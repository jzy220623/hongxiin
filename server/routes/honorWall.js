const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');
const XLSX = require('xlsx');

// ==================== PUBLIC ROUTES ====================

// GET / - list all honor wall members grouped by cohort (public)
router.get('/', (req, res) => {
  try {
    const members = db.prepare(
      'SELECT * FROM honor_wall ORDER BY cohort DESC, sort_order ASC, id ASC'
    ).all();

    // Group by cohort
    const grouped = {};
    for (const m of members) {
      if (!grouped[m.cohort]) {
        grouped[m.cohort] = [];
      }
      // Parse JSON fields
      grouped[m.cohort].push({
        ...m,
        full_achievements: tryParseJSON(m.full_achievements),
        projects: tryParseJSON(m.projects),
      });
    }

    // Convert to array sorted by cohort descending
    const result = Object.entries(grouped)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([cohort, list]) => ({ cohort, members: list }));

    res.json(result);
  } catch (err) {
    console.error('获取荣誉墙数据失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /cohorts - get distinct cohorts for filter
router.get('/cohorts', (req, res) => {
  const cohorts = db.prepare(
    'SELECT DISTINCT cohort FROM honor_wall ORDER BY cohort DESC'
  ).all();
  res.json(cohorts.map(c => c.cohort));
});

// ==================== ADMIN ROUTES ====================

// GET /admin - list all members (flat list for admin table)
router.get('/admin', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * pageSize;

    let whereClause = '';
    let params = [];
    if (search) {
      whereClause = 'WHERE name LIKE ? OR cohort LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    const total = db.prepare(
      `SELECT COUNT(*) as total FROM honor_wall ${whereClause}`
    ).get(...params).total;

    const list = db.prepare(
      `SELECT * FROM honor_wall ${whereClause} ORDER BY cohort DESC, sort_order ASC LIMIT ? OFFSET ?`
    ).all(...params, pageSize, offset);

    res.json({ list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin - create a new honor wall member
router.post('/admin', (req, res) => {
  const {
    name, avatar, cohort, role, member_type,
    achievements, full_achievements, projects, message, destination, sort_order
  } = req.body;

  if (!name || !cohort) {
    return res.status(400).json({ error: '姓名和届数为必填项' });
  }

  try {
    const result = db.prepare(
      `INSERT INTO honor_wall (name, avatar, cohort, role, member_type, achievements, full_achievements, projects, message, destination, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      name, avatar || '', cohort, role || '', member_type || 'tech',
      achievements || '', JSON.stringify(full_achievements || []), JSON.stringify(projects || []),
      message || '', destination || '', sort_order || 0
    );

    const member = db.prepare('SELECT * FROM honor_wall WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: '创建成功', member });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/:id - update a member
router.put('/admin/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM honor_wall WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '成员不存在' });
  }

  const fields = ['name', 'avatar', 'cohort', 'role', 'member_type', 'achievements', 'message', 'destination', 'sort_order'];
  const setters = [];
  const vals = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      setters.push(`${f} = ?`);
      vals.push(req.body[f]);
    }
  }

  // Handle JSON fields
  if (req.body.full_achievements !== undefined) {
    setters.push('full_achievements = ?');
    vals.push(JSON.stringify(req.body.full_achievements));
  }
  if (req.body.projects !== undefined) {
    setters.push('projects = ?');
    vals.push(JSON.stringify(req.body.projects));
  }

  if (setters.length > 0) {
    setters.push('updated_at = datetime(\'now\',\'localtime\')');
    vals.push(req.params.id);
    db.prepare(`UPDATE honor_wall SET ${setters.join(', ')} WHERE id = ?`).run(...vals);
  }

  const updated = db.prepare('SELECT * FROM honor_wall WHERE id = ?').get(req.params.id);
  res.json({ message: '更新成功', member: updated });
});

// DELETE /admin/:id - delete a member
router.delete('/admin/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM honor_wall WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '成员不存在' });
  }
  db.prepare('DELETE FROM honor_wall WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

// POST /admin/batch-delete - batch delete honor wall members
router.post('/admin/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的成员' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM honor_wall WHERE id IN (${placeholders})`).run(...ids);
  res.json({ message: `已删除 ${ids.length} 位成员` });
});

// POST /admin/import - batch import from Excel
router.post('/admin/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传Excel文件' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel文件为空' });
    }

    let imported = 0;
    let skipped = 0;

    const insert = db.prepare(
      `INSERT INTO honor_wall (name, avatar, cohort, role, member_type, achievements, full_achievements, projects, message, destination, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const row of data) {
      const name = String(row['姓名'] || row['name'] || '').trim();
      const cohort = String(row['届数'] || row['cohort'] || '').trim();
      if (!name || !cohort) { skipped++; continue; }

      insert.run(
        name,
        String(row['头像'] || row['avatar'] || ''),
        cohort,
        String(row['身份'] || row['role'] || ''),
        String(row['类型'] || row['member_type'] || 'tech'),
        String(row['成就'] || row['achievements'] || ''),
        JSON.stringify(String(row['完整获奖'] || row['full_achievements'] || '').split('\n').filter(Boolean)),
        JSON.stringify(String(row['项目经历'] || row['projects'] || '').split('\n').filter(Boolean)),
        String(row['寄语'] || row['message'] || ''),
        String(row['去向'] || row['destination'] || ''),
        parseInt(row['排序'] || row['sort_order']) || 0
      );
      imported++;
    }

    res.json({ message: '导入完成', imported, skipped, total: imported + skipped });
  } catch (err) {
    console.error('导入荣誉墙数据失败:', err);
    res.status(500).json({ error: '导入失败：' + err.message });
  }
});

// PUT /admin/batch-sort - batch update sort orders
router.put('/admin/batch-sort', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: '请提供排序数据' });
  }
  try {
    const stmt = db.prepare('UPDATE honor_wall SET sort_order = ? WHERE id = ?');
    for (const item of items) {
      stmt.run(item.sort_order, item.id);
    }
    res.json({ message: '排序已更新' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function tryParseJSON(str) {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return str ? [str] : [];
  }
}

module.exports = router;