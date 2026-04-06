// NotificationsPage.jsx
import { useEffect, useState } from 'react';
import { notificationService } from '../api/notificationService';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAllByUser(user.id);
      const sorted = [...data].sort((a, b) => a.is_read - b.is_read);
      setNotifications(sorted);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? updated : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 10 }}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 10 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 className="pageTitle">Notifications</h1>
          <p className="subtle">Your latest alerts and reminders</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Total</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{notifications.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Unread</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8, color: unreadCount > 0 ? 'var(--primary)' : 'inherit' }}>
            {unreadCount}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Read</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{notifications.length - unreadCount}</div>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          No notifications
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.map((notif, idx) => (
            <div
              key={notif.notification_id}
              style={{
                padding: '16px 20px',
                borderBottom: idx !== notifications.length - 1 ? '1px solid var(--border)' : 'none',
                background: notif.is_read ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              {/* Left: dot + content */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>

                {/* Unread indicator dot */}
                <div style={{ paddingTop: 5 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: notif.is_read ? 'transparent' : 'var(--primary)',
                    border: notif.is_read ? '1.5px solid var(--border)' : 'none',
                    flexShrink: 0,
                  }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{notif.title}</span>
                    {!notif.is_read && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--primary)',
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>{notif.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {new Date(notif.sent_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Right: Mark as Read button */}
              {!notif.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(notif.notification_id)}
                  style={{
                    flexShrink: 0,
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;