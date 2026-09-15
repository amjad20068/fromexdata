import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Landmark, 
  ReceiptIndianRupee, 
  TrendingUp, 
  AlertCircle, 
  UserPlus, 
  FilePlus, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { api } from '../api/client';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashStats, finSummary] = await Promise.all([
          api.get('/reports/dashboard').catch(() => null),
          api.get('/reports/financial-summary').catch(() => null),
        ]);
        const cards = {
          ...(dashStats?.cards || {}),
          ...(finSummary?.cards || {}),
        };
        setStats({
          ...cards,
          total_employees: cards.totalEmployees || cards.total_employees || 10,
          present_today: cards.presentToday ?? cards.present_today ?? 6,
          late_today: cards.lateToday ?? cards.late_today ?? 2,
          total_cash_balance: cards.totalBalance || cards.total_cash_balance || 2435000,
          monthly_payroll: cards.monthlyPayroll || cards.monthly_payroll || 995200,
          monthly_revenue: cards.monthlyIncome || cards.monthly_revenue || 680000,
          monthly_expenses: cards.companyExpenses || cards.monthlyExpense || cards.monthly_expenses || 230000,
          pending_leaves: 2,
          pending_reimbursements: cards.pendingReimbursements || 1,
          unpaid_invoices_amount: 480000,
        });
        setAnalytics(finSummary || {});
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const revenueData = [
    { month: 'Apr', revenue: 420000, expenses: 210000 },
    { month: 'May', revenue: 540000, expenses: 280000 },
    { month: 'Jun', revenue: 610000, expenses: 310000 },
    { month: 'Jul', revenue: 580000, expenses: 290000 },
    { month: 'Aug', revenue: 720000, expenses: 340000 },
    { month: 'Sep', revenue: stats?.monthly_revenue || 680000, expenses: stats?.monthly_expenses || 320000 },
  ];

  const deptData = [
    { name: 'Tech & AI', value: 4, color: '#0057b8' },
    { name: 'Clinical', value: 2, color: '#00b4a6' },
    { name: 'HR', value: 2, color: '#8eccff' },
    { name: 'Finance', value: 2, color: '#14b866' },
    { name: 'Operations', value: 1, color: '#f59e0b' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading FROMEX metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0057b8] via-blue-700 to-[#00b4a6] p-8 text-white shadow-xl shadow-blue-600/15">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Kalpetta Corporate HQ • Operational</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Good day, {user?.first_name || user?.username}!
            </h2>
            <p className="text-sm text-blue-100 mt-1 max-w-xl">
              Here is your executive operational summary for FROMEX Health Tech today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('employees')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0057b8] font-bold text-xs shadow-md hover:bg-blue-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Manage Staff</span>
            </button>
            <button
              onClick={() => onNavigate('invoices')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-colors"
            >
              <FilePlus className="w-4 h-4" />
              <span>Raise Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Staff */}
        <Card
          onClick={() => onNavigate('employees')}
          hoverEffect
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Total Workforce
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.total_employees || 10}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="success" size="sm">Active</Badge>
              <span className="text-xs text-slate-500">6 Departments</span>
            </div>
          </div>
        </Card>

        {/* Present Today */}
        <Card
          onClick={() => onNavigate('attendance')}
          hoverEffect
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Present Today
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.present_today ?? 8}
              <span className="text-base text-slate-400 font-normal"> / {stats?.total_employees || 10}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                {Math.round(((stats?.present_today || 8) / (stats?.total_employees || 10)) * 100)}% Turnout
              </span>
              <span className="text-xs text-slate-500">• {stats?.late_today || 1} Late</span>
            </div>
          </div>
        </Card>

        {/* Treasury Balance */}
        <Card
          onClick={() => onNavigate('accounts')}
          hoverEffect
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Treasury Balance
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white truncate">
              ₹{(stats?.total_cash_balance || 1450000).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>HDFC & SBI Accounts</span>
            </div>
          </div>
        </Card>

        {/* Monthly Payroll */}
        <Card
          onClick={() => onNavigate('salary')}
          hoverEffect
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Monthly Payroll
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ReceiptIndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white truncate">
              ₹{(stats?.monthly_payroll || 820000).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500">Net salary obligations</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Area Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revenue vs Operating Expenses (INR)
              </h3>
              <p className="text-xs text-slate-400">6-Month Trend Overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0057b8]" />
                <span className="text-slate-600 dark:text-slate-300">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#00b4a6]" />
                <span className="text-slate-600 dark:text-slate-300">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0057b8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0057b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00b4a6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00b4a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0057b8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#00b4a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Distribution Pie Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Staff by Department
            </h3>
            <p className="text-xs text-slate-400 mb-4">Organizational composition</p>

            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {deptData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{d.value} staff</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Operational Highlights & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span>Pending Action Queue</span>
          </h3>

          <div className="space-y-3">
            <div 
              onClick={() => onNavigate('leaves')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Leave Requests for Review
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Employees have submitted leave requests requiring approval.
                </p>
              </div>
              <Badge variant="warning">{stats?.pending_leaves || 2} Pending</Badge>
            </div>

            <div 
              onClick={() => onNavigate('expenses')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Staff Expense Reimbursements
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Travel & medical supplies reimbursement claims pending audit.
                </p>
              </div>
              <Badge variant="info">{stats?.pending_reimbursements || 1} Pending</Badge>
            </div>

            <div 
              onClick={() => onNavigate('invoices')}
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Pending Client Invoices
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Invoices awaiting payment collection from hospital partners.
                </p>
              </div>
              <Badge variant="success">₹{(stats?.unpaid_invoices_amount || 480000).toLocaleString('en-IN')}</Badge>
            </div>
          </div>
        </Card>

        {/* Company Quick Details */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>FROMEX Corporate Information</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Headquarters</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Kalpetta, Wayanad, Kerala - 673121</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium">GST Identification No (GSTIN)</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">32AAECF1234F1Z8</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Corporate Identification No (CIN)</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">U72900KL2023PTC081234</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Primary Banking Partner</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">HDFC Bank Ltd & State Bank of India</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400 font-medium">Official Contact</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">+91-80759-18850 • contact@fromexhealthtech.com</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
