const express = require('express');
const router = express.Router();
const db = require('../db');

// GET / - list all achievements with pagination
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  const total = db.prepare('SELECT COUNT(*) as total FROM achievements').get().total;
  const list = db.prepare(
    'SELECT * FROM achievements ORDER BY award_date DESC LIMIT ? OFFSET ?'
  ).all(pageSize, offset);

  res.json({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  });
});

// POST / - create achievement (admin)
router.post('/', (req, res) => {
  const { title, competition, award_level, award_rank, project_name, description, image, team_members, award_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  const result = db.prepare(
    'INSERT INTO achievements (title, competition, award_level, award_rank, project_name, description, image, team_members, award_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    title,
    competition || '',
    award_level || '',
    award_rank || '',
    project_name || '',
    description || '',
    image || '',
    team_members || '',
    award_date || null
  );

  const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(achievement);
});

// PUT /:id - update achievement (admin)
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM achievements WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '成果不存在' });
  }

  const { title, competition, award_level, award_rank, project_name, description, image, team_members, award_date } = req.body;

  db.prepare(
    'UPDATE achievements SET title = ?, competition = ?, award_level = ?, award_rank = ?, project_name = ?, description = ?, image = ?, team_members = ?, award_date = ? WHERE id = ?'
  ).run(
    title || existing.title,
    competition !== undefined ? competition : existing.competition,
    award_level !== undefined ? award_level : existing.award_level,
    award_rank !== undefined ? award_rank : existing.award_rank,
    project_name !== undefined ? project_name : existing.project_name,
    description !== undefined ? description : existing.description,
    image !== undefined ? image : existing.image,
    team_members !== undefined ? team_members : existing.team_members,
    award_date !== undefined ? award_date : existing.award_date,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM achievements WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /:id - delete achievement (admin)
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM achievements WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '成果不存在' });
  }

  db.prepare('DELETE FROM achievements WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

module.exports = router;