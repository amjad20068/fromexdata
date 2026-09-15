import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  LayoutGrid, 
  List, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  FileText, 
  DollarSign, 
  CreditCard,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { api } from '../api/client';
import { Employee, Department, Designation } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Employees: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & View
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const initialForm = {
    id: '',
    first_name: '',
    last_name: '',
    gender: 'Male',
    phone: '',
    email: '',
    dob: '',
    address: '',
    emergency_contact: '',
    department: '',
    designation: '',
    joining_date: new Date().toISOString().split('T')[0],
    employment_type: 'Full Time',
    reporting_manager: '',
    work_location: 'Kalpetta Office',
    status: 'Active',
    bank_name: 'HDFC Bank Ltd',
    account_holder: '',
    account_number: '',
    ifsc: '',
    upi_id: '',
    salary_type: 'Monthly',
    basic_salary: 50000,
    allowances: 10000,
    avatar_url: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes, desigRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
        api.get('/designations'),
      ]);
      setEmployees(empRes.employees || empRes || []);
      setDepartments(deptRes || []);
      setDesignations(desigRes || []);
    } catch (err: any) {
      showToast({ type: 'error', message: 'Failed to load employees list' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.id.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter ? emp.department === deptFilter : true;
    const matchStatus = statusFilter ? emp.status === statusFilter : true;
    return matchSearch && matchDept && matchStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      id: `FX-${Math.floor(1000 + Math.random() * 9000)}`,
      department: departments[0]?.name || 'Technology & AI',
      designation: designations[0]?.title || 'Software Engineer',
    });
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setFormData({
      id: emp.id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      gender: emp.gender,
      phone: emp.phone,
      email: emp.email,
      dob: emp.dob || '',
      address: emp.address || '',
      emergency_contact: emp.emergency_contact || '',
      department: emp.department,
      designation: emp.designation,
      joining_date: emp.joining_date,
      employment_type: emp.employment_type,
      reporting_manager: emp.reporting_manager || '',
      work_location: emp.work_location,
      status: emp.status,
      bank_name: emp.bank_name || '',
      account_holder: emp.account_holder || `${emp.first_name} ${emp.last_name}`,
      account_number: emp.account_number || '',
      ifsc: emp.ifsc || '',
      upi_id: emp.upi_id || '',
      salary_type: emp.salary_type || 'Monthly',
      basic_salary: emp.basic_salary,
      allowances: emp.allowances,
      avatar_url: emp.avatar_url || '',
    });
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/employees/${formData.id}`, formData);
        showToast({ type: 'success', message: 'Employee updated successfully' });
      } else {
        await api.post('/employees', formData);
        showToast({ type: 'success', message: 'Employee added successfully' });
      }
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', message: err.message || 'Error saving employee' });
    }
  };

  const handleExport = () => {
    window.open('/api/excel/export/employees', '_blank');
    showToast({ type: 'info', message: 'Downloading employees spreadsheet...' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Employee Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage company staff, department hierarchy, salary profiles and documentation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dept Filter */}
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
              <option value="Terminated">Terminated</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Content: Grid or Table */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading staff members...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">No employees match the filter criteria.</div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map(emp => (
            <Card key={emp.id} className="p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-md overflow-hidden">
                      {emp.avatar_url ? (
                        <img src={emp.avatar_url} alt={emp.first_name} className="w-full h-full object-cover" />
                      ) : (
                        `${emp.first_name[0]}${emp.last_name[0]}`
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {emp.first_name} {emp.last_name}
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        {emp.designation}
                      </p>
                    </div>
                  </div>
                  <Badge variant={emp.status === 'Active' ? 'success' : 'warning'}>
                    {emp.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 py-2 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.work_location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-400">{emp.id}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setIsDetailsOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                    title="View Profile"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold"
                    title="Edit Employee"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{emp.first_name} {emp.last_name}</p>
                          <p className="text-[11px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">{emp.id}</td>
                    <td className="py-3.5 px-4">{emp.department}</td>
                    <td className="py-3.5 px-4">{emp.designation}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{emp.phone}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={emp.status === 'Active' ? 'success' : 'warning'}>{emp.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsDetailsOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditMode ? `Edit Employee ${formData.id}` : 'Add New Employee'}
        subtitle="Complete workforce onboarding & payroll details"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">First Name *</label>
              <input
                required
                type="text"
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Last Name *</label>
              <input
                required
                type="text"
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email *</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone *</label>
              <input
                required
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Designation *</label>
              <select
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              >
                {designations.map(d => (
                  <option key={d.id} value={d.title}>{d.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Joining Date</label>
              <input
                type="date"
                value={formData.joining_date}
                onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Basic Monthly Salary (₹)</label>
              <input
                type="number"
                value={formData.basic_salary}
                onChange={e => setFormData({ ...formData, basic_salary: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={formData.account_number}
                onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0057b8] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25"
            >
              {isEditMode ? 'Update Employee' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
          subtitle={`Employee Code: ${selectedEmployee.id} • ${selectedEmployee.department}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                {selectedEmployee.avatar_url ? (
                  <img src={selectedEmployee.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  `${selectedEmployee.first_name[0]}${selectedEmployee.last_name[0]}`
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </h4>
                <p className="text-xs text-blue-600 font-semibold">{selectedEmployee.designation}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success">{selectedEmployee.status}</Badge>
                  <span className="text-xs text-slate-400">• Joined {selectedEmployee.joining_date}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold uppercase text-slate-400">Personal & Contact</span>
                <p><span className="text-slate-500">Email:</span> {selectedEmployee.email}</p>
                <p><span className="text-slate-500">Phone:</span> {selectedEmployee.phone}</p>
                <p><span className="text-slate-500">Address:</span> {selectedEmployee.address || 'Kalpetta HQ'}</p>
                <p><span className="text-slate-500">Emergency:</span> {selectedEmployee.emergency_contact || 'N/A'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold uppercase text-slate-400">Payroll & Banking</span>
                <p><span className="text-slate-500">Monthly Basic:</span> ₹{selectedEmployee.basic_salary?.toLocaleString('en-IN')}</p>
                <p><span className="text-slate-500">Allowances:</span> ₹{selectedEmployee.allowances?.toLocaleString('en-IN')}</p>
                <p><span className="text-slate-500">Bank:</span> {selectedEmployee.bank_name || 'HDFC Bank Ltd'}</p>
                <p><span className="text-slate-500">Account:</span> <span className="font-mono">{selectedEmployee.account_number || '••••••••'}</span></p>
                <p><span className="text-slate-500">IFSC:</span> <span className="font-mono">{selectedEmployee.ifsc || 'HDFC0001248'}</span></p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
