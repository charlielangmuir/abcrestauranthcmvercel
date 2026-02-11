const ReimbursementsPage = () => {
  const reimbursements = [
    { id: 1, description: 'Taxi fare to work', amount: 25.50, date: '2026-02-05', status: 'Pending' },
    { id: 2, description: 'Uniform purchase', amount: 89.99, date: '2026-02-03', status: 'Approved' },
    { id: 3, description: 'Parking fee', amount: 15.00, date: '2026-02-01', status: 'Paid' },
  ];

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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container" style={{ paddingTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 className="pageTitle">Reimbursements</h1>
          <p className="subtle">Submit and track your expense reimbursements</p>
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
        >
          + New Request
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Total Requested</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>$130.49</div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Pending Approval</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8, color: '#d97706' }}>1</div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Paid Out</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8, color: '#16a34a' }}>$15.00</div>
        </div>
      </div>

      <div className="card">
        <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border, #ddd)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900 }}>My Requests</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Date
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Description
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Amount
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reimbursements.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px', fontSize: 14, color: 'var(--muted)' }}>
                    {formatDate(item.date)}
                  </td>
                  <td style={{ padding: '16px', fontSize: 14, fontWeight: 600 }}>
                    {item.description}
                  </td>
                  <td style={{ padding: '16px', fontSize: 14, fontWeight: 700 }}>
                    ${item.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        borderRadius: '8px',
                        ...getStatusStyle(item.status)
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReimbursementsPage;