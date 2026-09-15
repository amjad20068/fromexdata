import React, { useState, useEffect } from 'react';
import { 
  WalletCards, 
  Plus, 
  Download, 
  Search, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  Receipt,
  FileText,
  Filter
} from 'lucide-react';
import { api } from '../api/client';
import { Expense, Reimbursement, CompanyAccount } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Expenses: React.FC = () => {
  const { hasPermission } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'expenses' | 'reimbursements'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [accounts, setAccounts] = useState<CompanyAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  // Add Expense Form
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Cloud Hosting & Software',
    description: '',
    amount: 15000,
    paid_from_account_id: '',
    vendor: '',
    payment_method: 'Bank Transfer',
    gst_applicable: 1,
    gst_rate: 18,
    notes: '',
  });

  // Reimbursement Form
  const [claimForm, setClaimForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Travel & Food',
    amount: 2500,
    description: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [expRes, reimbRes, accRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/reimbursements').catch(() => []),
        api.get('/accounts').catch(() => []),
      ]);
      setExpenses(expRes || []);
      setReimbursements(reimbRes || []);
      setAccounts(accRes || []);
      if (accRes?.length > 0) {
        setExpenseForm(prev => ({ ...prev, paid_from_account_id: accRes[0].id }));
      }
    } catch (err: any) {
      showToast({ type: 'error', message: 'Failed to load expense records' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', expenseForm);
      showToast({ type: 'success', message: 'Expense voucher booked successfully' });
      setIsAddExpenseOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to book expense' });
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reimbursements', claimForm);
      showToast({ type: 'success', message: 'Reimbursement claim submitted for review' });
      setIsClaimOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to submit claim' });
    }
  };

  const handleApproveReimb = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.patch(`/reimbursements/${id}/status`, { status });
      showToast({ type: 'success', message: `Claim ${status.toLowerCase()}` });
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Action failed' });
    }
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Expenses & Reimbursements
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track operational spending, vendor procurement, GST tax compliance, and staff reimbursement claims
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsClaimOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Claim Reimbursement</span>
          </button>

          {hasPermission('Expenses', 'create') && (
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'expenses'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Company Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('reimbursements')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'reimbursements'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Staff Reimbursements ({reimbursements.length})
        </button>
      </div>

      {activeTab === 'expenses' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Paid From</th>
                  <th className="py-3.5 px-4">GST Rate</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{exp.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm truncate text-slate-600 dark:text-slate-300">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{exp.vendor || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{exp.account_name || 'HDFC Bank'}</td>
                    <td className="py-3.5 px-4 font-mono">{exp.gst_applicable ? `${exp.gst_rate}%` : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reimbursements.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                      {r.first_name ? `${r.first_name} ${r.last_name}` : r.employee_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{r.date}</td>
                    <td className="py-3.5 px-4">{r.category}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{r.description}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{r.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'error' : 'warning'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status === 'Submitted' && hasPermission('Expenses', 'approve') && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveReimb(r.id, 'Approved')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveReimb(r.id, 'Rejected')}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Record Expense Modal */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Record Company Expense"
        subtitle="Book operating or capital expenses with GST details"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date *</label>
              <input
                required
                type="date"
                value={expenseForm.date}
                onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category *</label>
              <select
                value={expenseForm.category}
                onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="Cloud Hosting & Software">Cloud Hosting & Software</option>
                <option value="Medical Devices & Equipment">Medical Devices & Equipment</option>
                <option value="Office Rent & Maintenance">Office Rent & Maintenance</option>
                <option value="Travel & Client Demonstrations">Travel & Client Demonstrations</option>
                <option value="Utilities & High-Speed Internet">Utilities & Internet</option>
                <option value="Legal & Audit Compliance">Legal & Compliance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description *</label>
            <input
              required
              placeholder="e.g. AWS Clinical Cloud Infrastructure renewal"
              value={expenseForm.description}
              onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vendor / Payee</label>
              <input
                placeholder="e.g. Amazon Web Services"
                value={expenseForm.vendor}
                onChange={e => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Disbursed From Account *</label>
              <select
                value={expenseForm.paid_from_account_id}
                onChange={e => setExpenseForm({ ...expenseForm, paid_from_account_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.account_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Total Amount (₹) *</label>
              <input
                required
                type="number"
                value={expenseForm.amount}
                onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">GST Rate (%)</label>
              <select
                value={expenseForm.gst_rate}
                onChange={e => setExpenseForm({ ...expenseForm, gst_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Standard)</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold"
            >
              Save Expense Voucher
            </button>
          </div>
        </form>
      </Modal>

      {/* Reimbursement Claim Modal */}
      <Modal
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
        title="Submit Reimbursement Claim"
        subtitle="Staff expense claims for client visits and supplies"
      >
        <form onSubmit={handleCreateClaim} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date</label>
              <input
                required
                type="date"
                value={claimForm.date}
                onChange={e => setClaimForm({ ...claimForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
              <select
                value={claimForm.category}
                onChange={e => setClaimForm({ ...claimForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="Travel & Fuel">Travel & Fuel</option>
                <option value="Client Demonstration Meals">Client Meals</option>
                <option value="Emergency Medical Kit">Emergency Supplies</option>
                <option value="Office Consumables">Office Consumables</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Claim Amount (₹) *</label>
            <input
              required
              type="number"
              value={claimForm.amount}
              onChange={e => setClaimForm({ ...claimForm, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description / Bill Details *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Travel to Kozhikode Aster MIMS for clinical trial installation"
              value={claimForm.description}
              onChange={e => setClaimForm({ ...claimForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsClaimOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md"
            >
              Submit Claim
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
