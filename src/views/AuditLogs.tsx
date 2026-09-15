import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Clock } from 'lucide-react';
import { api } from '../api/client';
import { AuditLog } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useNotification } from '../context/NotificationContext';

export const AuditLogs: React.FC = () => {
  const { showToast } = useNotification();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const res = await api.get('/audit-logs');
        setLogs(res || []);
      } catch (err: any) {
        showToast({ type: 'error', message: 'Failed to load audit trail' });
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.record_id && l.record_id.toLowerCase().includes(search.toLowerCase()));
    const matchModule = moduleFilter ? l.module === moduleFilter : true;
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System Audit Trail & Compliance
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Immutable logging of authentication events, financial disbursements, workforce modifications, and records
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by action, user, or record ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            <option value="">All Modules</option>
            <option value="Auth">Auth</option>
            <option value="Employees">Employees</option>
            <option value="Attendance">Attendance</option>
            <option value="Salary">Salary</option>
            <option value="Accounts">Accounts</option>
            <option value="Expenses">Expenses</option>
            <option value="Invoices">Invoices</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Record ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit logs found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{log.created_at}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                      {log.user_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="primary">{log.module}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {log.record_id || 'System'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
