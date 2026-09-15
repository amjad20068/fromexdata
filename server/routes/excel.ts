import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog } from '../auth.js';
import * as XLSX from 'xlsx';

const router = Router();

// Download Employee Excel Template
router.get('/template', (req, res: Response) => {
  const sampleData = [
    {
      'Employee ID': 'FX-1011',
      'First Name': 'Deepak',
      'Last Name': 'Rao',
      'Gender': 'Male',
      'Phone': '+91-98471-00112',
      'Email': 'deepak.rao@fromexhealthtech.com',
      'Department': 'Technology & AI',
      'Designation': 'Senior Full-Stack Developer',
      'Joining Date': '2026-09-01',
      'Employment Type': 'Full Time',
      'Salary Type': 'Monthly',
      'Basic Salary': 90000,
      'Allowances': 15000,
      'Bank Name': 'HDFC Bank Ltd',
      'Account Number': '50200012345678',
      'IFSC': 'HDFC0001248',
      'UPI': 'deepak@okhdfc',
      'Status': 'Active'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, ws, 'Employees_Template');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="FROMEX_Employees_Template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// Validate & Import Employee Rows
router.post('/import-employees', authenticate, requirePermission('Employees', 'import'), (req: AuthenticatedRequest, res: Response) => {
  const { rows } = req.body;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'No data rows provided for import' });
  }

  const existingIds = new Set((db.prepare('SELECT id FROM employees').all() as any[]).map(r => r.id));
  const existingEmails = new Set((db.prepare('SELECT email FROM employees').all() as any[]).map(r => r.email.toLowerCase()));

  const errors: { row: number; employeeId: string; message: string }[] = [];
  const validRows: any[] = [];
  const seenInFileIds = new Set<string>();
  const seenInFileEmails = new Set<string>();

  rows.forEach((r: any, idx: number) => {
    const rowNum = idx + 1;
    const empId = (r['Employee ID'] || r.id || '').trim();
    const firstName = (r['First Name'] || r.first_name || '').trim();
    const lastName = (r['Last Name'] || r.last_name || '').trim();
    const email = (r['Email'] || r.email || '').trim().toLowerCase();
    const dept = (r['Department'] || r.department || '').trim();
    const desig = (r['Designation'] || r.designation || '').trim();
    const joining = (r['Joining Date'] || r.joining_date || new Date().toISOString().split('T')[0]).trim();

    if (!empId) {
      errors.push({ row: rowNum, employeeId: 'N/A', message: 'Missing Employee ID' });
      return;
    }
    if (!firstName || !lastName) {
      errors.push({ row: rowNum, employeeId: empId, message: 'Missing First or Last Name' });
      return;
    }
    if (!email) {
      errors.push({ row: rowNum, employeeId: empId, message: 'Missing Email address' });
      return;
    }
    if (existingIds.has(empId) || seenInFileIds.has(empId)) {
      errors.push({ row: rowNum, employeeId: empId, message: `Duplicate Employee ID "${empId}" already exists` });
      return;
    }
    if (existingEmails.has(email) || seenInFileEmails.has(email)) {
      errors.push({ row: rowNum, employeeId: empId, message: `Email "${email}" is already registered` });
      return;
    }

    seenInFileIds.add(empId);
    seenInFileEmails.add(email);

    validRows.push({
      id: empId,
      first_name: firstName,
      last_name: lastName,
      gender: r['Gender'] || r.gender || 'Other',
      phone: r['Phone'] || r.phone || '',
      email,
      department: dept || 'Technology & AI',
      designation: desig || 'Executive',
      joining_date: joining,
      employment_type: r['Employment Type'] || r.employment_type || 'Full Time',
      salary_type: r['Salary Type'] || r.salary_type || 'Monthly',
      basic_salary: Number(r['Basic Salary'] || r.basic_salary) || 50000,
      allowances: Number(r['Allowances'] || r.allowances) || 10000,
      bank_name: r['Bank Name'] || r.bank_name || 'HDFC Bank Ltd',
      account_number: r['Account Number'] || r.account_number || '',
      ifsc: r['IFSC'] || r.ifsc || '',
      upi_id: r['UPI'] || r.upi_id || '',
      status: r['Status'] || r.status || 'Active'
    });
  });

  if (errors.length > 0 && req.body.validateOnly) {
    return res.status(400).json({ validCount: validRows.length, errorCount: errors.length, errors, preview: validRows.slice(0, 5) });
  }

  // Perform transaction insert for valid rows
  const insertTx = db.transaction(() => {
    const insertEmp = db.prepare(`
      INSERT INTO employees (
        id, user_id, first_name, last_name, gender, phone, email,
        department, designation, joining_date, employment_type,
        status, bank_name, account_holder, account_number, ifsc, upi_id,
        salary_type, basic_salary, allowances
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `);

    const insertUser = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, employee_id, status)
      VALUES (?, ?, ?, '$2a$10$95j8U745e/8JzC461y6hFeq3g27K.eMvJjU.1b/3M00zRzN2K9sfe', 'EMPLOYEE', ?, 'Active')
    `);

    for (const v of validRows) {
      const uId = `USR-${v.id}`;
      insertUser.run(uId, v.email.split('@')[0], v.email, v.id);
      insertEmp.run(
        v.id, uId, v.first_name, v.last_name, v.gender, v.phone, v.email,
        v.department, v.designation, v.joining_date, v.employment_type,
        v.status, v.bank_name, `${v.first_name} ${v.last_name}`, v.account_number, v.ifsc, v.upi_id,
        v.salary_type, v.basic_salary, v.allowances
      );
    }
  });

  insertTx();

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'IMPORT',
    'Employees',
    null,
    null,
    `Batch imported ${validRows.length} employees from Excel`
  );

  res.json({
    message: `Successfully imported ${validRows.length} employees`,
    importedCount: validRows.length,
    errors
  });
});

export default router;
