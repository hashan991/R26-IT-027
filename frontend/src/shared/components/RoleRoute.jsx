import { Navigate } from "react-router-dom";

import { useAuth } from "../../auth/context/AuthContext";

function RoleRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;
