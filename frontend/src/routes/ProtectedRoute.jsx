import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { authContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const auth = useContext(authContext);
  const token = auth?.token;
  const role = auth?.role;

  const isAllowed = token && allowedRoles.includes(role);

  return isAllowed ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
