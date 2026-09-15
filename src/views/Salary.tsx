import React, { useState, useEffect, useRef } from 'react';
import { 
  ReceiptIndianRupee, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Building2, 
  CreditCard,
  FileText
} from 'lucide-react';
import { api } from '../api/client';
import { SalaryRecord, CompanyAccount } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Salary: React.FC = () => {
  const { hasPermission } = useAuth();
  const { showToast } = useNotification();

  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [accounts, setAccounts] = useState<CompanyAccount[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<SalaryRecord | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedRecordToPay, setSelectedRecordToPay] = useState<SalaryRecord | null>(null);
  const [payAccountId, setPayAccountId] = useState('');

  const printRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recRes, accRes] = await Promise.all([
        api.get(`/salary/records?month=${month}&year=${year}`),
        api.get('/accounts').catch(() => []),
      ]);
      setRecords(recRes || []);
      setAccounts(accRes || []);
      if (accRes?.length > 0) setPayAccountId(accRes[0].id);
    } catch (err: any) {
      showToast({ type: 'error', message: 'Failed to load payroll records' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [month, year]);

  const handleGeneratePayroll = async () => {
    try {
      const res = await api.post('/salary/generate', { month, year });
      showToast({
        type: 'success',
        title: 'Payroll Generated',
        message: `Successfully calculated salaries for ${res.count || 'all'} employees.`,
      });
      setIsGenerateOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to generate payroll' });
    }
  };

  const handlePaySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordToPay) return;
    try {
      await api.post(`/salary/${selectedRecordToPay.id}/pay`, {
        account_id: payAccountId,
        payment_date: new Date().toISOString().split('T')[0],
      });
      showToast({
        type: 'success',
        message: `Salary of ₹${selectedRecordToPay.net_salary.toLocaleString('en-IN')} marked as paid.`,
      });
      setIsPayModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Payment execution failed' });
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const totalNet = records.reduce((acc, r) => acc + r.net_salary, 0);
  const paidCount = records.filter(r => r.status === 'Paid').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Payroll & Salary Slips
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated monthly compensation calculation, bank disbursements, and official pay slips
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Month & Year Select */}
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>

          {hasPermission('Salary', 'create') && (
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Run Payroll</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Payroll Obligation</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{totalNet.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-slate-400 mt-2 block">{months[month - 1]} {year} cycle</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-500 font-semibold uppercase">Disbursement Status</span>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {paidCount} / {records.length} Paid
          </p>
          <span className="text-xs text-slate-400 mt-2 block">{records.length - paidCount} pending disbursement</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-500 font-semibold uppercase">Compliance & Reports</span>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => window.open(`/api/excel/export/salary?month=${month}&year=${year}`, '_blank')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Payroll Sheet</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Salary Records Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Basic Pay</th>
                <th className="py-3.5 px-4">Allowances</th>
                <th className="py-3.5 px-4">Deductions</th>
                <th className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Net Salary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No payroll generated for {months[month - 1]} {year}. Click "Run Payroll" to calculate.
                  </td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {rec.first_name} {rec.last_name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">{rec.employee_id}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {rec.designation || 'Staff'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">₹{rec.basic_salary.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">₹{rec.allowances.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono text-rose-500">
                      {rec.deductions > 0 ? `-₹${rec.deductions.toLocaleString('en-IN')}` : '₹0'}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900 dark:text-white">
                      ₹{rec.net_salary.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={rec.status === 'Paid' ? 'success' : 'warning'}>
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rec.status !== 'Paid' && hasPermission('Salary', 'manage') && (
                          <button
                            onClick={() => {
                              setSelectedRecordToPay(rec);
                              setIsPayModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                          >
                            Disburse
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSlip(rec)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Slip</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Run Payroll Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title={`Run Payroll for ${months[month - 1]} ${year}`}
        subtitle="Calculate net salaries based on employee wage structure and deductions"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            This will compute earnings, basic salary, allowances, and statutory deductions for all active employees for the selected month. Existing calculated records will be refreshed.
          </p>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-200">Cycle Period:</span> {months[month - 1]} {year}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsGenerateOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleGeneratePayroll}
              className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold"
            >
              Compute & Generate Slips
            </button>
          </div>
        </div>
      </Modal>

      {/* Disburse Modal */}
      {selectedRecordToPay && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Disburse Salary"
          subtitle={`Pay ${selectedRecordToPay.first_name} ${selectedRecordToPay.last_name}`}
        >
          <form onSubmit={handlePaySalary} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1 text-xs">
              <p><span className="text-slate-400">Net Amount:</span> <strong className="text-lg text-emerald-600 dark:text-emerald-400 font-mono">₹{selectedRecordToPay.net_salary.toLocaleString('en-IN')}</strong></p>
              <p><span className="text-slate-400">Employee Account:</span> <span className="font-mono">{selectedRecordToPay.account_number || 'Registered Bank Account'}</span></p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Debiting Company Account *</label>
              <select
                value={payAccountId}
                onChange={e => setPayAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.account_name} (₹{a.current_balance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Confirm Disbursement
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Pay Slip Preview Modal */}
      {selectedSlip && (
        <Modal
          isOpen={Boolean(selectedSlip)}
          onClose={() => setSelectedSlip(null)}
          title="Official Salary Slip"
          subtitle={`FROMEX Health Tech Pvt Ltd • ${months[selectedSlip.month - 1]} ${selectedSlip.year}`}
          maxWidth="2xl"
        >
          <div ref={printRef} className="space-y-6 text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-[#0057b8]">FROMEX HEALTH TECH PVT LTD</h3>
                <p className="text-xs text-slate-500">Kalpetta, Wayanad, Kerala - 673121, India</p>
                <p className="text-[11px] text-slate-400 font-mono">GSTIN: 32AAECF1234F1Z8 • CIN: U72900KL2023PTC081234</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase text-slate-400">PAYSLIP</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {months[selectedSlip.month - 1]} {selectedSlip.year}
                </p>
              </div>
            </div>

            {/* Employee metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p><span className="text-slate-400">Employee Name:</span> <strong>{selectedSlip.first_name} {selectedSlip.last_name}</strong></p>
                <p><span className="text-slate-400">Employee ID:</span> <strong className="font-mono">{selectedSlip.employee_id}</strong></p>
                <p><span className="text-slate-400">Department:</span> {selectedSlip.department || 'Technology & AI'}</p>
              </div>
              <div>
                <p><span className="text-slate-400">Designation:</span> {selectedSlip.designation || 'Specialist'}</p>
                <p><span className="text-slate-400">Bank Name:</span> {selectedSlip.bank_name || 'HDFC Bank Ltd'}</p>
                <p><span className="text-slate-400">Account No:</span> <span className="font-mono">{selectedSlip.account_number || '••••••••'}</span></p>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown */}
            <div className="grid grid-cols-2 gap-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              {/* Earnings */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <h5 className="font-bold uppercase text-slate-500 mb-2">Earnings</h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-mono font-semibold">₹{selectedSlip.basic_salary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA & Special Allowances</span>
                    <span className="font-mono font-semibold">₹{selectedSlip.allowances.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Bonus</span>
                    <span className="font-mono font-semibold">₹{selectedSlip.bonus || 0}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-l border-slate-200 dark:border-slate-800">
                <h5 className="font-bold uppercase text-slate-500 mb-2">Deductions</h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Professional Tax & TDS</span>
                    <span className="font-mono font-semibold">₹{selectedSlip.deductions.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salary Advance</span>
                    <span className="font-mono font-semibold">₹{selectedSlip.advance || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Total */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-blue-900 dark:text-blue-300">Net Take-Home Salary</span>
                <p className="text-xs text-slate-500">Transferred via RTGS / NEFT / IMPS</p>
              </div>
              <span className="text-2xl font-black text-[#0057b8] dark:text-blue-400 font-mono">
                ₹{selectedSlip.net_salary.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handlePrintSlip}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
