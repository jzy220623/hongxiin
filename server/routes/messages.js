const express = require('express');
const router = express.Router();
const db = require('../db');

// GET / - list messages with pagination
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const search = req.query.search;
  const offset = (page - 1) * pageSize;

  let conditions = [];
  let params = [];

  if (search) {
    conditions.push('(nickname LIKE ? OR content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as total FROM messages ${whereClause}`).get(...params).total;
  const list = db.prepare(
    `SELECT * FROM messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset);

  res.json({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  });
});

// POST / - create message
router.post('/', (req, res) => {
  const { nickname, content } = req.body;

  if (!nickname || !nickname.trim()) {
    return res.status(400).json({ error: '昵称不能为空' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '留言内容不能为空' });
  }

  const result = db.prepare(
    'INSERT INTO messages (nickname, content) VALUES (?, ?)'
  ).run(nickname.trim(), content.trim());

  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: '留言成功', data: message });
});

// PUT /:id - add reply to message (admin)
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '留言不存在' });
  }

  const { reply } = req.body;
  if (!reply || !reply.trim()) {
    return res.status(400).json({ error: '回复内容不能为空' });
  }

  db.prepare('UPDATE messages SET reply = ? WHERE id = ?').run(reply.trim(), req.params.id);

  const updated = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  res.json({ message: '回复成功', data: updated });
});

// DELETE /:id - delete message (admin)
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '留言不存在' });
  }

  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ message: '留言已删除' });
});

// POST /batch-delete - batch delete messages (admin)
router.post('/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的留言' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM messages WHERE id IN (${placeholders})`).run(...ids);
  res.json({ message: `已删除 ${ids.length} 条留言` });
});

module.exports = router;