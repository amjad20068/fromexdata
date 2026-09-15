import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requirePermission, recordAuditLog, maskBankAccount } from '../auth.js';

const router = Router();

// List Employees
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { search, department, designation, status, employment_type } = req.query;

  let query = `
    SELECT id, first_name, last_name, gender, phone, email, department, designation,
           joining_date, employment_type, reporting_manager, work_location, status,
           salary_type, basic_salary, allowances, avatar_url, bank_name, account_holder, account_number, ifsc, upi_id
    FROM employees
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    query += ` AND (id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }
  if (department) {
    query += ` AND department = ?`;
    params.push(department);
  }
  if (designation) {
    query += ` AND designation = ?`;
    params.push(designation);
  }
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  if (employment_type) {
    query += ` AND employment_type = ?`;
    params.push(employment_type);
  }

  query += ` ORDER BY id ASC`;

  const rows = db.prepare(query).all(...params) as any[];

  // Role permissions check for sensitive bank and salary info
  const role = req.user?.role || 'EMPLOYEE';
  const canViewFinancials = ['SUPER ADMIN', 'HR / ADMIN', 'ACCOUNTS'].includes(role);

  const sanitizedRows = rows.map(emp => {
    const isSelf = req.user?.employee_id === emp.id;
    return {
      ...emp,
      basic_salary: (canViewFinancials || isSelf) ? emp.basic_salary : null,
      allowances: (canViewFinancials || isSelf) ? emp.allowances : null,
      account_number: (canViewFinancials || isSelf) ? emp.account_number : maskBankAccount(emp.account_number),
      ifsc: (canViewFinancials || isSelf) ? emp.ifsc : '••••••••',
      upi_id: (canViewFinancials || isSelf) ? emp.upi_id : '••••••••'
    };
  });

  res.json(sanitizedRows);
});

// Get Single Employee Profile with Documents
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;

  if (!emp) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const documents = db.prepare('SELECT * FROM employee_documents WHERE employee_id = ?').all(id);

  const role = req.user?.role || 'EMPLOYEE';
  const isSelf = req.user?.employee_id === emp.id;
  const canViewFinancials = ['SUPER ADMIN', 'HR / ADMIN', 'ACCOUNTS'].includes(role);

  const profile = {
    ...emp,
    basic_salary: (canViewFinancials || isSelf) ? emp.basic_salary : null,
    allowances: (canViewFinancials || isSelf) ? emp.allowances : null,
    account_number: (canViewFinancials || isSelf) ? emp.account_number : maskBankAccount(emp.account_number),
    ifsc: (canViewFinancials || isSelf) ? emp.ifsc : '••••••••',
    upi_id: (canViewFinancials || isSelf) ? emp.upi_id : '••••••••',
    documents
  };

  res.json(profile);
});

// Create Employee
router.post('/', authenticate, requirePermission('Employees', 'create'), (req: AuthenticatedRequest, res: Response) => {
  const {
    id, first_name, last_name, gender, phone, email, dob, address, emergency_contact,
    department, designation, joining_date, employment_type, reporting_manager, work_location,
    status, bank_name, account_holder, account_number, ifsc, upi_id, salary_type, basic_salary,
    allowances, payment_cycle, avatar_url
  } = req.body;

  if (!id || !first_name || !last_name || !email || !department || !designation || !joining_date) {
    return res.status(400).json({ error: 'Please fill in all required employee fields' });
  }

  // Check duplicate ID
  const existingId = db.prepare('SELECT id FROM employees WHERE id = ?').get(id);
  if (existingId) {
    return res.status(400).json({ error: `Employee ID "${id}" is already assigned to another staff member` });
  }

  // Check duplicate Email
  const existingEmail = db.prepare('SELECT email FROM employees WHERE email = ?').get(email);
  if (existingEmail) {
    return res.status(400).json({ error: `Email address "${email}" is already registered` });
  }

  const userId = `USR-${id}`;
  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const tempPassword = 'password123';
  const hashedPass = bcrypt.hashSync(tempPassword, 10);

  const insertTx = db.transaction(() => {
    // 1. Create user account
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, employee_id, status)
      VALUES (?, ?, ?, ?, 'EMPLOYEE', ?, 'Active')
    `).run(userId, username, email, hashedPass, id);

    // 2. Insert employee
    db.prepare(`
      INSERT INTO employees (
        id, user_id, first_name, last_name, gender, phone, email, dob, address, emergency_contact,
        department, designation, joining_date, employment_type, reporting_manager, work_location,
        status, bank_name, account_holder, account_number, ifsc, upi_id, salary_type, basic_salary,
        allowances, payment_cycle, avatar_url
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `).run(
      id, userId, first_name, last_name, gender || 'Other', phone || '', email, dob || null, address || null, emergency_contact || null,
      department, designation, joining_date, employment_type || 'Full Time', reporting_manager || null, work_location || 'Kalpetta Office',
      status || 'Active', bank_name || null, account_holder || `${first_name} ${last_name}`, account_number || null, ifsc || null, upi_id || null,
      salary_type || 'Monthly', Number(basic_salary) || 0, Number(allowances) || 0, payment_cycle || 'Monthly',
      avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    );
  });

  insertTx();

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'CREATE',
    'Employees',
    id,
    null,
    `Created employee ${first_name} ${last_name} (${id}) in ${department}`
  );

  res.status(201).json({ message: 'Employee created successfully', id });
});

// Update Employee
router.put('/:id', authenticate, requirePermission('Employees', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const oldEmp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;
  if (!oldEmp) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const {
    first_name, last_name, gender, phone, email, dob, address, emergency_contact,
    department, designation, joining_date, employment_type, reporting_manager, work_location,
    status, bank_name, account_holder, account_number, ifsc, upi_id, salary_type, basic_salary,
    allowances, payment_cycle, avatar_url
  } = req.body;

  db.prepare(`
    UPDATE employees SET
      first_name = ?, last_name = ?, gender = ?, phone = ?, email = ?, dob = ?, address = ?,
      emergency_contact = ?, department = ?, designation = ?, joining_date = ?, employment_type = ?,
      reporting_manager = ?, work_location = ?, status = ?, bank_name = ?, account_holder = ?,
      account_number = ?, ifsc = ?, upi_id = ?, salary_type = ?, basic_salary = ?, allowances = ?,
      payment_cycle = ?, avatar_url = ?
    WHERE id = ?
  `).run(
    first_name || oldEmp.first_name,
    last_name || oldEmp.last_name,
    gender || oldEmp.gender,
    phone || oldEmp.phone,
    email || oldEmp.email,
    dob !== undefined ? dob : oldEmp.dob,
    address !== undefined ? address : oldEmp.address,
    emergency_contact !== undefined ? emergency_contact : oldEmp.emergency_contact,
    department || oldEmp.department,
    designation || oldEmp.designation,
    joining_date || oldEmp.joining_date,
    employment_type || oldEmp.employment_type,
    reporting_manager !== undefined ? reporting_manager : oldEmp.reporting_manager,
    work_location || oldEmp.work_location,
    status || oldEmp.status,
    bank_name !== undefined ? bank_name : oldEmp.bank_name,
    account_holder !== undefined ? account_holder : oldEmp.account_holder,
    account_number !== undefined ? account_number : oldEmp.account_number,
    ifsc !== undefined ? ifsc : oldEmp.ifsc,
    upi_id !== undefined ? upi_id : oldEmp.upi_id,
    salary_type || oldEmp.salary_type,
    basic_salary !== undefined ? Number(basic_salary) : oldEmp.basic_salary,
    allowances !== undefined ? Number(allowances) : oldEmp.allowances,
    payment_cycle || oldEmp.payment_cycle,
    avatar_url || oldEmp.avatar_url,
    id
  );

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE',
    'Employees',
    id,
    `Status: ${oldEmp.status}, Dept: ${oldEmp.department}`,
    `Status: ${status || oldEmp.status}, Dept: ${department || oldEmp.department}`
  );

  res.json({ message: 'Employee updated successfully' });
});

// Delete Employee
router.delete('/:id', authenticate, requirePermission('Employees', 'delete'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const emp = db.prepare('SELECT first_name, last_name FROM employees WHERE id = ?').get(id) as any;
  if (!emp) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const deleteTx = db.transaction(() => {
    db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    db.prepare('DELETE FROM users WHERE employee_id = ?').run(id);
  });
  deleteTx();

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'DELETE',
    'Employees',
    id,
    `${emp.first_name} ${emp.last_name}`,
    'Deleted from system'
  );

  res.json({ message: 'Employee deleted successfully' });
});

// Toggle Status (Activate / Deactivate)
router.patch('/:id/status', authenticate, requirePermission('Employees', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const oldEmp = db.prepare('SELECT status FROM employees WHERE id = ?').get(id) as any;
  if (!oldEmp) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  db.prepare('UPDATE employees SET status = ? WHERE id = ?').run(status, id);
  db.prepare('UPDATE users SET status = ? WHERE employee_id = ?').run(status === 'Active' ? 'Active' : 'Inactive', id);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'UPDATE_STATUS',
    'Employees',
    id,
    oldEmp.status,
    status
  );

  res.json({ message: `Employee status changed to ${status}` });
});

// Document Upload / Add
router.post('/:id/documents', authenticate, requirePermission('Employees', 'edit'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { doc_type, file_name, file_url } = req.body;

  if (!doc_type || !file_name) {
    return res.status(400).json({ error: 'Document type and file name are required' });
  }

  const docId = `DOC-${id}-${Date.now()}`;
  db.prepare(`
    INSERT INTO employee_documents (id, employee_id, doc_type, file_name, file_url)
    VALUES (?, ?, ?, ?, ?)
  `).run(docId, id, doc_type, file_name, file_url || `/docs/${file_name}`);

  recordAuditLog(
    req.user?.id || null,
    `${req.user?.first_name || ''} ${req.user?.last_name || ''}`.trim(),
    'ADD_DOCUMENT',
    'Employees',
    id,
    null,
    `Added ${doc_type}: ${file_name}`
  );

  res.status(201).json({ message: 'Document added successfully', docId });
});

export default router;
