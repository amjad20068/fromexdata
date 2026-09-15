import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';

const router = Router();

// Helper to compute gross and net salary
export function computeSalary(
  basic: number,
  allowances: number,
  bonus: number = 0,
  overtime: number = 0,
  deductions: number = 0,
  advance: number = 0,
  loan: number = 0
) {
  const gross = (Number(basic) || 0) + (Number(allowances) || 0) + (Number(bonus) || 0) + (Number(overtime) || 0);
  const totalDeductions = (Number(deductions) || 0) + (Number(advance) || 0) + (Number(loan) || 0);
  const net = Math.max(0, gross - totalDeductions);
  return { gross, net };
}

// List Salary Records / Payroll
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { employee_id, month, year, status } = req.query;

  // Role check: Employee can only see own salary records!
  if (req.user?.role === 'EMPLOYEE') {
    if (!req.user.employee_id) return res.json([]);
    const records = db.prepare(`
      SELECT s.*, e.first_name, e.last_name, e.department, e.designation, e.bank_name, e.account_number, e.ifsc
      FROM salary_records s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.employee_id = ?
      ORDER BY s.year DESC, s.month DESC
    `).all(req.user.employee_id);
    return res.json(records);
  }

  // Authorized roles (SUPER ADMIN, ACCOUNTS, HR)
  let query = `
    SELECT s.*, e.first_name, e.last_name, e.department, e.designation, e.bank_name, e.account_number, e.ifsc
    FROM salary_records s
    JOIN employees e ON s.employee_id = e.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (employee_id) {
    query += ` AND s.employee_id = ?`;
    params.push(employee_id);
  }
  if (month) {
    query += ` AND s.month = ?`;
    params.push(Number(month));
  }
  if (year) {
    query += ` AND s.year = ?`;
    params.push(Number(year));
  }
  if (status) {
    query += ` AND s.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY s.year DESC, s.month DESC, s.employee_id ASC`;

  const records = db.prepare(query).all(...params);
  res.json(records);
});

// Generate / Recalculate Monthly Payroll for All Active Employees
router.post('/generate-monthly', authenticate, requirePermission('Salary', 'create'), (req: AuthenticatedRequest, res: Response) => {
  const { month, year } = req.body;
  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  const activeEmployees = db.prepare("SELECT * FROM employees WHERE status = 'Active'").all() as any[];
  let generatedCount = 0;

  const batchTx = db.transaction(() => {
    for (const emp of activeEmployees) {
      const basic = Number(emp.basic_salary) || 0;
      const allowances = Number(emp.allowances) || 0;
      const bonus = 0;
      const overtime = 0;
      const pf = Math.round(basic * 0.12);
      const profTax = 200;
      const deductions = pf + profTax;
      const advance = 0;
      const loan = 0;
      const { gross, net } = computeSalary(basic, allowances, bonus, overtime, deductions, advance, loan);

      const id = `SAL-${emp.id}-${year}-${String(month).padStart(2, '0')}`;
      const existing = db.prepare('SELECT id FROM salary_records WHERE employee_id = ? AND month = ? AND year = ?').get(emp.id, month, year);

      if (!existing) {
        db.prepare(`
          INSERT INTO salary_records (
            id, employee_id, month, year, salary_type, basic_salary, allowances, bonus, overtime,
            gross_salary, deductions, advance, loan, net_salary, status, payment_account_id, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Calculated', 'ACC-001', 'Monthly batch calculated')
        `).run(id, emp.id, month, year, emp.salary_type || 'Monthly', basic, allowances, bonus, overtime, gross, deductions, advance, loan, net);
        generatedCount++;
      }
    }
  });

  batchTx();

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'GENERATE_PAYROLL',
    'Salary',
    `${year}-${month}`,
    null,
    `Generated payroll for ${generatedCount} employees for month ${month}/${year}`
  );

  res.json({ message: `Successfully generated payroll for ${generatedCount} employees for ${month}/${year}` });
});

// Update Salary Record (Inline or Modal Edit)
router.put('/:id', authenticate, requirePermission('Salary', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM salary_records WHERE id = ?').get(id) as any;
  if (!old) {
    return res.status(404).json({ error: 'Salary record not found' });
  }

  const {
    basic_salary, allowances, bonus, overtime, deductions, advance, loan, status, payment_date, payment_account_id, notes
  } = req.body;

  const basic = basic_salary !== undefined ? Number(basic_salary) : old.basic_salary;
  const allow = allowances !== undefined ? Number(allowances) : old.allowances;
  const bon = bonus !== undefined ? Number(bonus) : old.bonus;
  const ot = overtime !== undefined ? Number(overtime) : old.overtime;
  const ded = deductions !== undefined ? Number(deductions) : old.deductions;
  const adv = advance !== undefined ? Number(advance) : old.advance;
  const ln = loan !== undefined ? Number(loan) : old.loan;

  const { gross, net } = computeSalary(basic, allow, bon, ot, ded, adv, ln);

  db.prepare(`
    UPDATE salary_records SET
      basic_salary = ?, allowances = ?, bonus = ?, overtime = ?, gross_salary = ?,
      deductions = ?, advance = ?, loan = ?, net_salary = ?, status = ?,
      payment_date = ?, payment_account_id = ?, notes = ?
    WHERE id = ?
  `).run(
    basic, allow, bon, ot, gross, ded, adv, ln, net,
    status || old.status,
    payment_date !== undefined ? payment_date : old.payment_date,
    payment_account_id || old.payment_account_id,
    notes !== undefined ? notes : old.notes,
    id
  );

  // If status marked as "Paid", record account transaction and payment!
  if (status === 'Paid' && old.status !== 'Paid') {
    const accId = payment_account_id || old.payment_account_id || 'ACC-001';
    const acc = db.prepare('SELECT current_balance FROM company_accounts WHERE id = ?').get(accId) as any;
    if (acc) {
      const newBal = acc.current_balance - net;
      db.prepare('UPDATE company_accounts SET current_balance = ? WHERE id = ?').run(newBal, accId);

      const txnId = `TXN-SAL-${id}`;
      db.prepare(`
        INSERT INTO account_transactions (id, account_id, type, amount, reference_type, reference_id, description, balance_after, transaction_date)
        VALUES (?, ?, 'Debit', ?, 'Salary', ?, ?, ?, ?)
      `).run(
        txnId, accId, net, id, `Salary payout for employee ${old.employee_id} (${old.month}/${old.year})`,
        newBal, payment_date || new Date().toISOString().split('T')[0]
      );
    }
  }

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE_SALARY',
    'Salary',
    id,
    JSON.stringify({ gross: old.gross_salary, net: old.net_salary, status: old.status }),
    JSON.stringify({ gross, net, status: status || old.status })
  );

  res.json({ message: 'Salary record updated successfully', gross, net });
});

// Single Payslip Details
router.get('/:id/payslip', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const sal = db.prepare(`
    SELECT s.*, e.first_name, e.last_name, e.department, e.designation, e.joining_date,
           e.bank_name, e.account_holder, e.account_number, e.ifsc, e.upi_id, e.phone, e.email
    FROM salary_records s
    JOIN employees e ON s.employee_id = e.id
    WHERE s.id = ?
  `).get(id) as any;

  if (!sal) {
    return res.status(404).json({ error: 'Salary record not found' });
  }

  // If employee role, ensure this belongs to current user
  if (req.user?.role === 'EMPLOYEE' && sal.employee_id !== req.user.employee_id) {
    return res.status(403).json({ error: 'Unauthorized to view another employee’s payslip' });
  }

  const company = db.prepare('SELECT * FROM company_settings WHERE id = 1').get();

  res.json({
    payslip: sal,
    company
  });
});

export default router;
