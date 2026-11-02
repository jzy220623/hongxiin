const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const upload = require('../middleware/upload');
const adminAuth = require('../middleware/adminAuth');

const JWT_SECRET = 'zhisai-hongxin-secret-key';

// POST /login - authenticate admin (no auth required)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const isValid = bcrypt.compareSync(password, admin.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, type: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: '登录成功',
    token,
    user: { id: admin.id, username: admin.username }
  });
});

// All routes below require admin auth
router.use(adminAuth);

// GET /dashboard - return stats
router.get('/dashboard', (req, res) => {
  const totalNews = db.prepare('SELECT COUNT(*) as count FROM news').get().count;
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
  const pendingRegistrations = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'pending'").get().count;
  const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
  const totalMembers = db.prepare('SELECT COUNT(*) as count FROM core_members').get().count;
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  res.json({
    totalNews,
    totalEvents,
    pendingRegistrations,
    totalMessages,
    totalMembers,
    totalUsers,
  });
});

// POST /members/import - import members from Excel (matches 智赛宏芯社成员名单.xlsx format)
router.post('/members/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传Excel文件' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

    let imported = 0;
    let skipped = 0;

    const insertClub = db.prepare(
      `INSERT OR IGNORE INTO club_members (name, student_id, phone, department, grade, advisor, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const insertReg = db.prepare(
      `INSERT INTO registrations (name, student_id, phone, department, grade, major, class_name, advisor, reason, nickname, registration_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'join', 'approved')`
    );

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < 2) continue;

      // Find header row (skip title rows, find row containing "姓名")
      let headerRow = -1;
      for (let i = 0; i < Math.min(data.length, 5); i++) {
        const row = data[i];
        if (!row) continue;
        for (const cell of row) {
          if (cell && String(cell).includes('姓名')) {
            headerRow = i;
            break;
          }
        }
        if (headerRow !== -1) break;
      }

      if (headerRow === -1) continue;

      const headers = data[headerRow].map(h => String(h || '').trim());
      const nameIdx = headers.findIndex(h => h === '姓名');
      const phoneIdx = headers.findIndex(h => h === '手机号');
      const deptIdx = headers.findIndex(h => h === '院系');
      const majorIdx = headers.findIndex(h => h === '专业');
      const classIdx = headers.findIndex(h => h === '班级');
      const advisorIdx = headers.findIndex(h => h.includes('辅导员'));
      const studentIdIdx = headers.findIndex(h => h === '学号');
      const remarkIdx = headers.findIndex(h => h === '备注');

      if (nameIdx === -1) continue;

      // Determine grade from sheet name or data
      const gradeFromSheet = sheetName.includes('级') ? sheetName.trim() : '';

      // Check if existing records exist for dedup
      const existingNames = new Set(
        db.prepare('SELECT name FROM club_members').all().map(r => r.name)
      );

      for (let i = headerRow + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[nameIdx]) continue;

        const name = String(row[nameIdx] || '').trim();
        if (!name) { skipped++; continue; }
        if (existingNames.has(name)) { skipped++; continue; }

        const studentId = studentIdIdx >= 0 ? String(row[studentIdIdx] || '').trim() : '';
        const phone = phoneIdx >= 0 ? String(row[phoneIdx] || '').trim() : '';
        const department = deptIdx >= 0 ? String(row[deptIdx] || '').trim() : '';
        const major = majorIdx >= 0 ? String(row[majorIdx] || '').trim() : '';
        const className = classIdx >= 0 ? String(row[classIdx] || '').trim() : '';
        const advisor = advisorIdx >= 0 ? String(row[advisorIdx] || '').trim() : '';
        const remark = remarkIdx >= 0 ? String(row[remarkIdx] || '').trim() : '';

        // Derive grade from student_id
        const grade = gradeFromSheet ||
          (studentId.length >= 2 && /^\d{2}/.test(studentId) ? '24级' : '');

        // Insert into club_members
        insertClub.run(name, studentId, phone, department, grade, advisor, remark);

        // Also insert into registrations for complete data tracking
        insertReg.run(
          name, studentId, phone, department, grade,
          major, className, advisor, '', remark
        );

        imported++;
      }
    }

    res.json({
      message: '导入完成',
      imported,
      skipped,
      total: imported + skipped,
    });
  } catch (err) {
    console.error('导入成员失败:', err);
    res.status(500).json({ error: '导入失败：' + err.message });
  }
});

// GET /members/export - export members to Excel (matches 智赛宏芯社成员名单.xlsx format)
router.get('/members/export', (req, res) => {
  try {
    const members = db.prepare(
      `SELECT r.name, r.phone, r.department, r.major, r.class_name, r.advisor, r.student_id, r.grade, r.nickname
       FROM registrations r
       WHERE r.registration_type = 'join' AND r.status = 'approved'
       ORDER BY r.grade DESC, r.department, r.name`
    ).all();

    const workbook = XLSX.utils.book_new();

    // Group by grade
    const gradeMap = {};
    for (const m of members) {
      const g = m.grade || '未分级';
      if (!gradeMap[g]) gradeMap[g] = [];
      gradeMap[g].push(m);
    }

    // Add "总表" sheet
    const totalSheetData = [
      ['智赛宏芯社成员名单'],
      ['姓名', '手机号', '院系', '专业', '班级', '所属辅导员', '学号', '备注'],
      ...members.map(m => [
        m.name || '',
        m.phone || '',
        m.department || '',
        m.major || '',
        m.class_name || '',
        m.advisor || '',
        m.student_id || '',
        m.nickname || '',
      ]),
    ];
    const totalWs = XLSX.utils.aoa_to_sheet(totalSheetData);
    totalWs['!cols'] = [
      { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 22 },
      { wch: 22 }, { wch: 12 }, { wch: 18 }, { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, totalWs, '智赛宏芯社成员总表');

    // Add per-grade sheets
    let counter = 1;
    const sortedGrades = Object.keys(gradeMap).sort((a, b) => b.localeCompare(a, 'zh'));
    for (const grade of sortedGrades) {
      const list = gradeMap[grade];
      const sheetData = [
        [`${grade}智赛宏芯社成员名单`],
        ['编号', '姓名', '手机号', '院系', '专业', '班级', '所属辅导员', '学号', '备注'],
        ...list.map(m => {
          const num = grade.substring(0, 2) + String(counter++).padStart(2, '0');
          return [
            num,
            m.name || '',
            m.phone || '',
            m.department || '',
            m.major || '',
            m.class_name || '',
            m.advisor || '',
            m.student_id || '',
            m.nickname || '',
          ];
        }),
      ];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws['!cols'] = [
        { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 20 },
        { wch: 22 }, { wch: 22 }, { wch: 12 }, { wch: 18 }, { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(workbook, ws, grade);
      counter = 1; // Reset counter for each sheet
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const filename = encodeURIComponent('智赛宏芯社成员名单_导出.xlsx');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.send(buffer);
  } catch (err) {
    console.error('导出成员失败:', err);
    res.status(500).json({ error: '导出失败：' + err.message });
  }
});

// GET /members/:id/account - get account info for a registration
router.get('/members/:id/account', (req, res) => {
  const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  if (!reg) {
    return res.status(404).json({ error: '成员不存在' });
  }

  if (!reg.user_id) {
    return res.json({ hasAccount: false, account: null });
  }

  const user = db.prepare('SELECT id, username, name, student_id, phone, email, department, grade, created_at FROM users WHERE id = ?').get(reg.user_id);
  if (!user) {
    return res.json({ hasAccount: false, account: null });
  }

  res.json({ hasAccount: true, account: user });
});

// POST /members/:id/create-account - create user account for a registration
router.post('/members/:id/create-account', (req, res) => {
  const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  if (!reg) {
    return res.status(404).json({ error: '成员不存在' });
  }

  if (reg.user_id) {
    return res.status(400).json({ error: '该成员已绑定账号' });
  }

  // Check if username (student_id) already exists
  const username = reg.student_id || 'user_' + reg.id;
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(400).json({ error: '学号 ' + username + ' 已被注册，请先检查' });
  }

  // Default password: student_id or random
  const defaultPassword = reg.student_id || '123456';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  const result = db.prepare(
    'INSERT INTO users (username, password_hash, name, student_id, phone, email, department, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    username,
    passwordHash,
    reg.name,
    reg.student_id || '',
    reg.phone || '',
    reg.email || '',
    reg.department || '',
    reg.grade || ''
  );

  const userId = result.lastInsertRowid;

  // Link registration to user
  db.prepare('UPDATE registrations SET user_id = ? WHERE id = ?').run(userId, reg.id);

  // If this is an approved join registration, also create/update club_member
  if (reg.registration_type === 'join' && reg.status === 'approved') {
    const existingMember = db.prepare('SELECT * FROM club_members WHERE user_id = ?').get(userId);
    if (!existingMember) {
      db.prepare(
        'INSERT INTO club_members (user_id, name, student_id, phone, email, department, grade) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(
        userId,
        reg.name,
        reg.student_id || '',
        reg.phone || '',
        reg.email || '',
        reg.department || '',
        reg.grade || ''
      );
    }
  }

  const user = db.prepare('SELECT id, username, name, student_id, created_at FROM users WHERE id = ?').get(userId);

  res.status(201).json({
    message: '账号创建成功',
    account: user,
    defaultPassword: defaultPassword,
  });
});

// POST /upload - upload image file
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择文件' });
  }
  const url = '/uploads/' + req.file.filename;
  res.json({ url, filename: req.file.filename, message: '上传成功' });
});

// ===== Website Users Management =====

// GET /users - list all website users
router.get('/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const search = req.query.search || '';
  const offset = (page - 1) * pageSize;

  let whereClause = '';
  let params = [];
  if (search) {
    whereClause = 'WHERE username LIKE ? OR name LIKE ? OR email LIKE ? OR student_id LIKE ?';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const total = db.prepare(`SELECT COUNT(*) as total FROM users ${whereClause}`).get(...params).total;
  const list = db.prepare(
    `SELECT id, username, name, student_id, phone, email, department, grade, avatar, created_at FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset);

  res.json({ list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
});

// PUT /users/:id - update a website user (admin)
router.put('/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const { username, name, student_id, phone, email, department, grade, new_password } = req.body;

  // Check username uniqueness
  if (username && username !== user.username) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ error: '用户名已被占用' });
    }
  }

  // Update password if provided
  if (new_password) {
    const passwordHash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, req.params.id);
  }

  // Build dynamic update (only set fields that are provided)
  const setters = [];
  const vals = [];
  const fields = ['username', 'name', 'student_id', 'phone', 'email', 'department', 'grade'];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      setters.push(`${f} = ?`);
      vals.push(req.body[f]);
    }
  }

  if (setters.length > 0) {
    vals.push(req.params.id);
    db.prepare(`UPDATE users SET ${setters.join(', ')} WHERE id = ?`).run(...vals);
  }

  const updated = db.prepare(
    'SELECT id, username, name, student_id, phone, email, department, grade, avatar, created_at FROM users WHERE id = ?'
  ).get(req.params.id);

  res.json({ message: '用户信息已更新', user: updated });
});

// DELETE /users/:id - delete a website user
router.delete('/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: '用户已删除' });
});

// POST /users/batch-delete - batch delete users
router.post('/users/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的用户' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM users WHERE id IN (${placeholders})`).run(...ids);
  res.json({ message: `已删除 ${ids.length} 个用户` });
});

// ===== Club Members Management =====

// GET /club-members - list all official club members
router.get('/club-members', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const search = req.query.search || '';
  const department = req.query.department || '';
  const grade = req.query.grade || '';
  const offset = (page - 1) * pageSize;

  let conditions = [];
  let params = [];

  if (search) {
    conditions.push('(m.name LIKE ? OR m.student_id LIKE ? OR u.username LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (department) {
    conditions.push('m.department = ?');
    params.push(department);
  }
  if (grade) {
    conditions.push('m.grade = ?');
    params.push(grade);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as total FROM club_members m ${whereClause}`).get(...params).total;
  const list = db.prepare(
    `SELECT m.*, u.username as account_username FROM club_members m LEFT JOIN users u ON m.user_id = u.id ${whereClause} ORDER BY m.join_date DESC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset);

  res.json({ list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
});

// PUT /club-members/:id - update club member info
router.put('/club-members/:id', (req, res) => {
  const member = db.prepare('SELECT * FROM club_members WHERE id = ?').get(req.params.id);
  if (!member) {
    return res.status(404).json({ error: '成员不存在' });
  }

  const setters = [];
  const vals = [];
  const fields = ['name', 'student_id', 'phone', 'email', 'department', 'grade', 'advisor', 'role', 'status'];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      setters.push(`${f} = ?`);
      vals.push(req.body[f]);
    }
  }

  if (setters.length > 0) {
    vals.push(req.params.id);
    db.prepare(`UPDATE club_members SET ${setters.join(', ')} WHERE id = ?`).run(...vals);
  }

  const updated = db.prepare('SELECT * FROM club_members WHERE id = ?').get(req.params.id);
  res.json({ message: '成员信息已更新', member: updated });
});

// DELETE /club-members/:id - remove club member
router.delete('/club-members/:id', (req, res) => {
  const member = db.prepare('SELECT * FROM club_members WHERE id = ?').get(req.params.id);
  if (!member) {
    return res.status(404).json({ error: '成员不存在' });
  }
  db.prepare('DELETE FROM club_members WHERE id = ?').run(req.params.id);
  res.json({ message: '成员已移除' });
});

// POST /club-members/:id/create-account - create user account for a club member
router.post('/club-members/:id/create-account', (req, res) => {
  const member = db.prepare('SELECT * FROM club_members WHERE id = ?').get(req.params.id);
  if (!member) {
    return res.status(404).json({ error: '成员不存在' });
  }

  if (member.user_id) {
    return res.status(400).json({ error: '该成员已绑定账号' });
  }

  // Check if username (student_id) already exists
  const username = member.student_id || 'member_' + member.id;
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(400).json({ error: '学号 ' + username + ' 已被注册，请先检查' });
  }

  const defaultPassword = member.student_id || '123456';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  const result = db.prepare(
    'INSERT INTO users (username, password_hash, name, student_id, phone, email, department, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    username,
    passwordHash,
    member.name,
    member.student_id || '',
    member.phone || '',
    member.email || '',
    member.department || '',
    member.grade || ''
  );

  const userId = result.lastInsertRowid;

  // Link club_member to user
  db.prepare('UPDATE club_members SET user_id = ? WHERE id = ?').run(userId, member.id);

  const user = db.prepare('SELECT id, username, name, student_id, created_at FROM users WHERE id = ?').get(userId);

  res.status(201).json({
    message: '账号创建成功',
    account: user,
    defaultPassword: defaultPassword,
  });
});

// GET /club-members/filters - return distinct filters for club members
router.get('/club-members/filters', (req, res) => {
  const departments = db.prepare("SELECT DISTINCT department FROM club_members WHERE department != '' ORDER BY department").all();
  const grades = db.prepare("SELECT DISTINCT grade FROM club_members WHERE grade != '' ORDER BY grade").all();
  res.json({
    departments: departments.map(r => r.department),
    grades: grades.map(r => r.grade),
  });
});

// POST /club-members/batch-delete - batch delete club members
router.post('/club-members/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的成员' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM club_members WHERE id IN (${placeholders})`).run(...ids);
  res.json({ message: `已删除 ${ids.length} 位成员` });
});

module.exports = router;