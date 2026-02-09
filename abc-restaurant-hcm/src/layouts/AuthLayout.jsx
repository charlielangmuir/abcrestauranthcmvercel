import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="absolute top-8 left-8">
        <h1 className="text-2xl font-bold text-gray-800">
          ABC Restaurant HCM
        </h1>
      </div>

      <Outlet />

      <footer className="absolute bottom-4 w-full text-center text-sm text-gray-600">
        © 2026 ABC Restaurant HCM. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;