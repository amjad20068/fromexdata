import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// List Payments
router.get('/', authenticate, requirePermission('Payments', 'view'), (req: AuthenticatedRequest, res: Response) => {
  const { payment_type, status, from_account_id } = req.query;

  let query = `
    SELECT p.*, a.account_name, a.bank_name
    FROM payments p
    LEFT JOIN company_accounts a ON p.from_account_id = a.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (payment_type) {
    query += ` AND p.payment_type = ?`;
    params.push(payment_type);
  }
  if (status) {
    query += ` AND p.status = ?`;
    params.push(status);
  }
  if (from_account_id) {
    query += ` AND p.from_account_id = ?`;
    params.push(from_account_id);
  }

  query += ` ORDER BY p.date DESC, p.created_at DESC`;

  const payments = db.prepare(query).all(...params);
  res.json(payments);
});

// Create Payment
router.post('/', authenticate, requirePermission('Payments', 'create'), (req: AuthenticatedRequest, res: Response) => {
  const { date, from_account_id, to_name, payment_type, reference_number, amount, description, status, attachment } = req.body;

  if (!date || !from_account_id || !to_name || !amount) {
    return res.status(400).json({ error: 'Date, account, recipient, and amount are required' });
  }

  const id = `PAY-${Date.now().toString().slice(-4)}`;
  const amt = Number(amount);

  db.prepare(`
    INSERT INTO payments (id, date, from_account_id, to_name, payment_type, reference_number, amount, description, status, attachment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, date, from_account_id, to_name, payment_type || 'Vendor',
    reference_number || `REF-${Date.now().toString().slice(-6)}`,
    amt, description || '', status || 'Completed', attachment || null
  );

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CREATE',
    'Payments',
    id,
    null,
    `Created payment of ₹${amt.toLocaleString('en-IN')} to ${to_name} (${payment_type})`
  );

  res.status(201).json({ message: 'Payment recorded successfully', id });
});

// Update Payment
router.put('/:id', authenticate, requirePermission('Payments', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM payments WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  const { date, from_account_id, to_name, payment_type, reference_number, amount, description, status, attachment } = req.body;

  db.prepare(`
    UPDATE payments SET
      date = ?, from_account_id = ?, to_name = ?, payment_type = ?, reference_number = ?,
      amount = ?, description = ?, status = ?, attachment = ?
    WHERE id = ?
  `).run(
    date || old.date,
    from_account_id || old.from_account_id,
    to_name || old.to_name,
    payment_type || old.payment_type,
    reference_number || old.reference_number,
    amount !== undefined ? Number(amount) : old.amount,
    description !== undefined ? description : old.description,
    status || old.status,
    attachment !== undefined ? attachment : old.attachment,
    id
  );

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE',
    'Payments',
    id,
    JSON.stringify(old),
    JSON.stringify(req.body)
  );

  res.json({ message: 'Payment updated successfully' });
});

// Delete Payment
router.delete('/:id', authenticate, requirePermission('Payments', 'delete'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM payments WHERE id = ?').run(id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'DELETE',
    'Payments',
    id,
    null,
    'Payment deleted'
  );

  res.json({ message: 'Payment deleted' });
});

export default router;
