const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const auth = require('./middleware/auth');
const adminAuth = require('./middleware/adminAuth');
const db = require('./db');
const seed = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API root - health check & endpoint listing
app.get('/api', (req, res) => {
  res.json({
    name: '智赛宏芯社 API',
    version: '1.0.0',
    endpoints: {
      public: [
        'GET  /api/news',
        'GET  /api/events',
        'GET  /api/achievements',
        'GET  /api/messages',
        'GET  /api/members',
        'GET  /api/members/timeline',
        'GET  /api/members/club-info',
        'POST /api/registrations',
        'POST /api/registrations/join',
        'POST /api/messages',
      ],
      admin: [
        'POST /api/admin/login',
        'GET  /api/admin/dashboard',
        'POST /api/admin/news',
        'PUT  /api/admin/events',
        'GET  /api/admin/registrations',
      ],
    },
  });
});

// Public routes (no auth required)
app.use('/api/news', require('./routes/news'));
app.use('/api/events', require('./routes/events'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/members', require('./routes/members'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/honor-wall', require('./routes/honorWall'));

// Admin routes - login is public, dashboard requires auth
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

// Apply admin auth middleware to admin-only CRUD operations:
// news POST/PUT/DELETE
app.use('/api/news', (req, res, next) => {
  if (req.method === 'GET') return next();
  adminAuth(req, res, next);
});
// events POST/PUT/DELETE
app.use('/api/events', (req, res, next) => {
  if (req.method === 'GET') return next();
  adminAuth(req, res, next);
});
// achievements POST/PUT/DELETE
app.use('/api/achievements', (req, res, next) => {
  if (req.method === 'GET') return next();
  adminAuth(req, res, next);
});
// registrations GET/PUT
app.use('/api/registrations', (req, res, next) => {
  if (req.method === 'POST') return next();
  adminAuth(req, res, next);
});
// messages PUT/DELETE (admin-only for reply and deletion)
app.use('/api/messages', (req, res, next) => {
  if (req.method === 'PUT' || req.method === 'DELETE') {
    return adminAuth(req, res, next);
  }
  next();
});
// members POST/PUT/DELETE (core members CRUD)
app.use('/api/members', (req, res, next) => {
  if (req.method === 'GET') return next();
  adminAuth(req, res, next);
});
// honor-wall admin routes
app.use('/api/honor-wall/admin', adminAuth);

// Serve client build files in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

// Multer error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '文件大小超过限制，请压缩后重试' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: '文件上传失败: ' + err.message });
  }
  next(err);
});

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Initialize database and start server
db.init().then(() => {
  console.log('数据库初始化完成。');

  // Run seed on first start if tables are empty
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
  if (adminCount === 0) {
    console.log('首次启动，导入种子数据...');
    seed().then(() => {
      app.listen(PORT, () => {
        console.log(`智赛宏芯社后端服务器已启动，端口: ${PORT}`);
        console.log(`API地址: http://localhost:${PORT}/api`);
      });
    });
  } else {
    // Always check and seed honor wall if empty
    seed().catch(err => {
      console.error('种子数据检查失败:', err);
    });
    app.listen(PORT, () => {
      console.log(`智赛宏芯社后端服务器已启动，端口: ${PORT}`);
      console.log(`API地址: http://localhost:${PORT}/api`);
    });
  }
}).catch(err => {
  console.error('数据库初始化失败:', err);
  process.exit(1);
});

module.exports = app;