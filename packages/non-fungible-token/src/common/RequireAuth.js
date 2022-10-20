import { Navigate, Outlet } from "react-router-dom";

function getAuth() {
  return localStorage.getItem("BIP_39_KEY");
}

export function RequireAuth({ children, redirectTo }) {
  let isAuthenticated = getAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} />;
}
