import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  const role = useMemo(() => {
    const r = (user?.user_metadata?.role || 'EMPLOYEE').toString().toUpperCase();
    if (r === 'ADMIN') return 'Admin';
    if (r === 'MANAGER') return 'Manager';
    if (r === 'FINANCE') return 'Finance';
    return 'Employee';
  }, [user]);

  const today = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const stats = [
    { title: 'Upcoming Shifts', value: 0, subtitle: 'Next 7 days', icon: '📅' },
    { title: 'Hours This Week', value: 0, subtitle: 'Mon–Sun', icon: '⏱️' },
    { title: 'Pending Requests', value: 0, subtitle: 'Awaiting approval', icon: '📝' },
    { title: 'Unread Notifications', value: 0, subtitle: 'New updates', icon: '🔔' },
  ];

  return (
    <div className="container" style={{ paddingTop: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="pageTitle">Dashboard</h1>
          <p className="subtle">{today} • {role}</p>
        </div>

        <div className="card" style={{ padding: 12, minWidth: 260 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Signed in as</div>
          <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{user?.email || '—'}</div>
        </div>
      </div>

      {/* Welcome */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              Welcome back{user?.email ? `, ${user.email}` : ''}!
            </div>
            <div className="subtle" style={{ marginTop: 4 }}>
              Here’s a quick overview of your schedule and requests.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="iconBtn"
              onClick={() => window.location.assign('/schedule')}
              title="Go to schedule"
            >
              View Schedule
            </button>
            <button
              type="button"
              className="iconBtn"
              onClick={() => window.location.assign('/reimbursements')}
              title="Go to reimbursements"
            >
              Reimbursements
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid4" style={{ marginTop: 16 }}>
        {stats.map((s) => (
          <div key={s.title} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>{s.title}</div>
                <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{s.value}</div>
                <div className="subtle" style={{ marginTop: 6 }}>{s.subtitle}</div>
              </div>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Lower sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Recent Shifts</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Preview</div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="subtle">No shifts assigned yet.</div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Requests</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Preview</div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="subtle">No pending requests.</div>
          </div>
        </div>
      </div>

      {/* Mobile: stack the bottom two cards */}
      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
