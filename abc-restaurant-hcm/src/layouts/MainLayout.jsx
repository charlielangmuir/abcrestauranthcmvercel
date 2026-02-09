
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/schedule', icon: '📅', label: 'Schedule' },
      { path: '/reimbursements', icon: '💰', label: 'Reimbursements' },
      { path: '/profile', icon: '👤', label: 'Profile' },
    ];

    const role = user?.user_metadata?.role || 'EMPLOYEE';
    
    if (role === 'MANAGER' || role === 'ADMIN') {
      baseItems.splice(2, 0, { 
        path: '/employees', 
        icon: '👥', 
        label: 'Employees' 
      });
    }
    
    if (role === 'MANAGER' || role === 'FINANCE' || role === 'ADMIN') {
      baseItems.splice(3, 0, { 
        path: '/payroll', 
        icon: '💵', 
        label: 'Payroll' 
      });
    }

    return baseItems;
  };

  const navItems = getNavigationItems();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-xl font-bold text-gray-900">
                ABC Restaurant HCM
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-right">
                <p className="text-gray-900 font-medium">{user?.email}</p>
                <p className="text-gray-500 text-xs">
                  {user?.user_metadata?.role || 'Employee'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r border-gray-200 min-h-screen transition-all duration-300 overflow-hidden`}
        >
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  } group flex items-center px-3 py-2 text-sm font-medium transition-colors`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;