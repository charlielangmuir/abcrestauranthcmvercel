// src/pages/EmployeesPage.jsx
import { useState, useEffect } from 'react';
import { employeeService } from '../api/employeeService';
import toast from 'react-hot-toast';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, [showActiveOnly]);

  const fetchEmployees = async () => {
    try {
      // Only show loading screen on initial load
      if (employees.length === 0) {
        setInitialLoading(true);
      } else {
        setRefetching(true);
      }
      
      console.log('Fetching employees, activeOnly:', showActiveOnly);
      const data = await employeeService.getAll(showActiveOnly);
      console.log('Received employees:', data?.length, 'employees');
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(`Failed to load employees: ${error.message}`);
    } finally {
      setInitialLoading(false);
      setRefetching(false);
    }
  };

  const handleDeactivate = async (employeeId, employeeName) => {
    if (!confirm(`Are you sure you want to deactivate ${employeeName}?`)) {
      return;
    }

    try {
      await employeeService.deactivate(employeeId);
      toast.success(`${employeeName} has been deactivated`);
      fetchEmployees(); // Refresh list
    } catch (error) {
      console.error('Error deactivating employee:', error);
      toast.error('Failed to deactivate employee');
    }
  };

  const handleDelete = async (employeeId, employeeName) => {
    if (!confirm(`⚠️ PERMANENTLY delete ${employeeName}? This cannot be undone!`)) {
      return;
    }

    try {
      await employeeService.delete(employeeId);
      toast.success(`${employeeName} has been deleted`);
      fetchEmployees(); // Refresh list
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery) return true;
    
    const search = searchQuery.toLowerCase();
    const fullName = `${emp.users?.first_name || ''} ${emp.users?.last_name || ''}`.toLowerCase();
    const email = (emp.users?.email || '').toLowerCase();
    const jobTitle = (emp.job_title || '').toLowerCase();
    const department = (emp.department || '').toLowerCase();
    const employeeNumber = (emp.employee_number || '').toLowerCase();

    return fullName.includes(search) ||
           email.includes(search) ||
           jobTitle.includes(search) ||
           department.includes(search) ||
           employeeNumber.includes(search);
  });

  // Calculate stats
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.is_active).length,
    avgRate: employees.length > 0
      ? (employees.reduce((sum, e) => sum + (parseFloat(e.hourly_rate) || 0), 0) / employees.length).toFixed(2)
      : '0.00',
  };

  if (initialLoading) {
    return (
      <div className="container" style={{ paddingTop: 10 }}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          Loading employees...
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 className="pageTitle">
            Employees
            {refetching && (
              <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 12, fontWeight: 400 }}>
                Updating...
              </span>
            )}
          </h1>
          <p className="subtle">Manage your team members</p>
        </div>

        <button
          type="button"
          className="iconBtn"
          style={{
            background: 'var(--primary)',
            color: 'white',
            fontWeight: 700,
            padding: '10px 16px',
          }}
          onClick={() => toast('Add employee feature coming soon!')}
        >
          + Add Employee
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Total Employees</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{stats.total}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Active</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{stats.active}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Avg. Hourly Rate</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>${stats.avgRate}</div>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by name, email, position, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: 250,
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />

          {/* Active Filter Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Active only</span>
          </label>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Employee
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Position
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Department
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Email
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', width: 120 }}>
                  Rate
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', width: 100 }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', width: 160 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                    {searchQuery ? 'No employees found matching your search' : 'No employees found'}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const fullName = `${employee.users?.first_name || ''} ${employee.users?.last_name || ''}`.trim() || 'Unknown';
                  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();

                  return (
                    <tr
                      key={employee.employee_id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            className="avatar"
                            style={{ width: 32, height: 32, fontSize: 14 }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{fullName}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{employee.employee_number}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--muted)', fontSize: 14 }}>
                        {employee.job_title || '—'}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--muted)', fontSize: 14 }}>
                        {employee.department || '—'}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--muted)', fontSize: 14 }}>
                        {employee.users?.email || '—'}
                      </td>
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 600 }}>
                        {employee.hourly_rate ? `$${parseFloat(employee.hourly_rate).toFixed(2)}/hr` : '—'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: '8px',
                            background: employee.is_active ? '#d1fae5' : '#fee2e2',
                            color: employee.is_active ? '#065f46' : '#991b1b',
                          }}
                        >
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'left' }}>
                        <button
                          type="button"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                            marginRight: 12,
                          }}
                          onClick={() => toast('Edit feature coming soon!')}
                        >
                          Edit
                        </button>
                        {employee.is_active ? (
                          <button
                            type="button"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--danger)',
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: 'pointer',
                            }}
                            onClick={() => handleDeactivate(employee.employee_id, fullName)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#dc2626',
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: 'pointer',
                            }}
                            onClick={() => handleDelete(employee.employee_id, fullName)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;