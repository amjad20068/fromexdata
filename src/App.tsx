import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Employees } from './views/Employees';
import { Attendance } from './views/Attendance';
import { Leaves } from './views/Leaves';
import { Accounts } from './views/Accounts';
import { Salary } from './views/Salary';
import { Expenses } from './views/Expenses';
import { Invoices } from './views/Invoices';
import { Reports } from './views/Reports';
import { Settings } from './views/Settings';
import { AuditLogs } from './views/AuditLogs';
import { Building2 } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0057b8] to-[#00b4a6] flex items-center justify-center shadow-2xl shadow-blue-500/30 text-white font-bold text-2xl animate-pulse">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white tracking-wide">FROMEX Health Tech</h2>
            <p className="text-xs text-slate-400 mt-1">Initializing Secure Enterprise Session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'employees':
        return <Employees />;
      case 'attendance':
        return <Attendance />;
      case 'leaves':
        return <Leaves />;
      case 'accounts':
        return <Accounts />;
      case 'salary':
        return <Salary />;
      case 'expenses':
        return <Expenses />;
      case 'invoices':
        return <Invoices />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'audit-logs':
        return <AuditLogs />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderView()}
    </Layout>
  );
};
