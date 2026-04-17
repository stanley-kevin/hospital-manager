import { Navigate } from 'react-router-dom';
import { AdminAuth } from '../services/adminApi';

/**
 * AdminProtectedRoute — Guards admin pages.
 * Checks localStorage for a valid adminToken; redirects to /admin-login if missing.
 */
export default function AdminProtectedRoute({ children }) {
    if (!AdminAuth.isLoggedIn()) {
        return <Navigate to="/admin-login" replace />;
    }
    return children;
}
