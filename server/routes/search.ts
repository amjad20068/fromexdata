import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Global Grouped Search
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const q = req.query.q as string;
  if (!q || q.trim().length < 2) {
    return res.json({
      employees: [],
      invoices: [],
      expenses: [],
      accounts: [],
      attendance: []
    });
  }

  const term = `%${q.trim()}%`;

  // Search Employees
  const employees = db.prepare(`
    SELECT id, first_name, last_name, department, designation, email, phone, avatar_url, status
    FROM employees
    WHERE id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR department LIKE ?
    LIMIT 6
  `).all(term, term, term, term, term, term);

  // Search Invoices
  const invoices = db.prepare(`
    SELECT id, invoice_number, customer_name, grand_total, payment_status, invoice_date
    FROM invoices
    WHERE invoice_number LIKE ? OR customer_name LIKE ?
    LIMIT 6
  `).all(term, term);

  // Search Expenses
  const expenses = db.prepare(`
    SELECT id, category, description, amount, date, vendor
    FROM expenses
    WHERE id LIKE ? OR description LIKE ? OR vendor LIKE ? OR category LIKE ?
    LIMIT 6
  `).all(term, term, term, term);

  // Search Accounts
  const accounts = db.prepare(`
    SELECT id, account_name, account_type, bank_name, current_balance
    FROM company_accounts
    WHERE id LIKE ? OR account_name LIKE ? OR bank_name LIKE ?
    LIMIT 6
  `).all(term, term, term);

  // Search Attendance
  const attendance = db.prepare(`
    SELECT a.id, a.employee_id, a.date, a.status, a.check_in, a.check_out, e.first_name, e.last_name
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    WHERE a.employee_id LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ? OR a.date LIKE ?
    LIMIT 6
  `).all(term, term, term, term);

  res.json({
    employees,
    invoices,
    expenses,
    accounts,
    attendance
  });
});

export default router;
