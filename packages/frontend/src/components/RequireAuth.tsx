import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Layout from './Layout';

/**
 * Wraps Layout with auth check — redirects to /login if no token
 */
export default function RequireAuth() {
  const token = useAuthStore(s => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout />;
}
