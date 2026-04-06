import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ReimbursementForm from '../components/reimbursement/ReimbursementForm';
import ReimbursementList from '../components/reimbursement/ReimbursementList';
import { reimbursementService } from '../api/reimbursementService';
import { employeeService } from '../api/employeeService';
import toast from 'react-hot-toast';

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

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Paid', 'Rejected'];

const ReimbursementsPage = () => {
  const { user } = useAuth();

  const role = (user?.user_metadata?.role || 'EMPLOYEE').toString().toUpperCase();
  const isManager = ['MANAGER', 'ADMIN'].includes(role);

  const [reimbursements, setReimbursements] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);
  const [categories, setCategories] = useState([]);

  const loadReimbursements = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      if (isManager) {
        const data = await reimbursementService.getAll();
        setReimbursements(data);
        return;
      }

      const employee = await employeeService.getByUserId(user.id);
      setEmployeeId(employee.employee_id);
      const data = await reimbursementService.getByEmployeeId(employee.employee_id);
      setReimbursements(data);
    } catch (error) {
      console.error('Error loading reimbursements:', error);
      toast.error(error.message || 'Failed to load reimbursements');
      setReimbursements([]);
    } finally {
      setLoading(false);
    }
  }, [isManager, user?.id]);

  useEffect(() => {
    loadReimbursements();
  }, [loadReimbursements]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await reimbursementService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading reimbursement categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleAdd = async (formData) => {
    try {
      let resolvedEmployeeId = employeeId;

      if (!resolvedEmployeeId) {
        const employee = await employeeService.getByUserId(user.id);
        resolvedEmployeeId = employee.employee_id;
        setEmployeeId(employee.employee_id);
      }

      await reimbursementService.create({
        ...formData,
        employee_id: resolvedEmployeeId,
        status: 'Pending',
      });

      await loadReimbursements();
    } catch (error) {
      console.error('Error creating reimbursement:', error);
      throw error;
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await reimbursementService.updateStatus(id, newStatus);
      await loadReimbursements();
      toast.success(`Request marked ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating reimbursement:', error);
      toast.error(error.message || 'Failed to update reimbursement');
    }
  };

  const handleDelete = async (id) => {
    try {
      await reimbursementService.delete(id);
      await loadReimbursements();
      toast.success('Request deleted');
    } catch (error) {
      console.error('Error deleting reimbursement:', error);
      toast.error(error.message || 'Failed to delete reimbursement');
    }
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

        {loading ? (
          <div className="reimb-empty">
            <div className="reimb-empty-title">Loading reimbursement requests...</div>
          </div>
        ) : (
          <ReimbursementList
            items={filteredItems}
            isManager={isManager}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* New request modal */}
      <ReimbursementForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAdd={handleAdd}
        categories={categories}
      />
    </div>
  );
};

export default ReimbursementsPage;
