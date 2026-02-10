import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

          <button type="button" onClick={handleLogout} className="btnDanger">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
