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
  const [clockLoading, setClockLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeClockEntry, setActiveClockEntry] = useState(null);
  const [lastClockOut, setLastClockOut] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('');

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
      fetchClockStatus();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isClockedIn || !activeClockEntry?.clock_in) {
      setElapsedTime('');
      return;
    }

    const updateElapsedTime = () => {
      const clockInTime = new Date(activeClockEntry.clock_in);
      const now = new Date();
      const diffMs = now - clockInTime;

      if (diffMs < 0) {
        setElapsedTime('0m');
        return;
      }

      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0) {
        setElapsedTime(`${hours}h ${minutes}m`);
      } else {
        setElapsedTime(`${minutes}m`);
      }
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 60000);

    return () => clearInterval(interval);
  }, [isClockedIn, activeClockEntry]);

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

  const fetchClockStatus = async () => {
    try {
      const data = await dashboardService.getClockStatus(user.id);
      setIsClockedIn(data.isClockedIn);
      setActiveClockEntry(data.activeEntry || null);
      setLastClockOut(data.lastClockOut || null);
    } catch (error) {
      console.error('Error fetching clock status:', error);
    }
  };

  const handleClockAction = async () => {
    try {
      setClockLoading(true);

      const result = isClockedIn
        ? await dashboardService.clockOut(user.id)
        : await dashboardService.clockIn(user.id);

      if (!result.success) {
        alert(result.message || 'Unable to complete action.');
        return;
      }

      await fetchClockStatus();
      await fetchDashboardData();
    } catch (error) {
      console.error('Error handling clock action:', error);
      alert('Something went wrong.');
    } finally {
      setClockLoading(false);
    }
  };

  const statCards = [
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

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    const date = new Date(dateTimeStr);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatTimeOnly = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="container" style={{ paddingTop: 10, maxWidth: 1200, margin: '0 auto' }}>
      <div>
        <h1 className="pageTitle">Dashboard</h1>
        <p className="subtle">{today} • {role}</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              Welcome back{user?.email ? `, ${user.email}` : ''}!
            </div>
            <div className="subtle" style={{ marginTop: 4 }}>
              Here's your schedule and attendance summary.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="iconBtn"
              onClick={() => window.location.assign(role === 'Admin' || role === 'Manager' ? '/schedule' : '/view-schedule')}
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

      <div className="card" style={{ marginTop: 12, padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 15, fontWeight: 900 }}>Attendance</div>
            <div className="subtle" style={{ marginTop: 3, fontSize: 13 }}>
              Track your work session.
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
              <div
                style={{
                  padding: '14px',
                  border: '1px solid var(--border, #ddd)',
                  borderRadius: 8,
                  background: isClockedIn ? 'var(--primary-bg, #eff6ff)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6, color: isClockedIn ? '#228B22' : '#666' }}>
                  {isClockedIn ? '● On Shift' : '◯ Off Shift'}
                </div>
                {isClockedIn && activeClockEntry?.clock_in && (
                  <div className="subtle" style={{ fontSize: 11, marginTop: 6 }}>
                    Started {formatDateTime(activeClockEntry.clock_in)}
                  </div>
                )}
                {!isClockedIn && lastClockOut && (
                  <div className="subtle" style={{ fontSize: 11, marginTop: 6 }}>
                    Last ended {formatTimeOnly(lastClockOut)}
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: '14px',
                  border: '1px solid var(--border, #ddd)',
                  borderRadius: 8,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Elapsed</div>
                <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6 }}>
                  {isClockedIn ? (elapsedTime || '—') : '—'}
                </div>
                <div className="subtle" style={{ fontSize: 11, marginTop: 6 }}>
                  {isClockedIn ? 'Time on shift' : 'Not active'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <button
              type="button"
              className="iconBtn"
              onClick={handleClockAction}
              title={isClockedIn ? 'End your current shift' : 'Start your shift'}
              disabled={clockLoading}
              style={{
                minHeight: 44,
                fontWeight: 800,
                background: isClockedIn ? '#dc2626' : '#228B22',
                color: 'white',
                border: 'none'
              }}
            >
              {clockLoading ? 'Processing...' : isClockedIn ? '⊠ End Shift' : '▶ Start Shift'}
            </button>

            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border, #ddd)',
                fontSize: 12,
                color: 'var(--muted)',
                background: 'var(--card-bg, transparent)',
              }}
            >
              {isClockedIn
                ? 'Active shift in progress'
                : 'No active shift'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid4" style={{ marginTop: 12, alignItems: 'stretch', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {statCards.map((s) => (
          <div key={s.title} className="card" style={{ minHeight: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flex: 1 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 16, alignItems: 'stretch' }}>
        <div className="card" style={{ height: '100%', minHeight: '220px', maxHeight: '220px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Recent Shifts</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Last 7 days</div>
          </div>

          <div style={{ marginTop: 10, flex: 1, overflowY: 'auto' }}>
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
              <div className="subtle">No recent shifts yet.</div>
            )}
          </div>
        </div>

        <div className="card" style={{ height: '100%', minHeight: '220px', maxHeight: '220px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Upcoming Shifts</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Next 7 days</div>
          </div>

          <div style={{ marginTop: 10, flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div className="subtle">Loading shifts...</div>
            ) : stats.upcomingShiftList && stats.upcomingShiftList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.upcomingShiftList.map((shift) => (
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
              <div className="subtle">No upcoming shifts in the next week.</div>
            )}
          </div>
        </div>

        <div className="card" style={{ height: '100%', minHeight: '220px', maxHeight: '220px', display: 'flex', flexDirection: 'column' }}>
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