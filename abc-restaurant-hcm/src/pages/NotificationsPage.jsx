// NotificationsPage.jsx
import { useEffect, useState } from 'react';
import { notificationService } from '../api/notificationService';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications for logged-in user
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAllByUser(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user]);

  // Mark as read
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

  return (
    <div className="container" style={{ paddingTop: 10 }}>
      <div className="notificationsHeader">
        <div>
          <h1 className="notificationsTitle">Notifications</h1>
          <p className="notificationsSubtle">Your latest alerts and reminders</p>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="notificationsCard notificationsEmpty">No notifications</div>
      ) : (
        <div className="notificationsCard">
          {notifications.map((notif, idx) => (
            <div key={notif.notification_id} className="notifItem">
              <div className="notifTitle">{notif.title}</div>
              <div className="notifMsg">{notif.message}</div>
              <div className="notifTime">
                {new Date(notif.created_at).toLocaleString()}
              </div>
              {!notif.is_read && (
                <button
                  className="btnDanger"
                  onClick={() => handleMarkAsRead(notif.notification_id)}
                  style={{ marginTop: 6 }}
                >
                  Mark as Read
                </button>
              )}
              {idx !== notifications.length - 1 && <div className="notifDivider"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;