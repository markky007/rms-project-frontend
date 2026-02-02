import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }

  // Render the protected content if token exists
  return <>{children}</>;
}
