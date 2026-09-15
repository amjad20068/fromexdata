import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Users, 
  Clock, 
  Calendar,
  Building2,
  Receipt
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Legend
} from 'recharts';
import { api } from '../api/client';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const [dashStats, finSummary] = await Promise.all([
          api.get('/reports/dashboard').catch(() => null),
          api.get('/reports/financial-summary').catch(() => null),
        ]);
        setReportData({
          stats: dashStats || {},
          financial: finSummary || {},
        });
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  const monthlyFinancials = [
    { month: 'Apr', revenue: 420000, payroll: 780000, expenses: 140000 },
    { month: 'May', revenue: 540000, payroll: 800000, expenses: 180000 },
    { month: 'Jun', revenue: 610000, payroll: 820000, expenses: 210000 },
    { month: 'Jul', revenue: 580000, payroll: 820000, expenses: 190000 },
    { month: 'Aug', revenue: 720000, payroll: 850000, expenses: 240000 },
    { month: 'Sep', revenue: reportData?.stats?.monthly_revenue || 680000, payroll: reportData?.stats?.monthly_payroll || 820000, expenses: reportData?.stats?.monthly_expenses || 220000 },
  ];

  const attendanceTrends = [
    { day: 'Mon', turnout: 95 },
    { day: 'Tue', turnout: 90 },
    { day: 'Wed', turnout: 100 },
    { day: 'Thu', turnout: 92 },
    { day: 'Fri', turnout: 88 },
    { day: 'Sat', turnout: 85 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial & Operational Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Performance analytics, P&L statements, payroll cost trends, and attendance statistics
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary Report</span>
        </button>
      </div>

      {/* Financial Trends Bar Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Revenue, Payroll & Operations Breakdown
            </h3>
            <p className="text-xs text-slate-400">Monthly Comparative Ledger (INR)</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip 
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="revenue" name="Invoiced Revenue" fill="#0057b8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="payroll" name="Staff Payroll" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Operating Expenses" fill="#00b4a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column Stats: Attendance & P&L */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Weekly Workforce Turnout (%)
          </h3>
          <p className="text-xs text-slate-400 mb-6">Average daily attendance rate</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Turnout']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="turnout" stroke="#14b866" strokeWidth={3} dot={{ r: 5, fill: '#14b866' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Executive Summary Cards */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Statutory & Tax Metrics
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 font-medium">State of Incorporation</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Kerala (State Code 32)</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 font-medium">GST Filing Frequency</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">Monthly (GSTR-1 & GSTR-3B)</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 font-medium">TDS / Professional Tax Jurisdiction</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Wayanad Tax Circle</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 font-medium">Fiscal Year Cycle</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">FY 2026-27 (Apr - Mar)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
