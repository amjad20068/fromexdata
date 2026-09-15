export type Role = 'SUPER ADMIN' | 'HR / ADMIN' | 'ACCOUNTS' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  employee_id: string | null;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  status?: string;
}

export interface Employee {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  gender: string;
  phone: string;
  email: string;
  dob?: string;
  address?: string;
  emergency_contact?: string;
  department: string;
  designation: string;
  joining_date: string;
  employment_type: string;
  reporting_manager?: string;
  work_location: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Resigned';
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  ifsc?: string;
  upi_id?: string;
  salary_type: string;
  basic_salary: number;
  allowances: number;
  payment_cycle?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Department {
  id: string;
  name: string;
  head_name?: string;
  description?: string;
  status: string;
  employee_count?: number;
}

export interface Designation {
  id: string;
  title: string;
  department_name: string;
  description?: string;
  status: string;
  employee_count?: number;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  designation?: string;
  avatar_url?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  working_hours: number;
  status: 'Present' | 'Late' | 'Half Day' | 'On Leave' | 'Absent';
  source?: string;
  remarks?: string;
}

export interface AttendanceSettings {
  office_start_time: string;
  office_end_time: string;
  grace_period_minutes: number;
  min_working_hours: number;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  avatar_url?: string;
  leave_type: 'Casual' | 'Sick' | 'Annual' | 'Maternity' | 'Paternity' | 'Unpaid';
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  attachment?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  remarks?: string;
  created_at: string;
}

export interface LeaveBalance {
  casual: number;
  sick: number;
  annual: number;
  used: number;
  total: number;
}

export interface CompanyAccount {
  id: string;
  account_name: string;
  account_type: 'Bank Account' | 'Petty Cash' | 'Current Account' | 'Digital Wallet';
  bank_name?: string;
  account_number?: string;
  ifsc?: string;
  branch?: string;
  account_holder?: string;
  opening_balance: number;
  current_balance: number;
  status: 'Active' | 'Frozen' | 'Closed';
  notes?: string;
}

export interface AccountTransaction {
  id: string;
  account_id: string;
  account_name?: string;
  type: 'Credit' | 'Debit';
  amount: number;
  reference_type?: string;
  reference_id?: string;
  description: string;
  balance_after: number;
  transaction_date: string;
  created_at: string;
}

export interface SalaryRecord {
  id: string;
  employee_id: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  designation?: string;
  bank_name?: string;
  account_number?: string;
  ifsc?: string;
  month: number;
  year: number;
  salary_type: string;
  basic_salary: number;
  allowances: number;
  bonus: number;
  overtime: number;
  gross_salary: number;
  deductions: number;
  advance: number;
  loan: number;
  net_salary: number;
  status: 'Calculated' | 'Paid' | 'Processing';
  payment_date?: string;
  payment_account_id?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paid_from_account_id?: string;
  account_name?: string;
  vendor?: string;
  employee_id?: string;
  employee_name?: string;
  receipt_url?: string;
  payment_method: string;
  gst_applicable: number;
  gst_rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxable_amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
}

export interface PaymentVoucher {
  id: string;
  date: string;
  from_account_id: string;
  from_account_name?: string;
  to_name: string;
  payment_type: string;
  reference_number?: string;
  amount: number;
  description: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  attachment?: string;
  created_at?: string;
}

export interface Reimbursement {
  id: string;
  employee_id: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  receipt_url?: string;
  status: 'Submitted' | 'Approved' | 'Rejected' | 'Disbursed';
  reviewed_by?: string;
  created_at: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: string;
  gst_number?: string;
  taxable_amount: number;
  gst_rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  grand_total: number;
  payment_status: 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled';
  contract_type?: 'SaaS Subscription' | 'Software AMC' | 'Custom Development' | 'Cloud API & AI Tokens' | 'Enterprise License';
  billing_frequency?: 'Monthly' | 'Quarterly' | 'Annual' | 'Milestone';
  notes?: string;
  items?: InvoiceItem[];
  created_at: string;
}

export interface CompanySettings {
  company_name: string;
  logo_url: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  gst_number: string;
  pan: string;
  cin: string;
  state: string;
  state_code: string;
  country: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  is_read: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name: string;
  action: string;
  module: string;
  record_id?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface DashboardStats {
  total_employees: number;
  present_today: number;
  absent_today: number;
  on_leave_today: number;
  late_today: number;
  total_cash_balance: number;
  monthly_payroll: number;
  monthly_expenses: number;
  monthly_revenue: number;
  pending_leaves: number;
  pending_reimbursements: number;
  unpaid_invoices_count: number;
  unpaid_invoices_amount: number;
}
