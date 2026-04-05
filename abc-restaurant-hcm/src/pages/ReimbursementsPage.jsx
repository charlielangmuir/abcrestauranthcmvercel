import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ReimbursementForm from '../components/reimbursement/ReimbursementForm';
import ReimbursementList from '../components/reimbursement/ReimbursementList';

// Original helper — kept unchanged
const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending':
      return { background: '#fef3c7', color: '#92400e' };
    case 'Approved':
      return { background: '#d1fae5', color: '#065f46' };
    case 'Paid':
      return { background: '#dbeafe', color: '#1e40af' };
    case 'Rejected':
      return { background: '#fee2e2', color: '#991b1b' };
    default:
      return { background: '#f3f4f6', color: '#374151' };
  }
};

// Original helper — kept unchanged
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const MOCK_DATA = [
  { reimbursement_id: 1, description: 'Taxi fare to work', amount: 25.50, date: '2026-02-05', status: 'Pending',  category: 'Travel',    notes: null, employees: { users: { first_name: 'Alice', last_name: 'Wong' } } },
  { reimbursement_id: 2, description: 'Uniform purchase',  amount: 89.99, date: '2026-02-03', status: 'Approved', category: 'Uniform',   notes: null, employees: { users: { first_name: 'Bob',   last_name: 'Smith' } } },
  { reimbursement_id: 3, description: 'Parking fee',       amount: 15.00, date: '2026-02-01', status: 'Paid',     category: 'Travel',    notes: null, employees: { users: { first_name: 'Alice', last_name: 'Wong' } } },
];

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Paid', 'Rejected'];

let nextId = 4;

const ReimbursementsPage = () => {
  const { user } = useAuth();

  const role = (user?.user_metadata?.role || 'EMPLOYEE').toString().toUpperCase();
  const isManager = ['MANAGER', 'ADMIN'].includes(role);

  const [reimbursements, setReimbursements] = useState(MOCK_DATA);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const handleAdd = (formData) => {
    const newItem = {
      reimbursement_id: nextId++,
      ...formData,
      status: 'Pending',
      employees: { users: { first_name: user?.user_metadata?.first_name || 'You', last_name: '' } },
    };
    setReimbursements((prev) => [newItem, ...prev]);
  };

  const handleStatusChange = (id, newStatus) => {
    setReimbursements((prev) =>
      prev.map((r) => (r.reimbursement_id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleDelete = (id) => {
    setReimbursements((prev) => prev.filter((r) => r.reimbursement_id !== id));
  };

  const totalRequested = reimbursements.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const pendingCount   = reimbursements.filter((r) => r.status === 'Pending').length;
  const paidAmount     = reimbursements.filter((r) => r.status === 'Paid').reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const filteredItems =
    statusFilter === 'All'
      ? reimbursements
      : reimbursements.filter((r) => r.status === statusFilter);

  return (
    <div className="container reimb-page-wrap">
      {/* Header */}
      <div className="reimb-header">
        <div>
          <h1 className="pageTitle">Reimbursements</h1>
          <p className="subtle">Submit and track your expense reimbursements</p>
        </div>
        <button
          type="button"
          className="iconBtn reimb-btn-primary"
          onClick={() => setIsFormOpen(true)}
        >
          + New Request
        </button>
      </div>

      {/* Summary cards */}
      <div className="reimb-stats-grid">
        <div className="card">
          <div className="reimb-stat-label">Total Requested</div>
          <div className="reimb-stat-value">${totalRequested.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="reimb-stat-label">Pending Approval</div>
          <div className="reimb-stat-value reimb-stat-value-warning">{pendingCount}</div>
        </div>
        <div className="card">
          <div className="reimb-stat-label">Paid Out</div>
          <div className="reimb-stat-value reimb-stat-value-success">${paidAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Main table card */}
      <div className="card">
        <div className="reimb-card-header">
          <h2 className="reimb-card-title">{isManager ? 'All Requests' : 'My Requests'}</h2>
          <div className="reimb-filter-row">
            <select
              className="reimb-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <ReimbursementList
          items={filteredItems}
          isManager={isManager}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>

      {/* New request modal */}
      <ReimbursementForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
};

export default ReimbursementsPage;
