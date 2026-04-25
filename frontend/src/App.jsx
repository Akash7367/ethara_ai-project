import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CalendarCheck, Sun, Moon, Plus, Trash2, Filter, ChevronRight, BarChart3, Clock, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { getEmployees, createEmployee, deleteEmployee, markAttendance, getAttendance, getDashboardStats } from './api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modals & States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // stores employee_id to delete
  const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState(null);

  // Forms
  const [newEmployee, setNewEmployee] = useState({ employee_id: '', full_name: '', email: '', department: '' });
  const [attendance, setAttendance] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'dashboard') {
        const res = await getDashboardStats();
        setStats(res.data);
      } else if (activeTab === 'employees' || activeTab === 'attendance') {
        const res = await getEmployees();
        setEmployees(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to the server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEmployee(newEmployee);
      setNewEmployee({ employee_id: '', full_name: '', email: '', department: '' });
      setIsAddModalOpen(false);
      setSuccessMessage('Employee added successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error adding employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!confirmDelete) return;
    setLoading(true);
    try {
      await deleteEmployee(confirmDelete);
      setConfirmDelete(null);
      setSuccessMessage('Employee record removed.');
      fetchData();
    } catch (err) {
      setError('Error deleting employee record');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await markAttendance(attendance);
      setSuccessMessage('Attendance recorded successfully');
      setAttendance({ ...attendance, employee_id: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error marking attendance');
    } finally {
      setLoading(false);
    }
  };

  const viewAttendance = async (empId) => {
    try {
      const res = await getAttendance(empId);
      setSelectedEmployeeAttendance({ id: empId, records: res.data });
    } catch (err) {
      setError('Could not fetch attendance records');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className={`min-h-screen ${theme}`}>
      {/* Toast Messages */}
      {successMessage && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 2000, background: 'var(--secondary)', color: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)' }}>
          <CheckCircle2 size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <header className="card" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', marginBottom: '2rem' }}>
        <div className="container" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
              <LayoutDashboard size={24} />
            </div>
            <h1 style={{ fontSize: '1.5rem' }}>HRMS <span style={{ color: 'var(--primary)' }}>Lite</span></h1>
          </div>
          
          <nav className="nav" style={{ marginBottom: 0 }}>
            <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <BarChart3 size={18} /> Dashboard
            </button>
            <button className={`nav-link ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
              <Users size={18} /> Employees
            </button>
            <button className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
              <CalendarCheck size={18} /> Attendance
            </button>
          </nav>

          <button className="secondary" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <main className="container animate-fade-in">
      {/* Error Toast */}
      {error && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: 'white', color: 'var(--danger)', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--danger)', minWidth: '320px' }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: 500 }}>{error}</span>
          <button style={{ marginLeft: 'auto', background: 'none', color: 'var(--text-light)', border: 'none', padding: 0 }} onClick={() => setError(null)}>
            <X size={18} />
          </button>
        </div>
      )}

        {loading && !stats && !employees.length && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loader" style={{ marginBottom: '1rem' }}></div>
            <p style={{ color: 'var(--text-light)' }}>Updating records...</p>
          </div>
        )}

        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="grid-stats">
              <div className="card animate-fade-in">
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 500 }}>Total Employees</p>
                <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{stats.total_employees}</h2>
              </div>
              <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 500 }}>Present Today</p>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>{stats.total_present_today}</h2>
              </div>
              <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 500 }}>Absent Today</p>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--danger)', marginTop: '0.5rem' }}>{stats.total_absent_today}</h2>
              </div>
            </div>

            <div className="grid-stats" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="var(--primary)" /> Department Breakdown
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {Object.entries(stats.department_counts).map(([dept, count]) => (
                    <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)' }}>
                      <span style={{ fontWeight: 500 }}>{dept}</span>
                      <span className="badge" style={{ background: 'var(--surface)', color: 'var(--primary)' }}>{count} Employees</span>
                    </div>
                  ))}
                  {Object.keys(stats.department_counts).length === 0 && (
                    <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>No data available.</p>
                  )}
                </div>
              </div>
              <div className="card" style={{ background: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>Welcome Back, Admin</h3>
                <p style={{ opacity: 0.9, lineHeight: 1.6 }}>You have {stats.total_employees} employees currently in the system. Don't forget to mark today's attendance for accurate tracking.</p>
                <button className="secondary" style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }} onClick={() => setActiveTab('attendance')}>
                  Go to Attendance <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem' }}>Employee Directory</h2>
                <p style={{ color: 'var(--text-light)' }}>Manage your workforce records and information.</p>
              </div>
              <button className="primary" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={18} /> Add New Employee
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.employee_id}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{emp.employee_id}</td>
                      <td style={{ fontWeight: 500 }}>{emp.full_name}</td>
                      <td>{emp.email}</td>
                      <td>
                        <span className="badge" style={{ background: 'var(--background)' }}>{emp.department}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="secondary" style={{ padding: '0.5rem 0.75rem' }} onClick={() => viewAttendance(emp.employee_id)}>
                            <Clock size={16} /> History
                          </button>
                          <button className="danger" style={{ padding: '0.5rem' }} onClick={() => setConfirmDelete(emp.employee_id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && !loading && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '5rem' }}>
                        <div style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
                          <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                          <p>Your employee list is currently empty.</p>
                        </div>
                        <button className="primary" onClick={() => setIsAddModalOpen(true)}>Add your first employee</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card">
              <div style={{ marginBottom: '2rem' }}>
                <h2>Attendance Portal</h2>
                <p style={{ color: 'var(--text-light)' }}>Record daily presence for your staff members.</p>
              </div>
              
              <form onSubmit={handleMarkAttendance} style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Staff Member</label>
                  <select required value={attendance.employee_id} onChange={e => setAttendance({...attendance, employee_id: e.target.value})}>
                    <option value="">Search or select employee...</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>{emp.full_name} ({emp.employee_id})</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Date</label>
                    <input type="date" value={attendance.date} onChange={e => setAttendance({...attendance, date: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Attendance Status</label>
                    <select value={attendance.status} onChange={e => setAttendance({...attendance, status: e.target.value})}>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Processing...' : 'Submit Attendance'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="card" style={{ marginTop: '2rem', borderLeft: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <AlertCircle color="var(--accent)" />
                <div>
                  <p style={{ fontWeight: 600 }}>Quick Guidelines</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Attendance can be marked retroactively if needed. Duplicate entries for the same date will be updated with the latest status.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Staff Member</h3>
              <button className="secondary" style={{ padding: '0.25rem' }} onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="modal-body" style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Unique Employee ID</label>
                  <input required placeholder="e.g. EMP-101" value={newEmployee.employee_id} onChange={e => setNewEmployee({...newEmployee, employee_id: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Legal Name</label>
                  <input required placeholder="John Doe" value={newEmployee.full_name} onChange={e => setNewEmployee({...newEmployee, full_name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address</label>
                  <input type="email" required placeholder="john@company.com" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Assigned Department</label>
                  <select required value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}>
                    <option value="">Select Department...</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">Human Resources</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content confirm-modal animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
              <div style={{ background: '#fee2e2', color: 'var(--danger)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Trash2 size={32} />
              </div>
              <h3>Remove Employee?</h3>
              <p style={{ color: 'var(--text-light)', marginTop: '0.75rem', lineHeight: 1.5 }}>Are you sure you want to remove <strong>{confirmDelete}</strong>? This action will also delete all associated attendance records and cannot be undone.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                <button className="secondary" onClick={() => setConfirmDelete(null)}>Keep Record</button>
                <button className="danger" onClick={handleDeleteEmployee} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History Sidebar */}
      {selectedEmployeeAttendance && (
        <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }} onClick={() => setSelectedEmployeeAttendance(null)}>
          <div className="animate-fade-in" style={{ background: 'var(--surface)', width: '100%', maxWidth: '450px', height: '100%', padding: '2.5rem', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem' }}>Attendance History</h3>
                <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Records for ID: <strong>{selectedEmployeeAttendance.id}</strong></p>
              </div>
              <button className="secondary" style={{ padding: '0.5rem' }} onClick={() => setSelectedEmployeeAttendance(null)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {selectedEmployeeAttendance.records.sort((a,b) => new Date(b.date) - new Date(a.date)).map((rec, i) => (
                <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--background)', padding: '0.5rem', borderRadius: '8px' }}>
                      <CalendarCheck size={18} color="var(--text-light)" />
                    </div>
                    <span style={{ fontWeight: 500 }}>{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <span className={`badge badge-${rec.status.toLowerCase()}`}>{rec.status}</span>
                </div>
              ))}
              {selectedEmployeeAttendance.records.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-light)' }}>
                  <Clock size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                  <p>No attendance records found for this employee.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="container" style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem', color: 'var(--text-light)', fontSize: '0.875rem' }}>
        <p>&copy; {new Date().getFullYear()} HRMS Lite. Built for Excellence.</p>
      </footer>
    </div>
  );
};

export default App;
