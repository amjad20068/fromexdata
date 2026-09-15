import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// Helper to calculate hours between two HH:MM strings
function calculateHours(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const [h1, m1] = checkIn.split(':').map(Number);
  const [h2, m2] = checkOut.split(':').map(Number);
  const diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
  return Math.max(0, Number((diffMinutes / 60).toFixed(2)));
}

// Get Attendance Settings
router.get('/settings', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const settings = db.prepare('SELECT * FROM attendance_settings WHERE id = 1').get();
  res.json(settings);
});

// Update Attendance Settings
router.put('/settings', authenticate, requirePermission('Settings', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { office_start_time, office_end_time, grace_period_minutes, min_working_hours } = req.body;
  const oldSettings = db.prepare('SELECT * FROM attendance_settings WHERE id = 1').get() as any;

  db.prepare(`
    UPDATE attendance_settings SET
      office_start_time = ?, office_end_time = ?, grace_period_minutes = ?, min_working_hours = ?
    WHERE id = 1
  `).run(
    office_start_time || oldSettings.office_start_time,
    office_end_time || oldSettings.office_end_time,
    Number(grace_period_minutes) || oldSettings.grace_period_minutes,
    Number(min_working_hours) || oldSettings.min_working_hours
  );

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE_SETTINGS',
    'Attendance',
    'attendance_settings',
    JSON.stringify(oldSettings),
    JSON.stringify(req.body)
  );

  res.json({ message: 'Attendance settings updated successfully' });
});

// List Attendance Records
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { date, month, employee_id, department, status, search } = req.query;

  let query = `
    SELECT a.*, e.first_name, e.last_name, e.department, e.designation, e.avatar_url
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    WHERE 1=1
  `;
  const params: any[] = [];

  // If role is EMPLOYEE, restrict to own attendance unless having view permission
  if (req.user?.role === 'EMPLOYEE') {
    query += ` AND a.employee_id = ?`;
    params.push(req.user.employee_id);
  } else if (employee_id) {
    query += ` AND a.employee_id = ?`;
    params.push(employee_id);
  }

  if (date) {
    query += ` AND a.date = ?`;
    params.push(date);
  }
  if (month) {
    // Format YYYY-MM
    query += ` AND a.date LIKE ?`;
    params.push(`${month}%`);
  }
  if (department) {
    query += ` AND e.department = ?`;
    params.push(department);
  }
  if (status) {
    query += ` AND a.status = ?`;
    params.push(status);
  }
  if (search) {
    query += ` AND (e.first_name LIKE ? OR e.last_name LIKE ? OR a.employee_id LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ` ORDER BY a.date DESC, a.check_in ASC`;

  const records = db.prepare(query).all(...params);
  res.json(records);
});

// Today's Status for Current User
router.get('/today', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const empId = req.user?.employee_id;
  const today = new Date().toISOString().split('T')[0];

  if (!empId) {
    return res.json({ checkedIn: false, record: null });
  }

  const record = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(empId, today) as any;
  res.json({
    date: today,
    employee_id: empId,
    checkedIn: Boolean(record?.check_in),
    checkedOut: Boolean(record?.check_out),
    record: record || null
  });
});

// Check-In
router.post('/check-in', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const empId = req.body.employee_id || req.user?.employee_id;
  if (!empId) {
    return res.status(400).json({ error: 'Employee ID required for check-in' });
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Check if already checked in
  const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(empId, today) as any;
  if (existing && existing.check_in) {
    return res.status(400).json({ error: `You have already checked in today at ${existing.check_in}` });
  }

  // Fetch settings for late evaluation
  const settings = db.prepare('SELECT * FROM attendance_settings WHERE id = 1').get() as any;
  const [startH, startM] = (settings?.office_start_time || '09:00').split(':').map(Number);
  const graceMin = settings?.grace_period_minutes || 15;
  const thresholdMinutes = startH * 60 + startM + graceMin;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isLate = currentMinutes > thresholdMinutes;
  const status = isLate ? 'Late' : 'Present';
  const remarks = isLate ? `Late check-in (${currentTime} after ${settings.office_start_time} + ${graceMin}m grace)` : 'On time check-in';
  const source = req.headers['user-agent']?.includes('Mobile') ? 'Mobile App' : 'Web App';

  const attId = `ATT-${empId}-${today}`;
  if (existing) {
    db.prepare(`
      UPDATE attendance SET check_in = ?, status = ?, source = ?, remarks = ?, updated_by = ?
      WHERE id = ?
    `).run(currentTime, status, source, remarks, 'Self Check-In', existing.id);
  } else {
    db.prepare(`
      INSERT INTO attendance (id, employee_id, date, check_in, check_out, working_hours, status, source, remarks, updated_by)
      VALUES (?, ?, ?, ?, NULL, 0, ?, ?, ?, ?)
    `).run(attId, empId, today, currentTime, status, source, remarks, 'Self Check-In');
  }

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CHECK_IN',
    'Attendance',
    attId,
    null,
    `Check-in at ${currentTime} (Status: ${status})`
  );

  res.json({
    message: `Check-in successful at ${currentTime}`,
    status,
    check_in: currentTime,
    isLate
  });
});

// Check-Out
router.post('/check-out', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const empId = req.body.employee_id || req.user?.employee_id;
  if (!empId) {
    return res.status(400).json({ error: 'Employee ID required for check-out' });
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(empId, today) as any;
  if (!existing || !existing.check_in) {
    return res.status(400).json({ error: 'Cannot check out before checking in for today' });
  }

  if (existing.check_out) {
    return res.status(400).json({ error: `You have already checked out today at ${existing.check_out}` });
  }

  const hours = calculateHours(existing.check_in, currentTime);

  db.prepare(`
    UPDATE attendance SET check_out = ?, working_hours = ?, updated_by = ?
    WHERE id = ?
  `).run(currentTime, hours, 'Self Check-Out', existing.id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CHECK_OUT',
    'Attendance',
    existing.id,
    `CheckIn: ${existing.check_in}`,
    `CheckOut: ${currentTime}, Hours: ${hours}`
  );

  res.json({
    message: `Check-out successful at ${currentTime}. Total working hours: ${hours} hrs`,
    check_out: currentTime,
    working_hours: hours
  });
});

// Manual Mark Attendance (Admin / HR)
router.post('/manual', authenticate, requirePermission('Attendance', 'create'), (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, date, check_in, check_out, status, remarks } = req.body;
  if (!employee_id || !date || !status) {
    return res.status(400).json({ error: 'Employee, date, and status are required' });
  }

  const hours = calculateHours(check_in, check_out);
  const attId = `ATT-${employee_id}-${date}`;

  const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(employee_id, date);
  if (existing) {
    db.prepare(`
      UPDATE attendance SET
        check_in = ?, check_out = ?, working_hours = ?, status = ?, remarks = ?, updated_by = ?
      WHERE employee_id = ? AND date = ?
    `).run(check_in || null, check_out || null, hours, status, remarks || '', req.user?.username || 'Admin', employee_id, date);
  } else {
    db.prepare(`
      INSERT INTO attendance (id, employee_id, date, check_in, check_out, working_hours, status, source, remarks, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Manual Mark', ?, ?)
    `).run(attId, employee_id, date, check_in || null, check_out || null, hours, status, remarks || '', req.user?.username || 'Admin');
  }

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'MANUAL_MARK',
    'Attendance',
    attId,
    existing ? JSON.stringify(existing) : null,
    `Manual marked: ${status} for ${employee_id} on ${date}`
  );

  res.json({ message: 'Attendance marked successfully' });
});

// Edit Attendance Record
router.put('/:id', authenticate, requirePermission('Attendance', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Attendance record not found' });
  }

  const { check_in, check_out, status, remarks } = req.body;
  const hours = calculateHours(check_in !== undefined ? check_in : old.check_in, check_out !== undefined ? check_out : old.check_out);

  db.prepare(`
    UPDATE attendance SET
      check_in = ?, check_out = ?, working_hours = ?, status = ?, remarks = ?, updated_by = ?
    WHERE id = ?
  `).run(
    check_in !== undefined ? check_in : old.check_in,
    check_out !== undefined ? check_out : old.check_out,
    hours,
    status || old.status,
    remarks !== undefined ? remarks : old.remarks,
    req.user?.username || 'Admin',
    id
  );

  // Mandatory AUDIT LOG for Attendance Edit
  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'EDIT_ATTENDANCE',
    'Attendance',
    id,
    JSON.stringify({ check_in: old.check_in, check_out: old.check_out, status: old.status, hours: old.working_hours }),
    JSON.stringify({ check_in, check_out, status, hours })
  );

  res.json({ message: 'Attendance record updated and audit log recorded' });
});

// Delete Attendance Record
router.delete('/:id', authenticate, requirePermission('Attendance', 'delete'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Attendance record not found' });
  }

  db.prepare('DELETE FROM attendance WHERE id = ?').run(id);

  // Mandatory AUDIT LOG for Attendance Delete
  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'DELETE_ATTENDANCE',
    'Attendance',
    id,
    JSON.stringify(old),
    'Deleted record'
  );

  res.json({ message: 'Attendance record deleted' });
});

export default router;
