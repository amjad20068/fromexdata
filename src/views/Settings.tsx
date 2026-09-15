import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Save, 
  Lock, 
  Check, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  FileCheck
} from 'lucide-react';
import { api } from '../api/client';
import { CompanySettings } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { hasPermission } = useAuth();
  const { showToast } = useNotification();

  const [settings, setSettings] = useState<CompanySettings>({
    company_name: 'FROMEX Health Tech',
    logo_url: '/logo.png',
    website: 'https://www.fromexhealthtech.com/',
    email: 'contact@fromexhealthtech.com',
    phone: '+91-80759-18850',
    address: 'Kalpetta, Wayanad, Kerala - 673121, India',
    gst_number: '32AAECF1234F1Z8',
    pan: 'AAECF1234F',
    cin: 'U72900KL2023PTC081234',
    state: 'Kerala',
    state_code: '32',
    country: 'India',
  });

  const [permissions, setPermissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'company' | 'permissions'>('company');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const [setRes, permRes] = await Promise.all([
          api.get('/settings'),
          api.get('/settings/permissions').catch(() => []),
        ]);
        if (setRes) setSettings(setRes);
        if (permRes) setPermissions(permRes);
      } catch (err: any) {
        showToast({ type: 'error', message: 'Failed to load settings' });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', settings);
      showToast({ type: 'success', message: 'Company settings updated successfully' });
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to save settings' });
    }
  };

  const handleTogglePerm = (index: number, field: string) => {
    const next = [...permissions];
    next[index][field] = next[index][field] ? 0 : 1;
    setPermissions(next);
  };

  const handleSavePermissions = async () => {
    try {
      await api.put('/settings/permissions', { permissions });
      showToast({ type: 'success', message: 'Role permissions matrix updated successfully' });
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Failed to save permissions' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System & Enterprise Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Master company credentials, tax identity, statutory legal parameters, and RBAC matrix
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'company'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Company Master Profile
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Role Permissions Matrix (RBAC)
        </button>
      </div>

      {activeTab === 'company' ? (
        <Card className="p-6">
          <form onSubmit={handleSaveCompany} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Company Registered Name</label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Official Website</label>
                <input
                  type="text"
                  value={settings.website}
                  onChange={e => setSettings({ ...settings, website: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Headquarters Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>

            {/* Tax and Statutory IDs */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Statutory & Tax Identity</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={settings.gst_number}
                    onChange={e => setSettings({ ...settings, gst_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Permanent Account Number (PAN)</label>
                  <input
                    type="text"
                    value={settings.pan}
                    onChange={e => setSettings({ ...settings, pan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Company CIN</label>
                  <input
                    type="text"
                    value={settings.cin}
                    onChange={e => setSettings({ ...settings, cin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Company Profile</span>
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Role-Based Access Matrix</h3>
              <p className="text-xs text-slate-400">Configure feature permissions by user role</p>
            </div>
            <button
              onClick={handleSavePermissions}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Matrix</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-3 text-center">View</th>
                  <th className="py-3 px-3 text-center">Create</th>
                  <th className="py-3 px-3 text-center">Edit</th>
                  <th className="py-3 px-3 text-center">Delete</th>
                  <th className="py-3 px-3 text-center">Approve</th>
                  <th className="py-3 px-3 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{p.role}</td>
                    <td className="py-2.5 px-4 font-semibold text-blue-600 dark:text-blue-400">{p.module}</td>
                    {['can_view', 'can_create', 'can_edit', 'can_delete', 'can_approve', 'can_manage'].map(f => (
                      <td key={f} className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(p[f])}
                          onChange={() => handleTogglePerm(idx, f)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
