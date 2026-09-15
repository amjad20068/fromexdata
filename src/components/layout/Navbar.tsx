import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  Clock, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  ShieldAlert,
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../api/client';
import { Role } from '../../types';

export interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenSearch, activeTab }) => {
  const { user, quickLoginAs } = useAuth();
  const { showToast } = useNotification();

  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || 
      localStorage.getItem('fromex_theme') === 'dark';
  });

  const [punchStatus, setPunchStatus] = useState<'Checked In' | 'Checked Out' | 'Not Checked In'>('Not Checked In');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [isPunching, setIsPunching] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Toggle Dark mode
  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('fromex_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('fromex_theme', 'light');
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, [isDark]);

  // Load check-in status
  useEffect(() => {
    async function loadPunchStatus() {
      try {
        const res = await api.get('/attendance/status');
        if (res.checked_in) {
          setPunchStatus('Checked In');
          setCheckInTime(res.record?.check_in || null);
        } else if (res.record?.check_out) {
          setPunchStatus('Checked Out');
          setCheckInTime(null);
        } else {
          setPunchStatus('Not Checked In');
        }
      } catch (err) {
        // Attendance status may not exist for demo users without employee_id
      }
    }
    loadPunchStatus();
  }, [user]);

  // Load notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.get('/notifications');
        if (Array.isArray(res)) setNotifications(res);
      } catch (_) {}
    }
    loadNotifications();
  }, []);

  const handlePunchToggle = async () => {
    setIsPunching(true);
    try {
      if (punchStatus === 'Checked In') {
        await api.post('/attendance/check-out');
        setPunchStatus('Checked Out');
        showToast({
          type: 'info',
          title: 'Shift Ended',
          message: 'Punched out successfully. Have a great evening!',
        });
      } else {
        await api.post('/attendance/check-in');
        setPunchStatus('Checked In');
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setCheckInTime(nowStr);
        showToast({
          type: 'success',
          title: 'Shift Started',
          message: `Punched in successfully at ${nowStr}. Have a productive day!`,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Punch Failed',
        message: err.message || 'Could not record punch',
      });
    } finally {
      setIsPunching(false);
    }
  };

  const roles: Role[] = ['SUPER ADMIN', 'HR / ADMIN', 'ACCOUNTS', 'MANAGER', 'EMPLOYEE'];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-lg font-extrabold capitalize text-slate-900 dark:text-white">
            {activeTab.replace('-', ' ')}
          </h1>
          <p className="text-xs text-slate-400 font-medium">FROMEX Health Tech Management Suite</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Punch Button */}
        <button
          onClick={handlePunchToggle}
          disabled={isPunching}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            punchStatus === 'Checked In'
              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
          }`}
        >
          <Clock className="w-4 h-4 animate-pulse" />
          <span>
            {punchStatus === 'Checked In' ? `Punch Out (${checkInTime || 'Active'})` : 'Punch In'}
          </span>
        </button>

        {/* Global Search button */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium"
        >
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Quick Role Switcher Dropdown for Testing */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60 text-xs font-bold hover:bg-blue-100 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Role:</span> {user?.role}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Switch Role Profile
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={async () => {
                    setShowRoleMenu(false);
                    await quickLoginAs(r);
                    showToast({
                      type: 'success',
                      title: 'Role Switched',
                      message: `Now acting as ${r}`,
                    });
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                    user?.role === r
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{r}</span>
                  {user?.role === r && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Notifications</span>
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                      <p className="font-bold text-slate-800 dark:text-white">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
