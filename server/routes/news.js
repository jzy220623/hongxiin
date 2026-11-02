const express = require('express');
const router = express.Router();
const db = require('../db');

// GET / - list news with pagination, optional category filter
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const category = req.query.category;
  const offset = (page - 1) * pageSize;

  let sql = 'SELECT * FROM news';
  let countSql = 'SELECT COUNT(*) as total FROM news';
  const params = [];

  if (category) {
    sql += ' WHERE category = ?';
    countSql += ' WHERE category = ?';
    params.push(category);
  }

  sql += ' ORDER BY published_at DESC, created_at DESC LIMIT ? OFFSET ?';

  const total = db.prepare(countSql).get(...params).total;
  const list = db.prepare(sql).all(...params, pageSize, offset);

  res.json({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  });
});

// GET /:id - single news detail
router.get('/:id', (req, res) => {
  const news = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!news) {
    return res.status(404).json({ error: '新闻不存在' });
  }
  res.json(news);
});

// POST / - create news (admin)
router.post('/', (req, res) => {
  const { title, content, summary, cover_image, category, published_at } = req.body;

  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  const result = db.prepare(
    'INSERT INTO news (title, content, summary, cover_image, category, published_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, content || '', summary || '', cover_image || '', category || 'general', published_at || null);

  const news = db.prepare('SELECT * FROM news WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(news);
});

// PUT /:id - update news (admin)
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '新闻不存在' });
  }

  const { title, content, summary, cover_image, category, published_at } = req.body;

  db.prepare(
    `UPDATE news SET title = ?, content = ?, summary = ?, cover_image = ?, category = ?, published_at = ?, updated_at = datetime('now','localtime') WHERE id = ?`
  ).run(
    title || existing.title,
    content !== undefined ? content : existing.content,
    summary !== undefined ? summary : existing.summary,
    cover_image !== undefined ? cover_image : existing.cover_image,
    category || existing.category,
    published_at !== undefined ? published_at : existing.published_at,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /:id - delete news (admin)
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '新闻不存在' });
  }

  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

// POST /batch-delete - batch delete news (admin)
router.post('/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的新闻' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM news WHERE id IN (${placeholders})`).run(...ids);
  res.json({ message: `已删除 ${ids.length} 条新闻` });
});

module.exports = router;