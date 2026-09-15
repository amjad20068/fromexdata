import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Role } from '../types';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast({ type: 'warning', message: 'Please enter both username and password' });
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      showToast({
        type: 'success',
        title: 'Welcome to FROMEX',
        message: 'Successfully authenticated.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: err.message || 'Invalid credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogins = [
    { role: 'SUPER ADMIN', user: 'admin', pass: 'admin123', label: 'Super Admin (CEO)', icon: '👑' },
    { role: 'HR / ADMIN', user: 'priya_hr', pass: 'hr123', label: 'HR Manager (Priya)', icon: '👥' },
    { role: 'ACCOUNTS', user: 'kavitha_accounts', pass: 'accounts123', label: 'Accounts Lead (Kavitha)', icon: '💳' },
    { role: 'MANAGER', user: 'arun_lead', pass: 'manager123', label: 'Tech Lead (Dr. Arun)', icon: '🩺' },
    { role: 'EMPLOYEE', user: 'rahul_dev', pass: 'emp123', label: 'Staff Engineer (Rahul)', icon: '💻' },
  ];

  const handleQuickDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl">
        {/* Left Side: Brand & Quick Demo Access */}
        <div className="md:col-span-5 p-8 bg-gradient-to-b from-blue-900/50 via-slate-900/60 to-slate-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0057b8] to-[#00b4a6] flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">FROMEX</h1>
                <p className="text-xs text-teal-400 font-semibold tracking-wider uppercase">Health Tech ERP</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Internal Enterprise Management Platform for FROMEX Health Tech Pvt Ltd, Kalpetta, Wayanad.
            </p>

            {/* Demo Quick Logins */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Demo One-Click Select
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {demoLogins.map(d => (
                  <button
                    key={d.user}
                    type="button"
                    onClick={() => handleQuickDemo(d.user, d.pass)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                      username === d.user
                        ? 'bg-blue-600/30 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{d.icon} {d.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">{d.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Encrypted Session</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center bg-slate-900/40">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
            <p className="text-xs text-slate-400 mb-8">Access your company portal and workspaces</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-500">
              FROMEX Health Tech Management System v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
