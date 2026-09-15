import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// List Leaves
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, status, leave_type } = req.query;

  let query = `
    SELECT l.*, e.first_name, e.last_name, e.department, e.designation, e.avatar_url
    FROM leave_requests l
    JOIN employees e ON l.employee_id = e.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (req.user?.role === 'EMPLOYEE') {
    query += ` AND l.employee_id = ?`;
    params.push(req.user.employee_id);
  } else if (employee_id) {
    query += ` AND l.employee_id = ?`;
    params.push(employee_id);
  }

  if (status) {
    query += ` AND l.status = ?`;
    params.push(status);
  }
  if (leave_type) {
    query += ` AND l.leave_type = ?`;
    params.push(leave_type);
  }

  query += ` ORDER BY l.created_at DESC`;

  const leaves = db.prepare(query).all(...params);
  res.json(leaves);
});

// Request Leave
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, leave_type, start_date, end_date, total_days, reason, attachment } = req.body;
  const empId = employee_id || req.user?.employee_id;

  if (!empId || !leave_type || !start_date || !end_date) {
    return res.status(400).json({ error: 'Please provide employee, leave type, start date, and end date' });
  }

  const id = `LEV-${Date.now()}`;
  db.prepare(`
    INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, total_days, reason, attachment, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
  `).run(id, empId, leave_type, start_date, end_date, Number(total_days) || 1, reason || '', attachment || null);

  // Notify HR and Managers
  const emp = db.prepare('SELECT first_name, last_name, department FROM employees WHERE id = ?').get(empId) as any;
  const notifId = `NTF-${Date.now()}`;
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link)
    VALUES (?, NULL, ?, ?, 'info', '/leave')
  `).run(notifId, 'New Leave Application', `${emp?.first_name || 'An employee'} applied for ${total_days || 1} day(s) ${leave_type} (${start_date} to ${end_date})`);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'REQUEST_LEAVE',
    'Leave',
    id,
    null,
    `${leave_type} from ${start_date} to ${end_date} (${total_days} days)`
  );

  res.status(201).json({ message: 'Leave request submitted successfully', id });
});

// Review Leave (Approve / Reject)
router.put('/:id/review', authenticate, requirePermission('Leave', 'approve'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be Approved or Rejected.' });
  }

  const leave = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id) as any;
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  const reviewerName = `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim() || req.user?.username || 'Approver';
  const today = new Date().toISOString().split('T')[0];

  const reviewTx = db.transaction(() => {
    // 1. Update leave request status
    db.prepare(`
      UPDATE leave_requests SET
        status = ?, reviewed_by = ?, reviewed_at = ?, remarks = ?
      WHERE id = ?
    `).run(status, reviewerName, today, remarks || '', id);

    // 2. If Approved: automatically reflect in attendance!
    if (status === 'Approved') {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);

      // Loop each date in range
      for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        const dateStr = dt.toISOString().split('T')[0];
        const existingAtt = db.prepare('SELECT id FROM attendance WHERE employee_id = ? AND date = ?').get(leave.employee_id, dateStr);

        if (existingAtt) {
          db.prepare(`
            UPDATE attendance SET
              status = 'Leave', remarks = ?, source = 'Leave System', updated_by = ?
            WHERE employee_id = ? AND date = ?
          `).run(`Approved ${leave.leave_type} (${leave.id})`, reviewerName, leave.employee_id, dateStr);
        } else {
          const attId = `ATT-${leave.employee_id}-${dateStr}`;
          db.prepare(`
            INSERT INTO attendance (id, employee_id, date, check_in, check_out, working_hours, status, source, remarks, updated_by)
            VALUES (?, ?, ?, NULL, NULL, 0, 'Leave', 'Leave System', ?, ?)
          `).run(attId, leave.employee_id, dateStr, `Approved ${leave.leave_type} (${leave.id})`, reviewerName);
        }
      }
    }
  });

  reviewTx();

  recordAuditLog(
    req.user?.id || null,
    reviewerName,
    status.toUpperCase(),
    'Leave',
    id,
    `Status: ${leave.status}`,
    `Status: ${status} (Remarks: ${remarks || 'None'})`
  );

  // Send notification to employee
  const targetUser = db.prepare('SELECT id FROM users WHERE employee_id = ?').get(leave.employee_id) as any;
  if (targetUser) {
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?, '/leave')
    `).run(
      `NTF-${Date.now()}`,
      targetUser.id,
      `Leave Request ${status}`,
      `Your request for ${leave.leave_type} (${leave.start_date} to ${leave.end_date}) was ${status.toLowerCase()} by ${reviewerName}.`,
      status === 'Approved' ? 'success' : 'warning'
    );
  }

  res.json({ message: `Leave request ${status.toLowerCase()} successfully and synced with attendance.` });
});

// Cancel Leave Request (by employee if pending)
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const leave = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id) as any;
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  // If role is employee, only can cancel own pending request
  if (req.user?.role === 'EMPLOYEE' && leave.employee_id !== req.user.employee_id) {
    return res.status(403).json({ error: 'Cannot cancel another employee’s leave request' });
  }

  db.prepare('DELETE FROM leave_requests WHERE id = ?').run(id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CANCEL_LEAVE',
    'Leave',
    id,
    JSON.stringify(leave),
    'Cancelled leave request'
  );

  res.json({ message: 'Leave request cancelled' });
});

export default router;
