const express = require('express');
const router = express.Router();
const db = require('../db');

// GET / - list events with pagination, optional type and status filters
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const type = req.query.type;
  const status = req.query.status;
  const offset = (page - 1) * pageSize;

  let conditions = [];
  let params = [];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as total FROM events ${whereClause}`).get(...params).total;
  const list = db.prepare(
    `SELECT * FROM events ${whereClause} ORDER BY start_date ASC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset);

  res.json({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  });
});

// GET /:id - single event detail
router.get('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: '活动不存在' });
  }
  res.json(event);
});

// POST / - create event (admin)
router.post('/', (req, res) => {
  const { title, description, cover_image, type, status, start_date, end_date, location, schedule, registration_open, max_participants } = req.body;

  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  const result = db.prepare(
    'INSERT INTO events (title, description, cover_image, type, status, start_date, end_date, location, schedule, registration_open, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    title,
    description || '',
    cover_image || '',
    type || 'sci_tech',
    status || 'upcoming',
    start_date || null,
    end_date || null,
    location || '',
    schedule || '',
    registration_open !== undefined ? registration_open : 1,
    max_participants || 100
  );

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

// PUT /:id - update event (admin)
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '活动不存在' });
  }

  const { title, description, cover_image, type, status, start_date, end_date, location, schedule, registration_open, max_participants } = req.body;

  db.prepare(
    `UPDATE events SET title = ?, description = ?, cover_image = ?, type = ?, status = ?, start_date = ?, end_date = ?, location = ?, schedule = ?, registration_open = ?, max_participants = ?, updated_at = datetime('now','localtime') WHERE id = ?`
  ).run(
    title || existing.title,
    description !== undefined ? description : existing.description,
    cover_image !== undefined ? cover_image : existing.cover_image,
    type || existing.type,
    status || existing.status,
    start_date !== undefined ? start_date : existing.start_date,
    end_date !== undefined ? end_date : existing.end_date,
    location !== undefined ? location : existing.location,
    schedule !== undefined ? schedule : existing.schedule,
    registration_open !== undefined ? registration_open : existing.registration_open,
    max_participants !== undefined ? max_participants : existing.max_participants,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /:id - delete event (admin)
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '活动不存在' });
  }

  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

// POST /batch-delete - batch delete events (admin)
router.post('/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的活动' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM events WHERE id IN (${placeholders})`).run(...ids);
  res.json({ message: `已删除 ${ids.length} 个活动` });
});

module.exports = router;