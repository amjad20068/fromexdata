import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  UserX, 
  Settings as SettingsIcon, 
  Plus, 
  Download,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../api/client';
import { AttendanceRecord, AttendanceSettings } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Attendance: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { showToast } = useNotification();

  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ present: 0, late: 0, on_leave: 0, absent: 0 });
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Manual Punch Form
  const [manualForm, setManualForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '09:00',
    check_out: '18:00',
    status: 'Present',
    remarks: 'Manual correction by HR',
  });

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const [todayData, settingsData] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/settings').catch(() => null),
      ]);
      setTodayRecords(todayData.records || []);
      setStats(todayData.stats || { present: 0, late: 0, on_leave: 0, absent: 0 });
      if (settingsData) setSettings(settingsData);
    } catch (err: any) {
      showToast({ type: 'error', message: 'Failed to load attendance records' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleManualPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/attendance/manual', manualForm);
      showToast({ type: 'success', message: 'Attendance record updated successfully' });
      setIsManualModalOpen(false);
      loadAttendance();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to update attendance' });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/attendance/settings', settings);
      showToast({ type: 'success', message: 'Attendance policy updated successfully' });
      setIsSettingsModalOpen(false);
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to save settings' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Attendance & Work Hours
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time biometric & web punch logging, shift timings, and daily registers
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Clock Card */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold shadow-sm">
            <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{currentTime}</span>
          </div>

          {hasPermission('Attendance', 'manage') && (
            <>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Shift Settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsManualModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Manual Entry</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Present</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.present}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Late In</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.late}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">On Leave</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.on_leave}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Absent</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.absent}</p>
          </div>
        </Card>
      </div>

      {/* Today's Punch Table */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Attendance Register
            </h3>
            <p className="text-xs text-slate-400">
              Shift: {settings?.office_start_time || '09:00'} - {settings?.office_end_time || '18:00'} • Grace period: {settings?.grace_period_minutes || 15} mins
            </p>
          </div>
          <button
            onClick={() => window.open('/api/excel/export/attendance', '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Register</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Check In</th>
                <th className="py-3.5 px-4">Check Out</th>
                <th className="py-3.5 px-4">Work Hours</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {todayRecords.map(rec => {
                const badgeVariant = 
                  rec.status === 'Present' ? 'success' :
                  rec.status === 'Late' ? 'warning' :
                  rec.status === 'On Leave' ? 'info' : 'error';

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {rec.first_name ? rec.first_name[0] : 'U'}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {rec.first_name} {rec.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{rec.employee_id}</td>
                    <td className="py-3 px-4">{rec.department || 'Technology & AI'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {rec.check_in || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {rec.check_out || '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">
                      {rec.working_hours ? `${rec.working_hours} hrs` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={badgeVariant}>{rec.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic">
                      {rec.remarks || 'Standard punch'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Punch Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Manual Attendance Correction"
        subtitle="Log or adjust employee punch times"
      >
        <form onSubmit={handleManualPunch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Employee ID *</label>
            <input
              required
              placeholder="e.g. FX-1001"
              value={manualForm.employee_id}
              onChange={e => setManualForm({ ...manualForm, employee_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={manualForm.date}
                onChange={e => setManualForm({ ...manualForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
              <select
                value={manualForm.status}
                onChange={e => setManualForm({ ...manualForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Check In Time</label>
              <input
                type="time"
                value={manualForm.check_in}
                onChange={e => setManualForm({ ...manualForm, check_in: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Check Out Time</label>
              <input
                type="time"
                value={manualForm.check_out}
                onChange={e => setManualForm({ ...manualForm, check_out: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Reason / Remarks</label>
            <input
              type="text"
              value={manualForm.remarks}
              onChange={e => setManualForm({ ...manualForm, remarks: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      {settings && (
        <Modal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          title="Attendance Shift Configuration"
          subtitle="Configure office work hours and grace thresholds"
        >
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Office Start Time</label>
                <input
                  type="time"
                  value={settings.office_start_time}
                  onChange={e => setSettings({ ...settings, office_start_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Office End Time</label>
                <input
                  type="time"
                  value={settings.office_end_time}
                  onChange={e => setSettings({ ...settings, office_end_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Grace Period (Minutes)</label>
                <input
                  type="number"
                  value={settings.grace_period_minutes}
                  onChange={e => setSettings({ ...settings, grace_period_minutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Min Hours for Full Day</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.min_working_hours}
                  onChange={e => setSettings({ ...settings, min_working_hours: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold"
              >
                Save Shift Rules
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
