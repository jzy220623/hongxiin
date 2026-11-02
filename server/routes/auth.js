const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const JWT_SECRET = 'zhisai-hongxin-secret-key';

// POST /register - user registration
router.post('/register', (req, res) => {
  const { username, password, email, name, student_id, phone, department, grade, security_question, security_answer } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: '用户名不能为空' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: '密码至少6位' });
  }

  // Check if username already exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
  if (existing) {
    return res.status(400).json({ error: '用户名已被注册' });
  }

  // Check if email already exists
  if (email && email.trim()) {
    const emailExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim());
    if (emailExists) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const securityAnswerHash = security_answer && security_answer.trim() ? bcrypt.hashSync(security_answer.trim(), 10) : '';

  const result = db.prepare(
    'INSERT INTO users (username, email, password_hash, name, student_id, phone, department, grade, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    username.trim(),
    email ? email.trim() : '',
    passwordHash,
    name ? name.trim() : '',
    student_id ? student_id.trim() : '',
    phone ? phone.trim() : '',
    department ? department.trim() : '',
    grade ? grade.trim() : '',
    security_question ? security_question.trim() : '',
    securityAnswerHash
  );

  const user = db.prepare('SELECT id, username, email, name, student_id, phone, department, grade, avatar, security_question, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

  // Generate token
  const token = jwt.sign({ id: user.id, username: user.username, type: 'user' }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ message: '注册成功', token, user });
});

// POST /login - user login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, type: 'user' }, JWT_SECRET, { expiresIn: '7d' });

  const { password_hash, ...userData } = user;
  res.json({ message: '登录成功', token, user: userData });
});

// GET /me - get current user profile
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, username, email, name, student_id, phone, department, grade, avatar, security_question, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user);
});

// GET /registration-status - get user's join application status
router.get('/registration-status', auth, (req, res) => {
  const registration = db.prepare(
    'SELECT id, status, name, student_id, department, major, class_name, created_at FROM registrations WHERE user_id = ? AND registration_type = ? ORDER BY created_at DESC LIMIT 1'
  ).get(req.user.id, 'join');

  res.json({ registration: registration || null });
});

// PUT /me - update profile
router.put('/me', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!existing) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const { name, email, phone, department, grade, avatar, security_question, security_answer } = req.body;

  const securityAnswerHash = security_answer !== undefined
    ? (security_answer && security_answer.trim() ? bcrypt.hashSync(security_answer.trim(), 10) : '')
    : existing.security_answer;

  db.prepare(
    'UPDATE users SET name = ?, email = ?, phone = ?, department = ?, grade = ?, avatar = ?, security_question = ?, security_answer = ? WHERE id = ?'
  ).run(
    name !== undefined ? name : existing.name,
    email !== undefined ? email : existing.email,
    phone !== undefined ? phone : existing.phone,
    department !== undefined ? department : existing.department,
    grade !== undefined ? grade : existing.grade,
    avatar !== undefined ? avatar : existing.avatar,
    security_question !== undefined ? security_question : existing.security_question,
    securityAnswerHash,
    req.user.id
  );

  const updated = db.prepare('SELECT id, username, email, name, student_id, phone, department, grade, avatar, security_question, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ message: '个人信息更新成功', user: updated });
});

// PUT /password - change password
router.put('/password', auth, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '旧密码和新密码不能为空' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密码至少6位' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const valid = bcrypt.compareSync(oldPassword, user.password_hash);
  if (!valid) {
    return res.status(400).json({ error: '旧密码错误' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

  res.json({ message: '密码修改成功' });
});

// POST /avatar - upload user avatar (stores base64 in database)
router.post('/avatar', auth, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择头像文件' });
  }

  const buffer = req.file.buffer;
  const mimeType = req.file.mimetype;
  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(base64Data, req.user.id);

  const user = db.prepare('SELECT id, username, email, name, student_id, phone, department, grade, avatar, security_question, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ message: '头像上传成功', user });
});

// POST /forgot-password - get security question
router.post('/forgot-password', (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: '请输入用户名' });
  }

  const user = db.prepare('SELECT id, username, security_question FROM users WHERE username = ?').get(username.trim());
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  if (!user.security_question) {
    return res.status(400).json({ error: '该用户未设置安全问题，无法找回密码' });
  }

  res.json({
    username: user.username,
    security_question: user.security_question,
  });
});

// POST /verify-answer - verify security answer
router.post('/verify-answer', (req, res) => {
  const { username, answer } = req.body;

  if (!username || !answer) {
    return res.status(400).json({ error: '用户名和答案不能为空' });
  }

  const user = db.prepare('SELECT id, security_answer FROM users WHERE username = ?').get(username.trim());
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  if (!user.security_answer) {
    return res.status(400).json({ error: '该用户未设置安全问题' });
  }

  const valid = bcrypt.compareSync(answer.trim(), user.security_answer);
  if (!valid) {
    return res.status(400).json({ error: '安全问题答案错误' });
  }

  // Generate a temporary reset token
  const resetToken = jwt.sign({ id: user.id, username, type: 'reset' }, JWT_SECRET, { expiresIn: '10m' });
  res.json({ message: '验证成功', resetToken });
});

// POST /reset-password - reset password with token
router.post('/reset-password', (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: '参数不完整' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密码至少6位' });
  }

  let payload;
  try {
    payload = jwt.verify(resetToken, JWT_SECRET);
  } catch {
    return res.status(400).json({ error: '重置链接已过期，请重新操作' });
  }

  if (payload.type !== 'reset') {
    return res.status(400).json({ error: '无效的重置令牌' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, payload.id);

  res.json({ message: '密码重置成功，请使用新密码登录' });
});

module.exports = router;