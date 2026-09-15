import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Receipt, CreditCard, DollarSign, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search staff, invoices, accounts, expenses (Type at least 2 characters)..."
            className="w-full px-3 py-4 text-base bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 ml-2">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
              Searching database...
            </div>
          )}

          {!isLoading && !results && query.length < 2 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Ctrl+K</kbd> anytime to search staff, payroll, accounts or invoices.
            </div>
          )}

          {!isLoading && results && (
            <>
              {/* Employees */}
              {results.employees?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Staff Members ({results.employees.length})
                  </h4>
                  <div className="space-y-1">
                    {results.employees.map((emp: any) => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          onNavigate('employees');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                              {emp.first_name} {emp.last_name}
                            </p>
                            <p className="text-xs text-slate-500">{emp.designation} • {emp.department}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{emp.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {results.invoices?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" /> Invoices ({results.invoices.length})
                  </h4>
                  <div className="space-y-1">
                    {results.invoices.map((inv: any) => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          onNavigate('invoices');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {inv.invoice_number} - {inv.customer_name}
                          </p>
                          <p className="text-xs text-slate-500">Total: ₹{inv.grand_total.toLocaleString('en-IN')} • Status: {inv.payment_status}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accounts */}
              {results.accounts?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Company Accounts ({results.accounts.length})
                  </h4>
                  <div className="space-y-1">
                    {results.accounts.map((acc: any) => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          onNavigate('accounts');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {acc.account_name}
                          </p>
                          <p className="text-xs text-slate-500">{acc.bank_name || acc.account_type}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{acc.current_balance.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {results.employees?.length === 0 && results.invoices?.length === 0 && results.accounts?.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No matches found for "{query}"
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
