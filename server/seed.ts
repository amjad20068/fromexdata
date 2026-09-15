import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

export function seedDatabase() {
  initDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    return; // Already seeded
  }

  console.log('Seeding FROMEX Health Tech database with realistic records...');

  const salt = bcrypt.genSaltSync(10);
  const hashPass = (p: string) => bcrypt.hashSync(p, salt);

  // 1. Roles & Permissions Setup
  const roles = ['SUPER ADMIN', 'HR / ADMIN', 'ACCOUNTS', 'MANAGER', 'EMPLOYEE'];
  const modules = [
    'Dashboard', 'Employees', 'Attendance', 'Leave', 
    'Accounts', 'Salary', 'Expenses', 'Payments', 
    'Invoices', 'Reports', 'Settings', 'Audit Logs'
  ];

  const insertPerm = db.prepare(`
    INSERT OR REPLACE INTO roles_permissions (role, module, can_view, can_create, can_edit, can_delete, can_approve, can_export, can_import, can_manage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of roles) {
    for (const m of modules) {
      if (r === 'SUPER ADMIN') {
        insertPerm.run(r, m, 1, 1, 1, 1, 1, 1, 1, 1);
      } else if (r === 'HR / ADMIN') {
        const canManage = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Reports'].includes(m);
        insertPerm.run(r, m, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0);
      } else if (r === 'ACCOUNTS') {
        const canManage = ['Dashboard', 'Accounts', 'Salary', 'Expenses', 'Payments', 'Invoices', 'Reports'].includes(m);
        insertPerm.run(r, m, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0, canManage ? 1 : 0);
      } else if (r === 'MANAGER') {
        const canView = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Reports'].includes(m);
        const canApprove = ['Attendance', 'Leave'].includes(m);
        insertPerm.run(r, m, canView ? 1 : 0, 0, canApprove ? 1 : 0, 0, canApprove ? 1 : 0, canView ? 1 : 0, 0, 0);
      } else { // EMPLOYEE
        const canView = ['Dashboard', 'Attendance', 'Leave', 'Salary'].includes(m);
        const canCreate = ['Attendance', 'Leave'].includes(m);
        insertPerm.run(r, m, canView ? 1 : 0, canCreate ? 1 : 0, 0, 0, 0, 0, 0, 0);
      }
    }
  }

  // 2. Company Settings
  db.prepare(`
    INSERT OR REPLACE INTO company_settings (
      id, company_name, logo_url, website, email, phone, address, gst_number, pan, cin, state, state_code, country
    ) VALUES (
      1, 'FROMEX Health Tech', '/logo.png', 'https://www.fromexhealthtech.com/', 'contact@fromexhealthtech.com', '+91-80759-18850',
      'Kalpetta, Wayanad, Kerala - 673121, India', '32AAECF1234F1Z8', 'AAECF1234F', 'U72900KL2023PTC081234', 'Kerala', '32', 'India'
    )
  `).run();

  // 3. Attendance Settings
  db.prepare(`
    INSERT OR REPLACE INTO attendance_settings (
      id, office_start_time, office_end_time, grace_period_minutes, min_working_hours
    ) VALUES (
      1, '09:00', '18:00', 15, 8.0
    )
  `).run();

  // 4. Departments
  const depts = [
    ['DEP-001', 'Technology & AI', 'Dr. Arun Varma', 'AI-powered clinical software, algorithms, cloud solutions', 'Active'],
    ['DEP-002', 'Clinical Operations', 'Dr. Fathima Zahra', 'Clinical workflow analysis, hospital process design', 'Active'],
    ['DEP-003', 'Human Resources', 'Priya Nambiar', 'Talent acquisition, employee welfare, company culture', 'Active'],
    ['DEP-004', 'Finance & Accounts', 'Kavitha S.', 'Payroll, treasury, GST compliance, financial reporting', 'Active'],
    ['DEP-005', 'Operations & Logistics', 'Rahul Menon', 'Facility management, procurement, vendor coordination', 'Active'],
    ['DEP-006', 'Executive Management', 'Muhammed Nihal', 'Corporate leadership and strategic vision', 'Active']
  ];
  const insertDept = db.prepare('INSERT OR REPLACE INTO departments (id, name, head_name, description, status) VALUES (?, ?, ?, ?, ?)');
  depts.forEach(d => insertDept.run(...d));

  // 5. Designations
  const desigs = [
    ['DES-001', 'Chief Executive Officer', 'Executive Management', 'Executive direction and strategic partnerships'],
    ['DES-002', 'Lead AI Healthcare Engineer', 'Technology & AI', 'Health NLP, clinical LLM implementations, architecture'],
    ['DES-003', 'Senior Full-Stack Developer', 'Technology & AI', 'Healthcare cloud apps, React, Node.js, FHIR APIs'],
    ['DES-004', 'Clinical Workflow Specialist', 'Clinical Operations', 'Hospital digitization, doctor UX, clinic protocols'],
    ['DES-005', 'HR & People Operations Manager', 'Human Resources', 'Employee life cycle, compliance, retention'],
    ['DES-006', 'Senior Accounts Officer', 'Finance & Accounts', 'Financial audit, payroll, tax and expense tracking'],
    ['DES-007', 'Healthcare Operations Lead', 'Operations & Logistics', 'Deployment coordination and client installations'],
    ['DES-008', 'AI & Data Science Intern', 'Technology & AI', 'Medical dataset curation and computer vision training']
  ];
  const insertDesig = db.prepare("INSERT OR REPLACE INTO designations (id, title, department_name, description, status) VALUES (?, ?, ?, ?, 'Active')");
  desigs.forEach(d => insertDesig.run(...d));

  // 6. Users & Employees
  const employeesData = [
    {
      id: 'FX-1001',
      username: 'admin',
      email: 'admin@fromexhealthtech.com',
      password: 'admin123',
      role: 'SUPER ADMIN',
      firstName: 'Muhammed',
      lastName: 'Nihal',
      gender: 'Male',
      phone: '+91-98471-23456',
      dob: '1988-06-14',
      address: 'Pine Valley, Kalpetta, Wayanad, Kerala - 673121',
      emergency: 'Dr. Sameer Nihal (+91-98471-99999)',
      dept: 'Executive Management',
      desig: 'Chief Executive Officer',
      joining: '2022-01-10',
      empType: 'Full Time',
      manager: 'Board of Directors',
      location: 'Kalpetta HQ',
      status: 'Active',
      bankName: 'HDFC Bank Ltd',
      holder: 'Muhammed Nihal',
      accNo: '50200084729104',
      ifsc: 'HDFC0001248',
      upi: 'nihal@okhdfcbank',
      salaryType: 'Monthly',
      basic: 180000,
      allowances: 45000,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'FX-1002',
      username: 'priya_hr',
      email: 'priya.nambiar@fromexhealthtech.com',
      password: 'hr123',
      role: 'HR / ADMIN',
      firstName: 'Priya',
      lastName: 'Nambiar',
      gender: 'Female',
      phone: '+91-97451-87654',
      dob: '1992-04-18',
      address: 'Green Meadows Apt, Sulthan Bathery, Wayanad',
      emergency: 'K. Nambiar (+91-97451-11111)',
      dept: 'Human Resources',
      desig: 'HR & People Operations Manager',
      joining: '2022-04-01',
      empType: 'Full Time',
      manager: 'Muhammed Nihal',
      location: 'Kalpetta HQ',
      status: 'Active',
      bankName: 'State Bank of India',
      holder: 'Priya Nambiar',
      accNo: '381920491823',
      ifsc: 'SBIN0008492',
      upi: 'priya@oksbi',
      salaryType: 'Monthly',
      basic: 85000,
      allowances: 15000,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'FX-1003',
      username: 'kavitha_accounts',
      email: 'kavitha.s@fromexhealthtech.com',
      password: 'accounts123',
      role: 'ACCOUNTS',
      firstName: 'Kavitha',
      lastName: 'S.',
      gender: 'Female',
      phone: '+91-94960-55443',
      dob: '1990-11-25',
      address: 'Hill View Enclave, Mananthavady, Wayanad',
      emergency: 'Suresh Kumar (+91-94960-99887)',
      dept: 'Finance & Accounts',
      desig: 'Senior Accounts Officer',
      joining: '2022-07-15',
      empType: 'Full Time',
      manager: 'Muhammed Nihal',
      location: 'Kalpetta HQ',
      status: 'Active',
      bankName: 'Federal Bank',
      holder: 'Kavitha S',
      accNo: '12890100482910',
      ifsc: 'FDRL0001289',
      upi: 'kavitha@fednet',
      salaryType: 'Monthly',
      basic: 78000,
      allowances: 12000,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'FX-1004',
      username: 'arun_lead',
      email: 'arun.varma@fromexhealthtech.com',
      password: 'manager123',
      role: 'MANAGER',
      firstName: 'Dr. Arun',
      lastName: 'Varma',
      gender: 'Male',
      phone: '+91-98950-12984',
      dob: '1987-09-08',
      address: 'Orchid Heights, Vythiri, Wayanad',
      emergency: 'Anjali Varma (+91-98950-77665)',
      dept: 'Technology & AI',
      desig: 'Lead AI Healthcare Engineer',
      joining: '2022-02-15',
      empType: 'Full Time',
      manager: 'Muhammed Nihal',
      location: 'Kalpetta HQ',
      status: 'Active',
      bankName: 'HDFC Bank Ltd',
      holder: 'Dr. Arun Varma',
      accNo: '50100294819203',
      ifsc: 'HDFC0001248',
      upi: 'arunvarma@hdfc',
      salaryType: 'Monthly',
      basic: 145000,
      allowances: 25000,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'FX-1005',
      username: 'rohit_dev',
      email: 'rohit.sharma@fromexhealthtech.com',
      password: 'emp123',
      role: 'EMPLOYEE',
      firstName: 'Rohit',
      lastName: 'Sharma',
      gender: 'Male',
      phone: '+91-94471-88990',
      dob: '1995-03-12',
      address: 'Civil Station Road, Kalpetta, Wayanad',
      emergency: 'Sunita Sharma (+91-94471-22334)',
      dept: 'Technology & AI',
      desig: 'Senior Full-Stack Developer',
      joining: '2023-01-05',
      empType: 'Full Time',
      manager: 'Dr. Arun Varma',
      location: 'Kalpetta HQ',
      status: 'Active',
      bankName: 'Axis Bank',
      holder: 'Rohit Sharma',
      accNo: '918020048192038',
      ifsc: 'UTIB0000849',
      upi: 'rohit@axisbank',
      salaryType: 'Monthly',
      basic: 95000,
      allowances: 18000,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'FX-1006',
      username: 'fathima_zahra',
      email: 'fathima.zahra@fromexhealthtech.com',
      password: 'emp123',
      role: 'EMPLOYEE',
      firstName: 'Dr. Fathima',
      lastName: 'Zahra',
      gender: 'Female',
      phone: '+91-98460-33445',
      dob: '1991-07-22',
      address: 'Wayanad Club Road, Meppadi, Wayanad',
      emergency: 'Zameer Ahmed (+91-98460-88776)',
      dept: 'Clinical Operations',
      desig: 'Clinical Workflow Specialist',
      joining: '2023-03-10',
      empType: 'Full Time',
      manager: 'Muhammed Nihal',
      location: 'Kalpetta HQ',
      status: 'Active',
      bankName: 'State Bank of India',
      holder: 'Dr. Fathima Zahra',
      accNo: '394810294819',
      ifsc: 'SBIN0008492',
      upi: 'fathima@sbi',
      salaryType: 'Monthly',
      basic: 110000,
      allowances: 20000,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'FX-1007',
      username: 'rahul_ops',
      email: 'rahul.menon@fromexhealthtech.com',
      password: 'emp123',
      role: 'EMPLOYEE',
      firstName: 'Rahul',
      lastName: 'Menon',
      gender: 'Male',
      phone: '+91-97470-44556',
      dob: '1993-12-05',
      address: 'Main Bazaar, Kalpetta, Wayanad',
      emergency: 'Radha Menon (+91-97470-11223)',
      dept: 'Operations & Logistics',
      desig: 'Healthcare Operations Lead',
      joining: '2023-05-18',
      empType: 'Full Time',
      manager: 'Muhammed Nihal',
      location: 'Kalpetta HQ',
      status: 'Active',
      bankName: 'ICICI Bank',
      holder: 'Rahul Menon',
      accNo: '049101509281',
      ifsc: 'ICIC0000491',
      upi: 'rahul@icici',
      salaryType: 'Monthly',
      basic: 70000,
      allowances: 10000,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'FX-1008',
      username: 'sneha_intern',
      email: 'sneha.george@fromexhealthtech.com',
      password: 'emp123',
      role: 'EMPLOYEE',
      firstName: 'Sneha',
      lastName: 'George',
      gender: 'Female',
      phone: '+91-94970-12345',
      dob: '2001-08-30',
      address: 'Kainatty, Kalpetta, Wayanad',
      emergency: 'George Mathew (+91-94970-98765)',
      dept: 'Technology & AI',
      desig: 'AI & Data Science Intern',
      joining: '2024-01-15',
      empType: 'Intern',
      manager: 'Dr. Arun Varma',
      location: 'Kalpetta HQ',
      status: 'Active',
      bankName: 'Canara Bank',
      holder: 'Sneha George',
      accNo: '24910100481920',
      ifsc: 'CNRB0002491',
      upi: 'sneha@okcanara',
      salaryType: 'Monthly',
      basic: 25000,
      allowances: 3000,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'FX-1009',
      username: 'vivek_ui',
      email: 'vivek.k@fromexhealthtech.com',
      password: 'emp123',
      role: 'EMPLOYEE',
      firstName: 'Vivek',
      lastName: 'K.',
      gender: 'Male',
      phone: '+91-98470-77889',
      dob: '1996-05-14',
      address: 'Chundale, Wayanad',
      emergency: 'Rajesh K (+91-98470-44556)',
      dept: 'Technology & AI',
      desig: 'Senior Full-Stack Developer',
      joining: '2023-08-01',
      empType: 'Contract',
      manager: 'Dr. Arun Varma',
      location: 'Remote',
      status: 'Active',
      bankName: 'Federal Bank',
      holder: 'Vivek K',
      accNo: '13910100381920',
      ifsc: 'FDRL0001391',
      upi: 'vivek@federal',
      salaryType: 'Monthly',
      basic: 80000,
      allowances: 10000,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'FX-1010',
      username: 'ananya_doc',
      email: 'ananya.das@fromexhealthtech.com',
      password: 'emp123',
      role: 'EMPLOYEE',
      firstName: 'Ananya',
      lastName: 'Das',
      gender: 'Female',
      phone: '+91-98951-44332',
      dob: '1994-10-10',
      address: 'Meppadi Road, Kalpetta, Wayanad',
      emergency: 'Debashis Das (+91-98951-99001)',
      dept: 'Clinical Operations',
      desig: 'Clinical Workflow Specialist',
      joining: '2023-11-15',
      empType: 'Full Time',
      manager: 'Dr. Fathima Zahra',
      location: 'Kalpetta HQ',
      status: 'Active',
      bankName: 'Kotak Mahindra Bank',
      holder: 'Ananya Das',
      accNo: '719204918204',
      ifsc: 'KKBK0000849',
      upi: 'ananya@kotak',
      salaryType: 'Monthly',
      basic: 72000,
      allowances: 12000,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, employee_id, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Active')
  `);

  const insertEmp = db.prepare(`
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
  `);

  const insertDoc = db.prepare(`
    INSERT INTO employee_documents (id, employee_id, doc_type, file_name, file_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const emp of employeesData) {
    const userId = `USR-${emp.id}`;
    insertUser.run(userId, emp.username, emp.email, hashPass(emp.password), emp.role, emp.id);

    insertEmp.run(
      emp.id, userId, emp.firstName, emp.lastName, emp.gender, emp.phone, emp.email, emp.dob, emp.address, emp.emergency,
      emp.dept, emp.desig, emp.joining, emp.empType, emp.manager, emp.location,
      emp.status, emp.bankName, emp.holder, emp.accNo, emp.ifsc, emp.upi, emp.salaryType, emp.basic,
      emp.allowances, 'Monthly', emp.avatar
    );

    // Add standard sample documents
    insertDoc.run(`DOC-${emp.id}-1`, emp.id, 'ID Proof', 'Aadhaar_Card_Verified.pdf', '/docs/aadhaar_sample.pdf');
    insertDoc.run(`DOC-${emp.id}-2`, emp.id, 'Offer Letter', 'FROMEX_Offer_Letter_Signed.pdf', '/docs/offer_sample.pdf');
    insertDoc.run(`DOC-${emp.id}-3`, emp.id, 'Contract', 'Employment_Agreement_2023.pdf', '/docs/contract_sample.pdf');
  }

  // 7. Attendance Records (Today + Past 5 Days)
  const today = new Date().toISOString().split('T')[0];
  const dates = [];
  for (let i = 0; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const insertAtt = db.prepare(`
    INSERT INTO attendance (id, employee_id, date, check_in, check_out, working_hours, status, source, remarks, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Seed attendance for today
  insertAtt.run('ATT-FX1001-TODAY', 'FX-1001', today, '08:55', null, 0, 'Present', 'Web App (kalpetta-hq-wifi)', 'On time CEO check-in', 'System');
  insertAtt.run('ATT-FX1002-TODAY', 'FX-1002', today, '09:05', null, 0, 'Present', 'Mobile App', 'Morning team huddle', 'System');
  insertAtt.run('ATT-FX1003-TODAY', 'FX-1003', today, '09:12', null, 0, 'Present', 'Web App', 'Accounts desk', 'System');
  insertAtt.run('ATT-FX1004-TODAY', 'FX-1004', today, '09:22', null, 0, 'Late', 'Biometric Gate 1', 'Traffic near bypass', 'System');
  insertAtt.run('ATT-FX1005-TODAY', 'FX-1005', today, '08:50', null, 0, 'Present', 'Web App', 'Sprint review ready', 'System');
  insertAtt.run('ATT-FX1006-TODAY', 'FX-1006', today, null, null, 0, 'Leave', 'Leave System', 'Approved Sick Leave', 'Priya Nambiar');
  insertAtt.run('ATT-FX1007-TODAY', 'FX-1007', today, '09:02', null, 0, 'Present', 'Mobile App', 'Hospital deployment visit', 'System');
  insertAtt.run('ATT-FX1008-TODAY', 'FX-1008', today, '09:40', null, 0, 'Late', 'Web App', 'Late arrival lab experiment', 'System');
  insertAtt.run('ATT-FX1009-TODAY', 'FX-1009', today, null, null, 0, 'Absent', 'System', 'Uninformed absence', 'System');
  insertAtt.run('ATT-FX1010-TODAY', 'FX-1010', today, '09:14', null, 0, 'Present', 'Web App', 'Clinical workflow audit', 'System');

  // Seed past days attendance
  for (let i = 1; i < dates.length; i++) {
    const d = dates[i];
    employeesData.forEach((emp, idx) => {
      const isLate = (idx + i) % 7 === 0;
      const isLeave = (idx + i) % 9 === 0;
      const isAbsent = (idx + i) % 11 === 0;

      let status = 'Present';
      let checkIn = '08:55';
      let checkOut = '18:15';
      let hours = 9.33;

      if (isAbsent) {
        status = 'Absent';
        checkIn = null as any;
        checkOut = null as any;
        hours = 0;
      } else if (isLeave) {
        status = 'Leave';
        checkIn = null as any;
        checkOut = null as any;
        hours = 0;
      } else if (isLate) {
        status = 'Late';
        checkIn = '09:25';
        checkOut = '18:30';
        hours = 9.08;
      }

      insertAtt.run(`ATT-${emp.id}-${d}`, emp.id, d, checkIn, checkOut, hours, status, 'Web App', '', 'System');
    });
  }

  // 8. Leave Requests
  const insertLeave = db.prepare(`
    INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, total_days, reason, attachment, status, reviewed_by, reviewed_at, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLeave.run(
    'LEV-101', 'FX-1006', 'Sick Leave', today, today, 1, 'Mild seasonal fever and doctor visit',
    'medical_prescription.pdf', 'Approved', 'Priya Nambiar', today, 'Approved. Take care.'
  );
  insertLeave.run(
    'LEV-102', 'FX-1005', 'Annual Leave', '2026-09-20', '2026-09-22', 3, 'Family function in Kochi',
    'invitation_doc.pdf', 'Pending', null, null, 'Under review by Tech Lead'
  );
  insertLeave.run(
    'LEV-103', 'FX-1008', 'Casual Leave', '2026-09-25', '2026-09-25', 1, 'University semester exam formalities',
    'hallticket.pdf', 'Pending', null, null, 'Pending approval'
  );
  insertLeave.run(
    'LEV-104', 'FX-1007', 'Emergency Leave', '2026-09-02', '2026-09-03', 2, 'Personal emergency at ancestral home',
    null, 'Approved', 'Muhammed Nihal', '2026-09-02', 'Granted.'
  );

  // 9. Company Accounts
  const accountsData = [
    {
      id: 'ACC-001',
      name: 'HDFC Corporate Current Account',
      type: 'Bank Account',
      bank: 'HDFC Bank Ltd',
      accNo: '50200091823901',
      ifsc: 'HDFC0001248',
      branch: 'Kalpetta Town',
      holder: 'FROMEX HEALTH TECH PVT LTD',
      opening: 2500000,
      current: 2435000,
      notes: 'Primary operations, vendor settlement, and payroll disbursement'
    },
    {
      id: 'ACC-002',
      name: 'State Bank of India - Operational',
      type: 'Bank Account',
      bank: 'State Bank of India',
      accNo: '381920048192',
      ifsc: 'SBIN0008492',
      branch: 'Kalpetta Main',
      holder: 'FROMEX HEALTH TECH PVT LTD',
      opening: 1500000,
      current: 1280000,
      notes: 'Statutory payments, taxes, utility bills and local vendors'
    },
    {
      id: 'ACC-003',
      name: 'Kalpetta HQ Petty Cash Box',
      type: 'Petty Cash',
      bank: 'Internal Cash Vault',
      accNo: 'CASH-HQ-01',
      ifsc: 'N/A',
      branch: 'Kalpetta Office Room 204',
      holder: 'Kavitha S (Accounts)',
      opening: 50000,
      current: 43200,
      notes: 'Office pantry, courier, minor maintenance'
    },
    {
      id: 'ACC-004',
      name: 'Razorpay Corporate Gateway & UPI',
      type: 'UPI',
      bank: 'RazorpayX / Yes Bank',
      accNo: 'RZPX9182049182',
      ifsc: 'YESB0000001',
      branch: 'Bangalore Digital',
      holder: 'FROMEX Health Tech',
      opening: 200000,
      current: 195400,
      notes: 'Client SaaS collections and digital payment links'
    }
  ];

  const insertAcc = db.prepare(`
    INSERT INTO company_accounts (id, account_name, account_type, bank_name, account_number, ifsc, branch, account_holder, opening_balance, current_balance, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)
  `);
  accountsData.forEach(a => insertAcc.run(a.id, a.name, a.type, a.bank, a.accNo, a.ifsc, a.branch, a.holder, a.opening, a.current, a.notes));

  // 10. Account Transactions
  const insertTxn = db.prepare(`
    INSERT INTO account_transactions (id, account_id, type, amount, reference_type, reference_id, description, balance_after, transaction_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTxn.run('TXN-1001', 'ACC-001', 'Credit', 450000, 'Invoice', 'INV-2026-001', 'Payment received from Aster Medcity Clinic AI deployment', 2550000, '2026-09-05');
  insertTxn.run('TXN-1002', 'ACC-001', 'Debit', 115000, 'Expense', 'EXP-101', 'AWS Healthcare Cloud Infrastructure Invoice #AWS-84920', 2435000, '2026-09-08');
  insertTxn.run('TXN-1003', 'ACC-002', 'Debit', 42000, 'Expense', 'EXP-102', 'Kalpetta Office High-Speed Leased Line Internet (BSNL)', 1280000, '2026-09-10');
  insertTxn.run('TXN-1004', 'ACC-003', 'Debit', 6800, 'Expense', 'EXP-103', 'Medical devices demo supplies and lab sensor consumables', 43200, '2026-09-12');

  // 11. Salary Records (Previous month + Current Month Draft/Calculated)
  const insertSal = db.prepare(`
    INSERT INTO salary_records (
      id, employee_id, month, year, salary_type, basic_salary, allowances, bonus, overtime,
      gross_salary, deductions, advance, loan, net_salary, status, payment_date, payment_account_id, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  employeesData.forEach(emp => {
    const basic = emp.basic;
    const allowances = emp.allowances;
    const bonus = 5000;
    const overtime = 0;
    const gross = basic + allowances + bonus + overtime;
    const pfDeduction = Math.round(basic * 0.12);
    const profTax = 200;
    const deductions = pfDeduction + profTax;
    const advance = 0;
    const loan = 0;
    const net = gross - deductions - advance - loan;

    // Previous month (August 2026) - Paid
    insertSal.run(
      `SAL-${emp.id}-2026-08`, emp.id, 8, 2026, emp.salaryType, basic, allowances, bonus, overtime,
      gross, deductions, advance, loan, net, 'Paid', '2026-08-31', 'ACC-001', 'August salary disbursed via HDFC Corporate netbanking'
    );

    // Current month (September 2026) - Calculated
    insertSal.run(
      `SAL-${emp.id}-2026-09`, emp.id, 9, 2026, emp.salaryType, basic, allowances, 0, 0,
      basic + allowances, deductions, advance, loan, (basic + allowances) - deductions, 'Calculated', null, 'ACC-001', 'September salary pending monthly approval'
    );
  });

  // 12. Expenses
  const insertExp = db.prepare(`
    INSERT INTO expenses (
      id, date, category, description, amount, paid_from_account_id, vendor, employee_id,
      receipt_url, payment_method, gst_applicable, gst_rate, cgst, sgst, igst, taxable_amount, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertExp.run(
    'EXP-101', '2026-09-08', 'Software', 'AWS Cloud HIPPA & FHIR Healthcare Server Hosting', 115000, 'ACC-001', 'Amazon Web Services India', 'FX-1004',
    '/receipts/aws_sep_2026.pdf', 'Corporate Card', 1, 18, 10350, 10350, 0, 97457.63, 'Approved', 'Crucial GPU instances for medical imaging models'
  );
  insertExp.run(
    'EXP-102', '2026-09-10', 'Internet', 'High-speed dedicated leased line 200 Mbps (Kalpetta HQ)', 42000, 'ACC-002', 'BSNL Kerala Telecom', 'FX-1007',
    '/receipts/bsnl_leased_line.pdf', 'NEFT', 1, 18, 3780, 3780, 0, 35593.22, 'Approved', 'Quarterly fiber broadband renewal'
  );
  insertExp.run(
    'EXP-103', '2026-09-12', 'Medical', 'Smart wearable ECG test devkits and BLE bio-sensors', 38500, 'ACC-001', 'BioSense MedTech Systems', 'FX-1006',
    '/receipts/biosense_invoice.pdf', 'Bank Transfer', 1, 12, 2310, 2310, 0, 34375, 'Approved', 'Hardware prototype for hospital bedside tracking'
  );
  insertExp.run(
    'EXP-104', '2026-09-11', 'Travel', 'Client site clinical inspection at Wayanad Medical College', 6500, 'ACC-003', 'Kalpetta Taxi & Logistics', 'FX-1007',
    '/receipts/taxi_bill.pdf', 'Cash', 0, 0, 0, 0, 0, 6500, 'Approved', 'Local transit and hospital staff onboarding'
  );
  insertExp.run(
    'EXP-105', '2026-09-05', 'Office', 'Office ergonomic workstations and clinic test bench repairs', 28000, 'ACC-001', 'Wayanad Modular Furnishings', 'FX-1002',
    '/receipts/furniture.pdf', 'Bank Transfer', 1, 18, 2520, 2520, 0, 23728.81, 'Approved', 'New developer desks in Tech Room B'
  );

  // 13. Payments
  const insertPay = db.prepare(`
    INSERT INTO payments (id, date, from_account_id, to_name, payment_type, reference_number, amount, description, status, attachment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPay.run('PAY-201', '2026-09-08', 'ACC-001', 'Amazon Web Services India', 'Vendor', 'REF-AWS-91823', 115000, 'Cloud server compute charges for September', 'Completed', 'aws_slip.pdf');
  insertPay.run('PAY-202', '2026-09-10', 'ACC-002', 'BSNL Wayanad Telecom', 'Expense', 'REF-BSNL-49102', 42000, 'Leased line internet bill Q3', 'Completed', 'bsnl_slip.pdf');
  insertPay.run('PAY-203', '2026-09-15', 'ACC-001', 'BioSense MedTech Systems', 'Vendor', 'REF-BIO-38291', 38500, 'Sensor devkits procurement', 'Pending', null);
  insertPay.run('PAY-204', '2026-08-31', 'ACC-001', 'Employee August Batch Payroll', 'Salary', 'REF-SAL-202608', 924500, 'Total August salary disbursement to 10 employees', 'Completed', 'bank_batch_ack.pdf');

  // 14. Reimbursements
  const insertRmb = db.prepare(`
    INSERT INTO reimbursements (id, employee_id, date, category, amount, description, receipt_url, status, reviewed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertRmb.run('RMB-301', 'FX-1005', '2026-09-09', 'Software', 4500, 'GitHub Copilot Enterprise annual renewal for AI team', '/receipts/copilot.pdf', 'Accounts Review', 'Dr. Arun Varma');
  insertRmb.run('RMB-302', 'FX-1007', '2026-09-11', 'Travel', 2400, 'Inter-hospital transit fuel reimbursement (Kozhikode visit)', '/receipts/fuel_sep11.pdf', 'Approved', 'Priya Nambiar');
  insertRmb.run('RMB-303', 'FX-1006', '2026-09-12', 'Medical', 3200, 'Clinical trial antiseptic wipes and sterile glove inventory', '/receipts/pharma_supplies.pdf', 'Submitted', null);

  // 15. Invoices & Line Items
  const insertInv = db.prepare(`
    INSERT INTO invoices (
      id, invoice_number, invoice_date, due_date, customer_name, customer_email, customer_address,
      gst_number, taxable_amount, gst_rate, cgst, sgst, igst, discount, grand_total, payment_status, notes,
      contract_type, billing_frequency
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertInvItem = db.prepare(`
    INSERT INTO invoice_items (id, invoice_id, description, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Invoice 1: Medcity
  insertInv.run(
    'INV-001', 'FX-INV-2026-001', '2026-08-25', '2026-09-10', 'Aster Medcity Multi-Specialty Clinic', 'billing@astermedcity.org',
    'Chundale Medical Enclave, Wayanad, Kerala - 673123', '32AABCA8765E1ZG', 381355.93, 18, 34322.03, 34322.03, 0, 0, 450000, 'Paid',
    'Implementation and setup of FROMEX Clinic Workflow AI Suite Q3', 'SaaS Subscription', 'Annual'
  );
  insertInvItem.run('ITEM-001-1', 'INV-001', 'FROMEX AI Clinical Workflow Software License (Annual)', 1, 280000, 280000);
  insertInvItem.run('ITEM-001-2', 'INV-001', 'On-site Doctor & Nursing Staff Digitization Training', 2, 35000, 70000);
  insertInvItem.run('ITEM-001-3', 'INV-001', 'FHIR / EHR Interoperability Gateway Connector', 1, 31355.93, 31355.93);

  // Invoice 2: WIMS Hospital
  insertInv.run(
    'INV-002', 'FX-INV-2026-002', '2026-09-02', '2026-09-22', 'DM Wayanad Institute of Medical Sciences (WIMS)', 'finance@wimswayanad.com',
    'Naseera Nagar, Meppadi P.O., Wayanad, Kerala - 673577', '32AABTD9482F1ZF', 550847.46, 18, 49576.27, 49576.27, 0, 0, 650000, 'Partially Paid',
    'AI-powered OPD Queue Optimization and Bed Allocation Engine', 'Software AMC', 'Annual'
  );
  insertInvItem.run('ITEM-002-1', 'INV-002', 'FROMEX Hospital Operational Intelligence Platform v2.4', 1, 450000, 450000);
  insertInvItem.run('ITEM-002-2', 'INV-002', 'Custom IoT Sensor Gateway Integration for 12 ICU Beds', 1, 100847.46, 100847.46);

  // Invoice 3: Malabar Health Tech
  insertInv.run(
    'INV-003', 'FX-INV-2026-003', '2026-09-12', '2026-09-27', 'Malabar Health Tech Diagnostics', 'accounts@malabarhealth.com',
    'Mavoor Road, Kozhikode, Kerala - 673004', '32AAECM4910K1ZD', 186440.68, 18, 16779.66, 16779.66, 0, 0, 220000, 'Sent',
    'Cloud Pathology Report Analyzer & AI Summary Module', 'SaaS Subscription', 'Monthly'
  );
  insertInvItem.run('ITEM-003-1', 'INV-003', 'AI Pathology Report Summary Engine Module', 1, 186440.68, 186440.68);

  // 16. Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run('NTF-01', null, 'Late Attendance Alert', 'Dr. Arun Varma checked in at 09:22 AM (Grace period 15 min exceeded).', 'warning', '/attendance', 0);
  insertNotif.run('NTF-02', null, 'New Leave Request', 'Rohit Sharma has requested 3 days Annual Leave starting Sep 20.', 'info', '/leave', 0);
  insertNotif.run('NTF-03', null, 'Reimbursement Submitted', 'Vivek K. submitted software expense reimbursement for ₹4,500.', 'info', '/accounts/reimbursements', 0);
  insertNotif.run('NTF-04', null, 'September Payroll Calculated', 'September 2026 salary records calculated for 10 employees.', 'success', '/accounts/payroll', 0);
  insertNotif.run('NTF-05', null, 'Pending Payment Notice', 'Vendor payment to BioSense MedTech Systems (₹38,500) due on Sep 15.', 'warning', '/accounts/payments', 0);

  // 17. Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, action, module, record_id, old_value, new_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('AUD-01', 'USR-FX-1001', 'Muhammed Nihal', 'CREATE', 'Employees', 'FX-1010', null, 'Added employee Ananya Das (Clinical Workflow Specialist)');
  insertAudit.run('AUD-02', 'USR-FX-1002', 'Priya Nambiar', 'APPROVE', 'Leave', 'LEV-101', 'Status: Pending', 'Status: Approved (Dr. Fathima Zahra Sick Leave)');
  insertAudit.run('AUD-03', 'USR-FX-1003', 'Kavitha S.', 'UPDATE', 'Accounts', 'ACC-001', 'Balance: ₹25,50,000', 'Balance: ₹24,35,000 (Deducted AWS Expense #EXP-101)');
  insertAudit.run('AUD-04', 'USR-FX-1001', 'Muhammed Nihal', 'UPDATE', 'Settings', 'attendance_settings', 'Grace: 10 mins', 'Grace: 15 mins');

  console.log('Database seeded successfully with 10+ employees, accounts, payroll, and logs!');
}
