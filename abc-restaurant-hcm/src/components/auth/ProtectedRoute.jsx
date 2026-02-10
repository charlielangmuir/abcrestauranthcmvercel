import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  //make sure the user has the required role
  if (allowedRoles && !allowedRoles.includes(user.user_metadata.role)) {
    console.log('Access denied:', user.user_metadata.role, 'not in', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;