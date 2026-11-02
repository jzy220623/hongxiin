const express = require('express');
const router = express.Router();
const db = require('../db');

// POST / - submit event registration (public)
router.post('/', (req, res) => {
  const { event_id, name, student_id, phone, email, department, grade, reason } = req.body;

  if (!name) {
    return res.status(400).json({ error: '姓名不能为空' });
  }

  if (!event_id) {
    return res.status(400).json({ error: '活动ID不能为空' });
  }

  // Check if event exists
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
  if (!event) {
    return res.status(404).json({ error: '活动不存在' });
  }

  // Check if registration is open
  if (!event.registration_open) {
    return res.status(400).json({ error: '该活动暂未开放报名' });
  }

  // Check max participants
  const count = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?').get(event_id, 'rejected').count;
  if (count >= event.max_participants) {
    return res.status(400).json({ error: '报名人数已满' });
  }

  const result = db.prepare(
    'INSERT INTO registrations (event_id, name, student_id, phone, email, department, grade, reason, registration_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(event_id, name, student_id || '', phone || '', email || '', department || '', grade || '', reason || '', 'event');

  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: '报名成功', registration });
});

// POST /join - submit club join application (public)
router.post('/join', (req, res) => {
  const { name, nickname, student_id, phone, email, department, major, class_name, advisor, grade, self_intro, interests, user_id } = req.body;

  // All fields are required
  if (!name || !student_id || !phone || !email || !department || !major || !class_name || !advisor || !self_intro || !interests) {
    return res.status(400).json({ error: '所有字段均为必填项，请完整填写报名表单' });
  }

  // Check duplicate: same user_id can only submit one join application
  if (user_id) {
    const existing = db.prepare(
      'SELECT id FROM registrations WHERE user_id = ? AND registration_type = ?'
    ).get(user_id, 'join');
    if (existing) {
      return res.status(400).json({ error: '您已提交过报名申请，无需重复提交' });
    }
  }

  // Derive grade from student_id (first 2 digits) if not provided
  let finalGrade = grade || '';
  if (!finalGrade && student_id) {
    const sid = String(student_id).trim();
    if (sid.length >= 2 && /^\d{2}/.test(sid)) {
      finalGrade = sid.substring(0, 2) + '级';
    }
  }

  const result = db.prepare(
    'INSERT INTO registrations (name, nickname, student_id, phone, email, department, major, class_name, advisor, grade, reason, interests, registration_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, nickname || '', student_id, phone, email, department, major, class_name, advisor, finalGrade, self_intro, interests, 'join', user_id || null);

  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: '申请提交成功', registration });
});

// POST /checkin - event check-in
router.post('/checkin', (req, res) => {
  const { registration_id } = req.body;

  if (!registration_id) {
    return res.status(400).json({ error: '报名ID不能为空' });
  }

  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(registration_id);
  if (!registration) {
    return res.status(404).json({ error: '报名记录不存在' });
  }

  if (registration.status !== 'approved') {
    return res.status(400).json({ error: '报名尚未通过审核，无法签到' });
  }

  db.prepare('UPDATE registrations SET status = ? WHERE id = ?').run('checked_in', registration_id);

  const updated = db.prepare('SELECT * FROM registrations WHERE id = ?').get(registration_id);
  res.json({ message: '签到成功', registration: updated });
});

// GET / - list all registrations (admin)
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const status = req.query.status;
  const registration_type = req.query.registration_type;
  const event_id = req.query.event_id;
  const search = req.query.search;
  const department = req.query.department;
  const grade = req.query.grade;
  const offset = (page - 1) * pageSize;

  let conditions = [];
  let params = [];

  if (status) {
    conditions.push('r.status = ?');
    params.push(status);
  }
  if (registration_type) {
    conditions.push('r.registration_type = ?');
    params.push(registration_type);
  }
  if (event_id) {
    conditions.push('r.event_id = ?');
    params.push(event_id);
  }
  if (department) {
    conditions.push('r.department = ?');
    params.push(department);
  }
  if (grade) {
    conditions.push('r.grade = ?');
    params.push(grade);
  }
  if (search) {
    conditions.push('(r.name LIKE ? OR r.student_id LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as total FROM registrations r ${whereClause}`).get(...params).total;
  const list = db.prepare(
    `SELECT r.*, e.title as event_title, u.username as account_username, u.id as account_user_id FROM registrations r LEFT JOIN events e ON r.event_id = e.id LEFT JOIN users u ON r.user_id = u.id ${whereClause} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset);

  res.json({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  });
});

// PUT /:id - update registration (admin)
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '报名记录不存在' });
  }

  const { status, name, nickname, student_id, phone, email, department, major, class_name, advisor, grade, reason, interests } = req.body;

  // Validate status if provided
  if (status && !['approved', 'rejected', 'pending', 'checked_in'].includes(status)) {
    return res.status(400).json({ error: '无效的状态值' });
  }

  // Build dynamic update
  const setters = [];
  const vals = [];
  const fields = ['status', 'name', 'nickname', 'student_id', 'phone', 'email', 'department', 'major', 'class_name', 'advisor', 'grade', 'reason', 'interests'];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      setters.push(`${f} = ?`);
      vals.push(req.body[f]);
    }
  }

  if (setters.length > 0) {
    vals.push(req.params.id);
    db.prepare(`UPDATE registrations SET ${setters.join(', ')} WHERE id = ?`).run(...vals);
  }

  // If approving a join application, auto-create/update club_member
  if (status === 'approved' && existing.registration_type === 'join') {
    const existingMember = db.prepare('SELECT * FROM club_members WHERE user_id = ?').get(existing.user_id);
    if (!existingMember) {
      db.prepare(
        'INSERT INTO club_members (user_id, name, student_id, phone, email, department, grade) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(
        existing.user_id || null,
        name || existing.name,
        student_id || existing.student_id || '',
        phone || existing.phone || '',
        email || existing.email || '',
        department || existing.department || '',
        grade || existing.grade || ''
      );
    }
  }

  const updated = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  res.json({ message: '更新成功', registration: updated });
});

// GET /filters - return distinct departments and grades for filter dropdowns
router.get('/filters', (req, res) => {
  try {
    const departments = db.prepare("SELECT DISTINCT department FROM registrations WHERE department != '' ORDER BY department").all();
    const grades = db.prepare("SELECT DISTINCT grade FROM registrations WHERE grade != '' ORDER BY grade").all();
    res.json({
      departments: departments.map((r) => r.department),
      grades: grades.map((r) => r.grade),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /batch-status - batch update registration status
router.post('/batch-status', (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要操作的记录' });
  }
  if (!['approved', 'rejected', 'pending', 'checked_in'].includes(status)) {
    return res.status(400).json({ error: '无效的状态值' });
  }

  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE registrations SET status = ? WHERE id IN (${placeholders})`).run(status, ...ids);

  // If approving join applications, auto-create club_members
  if (status === 'approved') {
    const registrations = db.prepare(
      `SELECT * FROM registrations WHERE id IN (${placeholders}) AND registration_type = 'join'`
    ).all(...ids);

    for (const reg of registrations) {
      const existingMember = db.prepare('SELECT * FROM club_members WHERE user_id = ?').get(reg.user_id);
      if (!existingMember) {
        db.prepare(
          'INSERT INTO club_members (user_id, name, student_id, phone, email, department, grade, advisor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(
          reg.user_id || null,
          reg.name,
          reg.student_id || '',
          reg.phone || '',
          reg.email || '',
          reg.department || '',
          reg.grade || '',
          reg.advisor || ''
        );
      }
    }
  }

  res.json({ message: `已更新 ${ids.length} 条记录状态` });
});

// POST /batch-delete - batch delete registrations
router.post('/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的记录' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM registrations WHERE id IN (${placeholders})`).run(...ids);
  res.json({ message: `已删除 ${ids.length} 条记录` });
});

module.exports = router;