import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// List Reimbursements
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { status, employee_id } = req.query;

  let query = `
    SELECT r.*, e.first_name, e.last_name, e.department, e.designation
    FROM reimbursements r
    JOIN employees e ON r.employee_id = e.id
    WHERE 1=1
  `;
  const params: any[] = [];

  // Employee can only view own reimbursements unless having Accounts/Admin role
  if (req.user?.role === 'EMPLOYEE') {
    query += ` AND r.employee_id = ?`;
    params.push(req.user.employee_id);
  } else if (employee_id) {
    query += ` AND r.employee_id = ?`;
    params.push(employee_id);
  }

  if (status) {
    query += ` AND r.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY r.date DESC, r.created_at DESC`;

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// Submit Reimbursement
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, date, category, amount, description, receipt_url } = req.body;
  const empId = employee_id || req.user?.employee_id;

  if (!empId || !date || !amount) {
    return res.status(400).json({ error: 'Employee, date, and amount are required' });
  }

  const id = `RMB-${Date.now().toString().slice(-4)}`;
  const amt = Number(amount);

  db.prepare(`
    INSERT INTO reimbursements (id, employee_id, date, category, amount, description, receipt_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted')
  `).run(id, empId, date, category || 'Other', amt, description || '', receipt_url || null);

  // Notify Accounts & Manager
  const notifId = `NTF-${Date.now()}`;
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link)
    VALUES (?, NULL, 'New Reimbursement Claim', ?, 'info', '/accounts/reimbursements')
  `).run(notifId, `Reimbursement claim of ₹${amt.toLocaleString('en-IN')} submitted by employee ${empId}`);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'SUBMIT',
    'Reimbursements',
    id,
    null,
    `Claim ₹${amt.toLocaleString('en-IN')} for ${category}`
  );

  res.status(201).json({ message: 'Reimbursement submitted for review', id });
});

// Update Status / Review Workflow
router.patch('/:id/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, account_id } = req.body;

  const validStatuses = ['Submitted', 'Manager Review', 'Accounts Review', 'Approved', 'Paid', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const old = db.prepare('SELECT * FROM reimbursements WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Reimbursement claim not found' });
  }

  const reviewerName = `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim() || req.user?.username;

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE reimbursements SET status = ?, reviewed_by = ? WHERE id = ?
    `).run(status, reviewerName, id);

    // If marked as 'Paid', deduct from selected company account!
    if (status === 'Paid' && old.status !== 'Paid') {
      const accId = account_id || 'ACC-001';
      const acc = db.prepare('SELECT current_balance FROM company_accounts WHERE id = ?').get(accId) as any;
      if (acc) {
        const newBal = acc.current_balance - old.amount;
        db.prepare('UPDATE company_accounts SET current_balance = ? WHERE id = ?').run(newBal, accId);

        const txnId = `TXN-RMB-${id}`;
        db.prepare(`
          INSERT INTO account_transactions (id, account_id, type, amount, reference_type, reference_id, description, balance_after, transaction_date)
          VALUES (?, ?, 'Debit', ?, 'Reimbursement', ?, ?, ?, ?)
        `).run(txnId, accId, old.amount, id, `Reimbursement payout to employee ${old.employee_id}`, newBal, new Date().toISOString().split('T')[0]);
      }
    }
  });

  tx();

  recordAuditLog(
    req.user?.id || null,
    reviewerName,
    'STATUS_UPDATE',
    'Reimbursements',
    id,
    old.status,
    status
  );

  res.json({ message: `Reimbursement status updated to ${status}` });
});

// Delete
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM reimbursements WHERE id = ?').run(id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'DELETE',
    'Reimbursements',
    id,
    null,
    'Deleted claim'
  );

  res.json({ message: 'Reimbursement deleted' });
});

export default router;
