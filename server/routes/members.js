const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/members - get all core members (public) - includes linked user avatar
router.get('/', (req, res) => {
  const members = db.prepare(`
    SELECT cm.*, u.avatar as user_avatar, u.name as user_name
    FROM core_members cm
    LEFT JOIN users u ON cm.user_id = u.id
    ORDER BY cm.sort_order ASC, cm.id ASC
  `).all();
  res.json(members);
});

// GET /timeline - get timeline events
router.get('/timeline', (req, res) => {
  const timeline = db.prepare('SELECT * FROM timeline ORDER BY sort_order ASC').all();
  res.json(timeline);
});

// GET /club-info - get club basic info
router.get('/club-info', (req, res) => {
  const info = db.prepare('SELECT * FROM club_info LIMIT 1').get();
  if (!info) {
    return res.status(404).json({ error: '社团信息未初始化' });
  }
  res.json(info);
});

// PUT /club-info - update club info (admin)
router.put('/club-info', (req, res) => {
  const existing = db.prepare('SELECT * FROM club_info LIMIT 1').get();
  if (!existing) {
    return res.status(404).json({ error: '社团信息不存在，请先运行种子脚本' });
  }

  const { name, slogan, description, founded_date, logo, stats_members, stats_awards, stats_events, contact_email, contact_phone } = req.body;

  db.prepare(
    `UPDATE club_info SET name = ?, slogan = ?, description = ?, founded_date = ?, logo = ?, stats_members = ?, stats_awards = ?, stats_events = ?, contact_email = ?, contact_phone = ?, updated_at = datetime('now','localtime') WHERE id = ?`
  ).run(
    name || existing.name,
    slogan !== undefined ? slogan : existing.slogan,
    description !== undefined ? description : existing.description,
    founded_date !== undefined ? founded_date : existing.founded_date,
    logo !== undefined ? logo : existing.logo,
    stats_members !== undefined ? stats_members : existing.stats_members,
    stats_awards !== undefined ? stats_awards : existing.stats_awards,
    stats_events !== undefined ? stats_events : existing.stats_events,
    contact_email !== undefined ? contact_email : existing.contact_email,
    contact_phone !== undefined ? contact_phone : existing.contact_phone,
    existing.id
  );

  const updated = db.prepare('SELECT * FROM club_info WHERE id = ?').get(existing.id);
  res.json(updated);
});

// POST / - create core member (admin)
router.post('/', (req, res) => {
  const { name, role, department, avatar, bio, sort_order, user_id } = req.body;

  if (!name) {
    return res.status(400).json({ error: '姓名不能为空' });
  }

  const result = db.prepare(
    'INSERT INTO core_members (name, role, department, avatar, bio, sort_order, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, role || '', department || '', avatar || '', bio || '', sort_order || 0, user_id || null);

  const member = db.prepare('SELECT * FROM core_members WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: '核心成员创建成功', member });
});

// PUT /:id - update core member (admin)
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM core_members WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '核心成员不存在' });
  }

  const { name, role, department, avatar, bio, sort_order, user_id } = req.body;

  db.prepare(
    'UPDATE core_members SET name = ?, role = ?, department = ?, avatar = ?, bio = ?, sort_order = ?, user_id = ? WHERE id = ?'
  ).run(
    name !== undefined ? name : existing.name,
    role !== undefined ? role : existing.role,
    department !== undefined ? department : existing.department,
    avatar !== undefined ? avatar : existing.avatar,
    bio !== undefined ? bio : existing.bio,
    sort_order !== undefined ? sort_order : existing.sort_order,
    user_id !== undefined ? user_id : existing.user_id,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM core_members WHERE id = ?').get(req.params.id);
  res.json({ message: '核心成员更新成功', member: updated });
});

// DELETE /:id - delete core member (admin)
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM core_members WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '核心成员不存在' });
  }

  db.prepare('DELETE FROM core_members WHERE id = ?').run(req.params.id);
  res.json({ message: '核心成员已删除' });
});

// POST /batch-delete - batch delete core members
router.post('/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的成员' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM core_members WHERE id IN (${placeholders})`).run(...ids);
  res.json({ message: `已删除 ${ids.length} 位成员` });
});

module.exports = router;