import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      <div className="absolute top-8 left-8">
        <h1 className="text-2xl font-bold text-gray-800">
          ABC Restaurant HCM
        </h1>
        <p className="text-sm text-gray-600 mt-1">Simple scheduling & HR tools</p>
      </div>

      {/* Centered auth content */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <Outlet />
        </div>
      </div>

      <footer className="absolute bottom-4 w-full text-center text-sm text-gray-600">
        © 2026 ABC Restaurant HCM. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
