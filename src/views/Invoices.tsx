import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Download,
  Building2,
  Receipt,
  Sparkles,
  Code,
  ShieldCheck,
  Server,
  Cloud,
  Layers,
  Repeat
} from 'lucide-react';
import { api } from '../api/client';
import { Invoice, InvoiceItem } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Invoices: React.FC = () => {
  const { hasPermission } = useAuth();
  const { showToast } = useNotification();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contractFilter, setContractFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Invoice Form
  const initialForm = {
    invoice_number: `FX-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer_name: '',
    customer_email: '',
    customer_address: '',
    gst_number: '',
    discount: 0,
    gst_rate: 18,
    contract_type: 'SaaS Subscription' as const,
    billing_frequency: 'Annual' as const,
    payment_status: 'Sent' as const,
    notes: 'Includes software version upgrades, security patches, and 99.9% uptime SLA under FROMEX Health Tech Master Services Agreement.',
  };
  const [formData, setFormData] = useState(initialForm);

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { description: 'FROMEX AI Clinical Workflow Platform - Enterprise Cloud Tier (50 Doctor Seats, FHIR Cloud)', quantity: 1, rate: 280000, amount: 280000 },
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/invoices');
      setInvoices(res || []);
    } catch (err: any) {
      showToast({ type: 'error', message: 'Failed to load invoices' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Preset Handlers for Software Company Contracts
  const applyPreset = (type: 'saas' | 'amc' | 'custom' | 'api') => {
    if (type === 'saas') {
      setFormData(prev => ({
        ...prev,
        contract_type: 'SaaS Subscription',
        billing_frequency: 'Monthly',
        notes: 'Monthly Recurring SaaS access for hospital clinical staff with continuous cloud backups and 24/7 telemetry monitoring.',
      }));
      setLineItems([
        { description: 'FROMEX Clinical AI Cloud Suite - Monthly Enterprise SaaS Subscription (50 Seats, Multi-Department)', quantity: 1, rate: 85000, amount: 85000 },
        { description: 'Dedicated Clinical AI Server Cluster & High-Availability Database Hosting', quantity: 1, rate: 25000, amount: 25000 },
      ]);
    } else if (type === 'amc') {
      setFormData(prev => ({
        ...prev,
        contract_type: 'Software AMC',
        billing_frequency: 'Annual',
        notes: 'Annual Software Maintenance Contract (AMC) covering 24/7 bug fixes, quarterly compliance updates, security audits, and dedicated tech lead support.',
      }));
      setLineItems([
        { description: 'Annual Software Maintenance Contract (AMC) & Level-3 Production SLA Support', quantity: 1, rate: 240000, amount: 240000 },
        { description: 'Quarterly Diagnostic Model Fine-Tuning & Custom Data Re-calibration', quantity: 4, rate: 20000, amount: 80000 },
      ]);
    } else if (type === 'custom') {
      setFormData(prev => ({
        ...prev,
        contract_type: 'Custom Development',
        billing_frequency: 'Milestone',
        notes: 'Custom Clinical Software Engineering Contract. Deliverables based on mutually signed Statement of Work (SOW).',
      }));
      setLineItems([
        { description: 'Custom Healthcare Software Engineering - Milestone 1: FHIR EHR Data Gateway & REST API Architecture', quantity: 1, rate: 320000, amount: 320000 },
        { description: 'Doctor Mobile UX / React Native Application Custom Build', quantity: 1, rate: 180000, amount: 180000 },
      ]);
    } else if (type === 'api') {
      setFormData(prev => ({
        ...prev,
        contract_type: 'Cloud API & AI Tokens',
        billing_frequency: 'Monthly',
        notes: 'Pay-as-you-go Cloud API compute and AI diagnostic model inference token consumption.',
      }));
      setLineItems([
        { description: 'FROMEX Cloud Medical NLP API Inference - 1,500,000 Patient Record Summaries', quantity: 1, rate: 75000, amount: 75000 },
      ]);
    }
  };

  const handleAddItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, val: any) => {
    const next = [...lineItems];
    next[index] = { ...next[index], [field]: val };
    if (field === 'quantity' || field === 'rate') {
      next[index].amount = Number(next[index].quantity) * Number(next[index].rate);
    }
    setLineItems(next);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const taxableTotal = lineItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const discountVal = Number(formData.discount) || 0;
  const netTaxable = Math.max(0, taxableTotal - discountVal);
  const gstAmount = (netTaxable * formData.gst_rate) / 100;
  const grandTotal = Math.round(netTaxable + gstAmount);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name) {
      showToast({ type: 'warning', message: 'Client or hospital name is required' });
      return;
    }
    try {
      await api.post('/invoices', {
        ...formData,
        taxable_amount: netTaxable,
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        igst: 0,
        grand_total: grandTotal,
        items: lineItems,
      });
      showToast({ type: 'success', message: 'Software contract invoice issued successfully' });
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to create invoice' });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/invoices/${id}/status`, { payment_status: newStatus });
      showToast({ type: 'success', message: `Invoice marked as ${newStatus}` });
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Status update failed' });
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchContract = contractFilter === 'all' ? true : inv.contract_type === contractFilter;
    const matchStatus = statusFilter === 'all' ? true : inv.payment_status === statusFilter;
    return matchContract && matchStatus;
  });

  // Calculate SaaS metrics
  const totalBilled = invoices.reduce((acc, i) => acc + i.grand_total, 0);
  const saasRevenue = invoices
    .filter(i => (i.contract_type || 'SaaS Subscription').includes('SaaS'))
    .reduce((acc, i) => acc + i.grand_total, 0);
  const amcRevenue = invoices
    .filter(i => (i.contract_type || '').includes('AMC'))
    .reduce((acc, i) => acc + i.grand_total, 0);
  const customDevRevenue = invoices
    .filter(i => (i.contract_type || '').includes('Custom'))
    .reduce((acc, i) => acc + i.grand_total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Software Billing & Client Contracts
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Tech ERP
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            SaaS recurring subscriptions, Software AMC maintenance retainers, and custom development contracts
          </p>
        </div>

        {hasPermission('Invoices', 'create') && (
          <button
            onClick={() => {
              setFormData({
                ...initialForm,
                invoice_number: `FX-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
              });
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Software Invoice</span>
          </button>
        )}
      </div>

      {/* Software Revenue Metrics Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">SaaS Subscriptions</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
              <Cloud className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            ₹{saasRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 block">
            Cloud Platform Recurring
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Software AMC Retainers</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            ₹{amcRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 block">
            24/7 SLA & Maintenance
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Custom Dev Sprints</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
              <Code className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            ₹{customDevRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            Milestone Contract Billing
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Gross Software Billed</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            ₹{totalBilled.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {invoices.length} Enterprise Invoices
          </span>
        </Card>
      </div>

      {/* Filter bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-400 mr-1">Contract:</span>
            {[
              { id: 'all', label: 'All Contracts' },
              { id: 'SaaS Subscription', label: '🚀 SaaS Cloud' },
              { id: 'Software AMC', label: '🛠️ Software AMC' },
              { id: 'Custom Development', label: '💻 Custom Dev' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setContractFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  contractFilter === f.id
                    ? 'bg-[#0057b8] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Sent">Sent / Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Invoices List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Client Organization</th>
                <th className="py-3.5 px-4">Contract Nature</th>
                <th className="py-3.5 px-4">Cycle</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Amount (INR)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map(inv => {
                const badgeVariant =
                  inv.payment_status === 'Paid' ? 'success' :
                  inv.payment_status === 'Sent' ? 'info' :
                  inv.payment_status === 'Partially Paid' ? 'warning' :
                  inv.payment_status === 'Overdue' ? 'error' : 'neutral';

                const contractType = inv.contract_type || 'SaaS Subscription';

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{inv.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{inv.customer_email || 'Direct Enterprise Client'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                        {contractType.includes('SaaS') ? <Cloud className="w-3 h-3" /> : contractType.includes('AMC') ? <ShieldCheck className="w-3 h-3" /> : <Code className="w-3 h-3" />}
                        {contractType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                      {inv.billing_frequency || 'Annual'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{inv.invoice_date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                      ₹{inv.grand_total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={badgeVariant}>{inv.payment_status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.payment_status !== 'Paid' && hasPermission('Invoices', 'edit') && (
                          <button
                            onClick={() => handleStatusChange(inv.id, 'Paid')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              const fullInv = await api.get(`/invoices/${inv.id}`);
                              setSelectedInvoice(fullInv.invoice ? { ...fullInv.invoice, items: fullInv.items } : fullInv);
                            } catch (_) {
                              setSelectedInvoice(inv);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Contract</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Invoice Modal with Software Presets */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Software Contract Invoice"
        subtitle="SaaS Subscription, Software AMC, or Custom Engineering Contract"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          {/* Quick Software Preset Buttons */}
          <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/60 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Software Contract Presets (One-Click Auto Fill)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('saas')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-left flex items-center gap-1.5"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>SaaS Monthly</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('amc')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-left flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Annual AMC</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('custom')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left flex items-center gap-1.5"
              >
                <Code className="w-3.5 h-3.5 text-emerald-600" />
                <span>Custom SOW</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('api')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-left flex items-center gap-1.5"
              >
                <Server className="w-3.5 h-3.5 text-amber-600" />
                <span>Cloud API Usage</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Contract Category *</label>
              <select
                value={formData.contract_type}
                onChange={e => setFormData({ ...formData, contract_type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              >
                <option value="SaaS Subscription">🚀 SaaS Cloud Subscription</option>
                <option value="Software AMC">🛠️ Software AMC & Maintenance SLA</option>
                <option value="Custom Development">💻 Custom Software & AI Development</option>
                <option value="Cloud API & AI Tokens">☁️ Cloud API & AI Tokens</option>
                <option value="Enterprise License">🏥 Enterprise Software License</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Billing Frequency</label>
              <select
                value={formData.billing_frequency}
                onChange={e => setFormData({ ...formData, billing_frequency: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              >
                <option value="Monthly">Monthly Recurring</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual Upfront</option>
                <option value="Milestone">Milestone / Sprint Based</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Invoice Number *</label>
              <input
                required
                value={formData.invoice_number}
                onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Invoice Date</label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={e => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client / Hospital Name *</label>
              <input
                required
                placeholder="e.g. Aster DM Healthcare Wayanad"
                value={formData.customer_name}
                onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client GSTIN</label>
              <input
                placeholder="e.g. 32AABCA1234A1Z5"
                value={formData.gst_number}
                onChange={e => setFormData({ ...formData, gst_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono"
              />
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Software Deliverables / Modules</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                + Add Software Module
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    placeholder="Software module / service description"
                    value={item.description}
                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                    className="w-16 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-center"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={e => handleItemChange(idx, 'rate', Number(e.target.value))}
                    className="w-24 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-right font-mono"
                  />
                  <span className="w-28 text-right font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                    ₹{(Number(item.amount) || 0).toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Summary calculation */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Taxable Services Subtotal:</span>
              <span className="font-mono font-semibold">₹{taxableTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GST ({formData.gst_rate}% - SAC 998313 Information Technology):</span>
              <span className="font-mono font-semibold">₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
              <span className="text-slate-900 dark:text-white">Total Contract Value (INR):</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Contract Terms & SLA Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25"
            >
              Issue Software Contract Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Tax Invoice Preview Modal with Software Terms */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title={`Tax Invoice ${selectedInvoice.invoice_number}`}
          subtitle={`Client: ${selectedInvoice.customer_name} • ${selectedInvoice.contract_type || 'Software Service'}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-black text-[#0057b8]">FROMEX HEALTH TECH PVT LTD</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono">
                    IT / SOFTWARE
                  </span>
                </div>
                <p className="text-xs text-slate-500">Kalpetta, Wayanad, Kerala - 673121, India</p>
                <p className="text-xs text-slate-500">contact@fromexhealthtech.com • www.fromexhealthtech.com</p>
                <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                  GSTIN: 32AAECF1234F1Z8 • SAC Code: 998313 (IT Software)
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase text-slate-400">SOFTWARE TAX INVOICE</span>
                <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {selectedInvoice.invoice_number}
                </p>
                <p className="text-xs text-slate-500">Date: {selectedInvoice.invoice_date}</p>
                <p className="text-xs text-slate-500">Due: {selectedInvoice.due_date}</p>
              </div>
            </div>

            {/* Contract Type Banner */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-500 dark:text-slate-400">Contract Nature:</span>
                <strong className="text-slate-900 dark:text-white">{selectedInvoice.contract_type || 'SaaS Cloud Subscription'}</strong>
              </div>
              <div className="font-semibold text-blue-700 dark:text-blue-300">
                Billing Cycle: {selectedInvoice.billing_frequency || 'Annual'}
              </div>
            </div>

            {/* Bill To */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
              <span className="font-bold uppercase text-slate-400 block mb-1">Billed To Enterprise Client</span>
              <p className="font-bold text-slate-900 dark:text-white">{selectedInvoice.customer_name}</p>
              <p className="text-slate-500">{selectedInvoice.customer_address || 'Kerala, India'}</p>
              {selectedInvoice.gst_number && (
                <p className="font-mono text-slate-600 dark:text-slate-400">Client GSTIN: {selectedInvoice.gst_number}</p>
              )}
            </div>

            {/* Line items table */}
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Software Deliverable / Service</th>
                  <th className="p-3 text-center">Qty / Seats</th>
                  <th className="p-3 text-right">Unit Rate</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(selectedInvoice.items || [{ description: 'AI Clinical Platform License', quantity: 1, rate: selectedInvoice.taxable_amount, amount: selectedInvoice.taxable_amount }]).map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{it.description}</td>
                    <td className="p-3 text-center font-mono">{it.quantity}</td>
                    <td className="p-3 text-right font-mono">₹{it.rate.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{it.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Payable */}
            <div className="flex justify-between items-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
              <div>
                <span className="text-xs font-bold uppercase text-blue-900 dark:text-blue-300">Total Payable Amount</span>
                <p className="text-[11px] text-slate-500">Includes 18% GST (CGST 9% + SGST 9%) for IT Software Services</p>
              </div>
              <span className="text-2xl font-black text-[#0057b8] dark:text-blue-400 font-mono">
                ₹{selectedInvoice.grand_total.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Software Terms */}
            {selectedInvoice.notes && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 space-y-1">
                <span className="font-bold uppercase tracking-wider text-slate-400 block">SLA & License Terms:</span>
                <p>{selectedInvoice.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
