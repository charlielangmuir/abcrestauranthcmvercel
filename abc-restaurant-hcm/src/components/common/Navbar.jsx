import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [openNotif, setOpenNotif] = useState(false);

  // Ref for notification wrapper (bell + popout)
  const notifRef = useRef(null);

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

  // --- Dummy notifications for UI demo ---
  const dummyNotifications = [
    {
      id: 1,
      title: "New Schedule Posted",
      message: "Your shift for next week is now available.",
      sent_at: new Date(Date.now() - 1000 * 60 * 10)
    },
    {
      id: 2,
      title: "Manager Update",
      message: "Please review the updated kitchen procedures.",
      sent_at: new Date(Date.now() - 1000 * 60 * 60)
    },
    {
      id: 3,
      title: "System Notice",
      message: "Maintenance scheduled for tonight at 2 AM.",
      sent_at: new Date(Date.now() - 1000 * 60 * 90)
    }
  ];

  const timeSince = (date) => {
    const diff = (Date.now() - date.getTime()) / 1000;
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
            >
              <i className="fa-solid fa-bell" style={{ fontSize: '16px' }}></i>
            </div>

            {openNotif && (
              <div className="notifList">
                {dummyNotifications.length === 0 ? (
                  <div className="emptyNotif">No notifications</div>
                ) : (
                  dummyNotifications.slice(0, 5).map((n, idx) => (
                    <div key={n.id}>
                      <div className="notifItem">
                        <div className="notifTitle">{n.title}</div>
                        <div className="notifMsg">{n.message}</div>
                        <div className="notifTime">{timeSince(n.sent_at)}</div>
                      </div>
                      {idx < dummyNotifications.length - 1 && (
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