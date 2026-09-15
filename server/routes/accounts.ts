import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog, maskBankAccount } from '../auth.js';

const router = Router();

// List Company Accounts
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const role = req.user?.role || 'EMPLOYEE';
  const canViewFinance = ['SUPER ADMIN', 'ACCOUNTS'].includes(role);

  if (!canViewFinance && req.user?.role !== 'HR / ADMIN') {
    return res.status(403).json({ error: 'Permission Denied: Company accounts view restricted to authorized finance personnel.' });
  }

  const accounts = db.prepare('SELECT * FROM company_accounts ORDER BY current_balance DESC').all() as any[];

  // Mask bank numbers if not SUPER ADMIN or ACCOUNTS
  const sanitized = accounts.map(a => ({
    ...a,
    account_number: canViewFinance ? a.account_number : maskBankAccount(a.account_number),
    ifsc: canViewFinance ? a.ifsc : '••••••••'
  }));

  res.json(sanitized);
});

// Single Account with Transactions
router.get('/:id', authenticate, requirePermission('Accounts', 'view'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const account = db.prepare('SELECT * FROM company_accounts WHERE id = ?').get(id) as any;
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const transactions = db.prepare('SELECT * FROM account_transactions WHERE account_id = ? ORDER BY transaction_date DESC, created_at DESC').all(id);

  const canViewFinance = ['SUPER ADMIN', 'ACCOUNTS'].includes(req.user?.role || '');
  const sanitized = {
    ...account,
    account_number: canViewFinance ? account.account_number : maskBankAccount(account.account_number),
    ifsc: canViewFinance ? account.ifsc : '••••••••',
    transactions
  };

  res.json(sanitized);
});

// Add Company Account
router.post('/', authenticate, requirePermission('Accounts', 'create'), (req: AuthenticatedRequest, res: Response) => {
  const { account_name, account_type, bank_name, account_number, ifsc, branch, account_holder, opening_balance, notes } = req.body;

  if (!account_name || !account_type) {
    return res.status(400).json({ error: 'Account name and account type are required' });
  }

  const id = `ACC-${Date.now().toString().slice(-4)}`;
  const openBal = Number(opening_balance) || 0;

  db.prepare(`
    INSERT INTO company_accounts (id, account_name, account_type, bank_name, account_number, ifsc, branch, account_holder, opening_balance, current_balance, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)
  `).run(id, account_name, account_type, bank_name || null, account_number || null, ifsc || null, branch || null, account_holder || 'FROMEX Health Tech', openBal, openBal, notes || null);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CREATE',
    'Accounts',
    id,
    null,
    `Added account: ${account_name} (${account_type}) with initial balance ₹${openBal.toLocaleString('en-IN')}`
  );

  res.status(201).json({ message: 'Company account created successfully', id });
});

// Update Account
router.put('/:id', authenticate, requirePermission('Accounts', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM company_accounts WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const { account_name, account_type, bank_name, account_number, ifsc, branch, account_holder, notes, current_balance } = req.body;

  db.prepare(`
    UPDATE company_accounts SET
      account_name = ?, account_type = ?, bank_name = ?, account_number = ?, ifsc = ?,
      branch = ?, account_holder = ?, notes = ?, current_balance = ?
    WHERE id = ?
  `).run(
    account_name || old.account_name,
    account_type || old.account_type,
    bank_name !== undefined ? bank_name : old.bank_name,
    account_number !== undefined ? account_number : old.account_number,
    ifsc !== undefined ? ifsc : old.ifsc,
    branch !== undefined ? branch : old.branch,
    account_holder || old.account_holder,
    notes !== undefined ? notes : old.notes,
    current_balance !== undefined ? Number(current_balance) : old.current_balance,
    id
  );

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE',
    'Accounts',
    id,
    JSON.stringify(old),
    JSON.stringify(req.body)
  );

  res.json({ message: 'Account updated successfully' });
});

// Delete Account
router.delete('/:id', authenticate, requirePermission('Accounts', 'delete'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT account_name FROM company_accounts WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Account not found' });
  }

  db.prepare('DELETE FROM company_accounts WHERE id = ?').run(id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'DELETE',
    'Accounts',
    id,
    old.account_name,
    'Deleted account'
  );

  res.json({ message: 'Account deleted' });
});

// Toggle Status (Activate / Deactivate)
router.patch('/:id/status', authenticate, requirePermission('Accounts', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  db.prepare('UPDATE company_accounts SET status = ? WHERE id = ?').run(status, id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'STATUS_CHANGE',
    'Accounts',
    id,
    null,
    `Changed status to ${status}`
  );

  res.json({ message: `Account status changed to ${status}` });
});

// Transactions list across all accounts
router.get('/transactions/all', authenticate, requirePermission('Accounts', 'view'), (req: AuthenticatedRequest, res: Response) => {
  const { account_id, type } = req.query;
  let query = `
    SELECT t.*, a.account_name, a.account_type, a.bank_name
    FROM account_transactions t
    JOIN company_accounts a ON t.account_id = a.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (account_id) {
    query += ` AND t.account_id = ?`;
    params.push(account_id);
  }
  if (type) {
    query += ` AND t.type = ?`;
    params.push(type);
  }
  query += ` ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT 100`;

  const txns = db.prepare(query).all(...params);
  res.json(txns);
});

export default router;
