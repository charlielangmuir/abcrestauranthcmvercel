const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_BADGE_CLASS = {
  Pending:  'reimb-badge reimb-badge-pending',
  Approved: 'reimb-badge reimb-badge-approved',
  Paid:     'reimb-badge reimb-badge-paid',
  Rejected: 'reimb-badge reimb-badge-rejected',
};

const ReimbursementList = ({ items, isManager, onStatusChange, onDelete }) => {
  if (!items || items.length === 0) {
    return (
      <div className="reimb-empty">
        <div className="reimb-empty-title">No reimbursement requests found</div>
        <p className="subtle">
          {isManager
            ? 'No requests have been submitted yet.'
            : 'Submit a new request using the button above.'}
        </p>
      </div>
    );
  }

  return (
    <div className="reimb-table-wrap">
      <table className="reimb-table">
        <thead>
          <tr>
            <th className="reimb-th">Date</th>
            {isManager && <th className="reimb-th">Employee</th>}
            <th className="reimb-th">Description</th>
            <th className="reimb-th">Category</th>
            <th className="reimb-th">Amount</th>
            <th className="reimb-th">Status</th>
            <th className="reimb-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const empName = item.employees
              ? `${item.employees.users?.first_name || ''} ${item.employees.users?.last_name || ''}`.trim() || '—'
              : '—';

            const badgeClass = STATUS_BADGE_CLASS[item.status] || 'reimb-badge';

            return (
              <tr key={item.reimbursement_id} className="reimb-tr">
                <td className="reimb-td reimb-td-muted">{formatDate(item.date)}</td>

                {isManager && (
                  <td className="reimb-td reimb-td-semibold">{empName}</td>
                )}

                <td className="reimb-td reimb-td-semibold">{item.description}</td>
                <td className="reimb-td reimb-td-muted">{item.category || '—'}</td>
                <td className="reimb-td reimb-td-bold">${Number(item.amount || 0).toFixed(2)}</td>

                <td className="reimb-td">
                  <span className={badgeClass}>{item.status}</span>
                </td>

                <td className="reimb-td">
                  <div className="reimb-action-group">
                    {isManager && item.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          className="reimb-btn-approve"
                          onClick={() => onStatusChange(item.reimbursement_id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="reimb-btn-reject"
                          onClick={() => onStatusChange(item.reimbursement_id, 'Rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {isManager && item.status === 'Approved' && (
                      <button
                        type="button"
                        className="reimb-btn-pay"
                        onClick={() => onStatusChange(item.reimbursement_id, 'Paid')}
                      >
                        Mark Paid
                      </button>
                    )}

                    {!isManager && item.status === 'Pending' && (
                      <button
                        type="button"
                        className="reimb-btn-reject"
                        onClick={() => {
                          if (confirm('Delete this request?')) onDelete(item.reimbursement_id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReimbursementList;
