import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../api/supabaseClient';
import { useState, useEffect, useRef } from 'react';
import { notificationService } from '../../api/notificationService';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notifRef = useRef(null);

  useEffect(() => {
  if (!user?.id) return;

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAllByUser(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  fetchNotifications();

  const channel = supabase
  .channel(`user-notifications-${user.id}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${user.id}`
  }, (payload) => {
    setNotifications(prev => [payload.new, ...prev]);
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${user.id}`
  }, (payload) => {
    setNotifications(prev =>
      prev.map(n => n.notification_id === payload.new.notification_id ? payload.new : n)
    );
  })
  .subscribe();

  return () => supabase.removeChannel(channel);
}, [user?.id]);

  // --- Click Outside Handler ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setOpenNotif(false);
      }
    };

    if (openNotif) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openNotif]);

  const timeSince = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr + 'Z').getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
      console.error(error);
    }
  };

  const email = user?.email || 'User';
  const role = (user?.user_metadata?.role || 'Employee').toString();
  const initial = (email?.charAt(0) || 'U').toUpperCase();
  console.log('notifications:', notifications);
  const unreadCount = notifications.filter(n => n.is_read === false).length;
  return (
    <header className="topbar">
      <div className="topbarInner">
        <div className="brand">
          <button
            type="button"
            onClick={toggleSidebar}
            className="iconBtn"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            ☰
          </button>
          <span>ABC Restaurant HCM</span>
        </div>

        <div className="userBlock">

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{email}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{role}</div>
          </div>

          <div className="avatar" aria-label="User avatar">
            {initial}
          </div>

          {/* ================= NOTIFICATION WRAPPER ================= */}
          <div className="notifWrapper" ref={notifRef}>
          <div
            className="notifBell"
            onClick={() => setOpenNotif(!openNotif)}
            title="Notifications"
            style={{ position: 'relative' }}
          >
            <i className="fa-solid fa-bell" style={{ fontSize: '16px' }}></i>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--danger)',
                border: '1.5px solid white',
              }} />
            )}
          </div>

            {openNotif && (
              <div className="notifList">
                {notifications.length === 0 ? (
                  <div className="emptyNotif">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map((n, idx) => (
                    <div key={n.notification_id}>
                      <div className="notifItem">
                        <div className="notifTitle">{n.title}</div>
                        <div className="notifMsg">{n.message}</div>
                        <div className="notifTime">{timeSince(n.sent_at)}</div>
                      </div>
                      {idx < notifications.slice(0, 5).length - 1 && (
                        <div className="notifDivider"></div>
                      )}
                    </div>
                  ))
                )}
                <button
                  className="notifViewAll"
                  onClick={() => navigate('/notifications')}
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
          {/* ========================================================= */}

          <button type="button" onClick={handleLogout} className="btnDanger">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;