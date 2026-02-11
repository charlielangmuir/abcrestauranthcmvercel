const PayrollPage = () => {
  return (
    <div className="container" style={{ paddingTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 className="pageTitle">Payroll</h1>
          <p className="subtle">Manage employee compensation and pay periods</p>
        </div>

        <button
          type="button"
          className="iconBtn"
          style={{
            background: '#16a34a',
            color: 'white',
            fontWeight: 700,
            padding: '10px 16px',
          }}
        >
          Process Payroll
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Total Payroll (This Month)</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>$45,230</div>
          <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, marginTop: 6 }}>
            ↑ 5% from last month
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Employees Paid</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>28</div>
          <div className="subtle" style={{ marginTop: 6 }}>Out of 30 total</div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Next Pay Date</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>Feb 15</div>
          <div className="subtle" style={{ marginTop: 6 }}>6 days remaining</div>
        </div>
      </div>

      <div className="card">
        <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border, #ddd)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900 }}>Recent Payroll Records</h2>
        </div>

        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <svg
            style={{ width: 64, height: 64, color: 'var(--muted)', margin: '0 auto 16px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            Payroll records will appear here
          </div>
          <div className="subtle" style={{ fontSize: 14 }}>
            View paystubs, calculate wages, and process payments
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;