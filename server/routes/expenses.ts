import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// Helper to calculate GST breakdown
export function calculateGst(amount: number, gstRate: number, isInterstate: boolean = false) {
  if (!gstRate || gstRate <= 0) {
    return { taxable: amount, cgst: 0, sgst: 0, igst: 0, total: amount };
  }
  // If amount is inclusive of GST:
  const taxable = Number((amount / (1 + gstRate / 100)).toFixed(2));
  const totalTax = Number((amount - taxable).toFixed(2));

  if (isInterstate) {
    return { taxable, cgst: 0, sgst: 0, igst: totalTax, total: amount };
  } else {
    const halfTax = Number((totalTax / 2).toFixed(2));
    return { taxable, cgst: halfTax, sgst: halfTax, igst: 0, total: amount };
  }
}

// List Expenses
router.get('/', authenticate, requirePermission('Expenses', 'view'), (req: AuthenticatedRequest, res: Response) => {
  const { category, paid_from_account_id, startDate, endDate, search } = req.query;

  let query = `
    SELECT x.*, a.account_name, e.first_name, e.last_name
    FROM expenses x
    LEFT JOIN company_accounts a ON x.paid_from_account_id = a.id
    LEFT JOIN employees e ON x.employee_id = e.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category) {
    query += ` AND x.category = ?`;
    params.push(category);
  }
  if (paid_from_account_id) {
    query += ` AND x.paid_from_account_id = ?`;
    params.push(paid_from_account_id);
  }
  if (startDate) {
    query += ` AND x.date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND x.date <= ?`;
    params.push(endDate);
  }
  if (search) {
    query += ` AND (x.description LIKE ? OR x.vendor LIKE ? OR x.id LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ` ORDER BY x.date DESC, x.created_at DESC`;

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// Create Expense
router.post('/', authenticate, requirePermission('Expenses', 'create'), (req: AuthenticatedRequest, res: Response) => {
  const {
    date, category, description, amount, paid_from_account_id, vendor, employee_id,
    receipt_url, payment_method, gst_applicable, gst_rate, is_interstate, notes
  } = req.body;

  if (!date || !category || !description || !amount) {
    return res.status(400).json({ error: 'Date, category, description, and amount are required' });
  }

  const amt = Number(amount);
  const rate = gst_applicable ? Number(gst_rate || 18) : 0;
  const gstBreakdown = calculateGst(amt, rate, Boolean(is_interstate));

  const id = `EXP-${Date.now().toString().slice(-4)}`;

  const expenseTx = db.transaction(() => {
    // 1. Insert expense record
    db.prepare(`
      INSERT INTO expenses (
        id, date, category, description, amount, paid_from_account_id, vendor, employee_id,
        receipt_url, payment_method, gst_applicable, gst_rate, cgst, sgst, igst, taxable_amount, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', ?)
    `).run(
      id, date, category, description, amt, paid_from_account_id || null, vendor || null,
      employee_id || req.user?.employee_id || null, receipt_url || null, payment_method || 'Bank Transfer',
      gst_applicable ? 1 : 0, rate, gstBreakdown.cgst, gstBreakdown.sgst, gstBreakdown.igst,
      gstBreakdown.taxable, notes || null
    );

    // 2. Automatically update selected company account balance
    if (paid_from_account_id) {
      const acc = db.prepare('SELECT current_balance FROM company_accounts WHERE id = ?').get(paid_from_account_id) as any;
      if (acc) {
        const newBalance = acc.current_balance - amt;
        db.prepare('UPDATE company_accounts SET current_balance = ? WHERE id = ?').run(newBalance, paid_from_account_id);

        // Record in account_transactions
        const txnId = `TXN-${id}`;
        db.prepare(`
          INSERT INTO account_transactions (id, account_id, type, amount, reference_type, reference_id, description, balance_after, transaction_date)
          VALUES (?, ?, 'Debit', ?, 'Expense', ?, ?, ?, ?)
        `).run(txnId, paid_from_account_id, amt, id, `${category} Expense: ${description}`, newBalance, date);
      }
    }
  });

  expenseTx();

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CREATE',
    'Expenses',
    id,
    null,
    `Added ${category} expense: ₹${amt.toLocaleString('en-IN')} (Paid from: ${paid_from_account_id || 'N/A'})`
  );

  res.status(201).json({ message: 'Expense created and account balance adjusted', id });
});

// Update Expense
router.put('/:id', authenticate, requirePermission('Expenses', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const {
    date, category, description, amount, paid_from_account_id, vendor, employee_id,
    receipt_url, payment_method, gst_applicable, gst_rate, is_interstate, notes
  } = req.body;

  const amt = amount !== undefined ? Number(amount) : old.amount;
  const rate = gst_applicable !== undefined ? (gst_applicable ? Number(gst_rate || 18) : 0) : old.gst_rate;
  const gstBreakdown = calculateGst(amt, rate, Boolean(is_interstate));

  db.prepare(`
    UPDATE expenses SET
      date = ?, category = ?, description = ?, amount = ?, paid_from_account_id = ?,
      vendor = ?, employee_id = ?, receipt_url = ?, payment_method = ?,
      gst_applicable = ?, gst_rate = ?, cgst = ?, sgst = ?, igst = ?, taxable_amount = ?, notes = ?
    WHERE id = ?
  `).run(
    date || old.date,
    category || old.category,
    description || old.description,
    amt,
    paid_from_account_id !== undefined ? paid_from_account_id : old.paid_from_account_id,
    vendor !== undefined ? vendor : old.vendor,
    employee_id !== undefined ? employee_id : old.employee_id,
    receipt_url !== undefined ? receipt_url : old.receipt_url,
    payment_method || old.payment_method,
    gst_applicable !== undefined ? (gst_applicable ? 1 : 0) : old.gst_applicable,
    rate,
    gstBreakdown.cgst,
    gstBreakdown.sgst,
    gstBreakdown.igst,
    gstBreakdown.taxable,
    notes !== undefined ? notes : old.notes,
    id
  );

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE',
    'Expenses',
    id,
    JSON.stringify(old),
    JSON.stringify(req.body)
  );

  res.json({ message: 'Expense updated successfully' });
});

// Delete Expense
router.delete('/:id', authenticate, requirePermission('Expenses', 'delete'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  // If was paid from account, optionally refund the balance
  if (old.paid_from_account_id) {
    const acc = db.prepare('SELECT current_balance FROM company_accounts WHERE id = ?').get(old.paid_from_account_id) as any;
    if (acc) {
      const restoredBalance = acc.current_balance + old.amount;
      db.prepare('UPDATE company_accounts SET current_balance = ? WHERE id = ?').run(restoredBalance, old.paid_from_account_id);
    }
  }

  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'DELETE',
    'Expenses',
    id,
    JSON.stringify(old),
    'Deleted expense and restored account balance'
  );

  res.json({ message: 'Expense deleted and account balance restored' });
});

export default router;
