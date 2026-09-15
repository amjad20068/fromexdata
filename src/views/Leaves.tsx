import React, { useState, useEffect } from 'react';
import { 
  CalendarOff, 
  Plus, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { api } from '../api/client';
import { LeaveRequest, LeaveBalance } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Leaves: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { showToast } = useNotification();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Apply Form
  const [applyForm, setApplyForm] = useState({
    leave_type: 'Casual',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    total_days: 1,
    reason: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leavesRes, balRes] = await Promise.all([
        api.get('/leaves'),
        api.get('/leaves/balance').catch(() => null),
      ]);
      setLeaves(leavesRes || []);
      if (balRes) setBalance(balRes);
    } catch (err: any) {
      showToast({ type: 'error', message: 'Failed to load leave requests' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leaves', applyForm);
      showToast({ type: 'success', message: 'Leave request submitted for review' });
      setIsApplyOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to submit leave' });
    }
  };

  const handleReviewAction = async (status: 'Approved' | 'Rejected') => {
    if (!selectedLeave) return;
    try {
      await api.patch(`/leaves/${selectedLeave.id}/status`, {
        status,
        remarks: reviewRemarks,
      });
      showToast({
        type: status === 'Approved' ? 'success' : 'info',
        message: `Leave request ${status.toLowerCase()}`,
      });
      setIsReviewOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Action failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Leave Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit leave requests, track entitlement balances, and approve time-off
          </p>
        </div>

        <button
          onClick={() => setIsApplyOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Leave Balances Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase">Casual Leave</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {balance?.casual ?? 10} <span className="text-xs text-slate-400 font-normal">days left</span>
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase">Sick Leave</span>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {balance?.sick ?? 8} <span className="text-xs text-slate-400 font-normal">days left</span>
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase">Annual Leave</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {balance?.annual ?? 12} <span className="text-xs text-slate-400 font-normal">days left</span>
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase">Leaves Consumed</span>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-200 mt-1">
            {balance?.used ?? 4} <span className="text-xs text-slate-400 font-normal">days YTD</span>
          </p>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Leave Application History
          </h3>
          <p className="text-xs text-slate-400">All submitted applications & review decisions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Days</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaves.map(req => {
                const badgeVariant =
                  req.status === 'Approved' ? 'success' :
                  req.status === 'Rejected' ? 'error' : 'warning';

                return (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 dark:text-white">
                        {req.first_name ? `${req.first_name} ${req.last_name}` : req.employee_id}
                      </p>
                      <p className="text-[11px] text-slate-400">{req.department || req.employee_id}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {req.leave_type}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {req.start_date} to {req.end_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {req.total_days} {req.total_days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                      {req.reason || 'Personal'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={badgeVariant}>{req.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'Pending' && hasPermission('Leave', 'approve') ? (
                        <button
                          onClick={() => {
                            setSelectedLeave(req);
                            setReviewRemarks('');
                            setIsReviewOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {req.reviewed_by ? `By ${req.reviewed_by}` : 'Closed'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Apply for Leave"
        subtitle="Submit time-off application for manager approval"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Leave Category *</label>
            <select
              value={applyForm.leave_type}
              onChange={e => setApplyForm({ ...applyForm, leave_type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            >
              <option value="Casual">Casual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Annual">Annual Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Paternity">Paternity Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Start Date *</label>
              <input
                required
                type="date"
                value={applyForm.start_date}
                onChange={e => setApplyForm({ ...applyForm, start_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">End Date *</label>
              <input
                required
                type="date"
                value={applyForm.end_date}
                onChange={e => setApplyForm({ ...applyForm, end_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Total Days</label>
            <input
              type="number"
              step="0.5"
              value={applyForm.total_days}
              onChange={e => setApplyForm({ ...applyForm, total_days: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Reason for Leave *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide context or explanation..."
              value={applyForm.reason}
              onChange={e => setApplyForm({ ...applyForm, reason: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsApplyOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Leave Modal */}
      {selectedLeave && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title="Review Leave Application"
          subtitle={`Requested by ${selectedLeave.first_name} ${selectedLeave.last_name} (${selectedLeave.employee_id})`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <p><span className="text-slate-400">Leave Type:</span> <strong className="text-slate-800 dark:text-white">{selectedLeave.leave_type}</strong></p>
              <p><span className="text-slate-400">Period:</span> <strong className="font-mono">{selectedLeave.start_date} to {selectedLeave.end_date}</strong> ({selectedLeave.total_days} days)</p>
              <p><span className="text-slate-400">Reason:</span> <span className="text-slate-700 dark:text-slate-300">{selectedLeave.reason}</span></p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Reviewer Remarks / Feedback</label>
              <input
                type="text"
                placeholder="Optional comments for employee..."
                value={reviewRemarks}
                onChange={e => setReviewRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleReviewAction('Rejected')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 text-xs font-bold"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction('Approved')}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Leave</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
