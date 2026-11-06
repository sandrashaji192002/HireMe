import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
