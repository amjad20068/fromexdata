import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/fromex.db');

export const db = new Database(dbPath, { verbose: undefined });

// Enable Write-Ahead Logging for concurrency and foreign key constraints
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Users & Authentication
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      employee_id TEXT UNIQUE,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Role Permissions Matrix
    CREATE TABLE IF NOT EXISTS roles_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      module TEXT NOT NULL,
      can_view INTEGER DEFAULT 0,
      can_create INTEGER DEFAULT 0,
      can_edit INTEGER DEFAULT 0,
      can_delete INTEGER DEFAULT 0,
      can_approve INTEGER DEFAULT 0,
      can_export INTEGER DEFAULT 0,
      can_import INTEGER DEFAULT 0,
      can_manage INTEGER DEFAULT 0,
      UNIQUE(role, module)
    );

    -- Departments
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      head_name TEXT,
      description TEXT,
      status TEXT DEFAULT 'Active'
    );

    -- Designations
    CREATE TABLE IF NOT EXISTS designations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department_name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Active'
    );

    -- Employees
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      gender TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      dob TEXT,
      address TEXT,
      emergency_contact TEXT,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      joining_date TEXT NOT NULL,
      employment_type TEXT NOT NULL,
      reporting_manager TEXT,
      work_location TEXT DEFAULT 'Kalpetta Office',
      status TEXT DEFAULT 'Active',
      bank_name TEXT,
      account_holder TEXT,
      account_number TEXT,
      ifsc TEXT,
      upi_id TEXT,
      salary_type TEXT DEFAULT 'Monthly',
      basic_salary REAL DEFAULT 0,
      allowances REAL DEFAULT 0,
      payment_cycle TEXT DEFAULT 'Monthly',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Employee Documents
    CREATE TABLE IF NOT EXISTS employee_documents (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Attendance Settings
    CREATE TABLE IF NOT EXISTS attendance_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      office_start_time TEXT DEFAULT '09:00',
      office_end_time TEXT DEFAULT '18:00',
      grace_period_minutes INTEGER DEFAULT 15,
      min_working_hours REAL DEFAULT 8.0
    );

    -- Attendance Records
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      working_hours REAL DEFAULT 0,
      status TEXT NOT NULL,
      source TEXT DEFAULT 'Web App',
      remarks TEXT,
      updated_by TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, date),
      FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Leave Requests
    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total_days REAL NOT NULL,
      reason TEXT,
      attachment TEXT,
      status TEXT DEFAULT 'Pending',
      reviewed_by TEXT,
      reviewed_at TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Company Bank & Cash Accounts
    CREATE TABLE IF NOT EXISTS company_accounts (
      id TEXT PRIMARY KEY,
      account_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      bank_name TEXT,
      account_number TEXT,
      ifsc TEXT,
      branch TEXT,
      account_holder TEXT,
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      status TEXT DEFAULT 'Active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Account Transactions
    CREATE TABLE IF NOT EXISTS account_transactions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      type TEXT NOT NULL, -- Credit / Debit
      amount REAL NOT NULL,
      reference_type TEXT, -- Salary, Expense, Payment, Invoice, Reimbursement, Transfer
      reference_id TEXT,
      description TEXT,
      balance_after REAL NOT NULL,
      transaction_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES company_accounts(id) ON DELETE CASCADE
    );

    -- Salary Records
    CREATE TABLE IF NOT EXISTS salary_records (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      salary_type TEXT DEFAULT 'Monthly',
      basic_salary REAL DEFAULT 0,
      allowances REAL DEFAULT 0,
      bonus REAL DEFAULT 0,
      overtime REAL DEFAULT 0,
      gross_salary REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      advance REAL DEFAULT 0,
      loan REAL DEFAULT 0,
      net_salary REAL DEFAULT 0,
      status TEXT DEFAULT 'Calculated',
      payment_date TEXT,
      payment_account_id TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, month, year),
      FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Expenses
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_from_account_id TEXT,
      vendor TEXT,
      employee_id TEXT,
      receipt_url TEXT,
      payment_method TEXT DEFAULT 'Bank Transfer',
      gst_applicable INTEGER DEFAULT 0,
      gst_rate REAL DEFAULT 0,
      cgst REAL DEFAULT 0,
      sgst REAL DEFAULT 0,
      igst REAL DEFAULT 0,
      taxable_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Approved',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Payments
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      from_account_id TEXT NOT NULL,
      to_name TEXT NOT NULL,
      payment_type TEXT NOT NULL,
      reference_number TEXT,
      amount REAL NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Completed',
      attachment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(from_account_id) REFERENCES company_accounts(id)
    );

    -- Reimbursements
    CREATE TABLE IF NOT EXISTS reimbursements (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      receipt_url TEXT,
      status TEXT DEFAULT 'Submitted',
      reviewed_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Invoices
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      invoice_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_address TEXT,
      gst_number TEXT,
      taxable_amount REAL DEFAULT 0,
      gst_rate REAL DEFAULT 18,
      cgst REAL DEFAULT 0,
      sgst REAL DEFAULT 0,
      igst REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      grand_total REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'Sent',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Invoice Line Items
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      rate REAL DEFAULT 0,
      amount REAL DEFAULT 0,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );

    -- Company Master Settings
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company_name TEXT DEFAULT 'FROMEX Health Tech',
      logo_url TEXT DEFAULT '/logo.png',
      website TEXT DEFAULT 'https://www.fromexhealthtech.com/',
      email TEXT DEFAULT 'contact@fromexhealthtech.com',
      phone TEXT DEFAULT '+91-80759-18850',
      address TEXT DEFAULT 'Kalpetta, Wayanad, Kerala - 673121, India',
      gst_number TEXT DEFAULT '32AAECF1234F1Z8',
      pan TEXT DEFAULT 'AAECF1234F',
      cin TEXT DEFAULT 'U72900KL2023PTC081234',
      state TEXT DEFAULT 'Kerala',
      state_code TEXT DEFAULT '32',
      country TEXT DEFAULT 'India'
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- System Audit Trail
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      record_id TEXT,
      old_value TEXT,
      new_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for high performance
    CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance(employee_id, date);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
    CREATE INDEX IF NOT EXISTS idx_leaves_emp ON leave_requests(employee_id);
    CREATE INDEX IF NOT EXISTS idx_salary_emp ON salary_records(employee_id);
    CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module);
    CREATE INDEX IF NOT EXISTS idx_transactions_acc ON account_transactions(account_id);
  `);
}
