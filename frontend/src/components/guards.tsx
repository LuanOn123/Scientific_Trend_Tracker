import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "../types";
import { useAuthStore } from "../stores/authStore";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export function RoleGuard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const hasRole = useAuthStore((state) => state.hasRole);
  return hasRole(roles) ? <>{children}</> : <Navigate to="/dashboard" replace />;
}
