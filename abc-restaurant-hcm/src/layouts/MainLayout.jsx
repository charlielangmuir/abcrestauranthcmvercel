import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemo, useState } from 'react';
import Navbar from '../components/common/Navbar';

const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Start closed so it behaves like a drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = (user?.user_metadata?.role || 'EMPLOYEE').toString().toUpperCase();

  const profilePath = {
  EMPLOYEE: '/employee-profile',
  MANAGER: '/manager-profile',
  FINANCE: '/manager-profile',
  ADMIN: '/manager-profile'
}[role];

  const navItems = useMemo(() => {
    const items = [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/schedule', icon: '📅', label: 'Schedule' },
      { path: '/reimbursements', icon: '💰', label: 'Reimbursements' },
      { path: profilePath, icon: '👤', label: 'Profile' },
    ];

    if (role === 'MANAGER' || role === 'ADMIN') {
      items.splice(2, 0, { path: '/employees', icon: '👥', label: 'Employees' });
    }

    if (role === 'MANAGER' || role === 'FINANCE' || role === 'ADMIN') {
      const insertIndex = role === 'MANAGER' || role === 'ADMIN' ? 3 : 2;
      items.splice(insertIndex, 0, { path: '/payroll', icon: '💵', label: 'Payroll' });
    }

    return items;
  }, [role]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="appShell">
      <Navbar toggleSidebar={() => setSidebarOpen((v) => !v)} />

      {/* Overlay (only shown when open on small screens) */}
      {sidebarOpen && <div className="sidebarOverlay" onClick={closeSidebar} />}

      <div className="shellBody">
        {/* Drawer sidebar */}
        <aside className={`sidebarDrawer ${sidebarOpen ? 'sidebarDrawerOpen' : ''}`}>
          <div className="sidebarHeader">
            <div style={{ fontWeight: 900 }}>Menu</div>
            <button type="button" className="closeBtn" onClick={closeSidebar} aria-label="Close menu">
              ✕
            </button>
          </div>

          <nav className="navList">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navLink ${isActive(item.path) ? 'navLinkActive' : ''}`}
                onClick={closeSidebar}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: 12, color: 'var(--muted)', fontSize: 12 }}>
            ABC Restaurant HCM
          </div>
        </aside>

        {/* Main content */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
