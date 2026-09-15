import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft, 
  Plus, 
  CreditCard, 
  Wallet, 
  DollarSign, 
  Receipt,
  Search,
  Building2,
  Cloud,
  ShieldCheck,
  Repeat
} from 'lucide-react';
import { api } from '../api/client';
import { CompanyAccount, AccountTransaction } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Accounts: React.FC = () => {
  const { hasPermission } = useAuth();
  const { showToast } = useNotification();

  const [accounts, setAccounts] = useState<CompanyAccount[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Transfer Form
  const [transferForm, setTransferForm] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: 50000,
    description: 'Internal fund transfer',
  });

  // New Account Form
  const [newAccountForm, setNewAccountForm] = useState({
    id: `ACC-${Math.floor(100 + Math.random() * 900)}`,
    account_name: '',
    account_type: 'Bank Account',
    bank_name: 'HDFC Bank Ltd',
    account_number: '',
    ifsc: '',
    branch: 'Kalpetta',
    account_holder: 'FROMEX Health Tech Pvt Ltd',
    opening_balance: 0,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accRes, transRes, invRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/accounts/transactions/all'),
        api.get('/invoices').catch(() => []),
      ]);
      setAccounts(accRes || []);
      setTransactions(transRes || []);
      setInvoices(invRes || []);
      if (accRes?.length > 0) {
        setTransferForm(prev => ({
          ...prev,
          from_account_id: accRes[0].id,
          to_account_id: accRes[1]?.id || accRes[0].id,
        }));
      }
    } catch (err: any) {
      showToast({ type: 'error', message: 'Failed to load accounts & treasury data' });
    } finally {
      setIsLoading(false);
    }
  };

  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferForm.from_account_id === transferForm.to_account_id) {
      showToast({ type: 'warning', message: 'Source and destination accounts must be different' });
      return;
    }
    try {
      await api.post('/accounts/transfer', transferForm);
      showToast({ type: 'success', message: 'Funds transferred successfully' });
      setIsTransferOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Transfer failed' });
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/accounts', newAccountForm);
      showToast({ type: 'success', message: 'Company account created successfully' });
      setIsAddAccountOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to create account' });
    }
  };

  const filteredTransactions = selectedAccountId === 'all'
    ? transactions
    : transactions.filter(t => t.account_id === selectedAccountId);

  // Software metrics
  const totalBalance = accounts.reduce((acc, a) => acc + (a.current_balance || 0), 0);
  const saasInvoices = invoices.filter(i => (i.contract_type || 'SaaS Subscription').includes('SaaS'));
  const mrr = saasInvoices.reduce((acc, i) => acc + (i.grand_total || 0), 0) / (saasInvoices.length || 1);
  const arr = mrr * 12;
  const amcTotal = invoices
    .filter(i => (i.contract_type || '').includes('AMC'))
    .reduce((acc, i) => acc + (i.grand_total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Accounts & Software Treasury
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              SaaS & Treasury
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Corporate bank accounts, SaaS recurring revenue tracking, software AMC deposits, and cash flow ledgers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Fund Transfer</span>
          </button>

          {hasPermission('Accounts', 'create') && (
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Software SaaS & Recurring Revenue Run-Rate Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">SaaS MRR (Recurring)</p>
              <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                ₹{Math.round(mrr).toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Active health-tech subscriptions</p>
            </div>
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">ARR Run-Rate</p>
              <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                ₹{Math.round(arr).toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Annualized SaaS projection</p>
            </div>
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Cloud className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Software AMC / SLAs</p>
              <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{Math.round(amcTotal).toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Annual maintenance contracts</p>
            </div>
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Total Treasury Balance</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                ₹{totalBalance.toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Across {accounts.length} bank accounts</p>
            </div>
            <div className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Account Balances Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map(acc => {
          const isPetty = acc.account_type === 'Petty Cash';
          return (
            <Card
              key={acc.id}
              onClick={() => setSelectedAccountId(selectedAccountId === acc.id ? 'all' : acc.id)}
              className={`p-5 cursor-pointer transition-all border-2 ${
                selectedAccountId === acc.id ? 'border-blue-500 shadow-md' : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${isPetty ? 'bg-amber-50 text-amber-600 dark:bg-amber-950' : 'bg-blue-50 text-blue-600 dark:bg-blue-950'}`}>
                    {isPetty ? <Wallet className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {acc.account_name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {acc.bank_name ? `${acc.bank_name} • ${acc.account_number?.slice(-4) || 'Main'}` : acc.account_type}
                    </p>
                  </div>
                </div>
                <Badge variant={acc.status === 'Active' ? 'success' : 'neutral'}>
                  {acc.status}
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">Available Balance</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  ₹{acc.current_balance?.toLocaleString('en-IN')}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Transaction Ledger Table */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Transaction Ledger
            </h3>
            <p className="text-xs text-slate-400">
              {selectedAccountId === 'all' ? 'All Account Operations' : `Filtered for selected account`}
            </p>
          </div>

          {selectedAccountId !== 'all' && (
            <button
              onClick={() => setSelectedAccountId('all')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{tx.transaction_date}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white">
                    {tx.account_name || tx.account_id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 font-bold ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'Credit' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-sm truncate text-slate-600 dark:text-slate-300">
                    {tx.description}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{tx.reference_type || 'General'}</td>
                  <td className={`py-3.5 px-4 text-right font-bold font-mono ${tx.type === 'Credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                    ₹{tx.balance_after.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Fund Transfer Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Inter-Account Fund Transfer"
        subtitle="Transfer funds between company accounts with real-time balance adjustment"
      >
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">From Account (Debit) *</label>
            <select
              value={transferForm.from_account_id}
              onChange={e => setTransferForm({ ...transferForm, from_account_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.account_name} (₹{a.current_balance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">To Account (Credit) *</label>
            <select
              value={transferForm.to_account_id}
              onChange={e => setTransferForm({ ...transferForm, to_account_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.account_name} (₹{a.current_balance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Transfer Amount (₹) *</label>
            <input
              required
              type="number"
              value={transferForm.amount}
              onChange={e => setTransferForm({ ...transferForm, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description / Memo</label>
            <input
              type="text"
              value={transferForm.description}
              onChange={e => setTransferForm({ ...transferForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsTransferOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        title="Add Company Account"
        subtitle="Register new corporate bank account or cash ledger"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Account Name *</label>
            <input
              required
              placeholder="e.g. HDFC Operations Current Account"
              value={newAccountForm.account_name}
              onChange={e => setNewAccountForm({ ...newAccountForm, account_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Account Type</label>
              <select
                value={newAccountForm.account_type}
                onChange={e => setNewAccountForm({ ...newAccountForm, account_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="Bank Account">Bank Account</option>
                <option value="Current Account">Current Account</option>
                <option value="Petty Cash">Petty Cash</option>
                <option value="Digital Wallet">Digital Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Opening Balance (₹)</label>
              <input
                type="number"
                value={newAccountForm.opening_balance}
                onChange={e => setNewAccountForm({ ...newAccountForm, opening_balance: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bank Name</label>
              <input
                type="text"
                value={newAccountForm.bank_name}
                onChange={e => setNewAccountForm({ ...newAccountForm, bank_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Account Number</label>
              <input
                type="text"
                value={newAccountForm.account_number}
                onChange={e => setNewAccountForm({ ...newAccountForm, account_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddAccountOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25"
            >
              Save Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
