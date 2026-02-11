import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../api/dashboardService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingShifts: 0,
    hoursThisWeek: 0,
    pendingRequests: 0,
    unreadNotifications: 0,
    recentShifts: [],
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getEmployeeStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Upcoming Shifts', 
      value: loading ? '...' : stats.upcomingShifts, 
      subtitle: 'Next 7 days', 
      icon: <FontAwesomeIcon icon="fa-solid fa-calendar" /> 
    },
    { 
      title: 'Hours This Week', 
      value: loading ? '...' : stats.hoursThisWeek, 
      subtitle: 'Mon–Sun', 
      icon: <FontAwesomeIcon icon="fa-solid fa-clock" /> 
    },
    { 
      title: 'Pending Requests', 
      value: loading ? '...' : stats.pendingRequests, 
      subtitle: 'Awaiting approval', 
      icon: <FontAwesomeIcon icon="fa-solid fa-file-alt" /> 
    },
    { 
      title: 'Unread Notifications', 
      value: loading ? '...' : stats.unreadNotifications, 
      subtitle: 'New updates', 
      icon: <FontAwesomeIcon icon="fa-solid fa-bell" /> 
    },
  ];

  const formatShiftDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5);
  };

  return (
    <div className="container" style={{ paddingTop: 10 }}>
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

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              Welcome back{user?.email ? `, ${user.email}` : ''}!
            </div>
            <div className="subtle" style={{ marginTop: 4 }}>
              Here's a quick overview of your schedule and requests.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="iconBtn"
              onClick={() => window.location.assign('/view-schedule')}
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

      <div className="grid4" style={{ marginTop: 16 }}>
        {statCards.map((s) => (
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Recent Shifts</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>This Week</div>
          </div>

          <div style={{ marginTop: 10 }}>
            {loading ? (
              <div className="subtle">Loading shifts...</div>
            ) : stats.recentShifts && stats.recentShifts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.recentShifts.map((shift) => (
                  <div
                    key={shift.shift_id}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid var(--border, #ddd)',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {formatShiftDate(shift.shift_date)}
                      </div>
                      <div className="subtle" style={{ fontSize: 12, marginTop: 2 }}>
                        {shift.position || 'Shift'}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
                      {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="subtle">No shifts assigned yet.</div>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Requests</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Pending</div>
          </div>

          <div style={{ marginTop: 10 }}>
            {loading ? (
              <div className="subtle">Loading requests...</div>
            ) : stats.pendingRequests > 0 ? (
              <div style={{ 
                padding: '12px', 
                background: 'var(--primary-bg, #eff6ff)', 
                borderRadius: 6,
                border: '1px solid var(--primary, #2563eb)'
              }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {stats.pendingRequests} pending request{stats.pendingRequests !== 1 ? 's' : ''}
                </div>
                <div className="subtle" style={{ fontSize: 12, marginTop: 4 }}>
                  Awaiting manager approval
                </div>
              </div>
            ) : (
              <div className="subtle">No pending requests.</div>
            )}
          </div>
        </div>
      </div>

      {/* media rules :) */}
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