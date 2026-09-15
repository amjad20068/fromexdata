/**
 * ==========================================================
 * FROMEX HEALTH TECH - INTERNAL COMPANY MANAGEMENT SYSTEM
 * Core Application Engine (Pure Vanilla JavaScript)
 * ==========================================================
 */

(function () {
  'use strict';

  // ==========================================================
  // STORAGE KEYS & CONSTANTS
  // ==========================================================
  const STORAGE_KEYS = {
    MEMBERS: 'fromex_members',
    ATTENDANCE: 'fromex_attendance',
    ACCOUNTING_MEMBERS: 'fromex_accounting_members',
    ACCOUNTS: 'fromex_accounts',
    TRANSACTIONS: 'fromex_transactions',
    CATEGORIES: 'fromex_categories',
    SETTINGS: 'fromex_settings',
    THEME: 'fromex_theme'
  };

  const DEFAULT_SETTINGS = {
    companyName: 'FROMEX HEALTH TECH',
    logoUrl: 'logo.png',
    currency: '₹',
    defaultGst: 18,
    officeStartTime: '09:00',
    officeEndTime: '18:00'
  };

  const DEFAULT_CATEGORIES = [
    'Office', 'Travel', 'Equipment', 'Software', 'Internet',
    'Utilities', 'Marketing', 'Salary', 'Rent', 'Food',
    'Maintenance', 'Medical Supplies', 'Other'
  ];

  // ==========================================================
  // INITIAL SEED DATA FOR FROMEX HEALTH TECH
  // ==========================================================
  function getSeedData() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

    const members = [
      {
        id: 'FX-1001',
        name: 'Dr. Muhammed Nihal',
        department: 'Executive Management',
        designation: 'Chief Executive Officer',
        phone: '+91-98471-23456',
        email: 'admin@fromexhealthtech.com',
        joiningDate: '2022-01-10',
        status: 'Active'
      },
      {
        id: 'FX-1002',
        name: 'Priya Nambiar',
        department: 'Human Resources',
        designation: 'HR & People Operations Manager',
        phone: '+91-97451-87654',
        email: 'priya.nambiar@fromexhealthtech.com',
        joiningDate: '2022-04-01',
        status: 'Active'
      },
      {
        id: 'FX-1003',
        name: 'Kavitha S.',
        department: 'Finance & Accounts',
        designation: 'Senior Accounts Officer',
        phone: '+91-94960-55443',
        email: 'kavitha.s@fromexhealthtech.com',
        joiningDate: '2022-07-15',
        status: 'Active'
      },
      {
        id: 'FX-1004',
        name: 'Dr. Arun Varma',
        department: 'Technology & AI',
        designation: 'Lead AI Healthcare Engineer',
        phone: '+91-98460-11223',
        email: 'arun.varma@fromexhealthtech.com',
        joiningDate: '2022-09-01',
        status: 'Active'
      },
      {
        id: 'FX-1005',
        name: 'Ashwin Raj',
        department: 'Technology & AI',
        designation: 'Senior Full-Stack Developer',
        phone: '+91-94470-98765',
        email: 'ashwin.raj@fromexhealthtech.com',
        joiningDate: '2023-01-15',
        status: 'Active'
      },
      {
        id: 'FX-1006',
        name: 'Dr. Fathima Zahra',
        department: 'Clinical Operations',
        designation: 'Clinical Workflow Specialist',
        phone: '+91-98460-33445',
        email: 'fathima.zahra@fromexhealthtech.com',
        joiningDate: '2023-03-10',
        status: 'Active'
      },
      {
        id: 'FX-1007',
        name: 'Rahul Menon',
        department: 'Operations & Logistics',
        designation: 'Healthcare Operations Lead',
        phone: '+91-97470-44556',
        email: 'rahul.menon@fromexhealthtech.com',
        joiningDate: '2023-05-18',
        status: 'Active'
      },
      {
        id: 'FX-1008',
        name: 'Sneha George',
        department: 'Technology & AI',
        designation: 'AI & Data Science Intern',
        phone: '+91-94970-12345',
        email: 'sneha.george@fromexhealthtech.com',
        joiningDate: '2024-02-01',
        status: 'Active'
      },
      {
        id: 'FX-1009',
        name: 'Vignesh K.',
        department: 'Operations & Logistics',
        designation: 'Logistics Associate',
        phone: '+91-98450-66778',
        email: 'vignesh.k@fromexhealthtech.com',
        joiningDate: '2023-08-01',
        status: 'Inactive'
      },
      {
        id: 'FX-1010',
        name: 'Dr. Deepa Nair',
        department: 'Clinical Operations',
        designation: 'Medical Informatics Consultant',
        phone: '+91-97460-77889',
        email: 'deepa.nair@fromexhealthtech.com',
        joiningDate: '2023-11-15',
        status: 'Active'
      }
    ];

    const accountingMembers = [
      { id: 'FX-1001', name: 'Dr. Muhammed Nihal', department: 'Executive Management', designation: 'Chief Executive Officer', basicSalary: 180000, allowance: 45000, bonus: 20000, deduction: 15000, advance: 0, paymentStatus: 'Paid' },
      { id: 'FX-1002', name: 'Priya Nambiar', department: 'Human Resources', designation: 'HR & People Operations Manager', basicSalary: 85000, allowance: 15000, bonus: 5000, deduction: 5000, advance: 0, paymentStatus: 'Paid' },
      { id: 'FX-1003', name: 'Kavitha S.', department: 'Finance & Accounts', designation: 'Senior Accounts Officer', basicSalary: 80000, allowance: 12000, bonus: 4000, deduction: 4500, advance: 0, paymentStatus: 'Paid' },
      { id: 'FX-1004', name: 'Dr. Arun Varma', department: 'Technology & AI', designation: 'Lead AI Healthcare Engineer', basicSalary: 150000, allowance: 30000, bonus: 15000, deduction: 12000, advance: 0, paymentStatus: 'Paid' },
      { id: 'FX-1005', name: 'Ashwin Raj', department: 'Technology & AI', designation: 'Senior Full-Stack Developer', basicSalary: 95000, allowance: 15000, bonus: 8000, deduction: 6000, advance: 0, paymentStatus: 'Paid' },
      { id: 'FX-1006', name: 'Dr. Fathima Zahra', department: 'Clinical Operations', designation: 'Clinical Workflow Specialist', basicSalary: 110000, allowance: 20000, bonus: 10000, deduction: 8000, advance: 0, paymentStatus: 'Paid' },
      { id: 'FX-1007', name: 'Rahul Menon', department: 'Operations & Logistics', designation: 'Healthcare Operations Lead', basicSalary: 70000, allowance: 10000, bonus: 5000, deduction: 4000, advance: 0, paymentStatus: 'Paid' },
      { id: 'FX-1008', name: 'Sneha George', department: 'Technology & AI', designation: 'AI & Data Science Intern', basicSalary: 25000, allowance: 5000, bonus: 0, deduction: 1000, advance: 0, paymentStatus: 'Paid' },
      { id: 'FX-1009', name: 'Vignesh K.', department: 'Operations & Logistics', designation: 'Logistics Associate', basicSalary: 40000, allowance: 5000, bonus: 0, deduction: 2000, advance: 0, paymentStatus: 'Pending' },
      { id: 'FX-1010', name: 'Dr. Deepa Nair', department: 'Clinical Operations', designation: 'Medical Informatics Consultant', basicSalary: 120000, allowance: 25000, bonus: 10000, deduction: 9000, advance: 0, paymentStatus: 'Paid' }
    ];

    const accounts = [
      {
        id: 'ACC-001',
        name: 'HDFC Main Operating Account',
        type: 'Bank',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50200091823901',
        openingBalance: 2500000,
        currentBalance: 2835000,
        status: 'Active'
      },
      {
        id: 'ACC-002',
        name: 'State Bank of India - Operational',
        type: 'Bank',
        bankName: 'State Bank of India',
        accountNumber: '381920048192',
        openingBalance: 1500000,
        currentBalance: 1458000,
        status: 'Active'
      },
      {
        id: 'ACC-003',
        name: 'Kalpetta HQ Petty Cash Box',
        type: 'Petty Cash',
        bankName: 'Internal Cash Vault',
        accountNumber: 'CASH-HQ-01',
        openingBalance: 50000,
        currentBalance: 43200,
        status: 'Active'
      },
      {
        id: 'ACC-004',
        name: 'Razorpay Corporate Gateway & UPI',
        type: 'UPI',
        bankName: 'RazorpayX / Yes Bank',
        accountNumber: 'RZPX9182049182',
        openingBalance: 200000,
        currentBalance: 195400,
        status: 'Active'
      }
    ];

    const attendance = [
      // Today
      { id: 'ATT-101', employeeId: 'FX-1001', employeeName: 'Dr. Muhammed Nihal', department: 'Executive Management', date: today, checkIn: '08:50', checkOut: '', workingHours: '---', status: 'Present', remarks: 'Executive morning review' },
      { id: 'ATT-102', employeeId: 'FX-1002', employeeName: 'Priya Nambiar', department: 'Human Resources', date: today, checkIn: '09:05', checkOut: '', workingHours: '---', status: 'Present', remarks: 'On time' },
      { id: 'ATT-103', employeeId: 'FX-1003', employeeName: 'Kavitha S.', department: 'Finance & Accounts', date: today, checkIn: '09:12', checkOut: '', workingHours: '---', status: 'Present', remarks: 'Payroll ledger audit' },
      { id: 'ATT-104', employeeId: 'FX-1004', employeeName: 'Dr. Arun Varma', department: 'Technology & AI', date: today, checkIn: '09:22', checkOut: '', workingHours: '---', status: 'Late', remarks: 'Traffic near bypass' },
      { id: 'ATT-105', employeeId: 'FX-1005', employeeName: 'Ashwin Raj', department: 'Technology & AI', date: today, checkIn: '08:55', checkOut: '', workingHours: '---', status: 'Present', remarks: 'Clinical model release' },
      { id: 'ATT-106', employeeId: 'FX-1006', employeeName: 'Dr. Fathima Zahra', department: 'Clinical Operations', date: today, checkIn: '', checkOut: '', workingHours: '---', status: 'Leave', remarks: 'Approved medical leave' },
      { id: 'ATT-107', employeeId: 'FX-1007', employeeName: 'Rahul Menon', department: 'Operations & Logistics', date: today, checkIn: '09:02', checkOut: '', workingHours: '---', status: 'Present', remarks: 'Hospital deployment visit' },
      { id: 'ATT-108', employeeId: 'FX-1008', employeeName: 'Sneha George', department: 'Technology & AI', date: today, checkIn: '09:40', checkOut: '', workingHours: '---', status: 'Late', remarks: 'Lab experiment schedule' },
      { id: 'ATT-109', employeeId: 'FX-1010', employeeName: 'Dr. Deepa Nair', department: 'Clinical Operations', date: today, checkIn: '09:14', checkOut: '', workingHours: '---', status: 'Present', remarks: 'Clinical workflow testing' },

      // Yesterday
      { id: 'ATT-201', employeeId: 'FX-1001', employeeName: 'Dr. Muhammed Nihal', department: 'Executive Management', date: yesterday, checkIn: '08:50', checkOut: '18:15', workingHours: '09h 25m', status: 'Present', remarks: 'Full day' },
      { id: 'ATT-202', employeeId: 'FX-1002', employeeName: 'Priya Nambiar', department: 'Human Resources', date: yesterday, checkIn: '08:58', checkOut: '18:05', workingHours: '09h 07m', status: 'Present', remarks: 'Full day' },
      { id: 'ATT-203', employeeId: 'FX-1003', employeeName: 'Kavitha S.', department: 'Finance & Accounts', date: yesterday, checkIn: '09:02', checkOut: '18:10', workingHours: '09h 08m', status: 'Present', remarks: 'Full day' },
      { id: 'ATT-204', employeeId: 'FX-1004', employeeName: 'Dr. Arun Varma', department: 'Technology & AI', date: yesterday, checkIn: '09:05', checkOut: '18:30', workingHours: '09h 25m', status: 'Present', remarks: 'AI pipeline benchmark' },
      { id: 'ATT-205', employeeId: 'FX-1005', employeeName: 'Ashwin Raj', department: 'Technology & AI', date: yesterday, checkIn: '08:45', checkOut: '18:00', workingHours: '09h 15m', status: 'Present', remarks: 'Full day' },
      { id: 'ATT-206', employeeId: 'FX-1006', employeeName: 'Dr. Fathima Zahra', department: 'Clinical Operations', date: yesterday, checkIn: '09:10', checkOut: '18:10', workingHours: '09h 00m', status: 'Present', remarks: 'Full day' },
      { id: 'ATT-207', employeeId: 'FX-1007', employeeName: 'Rahul Menon', department: 'Operations & Logistics', date: yesterday, checkIn: '09:00', checkOut: '18:00', workingHours: '09h 00m', status: 'Present', remarks: 'Full day' },

      // Two Days Ago
      { id: 'ATT-301', employeeId: 'FX-1001', employeeName: 'Dr. Muhammed Nihal', department: 'Executive Management', date: twoDaysAgo, checkIn: '08:52', checkOut: '18:10', workingHours: '09h 18m', status: 'Present', remarks: 'Board meeting' },
      { id: 'ATT-302', employeeId: 'FX-1004', employeeName: 'Dr. Arun Varma', department: 'Technology & AI', date: twoDaysAgo, checkIn: '09:15', checkOut: '18:15', workingHours: '09h 00m', status: 'Present', remarks: 'Full day' }
    ];

    const transactions = [
      {
        id: 'TXN-1001',
        date: yesterday,
        transactionId: 'TXN-2026-001',
        type: 'Income',
        category: 'Software',
        description: 'Client SaaS Subscription payment from Aster Medcity Clinic AI',
        party: 'Aster Medcity Healthcare',
        accountId: 'ACC-001',
        amount: 450000,
        paymentMethod: 'Bank Transfer',
        gstRate: 18,
        gstAmount: 81000,
        totalAmount: 531000,
        status: 'Completed',
        remarks: 'Direct RTGS settlement'
      },
      {
        id: 'TXN-1002',
        date: yesterday,
        transactionId: 'TXN-2026-002',
        type: 'Expense',
        category: 'Software',
        description: 'AWS Healthcare Cloud GPU Computing Infrastructure Invoice',
        party: 'Amazon Web Services India',
        accountId: 'ACC-001',
        amount: 115000,
        paymentMethod: 'Bank Transfer',
        gstRate: 18,
        gstAmount: 20700,
        totalAmount: 135700,
        status: 'Completed',
        remarks: 'Inv #AWS-84920'
      },
      {
        id: 'TXN-1003',
        date: twoDaysAgo,
        transactionId: 'TXN-2026-003',
        type: 'Expense',
        category: 'Internet',
        description: 'Kalpetta Office 1 Gbps Fiber Leased Line Connection',
        party: 'BSNL Kerala Telecom',
        accountId: 'ACC-002',
        amount: 42000,
        paymentMethod: 'Bank Transfer',
        gstRate: 18,
        gstAmount: 7560,
        totalAmount: 49560,
        status: 'Completed',
        remarks: 'Monthly recurring broadband'
      },
      {
        id: 'TXN-1004',
        date: twoDaysAgo,
        transactionId: 'TXN-2026-004',
        type: 'Expense',
        category: 'Medical Supplies',
        description: 'Medical sensor evaluation devices and test clinical hardware',
        party: 'Kerala Bio-Medical Instruments',
        accountId: 'ACC-003',
        amount: 6800,
        paymentMethod: 'Cash',
        gstRate: 12,
        gstAmount: 816,
        totalAmount: 7616,
        status: 'Completed',
        remarks: 'Voucher #PV-902'
      },
      {
        id: 'TXN-1005',
        date: today,
        transactionId: 'TXN-2026-005',
        type: 'Salary',
        category: 'Salary',
        description: 'Monthly compensation disbursement for Engineering staff',
        party: 'FROMEX Staff Payroll',
        accountId: 'ACC-001',
        amount: 60000,
        paymentMethod: 'Bank Transfer',
        gstRate: 0,
        gstAmount: 0,
        totalAmount: 60000,
        status: 'Completed',
        remarks: 'Payroll batch #1'
      }
    ];

    return {
      members,
      accountingMembers,
      accounts,
      attendance,
      transactions,
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS
    };
  }

  // ==========================================================
  // STORAGE SERVICE
  // ==========================================================
  const Store = {
    init: function () {
      try {
        if (!localStorage.getItem('fromex_system_initialized')) {
          const seed = getSeedData();
          this.save(STORAGE_KEYS.MEMBERS, seed.members);
          this.save(STORAGE_KEYS.ACCOUNTING_MEMBERS, seed.accountingMembers);
          this.save(STORAGE_KEYS.ACCOUNTS, seed.accounts);
          this.save(STORAGE_KEYS.ATTENDANCE, seed.attendance);
          this.save(STORAGE_KEYS.TRANSACTIONS, seed.transactions);
          this.save(STORAGE_KEYS.CATEGORIES, seed.categories);
          this.save(STORAGE_KEYS.SETTINGS, seed.settings);
          localStorage.setItem('fromex_system_initialized', 'true');
        }
      } catch (e) {
        console.warn('Store init storage access warning:', e);
      }
    },
    get: function (key) {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
      } catch (e) {
        console.error('Storage parse error for ' + key, e);
        return null;
      }
    },
    save: function (key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error('Storage save error for ' + key, e);
        Toast.error('Storage quota exceeded or storage error!');
      }
    },
    clearAllData: function () {
      this.save(STORAGE_KEYS.MEMBERS, []);
      this.save(STORAGE_KEYS.ACCOUNTING_MEMBERS, []);
      this.save(STORAGE_KEYS.ACCOUNTS, []);
      this.save(STORAGE_KEYS.ATTENDANCE, []);
      this.save(STORAGE_KEYS.TRANSACTIONS, []);
      localStorage.setItem('fromex_system_initialized', 'true');
    },
    resetToDemo: function () {
      localStorage.removeItem('fromex_system_initialized');
      localStorage.removeItem(STORAGE_KEYS.MEMBERS);
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTING_MEMBERS);
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      this.init();
    }
  };

  // ==========================================================
  // TOAST NOTIFICATIONS
  // ==========================================================
  const Toast = {
    container: document.getElementById('toast-container'),
    show: function (message, type = 'info', duration = 3200) {
      if (!this.container) return;
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      let icon = 'fa-circle-info';
      if (type === 'success') icon = 'fa-circle-check';
      if (type === 'error') icon = 'fa-circle-exclamation';
      if (type === 'warning') icon = 'fa-triangle-exclamation';

      toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <div class="toast-message">${escapeHtml(message)}</div>
        <div class="toast-close"><i class="fa-solid fa-xmark"></i></div>
      `;

      toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
      });

      this.container.appendChild(toast);

      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(30px)';
          setTimeout(() => toast.remove(), 200);
        }
      }, duration);
    },
    success: function (msg) { this.show(msg, 'success'); },
    error: function (msg) { this.show(msg, 'error', 4500); },
    info: function (msg) { this.show(msg, 'info'); },
    warning: function (msg) { this.show(msg, 'warning', 4000); }
  };

  // ==========================================================
  // CONFIRMATION MODAL SERVICE (Promise-based)
  // ==========================================================
  const ConfirmModal = {
    modal: document.getElementById('modal-confirm'),
    titleEl: document.getElementById('confirm-modal-title'),
    msgEl: document.getElementById('confirm-modal-message'),
    btnCancel: document.getElementById('btn-confirm-cancel'),
    btnProceed: document.getElementById('btn-confirm-proceed'),
    resolvePromise: null,

    show: function (message, title = 'Confirm Action', isDanger = true) {
      return new Promise((resolve) => {
        this.resolvePromise = resolve;
        this.titleEl.innerHTML = `<i class="fa-solid fa-circle-question" style="color: ${isDanger ? 'var(--expense-color)' : 'var(--primary)'};"></i> ${escapeHtml(title)}`;
        this.msgEl.textContent = message;
        this.btnProceed.className = isDanger ? 'btn btn-danger' : 'btn btn-primary';
        this.modal.classList.add('active');
      });
    },
    close: function (result) {
      this.modal.classList.remove('active');
      if (this.resolvePromise) {
        this.resolvePromise(result);
        this.resolvePromise = null;
      }
    },
    init: function () {
      if (!this.modal) return;
      this.btnCancel.addEventListener('click', () => this.close(false));
      this.btnProceed.addEventListener('click', () => this.close(true));
      this.modal.querySelector('[data-close-modal]')?.addEventListener('click', () => this.close(false));
    }
  };

  // ==========================================================
  // UTILITY HELPERS
  // ==========================================================
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatCurrency(amount) {
    const settings = Store.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
    const curr = settings.currency || '₹';
    const num = Number(amount) || 0;
    return `${curr}${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  function calculateWorkingHours(checkIn, checkOut) {
    if (!checkIn || !checkOut) return '---';
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);

    if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return '---';

    let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // Crosses midnight
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  }

  function generateId(prefix = 'REC') {
    return `${prefix}-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 90 + 10)}`;
  }

  // ==========================================================
  // NAVIGATION CONTROLLER
  // ==========================================================
  const Navigation = {
    init: function () {
      const sidebar = document.getElementById('app-sidebar');
      const toggleBtn = document.getElementById('btn-sidebar-toggle');
      const overlay = document.getElementById('sidebar-overlay');
      const closeBtn = document.getElementById('btn-sidebar-close');

      const closeSidebar = () => {
        sidebar?.classList.remove('mobile-open');
        overlay?.classList.remove('active');
        document.body.classList.remove('sidebar-open');
      };

      const openSidebar = () => {
        sidebar?.classList.add('mobile-open');
        overlay?.classList.add('active');
        document.body.classList.add('sidebar-open');
      };

      const toggleMobileSidebar = () => {
        if (sidebar?.classList.contains('mobile-open')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      };

      // Sidebar Navigation Links
      const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const targetView = item.getAttribute('data-view');
          if (targetView) {
            this.switchView(targetView);
            closeSidebar();
          }
        });
      });

      // Sidebar Toggle & Close Buttons
      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.innerWidth <= 992) {
            toggleMobileSidebar();
          } else {
            sidebar.classList.toggle('collapsed');
          }
        });
      }

      closeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
      });

      overlay?.addEventListener('click', () => {
        closeSidebar();
      });

      // User profile badge click -> opens settings
      const userProfileBtn = document.getElementById('btn-user-profile');
      if (userProfileBtn) {
        userProfileBtn.addEventListener('click', () => {
          this.switchView('settings');
          closeSidebar();
        });
        userProfileBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.switchView('settings');
            closeSidebar();
          }
        });
      }

      // Quick links on Dashboard
      document.getElementById('dash-btn-add-member')?.addEventListener('click', () => {
        this.switchView('attendance-members');
        MembersModule.openAddModal();
      });

      document.getElementById('dash-btn-mark-attendance')?.addEventListener('click', () => {
        this.switchView('attendance-list');
      });

      document.getElementById('dash-btn-add-accounting')?.addEventListener('click', () => {
        this.switchView('accounting-list');
        AccountingModule.openAddModal();
      });

      document.getElementById('dash-btn-add-account')?.addEventListener('click', () => {
        this.switchView('company-accounts');
        AccountsModule.openAddModal();
      });

      document.getElementById('banner-btn-add-member')?.addEventListener('click', () => {
        this.switchView('attendance-members');
        MembersModule.openAddModal();
      });

      document.getElementById('banner-btn-add-account')?.addEventListener('click', () => {
        this.switchView('company-accounts');
        AccountsModule.openAddModal();
      });

      document.getElementById('banner-btn-reset-demo')?.addEventListener('click', () => {
        Store.resetToDemo();
        Toast.success('Sample company data loaded successfully.');
        setTimeout(() => location.reload(), 400);
      });

      document.getElementById('btn-view-all-attendance')?.addEventListener('click', () => {
        this.switchView('attendance-list');
      });

      document.getElementById('btn-view-all-accounting')?.addEventListener('click', () => {
        this.switchView('accounting-list');
      });

      // Quick Add Member buttons in Attendance Desk and Modals
      document.getElementById('btn-quick-add-member')?.addEventListener('click', () => {
        MembersModule.openAddModal();
      });

      document.getElementById('att-btn-quick-add-member')?.addEventListener('click', () => {
        MembersModule.openAddModal();
      });

      document.getElementById('att-btn-add-member-first')?.addEventListener('click', () => {
        MembersModule.openAddModal();
      });

      // Quick Add Account & Category buttons in Transaction Modal
      document.getElementById('txn-btn-quick-add-acc')?.addEventListener('click', () => {
        AccountsModule.openAddModal();
      });

      document.getElementById('txn-btn-create-acc-first')?.addEventListener('click', () => {
        AccountsModule.openAddModal();
      });

      document.getElementById('txn-btn-quick-add-cat')?.addEventListener('click', () => {
        const cat = prompt('Enter new accounting category name:');
        if (cat && cat.trim()) {
          const categories = Store.get(STORAGE_KEYS.CATEGORIES) || DEFAULT_CATEGORIES;
          if (!categories.includes(cat.trim())) {
            categories.push(cat.trim());
            Store.save(STORAGE_KEYS.CATEGORIES, categories);
            Toast.success(`Category "${cat.trim()}" added.`);
            AccountingModule.populateCategoryAndAccountDropdowns();
            const catSelect = document.getElementById('txn-category');
            if (catSelect) catSelect.value = cat.trim();
          }
        }
      });

      // Mobile Bottom Navigation Click Handlers
      document.querySelectorAll('.bottom-nav-item[data-view]').forEach(item => {
        item.addEventListener('click', () => {
          const view = item.getAttribute('data-view');
          if (view) {
            this.switchView(view);
            closeSidebar();
          }
        });
      });

      document.getElementById('bnav-more')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMobileSidebar();
      });

      // Global keyboard dismissal
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeSidebar();
        }
      });
    },

    switchView: function (viewId) {
      // Update sidebar active link
      document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        if (item.getAttribute('data-view') === viewId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Update mobile bottom nav active item
      const mainBottomViews = ['dashboard', 'attendance-list', 'accounting-list', 'attendance-members'];
      document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        if (btn.getAttribute('data-view') === viewId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      const moreBtn = document.getElementById('bnav-more');
      if (moreBtn) {
        if (!mainBottomViews.includes(viewId)) {
          moreBtn.classList.add('active');
        } else {
          moreBtn.classList.remove('active');
        }
      }

      // Switch active view pane
      document.querySelectorAll('.view-pane').forEach(pane => {
        pane.classList.remove('active');
      });

      const targetPane = document.getElementById(`view-${viewId}`);
      if (targetPane) {
        targetPane.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Refresh view data
        if (viewId === 'dashboard') DashboardModule.render();
        if (viewId === 'attendance-list') AttendanceModule.render();
        if (viewId === 'attendance-members') MembersModule.render();
        if (viewId === 'accounting-list') AccountingModule.render();
        if (viewId === 'accounting-members') AccountingMembersModule.render();
        if (viewId === 'company-accounts') AccountsModule.render();
        if (viewId === 'settings') SettingsModule.render();
      }

      // Ensure mobile sidebar is closed after switching
      document.getElementById('app-sidebar')?.classList.remove('mobile-open');
      document.getElementById('sidebar-overlay')?.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }
  };

  // ==========================================================
  // DASHBOARD MODULE
  // ==========================================================
  const DashboardModule = {
    render: function () {
      const today = new Date().toISOString().split('T')[0];
      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];
      const transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];

      // Active Members
      const activeMembers = members.filter(m => m.status === 'Active');
      const totalMembersCount = activeMembers.length;

      // Attendance for Today
      const todayAttendance = attendance.filter(a => a.date === today);
      let presentCount = 0;
      let lateCount = 0;
      let onLeaveCount = 0;
      let absentCount = 0;

      todayAttendance.forEach(a => {
        if (a.status === 'Present') presentCount++;
        else if (a.status === 'Late') lateCount++;
        else if (a.status === 'Leave') onLeaveCount++;
        else if (a.status === 'Absent') absentCount++;
      });

      // Count active members who haven't checked in yet today as absent or pending
      const checkedInEmpIds = new Set(todayAttendance.map(a => a.employeeId));
      const notCheckedIn = activeMembers.filter(m => !checkedInEmpIds.has(m.id)).length;
      absentCount += notCheckedIn;

      document.getElementById('dash-total-members').textContent = totalMembersCount;
      document.getElementById('dash-present-today').textContent = presentCount;
      document.getElementById('dash-absent-today').textContent = absentCount;
      document.getElementById('dash-late-today').textContent = lateCount;
      document.getElementById('dash-on-leave').textContent = onLeaveCount;

      // Accounting Metrics
      let totalIncome = 0;
      let totalExpense = 0;
      let totalSalary = 0;

      transactions.forEach(t => {
        if (t.status === 'Completed') {
          const tot = Number(t.totalAmount) || 0;
          if (t.type === 'Income' || t.type === 'Receipt') {
            totalIncome += tot;
          } else if (t.type === 'Salary') {
            totalSalary += tot;
          } else if (t.type === 'Expense' || t.type === 'Payment' || t.type === 'Reimbursement') {
            totalExpense += tot;
          }
        }
      });

      const totalTreasuryBalance = accounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

      document.getElementById('dash-total-income').textContent = formatCurrency(totalIncome);
      document.getElementById('dash-total-expense').textContent = formatCurrency(totalExpense);
      document.getElementById('dash-total-salary').textContent = formatCurrency(totalSalary);
      document.getElementById('dash-current-balance').textContent = formatCurrency(totalTreasuryBalance);

      // Toggle Clean Welcome Banner
      const banner = document.getElementById('dash-empty-welcome-banner');
      if (banner) {
        banner.style.display = (members.length === 0 && transactions.length === 0 && accounts.length === 0) ? 'block' : 'none';
      }

      // Populate Recent Attendance (Today's snapshot)
      const recentAttTbody = document.getElementById('dash-recent-attendance-tbody');
      if (recentAttTbody) {
        if (todayAttendance.length === 0) {
          recentAttTbody.innerHTML = `
            <tr>
              <td colspan="5" class="empty-state" style="padding: 1.5rem; text-align: center;">
                <p style="margin-bottom: 0.65rem;">No check-in records for today yet.</p>
                <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                  <button class="btn btn-sm btn-primary" onclick="window.FROMEX_APP.Members.openAddModal()">
                    <i class="fa-solid fa-user-plus"></i> Add Member
                  </button>
                  <button class="btn btn-sm btn-success" onclick="window.FROMEX_APP.Attendance.openAddModal()">
                    <i class="fa-solid fa-clipboard-check"></i> Mark Attendance
                  </button>
                </div>
              </td>
            </tr>`;
        } else {
          recentAttTbody.innerHTML = todayAttendance.slice(0, 6).map(a => `
            <tr>
              <td><strong>${escapeHtml(a.employeeId)}</strong></td>
              <td>${escapeHtml(a.employeeName)}</td>
              <td>${a.checkIn || '---'}</td>
              <td>${a.checkOut || '---'}</td>
              <td><span class="status-pill ${a.status.toLowerCase().replace(/\s+/g, '')}">${escapeHtml(a.status)}</span></td>
            </tr>
          `).join('');
        }
      }

      // Populate Recent Accounting (Last 5 transactions)
      const recentAccTbody = document.getElementById('dash-recent-accounting-tbody');
      if (recentAccTbody) {
        if (transactions.length === 0) {
          recentAccTbody.innerHTML = `
            <tr>
              <td colspan="5" class="empty-state" style="padding: 1.5rem; text-align: center;">
                <p style="margin-bottom: 0.65rem;">No financial transactions recorded yet.</p>
                <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                  <button class="btn btn-sm btn-primary" onclick="window.FROMEX_APP.Accounting.openAddModal()">
                    <i class="fa-solid fa-plus-circle"></i> Add Transaction
                  </button>
                  <button class="btn btn-sm btn-secondary" onclick="window.FROMEX_APP.Accounts.openAddModal()">
                    <i class="fa-solid fa-building-columns"></i> Add Account
                  </button>
                </div>
              </td>
            </tr>`;
        } else {
          const sortedTxns = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
          recentAccTbody.innerHTML = sortedTxns.slice(0, 6).map(t => `
            <tr>
              <td>${formatDate(t.date)}</td>
              <td><span class="type-badge ${t.type.toLowerCase()}">${escapeHtml(t.type)}</span></td>
              <td>${escapeHtml(t.category)}</td>
              <td>${formatCurrency(t.amount)}</td>
              <td><strong>${formatCurrency(t.totalAmount)}</strong></td>
            </tr>
          `).join('');
        }
      }
    }
  };

  // ==========================================================
  // ATTENDANCE MODULE (Excel Spreadsheet & Live Desk)
  // ==========================================================
  const AttendanceModule = {
    sortColumn: 'date',
    sortAsc: false,

    init: function () {
      const today = new Date().toISOString().split('T')[0];
      const todayDisplayEl = document.getElementById('dock-today-display');
      if (todayDisplayEl) todayDisplayEl.textContent = formatDate(today);

      // Quick Check-In & Check-Out
      document.getElementById('btn-quick-checkin')?.addEventListener('click', () => this.handleQuickCheckIn());
      document.getElementById('btn-quick-checkout')?.addEventListener('click', () => this.handleQuickCheckOut());

      // Filter events
      ['att-filter-search', 'att-filter-date', 'att-filter-month', 'att-filter-dept', 'att-filter-status', 'att-filter-employee'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => this.render());
      });

      document.getElementById('btn-reset-attendance-filters')?.addEventListener('click', () => {
        document.getElementById('att-filter-search').value = '';
        document.getElementById('att-filter-date').value = '';
        document.getElementById('att-filter-month').value = '';
        document.getElementById('att-filter-dept').value = '';
        document.getElementById('att-filter-status').value = '';
        document.getElementById('att-filter-employee').value = '';
        this.render();
      });

      // Add Attendance Modal trigger
      document.getElementById('btn-add-attendance-row')?.addEventListener('click', () => this.openAddModal());
      document.getElementById('btn-add-attendance-quick-row')?.addEventListener('click', () => this.openAddModal());

      // Form Submit
      document.getElementById('form-attendance')?.addEventListener('submit', (e) => this.handleSaveForm(e));

      // Live Hours calculation in modal
      const inEl = document.getElementById('att-checkin');
      const outEl = document.getElementById('att-checkout');
      const hoursEl = document.getElementById('att-calc-hours');
      const updateHours = () => {
        hoursEl.textContent = calculateWorkingHours(inEl.value, outEl.value);
      };
      inEl?.addEventListener('input', updateHours);
      outEl?.addEventListener('input', updateHours);

      // Employee dropdown in modal changes
      document.getElementById('att-employee-select')?.addEventListener('change', (e) => {
        const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
        const emp = members.find(m => m.id === e.target.value);
        if (emp && !document.getElementById('att-remarks').value) {
          // Keep clean
        }
      });

      // Sortable headers
      document.querySelectorAll('#attendance-excel-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.getAttribute('data-sort');
          if (this.sortColumn === col) {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortColumn = col;
            this.sortAsc = true;
          }
          this.render();
        });
      });

      // Export Buttons
      document.getElementById('btn-export-attendance-excel')?.addEventListener('click', () => ExcelService.exportAttendanceExcel());
      document.getElementById('btn-export-attendance-csv')?.addEventListener('click', () => ExcelService.exportAttendanceCSV());
      document.getElementById('btn-download-attendance-template')?.addEventListener('click', () => ExcelService.downloadAttendanceTemplate());
      document.getElementById('btn-import-attendance-excel')?.addEventListener('click', () => ExcelService.openImportModal('attendance'));
      document.getElementById('btn-print-attendance')?.addEventListener('click', () => PrintService.printSection('Attendance List'));
    },

    updateEmployeeDropdowns: function () {
      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const activeMembers = members.filter(m => m.status === 'Active');

      // Alert in modal if 0 active members
      const alertEl = document.getElementById('att-no-members-alert');
      if (alertEl) {
        alertEl.style.display = activeMembers.length === 0 ? 'flex' : 'none';
      }

      // Quick dock dropdown
      const quickSelect = document.getElementById('quick-employee-select');
      if (quickSelect) {
        if (activeMembers.length === 0) {
          quickSelect.innerHTML = `<option value="">-- No Active Employees (Click + Member) --</option>`;
        } else {
          quickSelect.innerHTML = activeMembers.map(m => `
            <option value="${escapeHtml(m.id)}">${escapeHtml(m.id)} - ${escapeHtml(m.name)} (${escapeHtml(m.department)})</option>
          `).join('');
        }
      }

      // Filter employee dropdown
      const filterSelect = document.getElementById('att-filter-employee');
      if (filterSelect) {
        const curVal = filterSelect.value;
        filterSelect.innerHTML = `<option value="">All Employees</option>` + activeMembers.map(m => `
          <option value="${escapeHtml(m.id)}">${escapeHtml(m.name)} (${escapeHtml(m.id)})</option>
        `).join('');
        filterSelect.value = curVal;
      }

      // Modal employee dropdown
      const modalSelect = document.getElementById('att-employee-select');
      if (modalSelect) {
        if (activeMembers.length === 0) {
          modalSelect.innerHTML = `<option value="">-- No Active Members Available --</option>`;
        } else {
          modalSelect.innerHTML = activeMembers.map(m => `
            <option value="${escapeHtml(m.id)}">${escapeHtml(m.id)} - ${escapeHtml(m.name)} (${escapeHtml(m.department)})</option>
          `).join('');
        }
      }

      // Update Department filter dropdown
      const deptSelect = document.getElementById('att-filter-dept');
      if (deptSelect) {
        const curVal = deptSelect.value;
        const depts = Array.from(new Set(members.map(m => m.department))).filter(Boolean);
        deptSelect.innerHTML = `<option value="">All Departments</option>` + depts.map(d => `
          <option value="${escapeHtml(d)}">${escapeHtml(d)}</option>
        `).join('');
        deptSelect.value = curVal;
      }
    },

    handleQuickCheckIn: function () {
      const quickSelect = document.getElementById('quick-employee-select');
      if (!quickSelect || !quickSelect.value) {
        Toast.warning('No active employee selected. Please add or select an employee first.');
        return;
      }

      const empId = quickSelect.value;
      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const employee = members.find(m => m.id === empId);
      if (!employee) {
        Toast.error('Employee not found!');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];

      // Duplicate Check: Prevent duplicate check-in for the same employee on the same date
      const existing = attendance.find(a => a.employeeId === empId && a.date === today);
      if (existing) {
        Toast.warning(`Duplicate Prevention: ${employee.name} (${empId}) is already checked in for today (${formatDate(today)}) at ${existing.checkIn || 'earlier'}.`);
        return;
      }

      // Current Time
      const now = new Date();
      const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Settings check for Late status
      const settings = Store.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
      const officeStart = settings.officeStartTime || '09:00';
      const isLate = checkInTime > officeStart;

      const newRecord = {
        id: generateId('ATT'),
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        date: today,
        checkIn: checkInTime,
        checkOut: '',
        workingHours: '---',
        status: isLate ? 'Late' : 'Present',
        remarks: isLate ? 'Checked in after office start time' : 'Regular on-time check-in'
      };

      attendance.unshift(newRecord);
      Store.save(STORAGE_KEYS.ATTENDANCE, attendance);

      Toast.success(`Check-in recorded successfully for ${employee.name} at ${checkInTime}.`);
      this.render();
      DashboardModule.render();
    },

    handleQuickCheckOut: function () {
      const quickSelect = document.getElementById('quick-employee-select');
      if (!quickSelect || !quickSelect.value) {
        Toast.warning('Please select an employee to check out.');
        return;
      }

      const empId = quickSelect.value;
      const today = new Date().toISOString().split('T')[0];
      const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];

      const recordIndex = attendance.findIndex(a => a.employeeId === empId && a.date === today);
      if (recordIndex === -1) {
        Toast.error(`No attendance record found for today for employee ${empId}. Please check in first.`);
        return;
      }

      const record = attendance[recordIndex];
      if (record.checkOut) {
        Toast.info(`${record.employeeName} has already checked out today at ${record.checkOut}.`);
        return;
      }

      // Record current time
      const now = new Date();
      const checkOutTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      record.checkOut = checkOutTime;
      record.workingHours = calculateWorkingHours(record.checkIn, checkOutTime);

      attendance[recordIndex] = record;
      Store.save(STORAGE_KEYS.ATTENDANCE, attendance);

      Toast.success(`Check-out recorded successfully for ${record.employeeName} at ${checkOutTime} (${record.workingHours}).`);
      this.render();
      DashboardModule.render();
    },

    openAddModal: function (existingRecord = null) {
      const modal = document.getElementById('modal-attendance');
      const form = document.getElementById('form-attendance');
      form.reset();

      this.updateEmployeeDropdowns();

      const editIdEl = document.getElementById('attendance-edit-id');
      const titleEl = document.getElementById('modal-attendance-title');
      const dateEl = document.getElementById('att-date');
      const statusEl = document.getElementById('att-status');
      const checkInEl = document.getElementById('att-checkin');
      const checkOutEl = document.getElementById('att-checkout');
      const hoursEl = document.getElementById('att-calc-hours');
      const remarksEl = document.getElementById('att-remarks');
      const empSelect = document.getElementById('att-employee-select');

      if (existingRecord) {
        titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Attendance Record`;
        editIdEl.value = existingRecord.id;
        empSelect.value = existingRecord.employeeId;
        dateEl.value = existingRecord.date;
        statusEl.value = existingRecord.status;
        checkInEl.value = existingRecord.checkIn || '';
        checkOutEl.value = existingRecord.checkOut || '';
        hoursEl.textContent = existingRecord.workingHours || calculateWorkingHours(existingRecord.checkIn, existingRecord.checkOut);
        remarksEl.value = existingRecord.remarks || '';
      } else {
        titleEl.innerHTML = `<i class="fa-solid fa-calendar-plus"></i> Add Attendance Record`;
        editIdEl.value = '';
        dateEl.value = new Date().toISOString().split('T')[0];
        statusEl.value = 'Present';
        checkInEl.value = '09:00';
        checkOutEl.value = '18:00';
        hoursEl.textContent = calculateWorkingHours('09:00', '18:00');
        remarksEl.value = '';
      }

      modal.classList.add('active');
    },

    handleSaveForm: function (e) {
      e.preventDefault();
      const editId = document.getElementById('attendance-edit-id').value;
      const empId = document.getElementById('att-employee-select').value;
      const date = document.getElementById('att-date').value;
      const status = document.getElementById('att-status').value;
      const checkIn = document.getElementById('att-checkin').value;
      const checkOut = document.getElementById('att-checkout').value;
      const remarks = document.getElementById('att-remarks').value.trim();

      if (!empId || !date) {
        Toast.error('Employee and Date are required fields.');
        return;
      }

      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const employee = members.find(m => m.id === empId);
      if (!employee) {
        Toast.error('Invalid employee selected.');
        return;
      }

      const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];

      // Duplicate check for new record
      if (!editId) {
        const isDup = attendance.some(a => a.employeeId === empId && a.date === date);
        if (isDup) {
          Toast.error(`An attendance entry for ${employee.name} on ${formatDate(date)} already exists.`);
          return;
        }
      }

      const workingHours = calculateWorkingHours(checkIn, checkOut);

      if (editId) {
        const idx = attendance.findIndex(a => a.id === editId);
        if (idx !== -1) {
          attendance[idx] = {
            ...attendance[idx],
            employeeId: employee.id,
            employeeName: employee.name,
            department: employee.department,
            date,
            checkIn,
            checkOut,
            workingHours,
            status,
            remarks
          };
          Toast.success('Attendance record updated successfully.');
        }
      } else {
        attendance.unshift({
          id: generateId('ATT'),
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          date,
          checkIn,
          checkOut,
          workingHours,
          status,
          remarks
        });
        Toast.success('Attendance saved successfully.');
      }

      Store.save(STORAGE_KEYS.ATTENDANCE, attendance);
      document.getElementById('modal-attendance').classList.remove('active');
      this.render();
      DashboardModule.render();
    },

    deleteRecord: async function (id) {
      const ok = await ConfirmModal.show('Are you sure you want to delete this attendance record?', 'Delete Attendance');
      if (!ok) return;

      let attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];
      attendance = attendance.filter(a => a.id !== id);
      Store.save(STORAGE_KEYS.ATTENDANCE, attendance);

      Toast.success('Attendance record deleted.');
      this.render();
      DashboardModule.render();
    },

    duplicateRecord: function (id) {
      const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];
      const item = attendance.find(a => a.id === id);
      if (!item) return;

      const copy = {
        ...item,
        id: generateId('ATT'),
        remarks: `${item.remarks || ''} (Copy)`.trim()
      };

      attendance.unshift(copy);
      Store.save(STORAGE_KEYS.ATTENDANCE, attendance);
      Toast.success('Attendance row duplicated.');
      this.render();
    },

    updateInlineStatus: function (id, newStatus) {
      const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];
      const idx = attendance.findIndex(a => a.id === id);
      if (idx !== -1) {
        attendance[idx].status = newStatus;
        Store.save(STORAGE_KEYS.ATTENDANCE, attendance);
        Toast.info(`Status updated to ${newStatus}.`);
        DashboardModule.render();
      }
    },

    render: function () {
      this.updateEmployeeDropdowns();
      let attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];

      // Filters
      const search = (document.getElementById('att-filter-search')?.value || '').toLowerCase().trim();
      const filterDate = document.getElementById('att-filter-date')?.value;
      const filterMonth = document.getElementById('att-filter-month')?.value;
      const filterDept = document.getElementById('att-filter-dept')?.value;
      const filterStatus = document.getElementById('att-filter-status')?.value;
      const filterEmployee = document.getElementById('att-filter-employee')?.value;

      let filtered = attendance.filter(a => {
        if (search) {
          const match = (a.employeeId && a.employeeId.toLowerCase().includes(search)) ||
                        (a.employeeName && a.employeeName.toLowerCase().includes(search)) ||
                        (a.department && a.department.toLowerCase().includes(search)) ||
                        (a.remarks && a.remarks.toLowerCase().includes(search));
          if (!match) return false;
        }

        if (filterDate && a.date !== filterDate) return false;

        if (filterMonth && a.date) {
          const m = a.date.split('-')[1];
          if (m !== filterMonth) return false;
        }

        if (filterDept && a.department !== filterDept) return false;
        if (filterStatus && a.status !== filterStatus) return false;
        if (filterEmployee && a.employeeId !== filterEmployee) return false;

        return true;
      });

      // Sorting
      filtered.sort((a, b) => {
        let valA = a[this.sortColumn] || '';
        let valB = b[this.sortColumn] || '';

        if (this.sortColumn === 'date') {
          return this.sortAsc ? new Date(valA) - new Date(valB) : new Date(valB) - new Date(valA);
        }

        if (typeof valA === 'string') {
          return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return this.sortAsc ? valA - valB : valB - valA;
      });

      const tbody = document.getElementById('attendance-table-body');
      const counter = document.getElementById('attendance-row-counter');

      if (counter) {
        counter.textContent = `Showing ${filtered.length} of ${attendance.length} records`;
      }

      if (!tbody) return;

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="11" class="empty-state">
              <i class="fa-solid fa-calendar-xmark"></i>
              <h3>No Attendance Records Found</h3>
              <p>No records match your selected search or filter criteria. Click below to add an attendance entry or register a new employee.</p>
              <div style="display: flex; gap: 0.65rem; justify-content: center; margin-top: 0.75rem; flex-wrap: wrap;">
                <button class="btn btn-primary btn-sm" onclick="window.FROMEX_APP.Attendance.openAddModal()">
                  <i class="fa-solid fa-plus"></i> Add Attendance Entry
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.FROMEX_APP.Members.openAddModal()">
                  <i class="fa-solid fa-user-plus"></i> Register Employee
                </button>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map((a, index) => {
        const statusClass = (a.status || 'present').toLowerCase().replace(/\s+/g, '');
        return `
          <tr data-id="${escapeHtml(a.id)}">
            <td class="col-sno">${index + 1}</td>
            <td><strong>${escapeHtml(a.employeeId)}</strong></td>
            <td>${escapeHtml(a.employeeName)}</td>
            <td>${escapeHtml(a.department)}</td>
            <td>${formatDate(a.date)}</td>
            <td>${a.checkIn || '---'}</td>
            <td>${a.checkOut || '---'}</td>
            <td style="font-weight: 600; color: ${a.workingHours && a.workingHours !== '---' ? 'var(--primary)' : 'var(--text-light)'};">
              ${escapeHtml(a.workingHours || '---')}
            </td>
            <td>
              <select class="form-control filter-select inline-status-select status-pill ${statusClass}"
                      style="font-size: 0.75rem; padding: 0.2rem 0.4rem; font-weight: 700; height: auto;"
                      onchange="window.FROMEX_APP.Attendance.updateInlineStatus('${escapeHtml(a.id)}', this.value)">
                <option value="Present" ${a.status === 'Present' ? 'selected' : ''}>Present</option>
                <option value="Absent" ${a.status === 'Absent' ? 'selected' : ''}>Absent</option>
                <option value="Late" ${a.status === 'Late' ? 'selected' : ''}>Late</option>
                <option value="Half Day" ${a.status === 'Half Day' ? 'selected' : ''}>Half Day</option>
                <option value="Leave" ${a.status === 'Leave' ? 'selected' : ''}>Leave</option>
                <option value="Holiday" ${a.status === 'Holiday' ? 'selected' : ''}>Holiday</option>
              </select>
            </td>
            <td><span title="${escapeHtml(a.remarks)}">${escapeHtml(a.remarks || '-')}</span></td>
            <td style="text-align: center;">
              <div class="table-actions" style="justify-content: center;">
                <button class="btn-icon" title="Edit Record" onclick="window.FROMEX_APP.Attendance.openEditModal('${escapeHtml(a.id)}')">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-icon" title="Duplicate Row" onclick="window.FROMEX_APP.Attendance.duplicateRecord('${escapeHtml(a.id)}')">
                  <i class="fa-solid fa-copy"></i>
                </button>
                <button class="btn-icon danger" title="Delete Record" onclick="window.FROMEX_APP.Attendance.deleteRecord('${escapeHtml(a.id)}')">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    },

    openEditModal: function (id) {
      const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];
      const item = attendance.find(a => a.id === id);
      if (item) this.openAddModal(item);
    }
  };

  // ==========================================================
  // MEMBERS MODULE (Employee Directory)
  // ==========================================================
  const MembersModule = {
    init: function () {
      document.getElementById('btn-open-add-member-modal')?.addEventListener('click', () => this.openAddModal());
      document.getElementById('form-member')?.addEventListener('submit', (e) => this.handleSaveMember(e));

      // Filters
      document.getElementById('member-filter-search')?.addEventListener('input', () => this.render());
      document.getElementById('member-filter-dept')?.addEventListener('change', () => this.render());
      document.getElementById('member-filter-status')?.addEventListener('change', () => this.render());
      document.getElementById('btn-reset-member-filters')?.addEventListener('click', () => {
        document.getElementById('member-filter-search').value = '';
        document.getElementById('member-filter-dept').value = '';
        document.getElementById('member-filter-status').value = '';
        this.render();
      });

      // Export / Print
      document.getElementById('btn-export-members-excel')?.addEventListener('click', () => ExcelService.exportMembersExcel());
      document.getElementById('btn-print-members')?.addEventListener('click', () => PrintService.printSection('Members Directory'));
    },

    openAddModal: function (existing = null) {
      const modal = document.getElementById('modal-member');
      const form = document.getElementById('form-member');
      form.reset();

      const editIdEl = document.getElementById('member-edit-id');
      const titleEl = document.getElementById('modal-member-title');
      const empIdEl = document.getElementById('member-emp-id');
      const nameEl = document.getElementById('member-name');
      const deptEl = document.getElementById('member-dept');
      const desigEl = document.getElementById('member-desig');
      const phoneEl = document.getElementById('member-phone');
      const emailEl = document.getElementById('member-email');
      const joinEl = document.getElementById('member-joining');
      const statusEl = document.getElementById('member-status');

      if (existing) {
        titleEl.innerHTML = `<i class="fa-solid fa-user-pen"></i> Edit Member (${existing.id})`;
        editIdEl.value = existing.id;
        empIdEl.value = existing.id;
        empIdEl.disabled = true;
        nameEl.value = existing.name;
        deptEl.value = existing.department;
        desigEl.value = existing.designation;
        phoneEl.value = existing.phone || '';
        emailEl.value = existing.email || '';
        joinEl.value = existing.joiningDate;
        statusEl.value = existing.status;
      } else {
        titleEl.innerHTML = `<i class="fa-solid fa-user-plus"></i> Add Company Member`;
        editIdEl.value = '';
        empIdEl.disabled = false;
        empIdEl.value = `FX-${Math.floor(1000 + Math.random() * 9000)}`;
        joinEl.value = new Date().toISOString().split('T')[0];
        statusEl.value = 'Active';
      }

      modal.classList.add('active');
    },

    handleSaveMember: function (e) {
      e.preventDefault();
      const editId = document.getElementById('member-edit-id').value;
      const empId = document.getElementById('member-emp-id').value.trim().toUpperCase();
      const name = document.getElementById('member-name').value.trim();
      const department = document.getElementById('member-dept').value.trim();
      const designation = document.getElementById('member-desig').value.trim();
      const phone = document.getElementById('member-phone').value.trim();
      const email = document.getElementById('member-email').value.trim();
      const joiningDate = document.getElementById('member-joining').value;
      const status = document.getElementById('member-status').value;

      if (!empId || !name || !department || !designation || !joiningDate) {
        Toast.error('Please fill in all required employee fields.');
        return;
      }

      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const accountingMembers = Store.get(STORAGE_KEYS.ACCOUNTING_MEMBERS) || [];

      if (!editId) {
        // Duplicate Employee ID check
        if (members.some(m => m.id.toUpperCase() === empId)) {
          Toast.error(`Employee ID "${empId}" is already taken by an existing staff member.`);
          return;
        }

        const newMember = {
          id: empId,
          name,
          department,
          designation,
          phone,
          email,
          joiningDate,
          status
        };

        members.push(newMember);

        // Auto create accounting member entry
        accountingMembers.push({
          id: empId,
          name,
          department,
          designation,
          basicSalary: 50000,
          allowance: 10000,
          bonus: 0,
          deduction: 2000,
          advance: 0,
          paymentStatus: 'Pending'
        });

        Toast.success(`Member ${name} added successfully and linked to attendance.`);
      } else {
        const idx = members.findIndex(m => m.id === editId);
        if (idx !== -1) {
          members[idx] = {
            ...members[idx],
            name,
            department,
            designation,
            phone,
            email,
            joiningDate,
            status
          };

          // Also update name and dept in accounting members
          const accIdx = accountingMembers.findIndex(a => a.id === editId);
          if (accIdx !== -1) {
            accountingMembers[accIdx].name = name;
            accountingMembers[accIdx].department = department;
            accountingMembers[accIdx].designation = designation;
          }

          Toast.success(`Member ${name} updated successfully.`);
        }
      }

      Store.save(STORAGE_KEYS.MEMBERS, members);
      Store.save(STORAGE_KEYS.ACCOUNTING_MEMBERS, accountingMembers);

      document.getElementById('modal-member').classList.remove('active');
      this.render();
      AttendanceModule.render();
      DashboardModule.render();
    },

    deleteMember: async function (id) {
      const ok = await ConfirmModal.show(`Are you sure you want to delete employee ${id}? This will remove them from active rosters.`, 'Delete Member');
      if (!ok) return;

      let members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      let accountingMembers = Store.get(STORAGE_KEYS.ACCOUNTING_MEMBERS) || [];

      members = members.filter(m => m.id !== id);
      accountingMembers = accountingMembers.filter(m => m.id !== id);

      Store.save(STORAGE_KEYS.MEMBERS, members);
      Store.save(STORAGE_KEYS.ACCOUNTING_MEMBERS, accountingMembers);

      Toast.success(`Member ${id} deleted.`);
      this.render();
      AttendanceModule.render();
      DashboardModule.render();
    },

    viewMember: function (id) {
      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const member = members.find(m => m.id === id);
      if (!member) return;

      const content = document.getElementById('view-member-content');
      content.innerHTML = `
        <div style="display: flex; gap: 1.25rem; align-items: center; margin-bottom: 1.5rem; background: var(--bg-surface-subtle); padding: 1.25rem; border-radius: var(--radius-md);">
          <div class="user-avatar" style="width: 56px; height: 56px; font-size: 1.5rem;">
            ${escapeHtml(member.name.slice(0, 2).toUpperCase())}
          </div>
          <div>
            <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.2rem;">${escapeHtml(member.name)}</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
              ${escapeHtml(member.designation)} &bull; ${escapeHtml(member.department)}
            </div>
            <div style="margin-top: 0.4rem;">
              <span class="status-pill ${member.status.toLowerCase()}">${escapeHtml(member.status)}</span>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; font-size: 0.85rem;">
          <div class="form-group">
            <span class="form-label" style="color: var(--text-muted);">Employee ID</span>
            <strong>${escapeHtml(member.id)}</strong>
          </div>
          <div class="form-group">
            <span class="form-label" style="color: var(--text-muted);">Joining Date</span>
            <strong>${formatDate(member.joiningDate)}</strong>
          </div>
          <div class="form-group">
            <span class="form-label" style="color: var(--text-muted);">Phone</span>
            <strong>${escapeHtml(member.phone || 'Not provided')}</strong>
          </div>
          <div class="form-group">
            <span class="form-label" style="color: var(--text-muted);">Email</span>
            <strong>${escapeHtml(member.email || 'Not provided')}</strong>
          </div>
        </div>
      `;

      document.getElementById('modal-view-member').classList.add('active');
    },

    render: function () {
      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const search = (document.getElementById('member-filter-search')?.value || '').toLowerCase().trim();
      const deptFilter = document.getElementById('member-filter-dept')?.value;
      const statusFilter = document.getElementById('member-filter-status')?.value;

      // Populate department filter options if needed
      const deptSelect = document.getElementById('member-filter-dept');
      if (deptSelect && deptSelect.children.length <= 1) {
        const depts = Array.from(new Set(members.map(m => m.department))).filter(Boolean);
        deptSelect.innerHTML = `<option value="">All Departments</option>` + depts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
      }

      let filtered = members.filter(m => {
        if (search) {
          const match = m.id.toLowerCase().includes(search) ||
                        m.name.toLowerCase().includes(search) ||
                        m.department.toLowerCase().includes(search) ||
                        (m.phone && m.phone.toLowerCase().includes(search)) ||
                        (m.email && m.email.toLowerCase().includes(search));
          if (!match) return false;
        }

        if (deptFilter && m.department !== deptFilter) return false;
        if (statusFilter && m.status !== statusFilter) return false;
        return true;
      });

      const tbody = document.getElementById('members-table-body');
      const counter = document.getElementById('members-row-counter');

      if (counter) counter.textContent = `Showing ${filtered.length} of ${members.length} members`;
      if (!tbody) return;

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" class="empty-state">
              <i class="fa-solid fa-users-slash"></i>
              <h3>No Members Found</h3>
              <p>No company employees found. Click below to register your first employee member.</p>
              <div style="margin-top: 0.75rem;">
                <button class="btn btn-primary btn-sm" onclick="window.FROMEX_APP.Members.openAddModal()">
                  <i class="fa-solid fa-user-plus"></i> + Add First Member
                </button>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map((m, index) => `
        <tr>
          <td class="col-sno">${index + 1}</td>
          <td><strong>${escapeHtml(m.id)}</strong></td>
          <td>${escapeHtml(m.name)}</td>
          <td>${escapeHtml(m.department)}</td>
          <td>${escapeHtml(m.designation)}</td>
          <td>${escapeHtml(m.phone || '-')}</td>
          <td>${escapeHtml(m.email || '-')}</td>
          <td>${formatDate(m.joiningDate)}</td>
          <td><span class="status-pill ${m.status.toLowerCase()}">${escapeHtml(m.status)}</span></td>
          <td style="text-align: center;">
            <div class="table-actions" style="justify-content: center;">
              <button class="btn-icon" title="View Profile" onclick="window.FROMEX_APP.Members.viewMember('${escapeHtml(m.id)}')">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn-icon" title="Edit Member" onclick="window.FROMEX_APP.Members.openEditModal('${escapeHtml(m.id)}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon danger" title="Delete Member" onclick="window.FROMEX_APP.Members.deleteMember('${escapeHtml(m.id)}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    openEditModal: function (id) {
      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const m = members.find(item => item.id === id);
      if (m) this.openAddModal(m);
    }
  };

  // ==========================================================
  // ACCOUNTING LIST MODULE (Spreadsheet & Ledger)
  // ==========================================================
  const AccountingModule = {
    sortColumn: 'date',
    sortAsc: false,

    init: function () {
      document.getElementById('btn-open-add-transaction-modal')?.addEventListener('click', () => this.openAddModal());
      document.getElementById('btn-add-accounting-quick-row')?.addEventListener('click', () => this.openAddModal());

      document.getElementById('form-transaction')?.addEventListener('submit', (e) => this.handleSaveTransaction(e));

      // Live calculation of GST & Total
      const amtEl = document.getElementById('txn-amount');
      const gstEl = document.getElementById('txn-gst');
      const typeEl = document.getElementById('txn-type');

      const recalc = () => {
        const amt = Number(amtEl.value) || 0;
        let gstRate = Number(gstEl.value) || 0;

        // No GST automatically on Salary
        if (typeEl.value === 'Salary') {
          gstRate = 0;
          gstEl.value = 0;
          gstEl.disabled = true;
        } else {
          gstEl.disabled = false;
        }

        const gstAmt = (amt * gstRate) / 100;
        const total = amt + gstAmt;

        document.getElementById('txn-calc-gst').textContent = formatCurrency(gstAmt);
        document.getElementById('txn-calc-total').textContent = formatCurrency(total);
      };

      amtEl?.addEventListener('input', recalc);
      gstEl?.addEventListener('input', recalc);
      typeEl?.addEventListener('change', recalc);

      // Filters
      ['acc-filter-search', 'acc-filter-date', 'acc-filter-type', 'acc-filter-category', 'acc-filter-account', 'acc-filter-status'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => this.render());
      });

      document.getElementById('btn-reset-accounting-filters')?.addEventListener('click', () => {
        document.getElementById('acc-filter-search').value = '';
        document.getElementById('acc-filter-date').value = '';
        document.getElementById('acc-filter-type').value = '';
        document.getElementById('acc-filter-category').value = '';
        document.getElementById('acc-filter-account').value = '';
        document.getElementById('acc-filter-status').value = '';
        this.render();
      });

      // Sorting
      document.querySelectorAll('#accounting-excel-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.getAttribute('data-sort');
          if (this.sortColumn === col) {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortColumn = col;
            this.sortAsc = true;
          }
          this.render();
        });
      });

      // Export / Import / Print
      document.getElementById('btn-export-accounting-excel')?.addEventListener('click', () => ExcelService.exportAccountingExcel());
      document.getElementById('btn-export-accounting-csv')?.addEventListener('click', () => ExcelService.exportAccountingCSV());
      document.getElementById('btn-download-accounting-template')?.addEventListener('click', () => ExcelService.downloadAccountingTemplate());
      document.getElementById('btn-import-accounting-excel')?.addEventListener('click', () => ExcelService.openImportModal('accounting'));
      document.getElementById('btn-print-accounting')?.addEventListener('click', () => PrintService.printSection('Accounting Ledger'));
    },

    populateCategoryAndAccountDropdowns: function () {
      const categories = Store.get(STORAGE_KEYS.CATEGORIES) || DEFAULT_CATEGORIES;
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];

      // Alert in modal if 0 accounts
      const noAccountsAlert = document.getElementById('txn-no-accounts-alert');
      if (noAccountsAlert) {
        noAccountsAlert.style.display = accounts.length === 0 ? 'flex' : 'none';
      }

      // Modal Category
      const catModalSelect = document.getElementById('txn-category');
      if (catModalSelect) {
        catModalSelect.innerHTML = categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
      }

      // Filter Category
      const catFilterSelect = document.getElementById('acc-filter-category');
      if (catFilterSelect) {
        const cur = catFilterSelect.value;
        catFilterSelect.innerHTML = `<option value="">All Categories</option>` + categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        catFilterSelect.value = cur;
      }

      // Modal Account
      const accModalSelect = document.getElementById('txn-account');
      if (accModalSelect) {
        if (accounts.length === 0) {
          accModalSelect.innerHTML = `<option value="">-- No Accounts (Click + Account) --</option>`;
        } else {
          accModalSelect.innerHTML = accounts.map(a => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)} (${escapeHtml(a.type)})</option>`).join('');
        }
      }

      // Filter Account
      const accFilterSelect = document.getElementById('acc-filter-account');
      if (accFilterSelect) {
        const cur = accFilterSelect.value;
        accFilterSelect.innerHTML = `<option value="">All Accounts</option>` + accounts.map(a => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)}</option>`).join('');
        accFilterSelect.value = cur;
      }

      // Populate datalist-parties with employees and vendors
      const datalistParties = document.getElementById('datalist-parties');
      if (datalistParties) {
        const partySet = new Set();
        members.forEach(m => partySet.add(m.name));
        transactions.forEach(t => { if (t.party) partySet.add(t.party); });
        datalistParties.innerHTML = Array.from(partySet).map(p => `<option value="${escapeHtml(p)}">`).join('');
      }
    },

    openAddModal: function (existing = null) {
      const modal = document.getElementById('modal-transaction');
      const form = document.getElementById('form-transaction');
      form.reset();

      this.populateCategoryAndAccountDropdowns();

      const editIdEl = document.getElementById('txn-edit-id');
      const titleEl = document.getElementById('modal-transaction-title');
      const dateEl = document.getElementById('txn-date');
      const txnIdEl = document.getElementById('txn-id');
      const typeEl = document.getElementById('txn-type');
      const catEl = document.getElementById('txn-category');
      const partyEl = document.getElementById('txn-party');
      const accEl = document.getElementById('txn-account');
      const descEl = document.getElementById('txn-desc');
      const amtEl = document.getElementById('txn-amount');
      const gstEl = document.getElementById('txn-gst');
      const methodEl = document.getElementById('txn-method');
      const statusEl = document.getElementById('txn-status');
      const remarksEl = document.getElementById('txn-remarks');

      if (existing) {
        titleEl.innerHTML = `<i class="fa-solid fa-file-pen"></i> Edit Accounting Entry`;
        editIdEl.value = existing.id;
        dateEl.value = existing.date;
        txnIdEl.value = existing.transactionId || '';
        typeEl.value = existing.type;
        catEl.value = existing.category;
        partyEl.value = existing.party || '';
        accEl.value = existing.accountId;
        descEl.value = existing.description;
        amtEl.value = existing.amount;
        gstEl.value = existing.gstRate || 0;
        methodEl.value = existing.paymentMethod || 'Bank Transfer';
        statusEl.value = existing.status || 'Completed';
        remarksEl.value = existing.remarks || '';
      } else {
        titleEl.innerHTML = `<i class="fa-solid fa-money-bill-transfer"></i> Add Accounting Entry`;
        editIdEl.value = '';
        dateEl.value = new Date().toISOString().split('T')[0];
        txnIdEl.value = `TXN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        typeEl.value = 'Expense';
        const settings = Store.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
        gstEl.value = settings.defaultGst || 18;
        methodEl.value = 'Bank Transfer';
        statusEl.value = 'Completed';
      }

      // Trigger recalculate
      amtEl.dispatchEvent(new Event('input'));
      modal.classList.add('active');
    },

    handleSaveTransaction: function (e) {
      e.preventDefault();
      const editId = document.getElementById('txn-edit-id').value;
      const date = document.getElementById('txn-date').value;
      const transactionId = document.getElementById('txn-id').value.trim() || `TXN-${Date.now()}`;
      const type = document.getElementById('txn-type').value;
      const category = document.getElementById('txn-category').value;
      const party = document.getElementById('txn-party').value.trim();
      const accountId = document.getElementById('txn-account').value;
      const description = document.getElementById('txn-desc').value.trim();
      const amount = Number(document.getElementById('txn-amount').value) || 0;
      let gstRate = Number(document.getElementById('txn-gst').value) || 0;
      if (type === 'Salary') gstRate = 0;

      const gstAmount = (amount * gstRate) / 100;
      const totalAmount = amount + gstAmount;
      const paymentMethod = document.getElementById('txn-method').value;
      const status = document.getElementById('txn-status').value;
      const remarks = document.getElementById('txn-remarks').value.trim();

      if (!date || !type || !accountId || !description || amount <= 0) {
        Toast.error('Please fill in required fields and enter a valid numeric amount.');
        return;
      }

      const transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const targetAccount = accounts.find(a => a.id === accountId);

      if (!targetAccount) {
        Toast.error('Selected company account was not found.');
        return;
      }

      // Recalculate account balances accurately
      if (editId) {
        const oldIndex = transactions.findIndex(t => t.id === editId);
        if (oldIndex !== -1) {
          // Revert old transaction effect on old account
          const oldTxn = transactions[oldIndex];
          AccountsModule.applyTransactionEffect(oldTxn.accountId, oldTxn.type, oldTxn.totalAmount, true);

          transactions[oldIndex] = {
            ...transactions[oldIndex],
            date,
            transactionId,
            type,
            category,
            party,
            accountId,
            description,
            amount,
            gstRate,
            gstAmount,
            totalAmount,
            paymentMethod,
            status,
            remarks
          };

          // Apply new effect on account
          if (status === 'Completed') {
            AccountsModule.applyTransactionEffect(accountId, type, totalAmount, false);
          }

          Toast.success('Accounting entry updated successfully.');
        }
      } else {
        const newEntry = {
          id: generateId('TXN'),
          date,
          transactionId,
          type,
          category,
          party,
          accountId,
          description,
          amount,
          gstRate,
          gstAmount,
          totalAmount,
          paymentMethod,
          status,
          remarks
        };

        transactions.unshift(newEntry);

        // Apply effect to account
        if (status === 'Completed') {
          AccountsModule.applyTransactionEffect(accountId, type, totalAmount, false);
        }

        Toast.success('Accounting entry added and account balance updated.');
      }

      Store.save(STORAGE_KEYS.TRANSACTIONS, transactions);
      document.getElementById('modal-transaction').classList.remove('active');
      this.render();
      AccountsModule.render();
      DashboardModule.render();
    },

    deleteTransaction: async function (id) {
      const ok = await ConfirmModal.show('Are you sure you want to delete this accounting transaction?', 'Delete Transaction');
      if (!ok) return;

      let transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const txn = transactions.find(t => t.id === id);

      if (txn && txn.status === 'Completed') {
        // Revert account balance effect
        AccountsModule.applyTransactionEffect(txn.accountId, txn.type, txn.totalAmount, true);
      }

      transactions = transactions.filter(t => t.id !== id);
      Store.save(STORAGE_KEYS.TRANSACTIONS, transactions);

      Toast.success('Accounting transaction deleted.');
      this.render();
      AccountsModule.render();
      DashboardModule.render();
    },

    duplicateTransaction: function (id) {
      const transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const item = transactions.find(t => t.id === id);
      if (!item) return;

      const copy = {
        ...item,
        id: generateId('TXN'),
        transactionId: `TXN-${Date.now().toString().slice(-4)}`,
        description: `${item.description} (Copy)`.trim()
      };

      transactions.unshift(copy);
      if (copy.status === 'Completed') {
        AccountsModule.applyTransactionEffect(copy.accountId, copy.type, copy.totalAmount, false);
      }

      Store.save(STORAGE_KEYS.TRANSACTIONS, transactions);
      Toast.success('Transaction duplicated.');
      this.render();
      AccountsModule.render();
      DashboardModule.render();
    },

    render: function () {
      this.populateCategoryAndAccountDropdowns();
      let transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const accountsMap = new Map(accounts.map(a => [a.id, a.name]));

      const search = (document.getElementById('acc-filter-search')?.value || '').toLowerCase().trim();
      const filterDate = document.getElementById('acc-filter-date')?.value;
      const filterType = document.getElementById('acc-filter-type')?.value;
      const filterCategory = document.getElementById('acc-filter-category')?.value;
      const filterAccount = document.getElementById('acc-filter-account')?.value;
      const filterStatus = document.getElementById('acc-filter-status')?.value;

      let filtered = transactions.filter(t => {
        if (search) {
          const match = (t.transactionId && t.transactionId.toLowerCase().includes(search)) ||
                        (t.description && t.description.toLowerCase().includes(search)) ||
                        (t.party && t.party.toLowerCase().includes(search)) ||
                        (t.category && t.category.toLowerCase().includes(search)) ||
                        (t.remarks && t.remarks.toLowerCase().includes(search));
          if (!match) return false;
        }

        if (filterDate && t.date !== filterDate) return false;
        if (filterType && t.type !== filterType) return false;
        if (filterCategory && t.category !== filterCategory) return false;
        if (filterAccount && t.accountId !== filterAccount) return false;
        if (filterStatus && t.status !== filterStatus) return false;

        return true;
      });

      // Sorting
      filtered.sort((a, b) => {
        let valA = a[this.sortColumn] || '';
        let valB = b[this.sortColumn] || '';

        if (this.sortColumn === 'date') {
          return this.sortAsc ? new Date(valA) - new Date(valB) : new Date(valB) - new Date(valA);
        }

        if (this.sortColumn === 'totalAmount' || this.sortColumn === 'amount') {
          return this.sortAsc ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
        }

        if (typeof valA === 'string') {
          return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return this.sortAsc ? valA - valB : valB - valA;
      });

      const tbody = document.getElementById('accounting-table-body');
      const counter = document.getElementById('accounting-row-counter');
      const totalsSummary = document.getElementById('accounting-totals-summary');

      const sumTotal = filtered.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);

      if (counter) counter.textContent = `Showing ${filtered.length} of ${transactions.length} entries`;
      if (totalsSummary) totalsSummary.textContent = `Filtered Total: ${formatCurrency(sumTotal)}`;
      if (!tbody) return;

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="15" class="empty-state" style="padding: 2.5rem 1rem; text-align: center;">
              <i class="fa-solid fa-receipt" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem; display: block;"></i>
              <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">No Accounting Entries Found</h3>
              <p style="color: var(--text-muted); margin-bottom: 1rem;">No transactions match your criteria. Add a transaction or set up company accounts to get started.</p>
              <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="window.FROMEX_APP.Accounting.openAddModal()">
                  <i class="fa-solid fa-plus-circle"></i> + Add Accounting Entry
                </button>
                <button class="btn btn-secondary" onclick="window.FROMEX_APP.Accounts.openAddModal()">
                  <i class="fa-solid fa-building-columns"></i> + Add Company Account
                </button>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map((t, index) => {
        const typeClass = (t.type || 'other').toLowerCase();
        const accName = accountsMap.get(t.accountId) || t.accountId;

        return `
          <tr>
            <td class="col-sno">${index + 1}</td>
            <td>${formatDate(t.date)}</td>
            <td><strong>${escapeHtml(t.transactionId)}</strong></td>
            <td><span class="type-badge ${typeClass}">${escapeHtml(t.type)}</span></td>
            <td>${escapeHtml(t.category)}</td>
            <td>${escapeHtml(t.description)}</td>
            <td>${escapeHtml(t.party || '-')}</td>
            <td>${escapeHtml(accName)}</td>
            <td>${formatCurrency(t.amount)}</td>
            <td>${escapeHtml(t.paymentMethod || '-')}</td>
            <td>${t.gstRate || 0}%</td>
            <td><strong>${formatCurrency(t.totalAmount)}</strong></td>
            <td><span class="status-pill ${t.status === 'Completed' ? 'present' : (t.status === 'Pending' ? 'late' : 'absent')}">${escapeHtml(t.status)}</span></td>
            <td><span title="${escapeHtml(t.remarks)}">${escapeHtml(t.remarks || '-')}</span></td>
            <td style="text-align: center;">
              <div class="table-actions" style="justify-content: center;">
                <button class="btn-icon" title="Edit Entry" onclick="window.FROMEX_APP.Accounting.openEditModal('${escapeHtml(t.id)}')">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-icon" title="Duplicate Entry" onclick="window.FROMEX_APP.Accounting.duplicateTransaction('${escapeHtml(t.id)}')">
                  <i class="fa-solid fa-copy"></i>
                </button>
                <button class="btn-icon danger" title="Delete Entry" onclick="window.FROMEX_APP.Accounting.deleteTransaction('${escapeHtml(t.id)}')">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    },

    openEditModal: function (id) {
      const transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const item = transactions.find(t => t.id === id);
      if (item) this.openAddModal(item);
    }
  };

  // ==========================================================
  // ACCOUNTING MEMBERS MODULE (Salary & Compensation)
  // ==========================================================
  const AccountingMembersModule = {
    init: function () {
      document.getElementById('form-salary')?.addEventListener('submit', (e) => this.handleSaveSalary(e));

      // Live Calculation in modal
      const basicEl = document.getElementById('sal-basic');
      const allowEl = document.getElementById('sal-allowance');
      const bonusEl = document.getElementById('sal-bonus');
      const dedEl = document.getElementById('sal-deduction');
      const advEl = document.getElementById('sal-advance');

      const recalc = () => {
        const basic = Number(basicEl.value) || 0;
        const allow = Number(allowEl.value) || 0;
        const bonus = Number(bonusEl.value) || 0;
        const ded = Number(dedEl.value) || 0;
        const adv = Number(advEl.value) || 0;

        const gross = basic + allow + bonus;
        const net = gross - ded - adv;

        document.getElementById('sal-calc-gross').textContent = formatCurrency(gross);
        document.getElementById('sal-calc-net').textContent = formatCurrency(net);
      };

      [basicEl, allowEl, bonusEl, dedEl, advEl].forEach(el => el?.addEventListener('input', recalc));

      // Export / Print
      document.getElementById('btn-export-salary-excel')?.addEventListener('click', () => ExcelService.exportSalaryExcel());
      document.getElementById('btn-print-salary')?.addEventListener('click', () => PrintService.printSection('Salary & Payroll Roster'));
    },

    openEditModal: function (id) {
      const accMembers = Store.get(STORAGE_KEYS.ACCOUNTING_MEMBERS) || [];
      const member = accMembers.find(m => m.id === id);
      if (!member) return;

      document.getElementById('sal-member-id').value = member.id;
      document.getElementById('sal-emp-name').textContent = member.name;
      document.getElementById('sal-emp-meta').textContent = `${member.id} • ${member.department} • ${member.designation}`;

      document.getElementById('sal-basic').value = member.basicSalary || 0;
      document.getElementById('sal-allowance').value = member.allowance || 0;
      document.getElementById('sal-bonus').value = member.bonus || 0;
      document.getElementById('sal-deduction').value = member.deduction || 0;
      document.getElementById('sal-advance').value = member.advance || 0;
      document.getElementById('sal-status').value = member.paymentStatus || 'Pending';

      document.getElementById('sal-basic').dispatchEvent(new Event('input'));
      document.getElementById('modal-salary').classList.add('active');
    },

    handleSaveSalary: function (e) {
      e.preventDefault();
      const id = document.getElementById('sal-member-id').value;
      const basic = Number(document.getElementById('sal-basic').value) || 0;
      const allowance = Number(document.getElementById('sal-allowance').value) || 0;
      const bonus = Number(document.getElementById('sal-bonus').value) || 0;
      const deduction = Number(document.getElementById('sal-deduction').value) || 0;
      const advance = Number(document.getElementById('sal-advance').value) || 0;
      const paymentStatus = document.getElementById('sal-status').value;

      const accMembers = Store.get(STORAGE_KEYS.ACCOUNTING_MEMBERS) || [];
      const idx = accMembers.findIndex(m => m.id === id);

      if (idx !== -1) {
        accMembers[idx] = {
          ...accMembers[idx],
          basicSalary: basic,
          allowance,
          bonus,
          deduction,
          advance,
          paymentStatus
        };

        Store.save(STORAGE_KEYS.ACCOUNTING_MEMBERS, accMembers);
        Toast.success(`Salary structure updated for ${accMembers[idx].name}.`);
        document.getElementById('modal-salary').classList.remove('active');
        this.render();
      }
    },

    render: function () {
      const accMembers = Store.get(STORAGE_KEYS.ACCOUNTING_MEMBERS) || [];
      const tbody = document.getElementById('salary-table-body');
      const counter = document.getElementById('salary-row-counter');
      const totalsSummary = document.getElementById('salary-totals-summary');

      let totalNetPayroll = 0;

      if (!tbody) return;

      if (accMembers.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="13" class="empty-state" style="padding: 2.5rem 1rem; text-align: center;">
              <i class="fa-solid fa-money-check-dollar" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem; display: block;"></i>
              <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">No Salary Roster Members</h3>
              <p style="color: var(--text-muted); margin-bottom: 1rem;">No employees registered in the company payroll roster. Add members to configure their compensation structure.</p>
              <button class="btn btn-primary" onclick="window.FROMEX_APP.Members.openAddModal()">
                <i class="fa-solid fa-user-plus"></i> + Add Member to Roster
              </button>
            </td>
          </tr>
        `;
        if (counter) counter.textContent = 'Showing 0 members';
        if (totalsSummary) totalsSummary.textContent = `Total Net Monthly Payroll: ${formatCurrency(0)}`;
        return;
      }

      tbody.innerHTML = accMembers.map((m, index) => {
        const basic = Number(m.basicSalary) || 0;
        const allow = Number(m.allowance) || 0;
        const bonus = Number(m.bonus) || 0;
        const ded = Number(m.deduction) || 0;
        const adv = Number(m.advance) || 0;

        const gross = basic + allow + bonus;
        const net = gross - ded - adv;
        totalNetPayroll += net;

        const statusClass = m.paymentStatus === 'Paid' ? 'present' : (m.paymentStatus === 'Partially Paid' ? 'late' : 'absent');

        return `
          <tr>
            <td class="col-sno">${index + 1}</td>
            <td><strong>${escapeHtml(m.id)}</strong></td>
            <td>${escapeHtml(m.name)}</td>
            <td>${escapeHtml(m.department)}</td>
            <td>${escapeHtml(m.designation)}</td>
            <td>${formatCurrency(basic)}</td>
            <td>${formatCurrency(allow)}</td>
            <td>${formatCurrency(bonus)}</td>
            <td style="color: var(--expense-color);">${formatCurrency(ded)}</td>
            <td style="color: var(--expense-color);">${formatCurrency(adv)}</td>
            <td><strong style="color: var(--primary);">${formatCurrency(net)}</strong></td>
            <td><span class="status-pill ${statusClass}">${escapeHtml(m.paymentStatus || 'Pending')}</span></td>
            <td style="text-align: center;">
              <button class="btn-icon" title="Edit Salary Breakdown" onclick="window.FROMEX_APP.AccountingMembers.openEditModal('${escapeHtml(m.id)}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      if (counter) counter.textContent = `Showing ${accMembers.length} members`;
      if (totalsSummary) totalsSummary.textContent = `Total Net Monthly Payroll: ${formatCurrency(totalNetPayroll)}`;
    }
  };

  // ==========================================================
  // COMPANY ACCOUNTS MODULE (Treasury & Balances)
  // ==========================================================
  const AccountsModule = {
    init: function () {
      document.getElementById('btn-open-add-account-modal')?.addEventListener('click', () => this.openAddModal());
      document.getElementById('form-account')?.addEventListener('submit', (e) => this.handleSaveAccount(e));

      // Export / Print
      document.getElementById('btn-export-accounts-excel')?.addEventListener('click', () => ExcelService.exportAccountsExcel());
      document.getElementById('btn-print-accounts')?.addEventListener('click', () => PrintService.printSection('Company Accounts'));
    },

    openAddModal: function (existing = null) {
      const modal = document.getElementById('modal-account');
      const form = document.getElementById('form-account');
      form.reset();

      const editIdEl = document.getElementById('acc-edit-id');
      const titleEl = document.getElementById('modal-account-title');
      const nameEl = document.getElementById('acc-name');
      const typeEl = document.getElementById('acc-type');
      const bankEl = document.getElementById('acc-bank-name');
      const numEl = document.getElementById('acc-number');
      const balEl = document.getElementById('acc-opening-bal');
      const statusEl = document.getElementById('acc-status');

      if (existing) {
        titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Company Account`;
        editIdEl.value = existing.id;
        nameEl.value = existing.name;
        typeEl.value = existing.type;
        bankEl.value = existing.bankName || '';
        numEl.value = existing.accountNumber || '';
        balEl.value = existing.openingBalance;
        balEl.disabled = true; // Opening balance locked on edit
        statusEl.value = existing.status;
      } else {
        titleEl.innerHTML = `<i class="fa-solid fa-building-columns"></i> Add Company Account`;
        editIdEl.value = '';
        balEl.disabled = false;
        balEl.value = '0.00';
        statusEl.value = 'Active';
      }

      modal.classList.add('active');
    },

    handleSaveAccount: function (e) {
      e.preventDefault();
      const editId = document.getElementById('acc-edit-id').value;
      const name = document.getElementById('acc-name').value.trim();
      const type = document.getElementById('acc-type').value;
      const bankName = document.getElementById('acc-bank-name').value.trim();
      const accountNumber = document.getElementById('acc-number').value.trim();
      const openingBalance = Number(document.getElementById('acc-opening-bal').value) || 0;
      const status = document.getElementById('acc-status').value;

      if (!name || !type) {
        Toast.error('Please specify an account name and type.');
        return;
      }

      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];

      if (editId) {
        const idx = accounts.findIndex(a => a.id === editId);
        if (idx !== -1) {
          accounts[idx] = {
            ...accounts[idx],
            name,
            type,
            bankName,
            accountNumber,
            status
          };
          Toast.success('Account details updated.');
        }
      } else {
        const newId = `ACC-00${accounts.length + 1}`;
        accounts.push({
          id: newId,
          name,
          type,
          bankName,
          accountNumber,
          openingBalance,
          currentBalance: openingBalance,
          status
        });
        Toast.success(`Account "${name}" created with opening balance of ${formatCurrency(openingBalance)}.`);
      }

      Store.save(STORAGE_KEYS.ACCOUNTS, accounts);
      document.getElementById('modal-account').classList.remove('active');
      this.render();
      DashboardModule.render();
    },

    deleteAccount: async function (id) {
      const ok = await ConfirmModal.show('Are you sure you want to delete this company account? Existing transaction history will remain.', 'Delete Account');
      if (!ok) return;

      let accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      accounts = accounts.filter(a => a.id !== id);
      Store.save(STORAGE_KEYS.ACCOUNTS, accounts);

      Toast.success('Company account deleted.');
      this.render();
      DashboardModule.render();
    },

    viewTransactions: function (id) {
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const account = accounts.find(a => a.id === id);
      if (!account) return;

      const transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const linked = transactions.filter(t => t.accountId === id);

      document.getElementById('modal-acc-txns-name').textContent = account.name;
      document.getElementById('modal-acc-txns-info').textContent = `${account.bankName || ''} • ${account.accountNumber || ''} • Type: ${account.type}`;
      document.getElementById('modal-acc-txns-balance').textContent = formatCurrency(account.currentBalance);

      const tbody = document.getElementById('modal-acc-txns-tbody');
      if (linked.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state" style="padding: 1.5rem;"><p>No transactions found for this account.</p></td></tr>`;
      } else {
        tbody.innerHTML = linked.map(t => `
          <tr>
            <td>${formatDate(t.date)}</td>
            <td><strong>${escapeHtml(t.transactionId)}</strong></td>
            <td><span class="type-badge ${t.type.toLowerCase()}">${escapeHtml(t.type)}</span></td>
            <td>${escapeHtml(t.category)}</td>
            <td>${escapeHtml(t.description)}</td>
            <td>${escapeHtml(t.party || '-')}</td>
            <td><strong>${formatCurrency(t.totalAmount)}</strong></td>
          </tr>
        `).join('');
      }

      document.getElementById('modal-account-txns').classList.add('active');
    },

    applyTransactionEffect: function (accountId, type, amount, isReversal = false) {
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const idx = accounts.findIndex(a => a.id === accountId);
      if (idx === -1) return;

      const num = Number(amount) || 0;
      const isCredit = (type === 'Income' || type === 'Receipt');

      let delta = isCredit ? num : -num;
      if (isReversal) delta = -delta;

      accounts[idx].currentBalance = (Number(accounts[idx].currentBalance) || 0) + delta;
      Store.save(STORAGE_KEYS.ACCOUNTS, accounts);
    },

    render: function () {
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const tbody = document.getElementById('accounts-table-body');
      const counter = document.getElementById('accounts-row-counter');
      const totalDisplay = document.getElementById('accounts-total-balance-display');

      const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

      if (counter) counter.textContent = `Showing ${accounts.length} accounts`;
      if (totalDisplay) totalDisplay.textContent = `Total Treasury Balance: ${formatCurrency(totalBalance)}`;
      if (!tbody) return;

      if (accounts.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" class="empty-state" style="padding: 2.5rem 1rem; text-align: center;">
              <i class="fa-solid fa-building-columns" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem; display: block;"></i>
              <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">No Company Accounts Configured</h3>
              <p style="color: var(--text-muted); margin-bottom: 1rem;">Set up bank, cash, or UPI accounts to track company financial balances and transactions.</p>
              <button class="btn btn-primary" onclick="window.FROMEX_APP.Accounts.openAddModal()">
                <i class="fa-solid fa-plus-circle"></i> + Add Company Account
              </button>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = accounts.map((a, index) => `
        <tr>
          <td class="col-sno">${index + 1}</td>
          <td><strong>${escapeHtml(a.id)}</strong></td>
          <td>${escapeHtml(a.name)}</td>
          <td><span class="type-badge" style="background: var(--bg-surface-subtle);">${escapeHtml(a.type)}</span></td>
          <td>${escapeHtml(a.bankName || '-')}</td>
          <td><code>${escapeHtml(a.accountNumber || '-')}</code></td>
          <td>${formatCurrency(a.openingBalance)}</td>
          <td><strong style="color: var(--income-color);">${formatCurrency(a.currentBalance)}</strong></td>
          <td><span class="status-pill ${a.status === 'Active' ? 'present' : 'absent'}">${escapeHtml(a.status)}</span></td>
          <td style="text-align: center;">
            <div class="table-actions" style="justify-content: center;">
              <button class="btn-icon" title="View Transactions" onclick="window.FROMEX_APP.Accounts.viewTransactions('${escapeHtml(a.id)}')">
                <i class="fa-solid fa-list"></i>
              </button>
              <button class="btn-icon" title="Edit Account" onclick="window.FROMEX_APP.Accounts.openEditModal('${escapeHtml(a.id)}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon danger" title="Delete Account" onclick="window.FROMEX_APP.Accounts.deleteAccount('${escapeHtml(a.id)}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    openEditModal: function (id) {
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const item = accounts.find(a => a.id === id);
      if (item) this.openAddModal(item);
    }
  };

  // ==========================================================
  // SETTINGS & BACKUP MODULE
  // ==========================================================
  const SettingsModule = {
    init: function () {
      const form = document.getElementById('form-company-settings');
      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = {
          companyName: document.getElementById('settings-company-name').value.trim() || 'FROMEX HEALTH TECH',
          logoUrl: document.getElementById('settings-logo-url').value.trim() || 'logo.png',
          currency: document.getElementById('settings-currency').value.trim() || '₹',
          defaultGst: Number(document.getElementById('settings-default-gst').value) || 18,
          officeStartTime: document.getElementById('settings-start-time').value || '09:00',
          officeEndTime: document.getElementById('settings-end-time').value || '18:00'
        };

        Store.save(STORAGE_KEYS.SETTINGS, settings);
        Toast.success('Company settings saved successfully.');

        // Update brand in top header
        document.getElementById('header-company-name').textContent = settings.companyName;
        document.getElementById('header-logo-img').src = settings.logoUrl;
        document.getElementById('print-company-name').textContent = settings.companyName;

        DashboardModule.render();
      });

      // Categories
      document.getElementById('btn-add-category')?.addEventListener('click', () => {
        const input = document.getElementById('input-new-category');
        const val = input.value.trim();
        if (!val) return;

        const categories = Store.get(STORAGE_KEYS.CATEGORIES) || DEFAULT_CATEGORIES;
        if (categories.includes(val)) {
          Toast.warning('Category already exists!');
          return;
        }

        categories.push(val);
        Store.save(STORAGE_KEYS.CATEGORIES, categories);
        input.value = '';
        Toast.success(`Category "${val}" added.`);
        this.renderCategories();
      });

      // Backup Export
      document.getElementById('btn-export-backup')?.addEventListener('click', () => this.exportBackup());

      // Backup Restore
      document.getElementById('btn-trigger-restore')?.addEventListener('click', () => this.importBackup());

      // Reset to Demo Data
      document.getElementById('btn-reset-demo-data')?.addEventListener('click', async () => {
        const ok = await ConfirmModal.show('Are you sure you want to reset all data back to FROMEX demo records? All current changes will be overwritten.', 'Reset Demo Data', false);
        if (!ok) return;

        Store.resetToDemo();
        Toast.success('System reset to demo data successfully.');
        setTimeout(() => location.reload(), 600);
      });

      // Clear All Data (Complete Database Wipe)
      document.getElementById('btn-clear-all-data')?.addEventListener('click', async () => {
        const ok = await ConfirmModal.show(
          'Are you sure you want to completely wipe ALL company data? This will clear all employees, attendance logs, company bank accounts, transactions, and reset the entire dashboard to 0. This cannot be undone!',
          'Wipe All Company Data',
          true
        );
        if (!ok) return;

        Store.clearAllData();
        Toast.success('All company data has been completely cleared. System reset to 0.');
        setTimeout(() => location.reload(), 600);
      });
    },

    exportBackup: function () {
      const backup = {
        meta: {
          app: 'FROMEX HEALTH TECH INTERNAL MANAGEMENT',
          version: '2.0',
          exportedAt: new Date().toISOString()
        },
        members: Store.get(STORAGE_KEYS.MEMBERS) || [],
        attendance: Store.get(STORAGE_KEYS.ATTENDANCE) || [],
        accountingMembers: Store.get(STORAGE_KEYS.ACCOUNTING_MEMBERS) || [],
        accounts: Store.get(STORAGE_KEYS.ACCOUNTS) || [],
        transactions: Store.get(STORAGE_KEYS.TRANSACTIONS) || [],
        categories: Store.get(STORAGE_KEYS.CATEGORIES) || DEFAULT_CATEGORIES,
        settings: Store.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `fromex_company_backup_${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Toast.success('Complete system backup exported successfully.');
    },

    importBackup: function () {
      const input = document.getElementById('input-restore-backup');
      const file = input.files[0];
      if (!file) {
        Toast.warning('Please select a .json backup file first.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.members || !data.attendance || !data.accounts) {
            Toast.error('Invalid backup file format! Missing essential data keys.');
            return;
          }

          const msg = `Backup contains: ${data.members.length} members, ${data.attendance.length} attendance records, and ${data.transactions?.length || 0} financial transactions. Restoring will replace your current data. Proceed?`;
          const ok = await ConfirmModal.show(msg, 'Restore Backup', true);
          if (!ok) return;

          Store.save(STORAGE_KEYS.MEMBERS, data.members);
          Store.save(STORAGE_KEYS.ATTENDANCE, data.attendance);
          Store.save(STORAGE_KEYS.ACCOUNTING_MEMBERS, data.accountingMembers || []);
          Store.save(STORAGE_KEYS.ACCOUNTS, data.accounts);
          Store.save(STORAGE_KEYS.TRANSACTIONS, data.transactions || []);
          Store.save(STORAGE_KEYS.CATEGORIES, data.categories || DEFAULT_CATEGORIES);
          Store.save(STORAGE_KEYS.SETTINGS, data.settings || DEFAULT_SETTINGS);

          Toast.success('System restored from backup successfully!');
          setTimeout(() => location.reload(), 800);
        } catch (err) {
          Toast.error('Failed to parse backup JSON file: ' + err.message);
        }
      };
      reader.readAsText(file);
    },

    renderCategories: function () {
      const categories = Store.get(STORAGE_KEYS.CATEGORIES) || DEFAULT_CATEGORIES;
      const listEl = document.getElementById('categories-badge-list');
      if (!listEl) return;

      listEl.innerHTML = categories.map(c => `
        <span class="status-pill" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-color); padding: 0.3rem 0.6rem; font-size: 0.8rem;">
          ${escapeHtml(c)}
          ${!['Office', 'Salary', 'Other'].includes(c) ? `<i class="fa-solid fa-times" style="margin-left: 0.35rem; cursor: pointer; color: var(--expense-color);" onclick="window.FROMEX_APP.Settings.removeCategory('${escapeHtml(c)}')"></i>` : ''}
        </span>
      `).join('');
    },

    removeCategory: function (catName) {
      let categories = Store.get(STORAGE_KEYS.CATEGORIES) || DEFAULT_CATEGORIES;
      categories = categories.filter(c => c !== catName);
      Store.save(STORAGE_KEYS.CATEGORIES, categories);
      this.renderCategories();
      Toast.info(`Category "${catName}" removed.`);
    },

    render: function () {
      const settings = Store.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
      document.getElementById('settings-company-name').value = settings.companyName || 'FROMEX HEALTH TECH';
      document.getElementById('settings-logo-url').value = settings.logoUrl || 'logo.png';
      document.getElementById('settings-currency').value = settings.currency || '₹';
      document.getElementById('settings-default-gst').value = settings.defaultGst || 18;
      document.getElementById('settings-start-time').value = settings.officeStartTime || '09:00';
      document.getElementById('settings-end-time').value = settings.officeEndTime || '18:00';

      this.renderCategories();
    }
  };

  // ==========================================================
  // EXCEL IMPORT & EXPORT SERVICE (SheetJS XLSX)
  // ==========================================================
  const ExcelService = {
    currentImportType: null,
    parsedImportData: [],

    init: function () {
      const fileInput = document.getElementById('excel-file-input');
      fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));

      document.getElementById('btn-confirm-excel-import')?.addEventListener('click', () => this.confirmImport());
    },

    exportAttendanceExcel: function () {
      if (typeof XLSX === 'undefined') {
        Toast.error('SheetJS library is not available. Please check internet connection.');
        return;
      }

      const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];
      const rows = attendance.map((a, i) => ({
        'S.No': i + 1,
        'Employee ID': a.employeeId,
        'Employee Name': a.employeeName,
        'Department': a.department,
        'Date': a.date,
        'Check In': a.checkIn || '',
        'Check Out': a.checkOut || '',
        'Working Hours': a.workingHours || '',
        'Status': a.status,
        'Remarks': a.remarks || ''
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `FROMEX_Attendance_${today}.xlsx`);
      Toast.success('Attendance Excel file exported successfully.');
    },

    exportAttendanceCSV: function () {
      if (typeof XLSX === 'undefined') {
        Toast.error('SheetJS library is not available.');
        return;
      }

      const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];
      const rows = attendance.map((a, i) => ({
        'S.No': i + 1,
        'Employee ID': a.employeeId,
        'Employee Name': a.employeeName,
        'Department': a.department,
        'Date': a.date,
        'Check In': a.checkIn || '',
        'Check Out': a.checkOut || '',
        'Working Hours': a.workingHours || '',
        'Status': a.status,
        'Remarks': a.remarks || ''
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `FROMEX_Attendance_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Toast.success('Attendance CSV exported successfully.');
    },

    downloadAttendanceTemplate: function () {
      if (typeof XLSX === 'undefined') return;

      const templateData = [
        {
          'Employee ID': 'FX-1001',
          'Employee Name': 'Dr. Muhammed Nihal',
          'Department': 'Executive Management',
          'Date': '2026-09-14',
          'Check In': '09:00',
          'Check Out': '18:00',
          'Status': 'Present',
          'Remarks': 'Sample entry 1'
        },
        {
          'Employee ID': 'FX-1002',
          'Employee Name': 'Priya Nambiar',
          'Department': 'Human Resources',
          'Date': '2026-09-14',
          'Check In': '09:15',
          'Check Out': '18:00',
          'Status': 'Late',
          'Remarks': 'Sample entry 2'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AttendanceTemplate');
      XLSX.writeFile(wb, 'FROMEX_Attendance_Template.xlsx');
      Toast.success('Attendance Excel template downloaded.');
    },

    exportAccountingExcel: function () {
      if (typeof XLSX === 'undefined') return;

      const transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const accMap = new Map(accounts.map(a => [a.id, a.name]));

      const rows = transactions.map((t, i) => ({
        'S.No': i + 1,
        'Date': t.date,
        'Transaction ID': t.transactionId,
        'Type': t.type,
        'Category': t.category,
        'Description': t.description,
        'Employee / Vendor': t.party || '',
        'Account': accMap.get(t.accountId) || t.accountId,
        'Amount': t.amount,
        'Payment Method': t.paymentMethod,
        'GST Rate (%)': t.gstRate || 0,
        'Total Amount': t.totalAmount,
        'Status': t.status,
        'Remarks': t.remarks || ''
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Accounting');

      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `FROMEX_Accounting_${today}.xlsx`);
      Toast.success('Accounting Excel file exported.');
    },

    exportAccountingCSV: function () {
      if (typeof XLSX === 'undefined') return;

      const transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const accMap = new Map(accounts.map(a => [a.id, a.name]));

      const rows = transactions.map((t, i) => ({
        'S.No': i + 1,
        'Date': t.date,
        'Transaction ID': t.transactionId,
        'Type': t.type,
        'Category': t.category,
        'Description': t.description,
        'Employee / Vendor': t.party || '',
        'Account': accMap.get(t.accountId) || t.accountId,
        'Amount': t.amount,
        'Payment Method': t.paymentMethod,
        'GST Rate (%)': t.gstRate || 0,
        'Total Amount': t.totalAmount,
        'Status': t.status,
        'Remarks': t.remarks || ''
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `FROMEX_Accounting_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Toast.success('Accounting CSV file exported.');
    },

    downloadAccountingTemplate: function () {
      if (typeof XLSX === 'undefined') return;

      const templateData = [
        {
          'Date': '2026-09-14',
          'Transaction ID': 'TXN-2026-901',
          'Type': 'Expense',
          'Category': 'Office',
          'Description': 'Office stationery and printing paper',
          'Employee / Vendor': 'Wayanad Paper Mart',
          'Account': 'ACC-001',
          'Amount': 2500,
          'Payment Method': 'Bank Transfer',
          'GST': 18,
          'Status': 'Completed',
          'Remarks': 'Bill #8910'
        },
        {
          'Date': '2026-09-14',
          'Transaction ID': 'TXN-2026-902',
          'Type': 'Income',
          'Category': 'Software',
          'Description': 'Hospital AI Module Licensing Fee',
          'Employee / Vendor': 'Malabar Hospital',
          'Account': 'ACC-001',
          'Amount': 85000,
          'Payment Method': 'Bank Transfer',
          'GST': 18,
          'Status': 'Completed',
          'Remarks': 'License Q3'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AccountingTemplate');
      XLSX.writeFile(wb, 'FROMEX_Accounting_Template.xlsx');
      Toast.success('Accounting Excel template downloaded.');
    },

    exportMembersExcel: function () {
      if (typeof XLSX === 'undefined') return;
      const members = Store.get(STORAGE_KEYS.MEMBERS) || [];
      const rows = members.map((m, i) => ({
        'S.No': i + 1,
        'Employee ID': m.id,
        'Employee Name': m.name,
        'Department': m.department,
        'Designation': m.designation,
        'Phone': m.phone || '',
        'Email': m.email || '',
        'Joining Date': m.joiningDate,
        'Status': m.status
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Members');
      XLSX.writeFile(wb, 'FROMEX_Members_Directory.xlsx');
      Toast.success('Members Excel directory exported.');
    },

    exportSalaryExcel: function () {
      if (typeof XLSX === 'undefined') return;
      const members = Store.get(STORAGE_KEYS.ACCOUNTING_MEMBERS) || [];
      const rows = members.map((m, i) => {
        const basic = Number(m.basicSalary) || 0;
        const allow = Number(m.allowance) || 0;
        const bonus = Number(m.bonus) || 0;
        const ded = Number(m.deduction) || 0;
        const adv = Number(m.advance) || 0;
        const gross = basic + allow + bonus;
        const net = gross - ded - adv;

        return {
          'S.No': i + 1,
          'Employee ID': m.id,
          'Employee Name': m.name,
          'Department': m.department,
          'Designation': m.designation,
          'Basic Salary': basic,
          'Allowance': allow,
          'Bonus': bonus,
          'Gross Salary': gross,
          'Deduction': ded,
          'Advance': adv,
          'Net Salary': net,
          'Payment Status': m.paymentStatus || 'Pending'
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'SalaryRoster');
      XLSX.writeFile(wb, 'FROMEX_Salary_Roster.xlsx');
      Toast.success('Salary Excel roster exported.');
    },

    exportAccountsExcel: function () {
      if (typeof XLSX === 'undefined') return;
      const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
      const rows = accounts.map((a, i) => ({
        'S.No': i + 1,
        'Account ID': a.id,
        'Account Name': a.name,
        'Account Type': a.type,
        'Bank Name': a.bankName || '',
        'Account Number': a.accountNumber || '',
        'Opening Balance': a.openingBalance,
        'Current Balance': a.currentBalance,
        'Status': a.status
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'CompanyAccounts');
      XLSX.writeFile(wb, 'FROMEX_Company_Accounts.xlsx');
      Toast.success('Accounts Excel exported.');
    },

    openImportModal: function (type) {
      this.currentImportType = type;
      this.parsedImportData = [];

      const modal = document.getElementById('modal-import-excel');
      const titleEl = document.getElementById('modal-import-title');
      const statusEl = document.getElementById('import-preview-status');
      const previewContainer = document.getElementById('import-preview-container');
      const fileInput = document.getElementById('excel-file-input');
      const confirmBtn = document.getElementById('btn-confirm-excel-import');

      fileInput.value = '';
      previewContainer.style.display = 'none';
      confirmBtn.disabled = true;

      if (type === 'attendance') {
        titleEl.innerHTML = `<i class="fa-solid fa-file-excel"></i> Import Attendance Excel (.xlsx / .csv)`;
        statusEl.innerHTML = `Select a spreadsheet file containing columns: <strong>Employee ID, Employee Name, Department, Date, Check In, Check Out, Status, Remarks</strong>.`;
      } else {
        titleEl.innerHTML = `<i class="fa-solid fa-file-excel"></i> Import Accounting Excel (.xlsx / .csv)`;
        statusEl.innerHTML = `Select a spreadsheet file containing columns: <strong>Date, Transaction ID, Type, Category, Description, Employee / Vendor, Account, Amount, GST, Status</strong>.`;
      }

      modal.classList.add('active');
    },

    handleFileSelect: function (e) {
      const file = e.target.files[0];
      if (!file) return;

      if (typeof XLSX === 'undefined') {
        Toast.error('SheetJS library is not loaded. Cannot parse Excel.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (!json || json.length === 0) {
            Toast.error('No rows found in the uploaded file.');
            return;
          }

          this.processImportRows(json);
        } catch (err) {
          Toast.error('Error reading Excel file: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    },

    processImportRows: function (rawRows) {
      const statusEl = document.getElementById('import-preview-status');
      const previewContainer = document.getElementById('import-preview-container');
      const countEl = document.getElementById('import-record-count');
      const thead = document.getElementById('import-preview-thead');
      const tbody = document.getElementById('import-preview-tbody');
      const confirmBtn = document.getElementById('btn-confirm-excel-import');

      this.parsedImportData = [];

      if (this.currentImportType === 'attendance') {
        // Attendance Validation
        const validRows = [];
        const errors = [];
        const existingAttendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];

        rawRows.forEach((row, idx) => {
          // Normalize column names
          const empId = row['Employee ID'] || row['employeeId'] || row['Emp ID'] || row['ID'];
          const empName = row['Employee Name'] || row['Name'] || row['Employee'];
          const dept = row['Department'] || row['Dept'] || 'General';
          let date = row['Date'] || '';
          const checkIn = row['Check In'] || row['checkIn'] || row['In'] || '';
          const checkOut = row['Check Out'] || row['checkOut'] || row['Out'] || '';
          const status = row['Status'] || (checkIn ? 'Present' : 'Absent');
          const remarks = row['Remarks'] || row['Remark'] || '';

          // Format Date if integer Excel serial date
          if (typeof date === 'number') {
            const d = XLSX.SSF.parse_date_code(date);
            date = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
          }

          if (!empId) {
            errors.push(`Row ${idx + 2}: Missing Employee ID`);
            return;
          }
          if (!date) {
            errors.push(`Row ${idx + 2}: Missing Date for ${empId}`);
            return;
          }

          // Duplicate detection check
          const isDup = existingAttendance.some(a => a.employeeId === String(empId).trim() && a.date === String(date).trim());
          if (isDup) {
            errors.push(`Row ${idx + 2}: Duplicate skipped (${empId} already recorded for ${date})`);
            return;
          }

          const workingHours = calculateWorkingHours(String(checkIn), String(checkOut));

          validRows.push({
            id: generateId('ATT'),
            employeeId: String(empId).trim(),
            employeeName: String(empName || empId).trim(),
            department: String(dept).trim(),
            date: String(date).trim(),
            checkIn: String(checkIn).trim(),
            checkOut: String(checkOut).trim(),
            workingHours,
            status: String(status).trim() || 'Present',
            remarks: String(remarks).trim()
          });
        });

        this.parsedImportData = validRows;
        countEl.textContent = validRows.length;

        if (errors.length > 0) {
          statusEl.innerHTML = `<div style="color: var(--expense-color);"><i class="fa-solid fa-triangle-exclamation"></i> <strong>${errors.length} rows had errors/duplicates:</strong><br>${errors.slice(0, 4).join('<br>')}${errors.length > 4 ? '<br>...' : ''}</div>`;
        } else {
          statusEl.innerHTML = `<div style="color: var(--income-color);"><i class="fa-solid fa-circle-check"></i> All ${validRows.length} rows successfully validated!</div>`;
        }

        thead.innerHTML = `
          <tr>
            <th>#</th>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Dept</th>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Status</th>
          </tr>
        `;

        tbody.innerHTML = validRows.slice(0, 10).map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${escapeHtml(r.employeeId)}</strong></td>
            <td>${escapeHtml(r.employeeName)}</td>
            <td>${escapeHtml(r.department)}</td>
            <td>${escapeHtml(r.date)}</td>
            <td>${escapeHtml(r.checkIn || '---')}</td>
            <td>${escapeHtml(r.checkOut || '---')}</td>
            <td><span class="status-pill ${r.status.toLowerCase()}">${escapeHtml(r.status)}</span></td>
          </tr>
        `).join('');

        previewContainer.style.display = 'block';
        confirmBtn.disabled = validRows.length === 0;
      } else {
        // Accounting Validation
        const validRows = [];
        const accounts = Store.get(STORAGE_KEYS.ACCOUNTS) || [];
        const defaultAccId = accounts[0]?.id || 'ACC-001';

        rawRows.forEach((row, idx) => {
          let date = row['Date'] || '';
          if (typeof date === 'number') {
            const d = XLSX.SSF.parse_date_code(date);
            date = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
          }

          const txnId = row['Transaction ID'] || row['Txn ID'] || `TXN-IMP-${idx + 1}`;
          const type = row['Type'] || 'Expense';
          const category = row['Category'] || 'Office';
          const desc = row['Description'] || row['Desc'] || 'Imported Entry';
          const party = row['Employee / Vendor'] || row['Party'] || '';
          const account = row['Account'] || defaultAccId;
          const amt = Number(row['Amount']) || 0;
          const gst = Number(row['GST'] || row['GST Rate']) || 0;
          const status = row['Status'] || 'Completed';
          const remarks = row['Remarks'] || '';

          if (!date || amt <= 0) return;

          const gstAmt = (amt * gst) / 100;
          const total = amt + gstAmt;

          validRows.push({
            id: generateId('TXN'),
            date: String(date).trim(),
            transactionId: String(txnId).trim(),
            type: String(type).trim(),
            category: String(category).trim(),
            party: String(party).trim(),
            accountId: String(account).trim(),
            description: String(desc).trim(),
            amount: amt,
            gstRate: gst,
            gstAmount: gstAmt,
            totalAmount: total,
            paymentMethod: 'Bank Transfer',
            status: String(status).trim(),
            remarks: String(remarks).trim()
          });
        });

        this.parsedImportData = validRows;
        countEl.textContent = validRows.length;
        statusEl.innerHTML = `<div style="color: var(--income-color);"><i class="fa-solid fa-circle-check"></i> ${validRows.length} valid accounting transactions parsed!</div>`;

        thead.innerHTML = `
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Txn ID</th>
            <th>Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Total</th>
          </tr>
        `;

        tbody.innerHTML = validRows.slice(0, 10).map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(r.date)}</td>
            <td><strong>${escapeHtml(r.transactionId)}</strong></td>
            <td><span class="type-badge ${r.type.toLowerCase()}">${escapeHtml(r.type)}</span></td>
            <td>${escapeHtml(r.description)}</td>
            <td>${formatCurrency(r.amount)}</td>
            <td>${formatCurrency(r.totalAmount)}</td>
          </tr>
        `).join('');

        previewContainer.style.display = 'block';
        confirmBtn.disabled = validRows.length === 0;
      }
    },

    confirmImport: function () {
      if (this.parsedImportData.length === 0) return;

      if (this.currentImportType === 'attendance') {
        const attendance = Store.get(STORAGE_KEYS.ATTENDANCE) || [];
        const updated = [...this.parsedImportData, ...attendance];
        Store.save(STORAGE_KEYS.ATTENDANCE, updated);

        Toast.success(`Excel imported successfully! Added ${this.parsedImportData.length} attendance records.`);
        document.getElementById('modal-import-excel').classList.remove('active');
        AttendanceModule.render();
        DashboardModule.render();
      } else {
        const transactions = Store.get(STORAGE_KEYS.TRANSACTIONS) || [];
        this.parsedImportData.forEach(t => {
          if (t.status === 'Completed') {
            AccountsModule.applyTransactionEffect(t.accountId, t.type, t.totalAmount, false);
          }
        });

        const updated = [...this.parsedImportData, ...transactions];
        Store.save(STORAGE_KEYS.TRANSACTIONS, updated);

        Toast.success(`Excel imported successfully! Added ${this.parsedImportData.length} accounting entries.`);
        document.getElementById('modal-import-excel').classList.remove('active');
        AccountingModule.render();
        AccountsModule.render();
        DashboardModule.render();
      }
    }
  };

  // ==========================================================
  // PRINT SERVICE
  // ==========================================================
  const PrintService = {
    printSection: function (sectionName) {
      const settings = Store.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
      document.getElementById('print-company-name').textContent = settings.companyName || 'FROMEX HEALTH TECH';
      document.getElementById('print-sheet-title').textContent = `${sectionName} - Internal Corporate Report`;
      document.getElementById('print-timestamp').textContent = `Generated on ${new Date().toLocaleString()}`;
      window.print();
    }
  };

  // ==========================================================
  // THEME & LIVE CLOCK
  // ==========================================================
  const ThemeService = {
    init: function () {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
      this.apply(savedTheme);

      document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        const next = isDark ? 'light' : 'dark';
        this.apply(next);
        Toast.info(`Switched to ${next} mode.`);
      });
    },
    apply: function (theme) {
      const icon = document.getElementById('theme-icon');
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (icon) {
          icon.className = 'fa-solid fa-sun';
          icon.style.color = '#fbbf24';
        }
      } else {
        document.body.classList.remove('dark-theme');
        if (icon) {
          icon.className = 'fa-solid fa-moon';
          icon.style.color = '';
        }
      }
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
  };

  const LiveClock = {
    init: function () {
      const dateTextEl = document.getElementById('live-date-text');
      const update = () => {
        if (!dateTextEl) return;
        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = days[now.getDay()];
        const d = String(now.getDate()).padStart(2, '0');
        const m = months[now.getMonth()];
        const y = now.getFullYear();
        const h = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const sec = String(now.getSeconds()).padStart(2, '0');
        dateTextEl.innerHTML = `<span class="date-full">${day}, ${d} ${m} ${y} • ${h}:${min}:${sec}</span><span class="date-compact">${d} ${m} • ${h}:${min}</span>`;
      };
      update();
      setInterval(update, 1000);
    }
  };

  // ==========================================================
  // GLOBAL MODAL CLOSE HANDLERS & MOBILE BODY SCROLL LOCK
  // ==========================================================
  function setupModalDismissals() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
        document.body.classList.remove('modal-open');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.classList.remove('modal-open');
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          modal.classList.remove('active');
        });
        document.body.classList.remove('modal-open');
      }
    });

    // Auto body scroll-lock observer for mobile modals
    try {
      const modalObserver = new MutationObserver(() => {
        const anyActive = document.querySelector('.modal-overlay.active');
        if (anyActive) {
          document.body.classList.add('modal-open');
        } else {
          document.body.classList.remove('modal-open');
        }
      });
      document.querySelectorAll('.modal-overlay').forEach(modal => {
        modalObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
      });
    } catch (_) {}
  }

  // ==========================================================
  // APPLICATION BOOTSTRAPPER
  // ==========================================================
  function initApp() {
    try { LiveClock.init(); } catch (e) { console.warn('LiveClock init warning:', e); }
    try { ThemeService.init(); } catch (e) { console.warn('ThemeService init warning:', e); }
    try { Store.init(); } catch (e) { console.warn('Store init warning:', e); }
    try { ConfirmModal.init(); } catch (e) { console.warn('ConfirmModal init warning:', e); }
    try { setupModalDismissals(); } catch (e) { console.warn('setupModalDismissals init warning:', e); }

    try { Navigation.init(); } catch (e) { console.warn('Navigation init warning:', e); }
    try { DashboardModule.render(); } catch (e) { console.warn('DashboardModule render warning:', e); }
    try { AttendanceModule.init(); } catch (e) { console.warn('AttendanceModule init warning:', e); }
    try { MembersModule.init(); } catch (e) { console.warn('MembersModule init warning:', e); }
    try { AccountingModule.init(); } catch (e) { console.warn('AccountingModule init warning:', e); }
    try { AccountingMembersModule.init(); } catch (e) { console.warn('AccountingMembersModule init warning:', e); }
    try { AccountsModule.init(); } catch (e) { console.warn('AccountsModule init warning:', e); }
    try { SettingsModule.init(); } catch (e) { console.warn('SettingsModule init warning:', e); }
    try { ExcelService.init(); } catch (e) { console.warn('ExcelService init warning:', e); }

    // Set header company name & logo from settings
    try {
      const settings = Store.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
      const headerCompanyEl = document.getElementById('header-company-name');
      const headerLogoEl = document.getElementById('header-logo-img');
      if (headerCompanyEl && settings.companyName) headerCompanyEl.textContent = settings.companyName;
      if (headerLogoEl && settings.logoUrl) headerLogoEl.src = settings.logoUrl;
    } catch (_) {}

    console.log('FROMEX HEALTH TECH Internal Management Platform Initialized.');
  }

  // Expose global methods for inline HTML onclick handlers
  window.FROMEX_APP = {
    Attendance: AttendanceModule,
    Members: MembersModule,
    Accounting: AccountingModule,
    AccountingMembers: AccountingMembersModule,
    Accounts: AccountsModule,
    Settings: SettingsModule
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
