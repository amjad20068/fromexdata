import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarOff, 
  Landmark, 
  ReceiptIndianRupee, 
  WalletCards, 
  FileText, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onToggle,
}) => {
  const { user, logout, hasPermission } = useAuth();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'Dashboard' },
      ]
    },
    {
      group: 'Staff & Workforce',
      items: [
        { id: 'employees', label: 'Employees Directory', icon: Users, module: 'Employees' },
        { id: 'attendance', label: 'Attendance & Punch', icon: Clock, module: 'Attendance' },
        { id: 'leaves', label: 'Leave Requests', icon: CalendarOff, module: 'Leave' },
      ]
    },
    {
      group: 'Finance & Accounts',
      items: [
        { id: 'accounts', label: 'Bank & Accounts', icon: Landmark, module: 'Accounts' },
        { id: 'salary', label: 'Payroll & Slips', icon: ReceiptIndianRupee, module: 'Salary' },
        { id: 'expenses', label: 'Expenses & Claims', icon: WalletCards, module: 'Expenses' },
        { id: 'invoices', label: 'Invoices & Billing', icon: FileText, module: 'Invoices' },
      ]
    },
    {
      group: 'Administration',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, module: 'Reports' },
        { id: 'settings', label: 'Company Settings', icon: Settings, module: 'Settings' },
        { id: 'audit-logs', label: 'Audit Trail', icon: ShieldCheck, module: 'Audit Logs' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-72 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0057b8] to-[#00b4a6] flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">FROMEX</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                ERP
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Health Tech Pvt Ltd</span>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navGroups.map((grp, idx) => {
            const filteredItems = grp.items.filter(item => hasPermission(item.module));
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx}>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                  {grp.group}
                </h4>
                <div className="space-y-1">
                  {filteredItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          if (window.innerWidth < 1024) onToggle();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                          isActive
                            ? 'bg-[#0057b8] text-white shadow-md shadow-blue-600/25 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden shrink-0">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user?.username?.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                </p>
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate uppercase">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
