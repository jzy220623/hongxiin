const jwt = require('jsonwebtoken');

const JWT_SECRET = 'zhisai-hongxin-secret-key';

/**
 * Admin authentication middleware.
 * Rejects user tokens (type === 'user'), only allows admin tokens.
 */
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: '认证令牌格式错误' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Reject user tokens — only admins can access admin routes
    if (decoded.type === 'user') {
      return res.status(403).json({ error: '权限不足，需要管理员账号' });
    }

    req.admin = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: '认证令牌无效或已过期' });
  }
}

module.exports = adminAuth;