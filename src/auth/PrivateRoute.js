import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const userRole = localStorage.getItem("role");

  // Agar foydalanuvchi tizimga kirmagan bo'lsa, login sahifasiga yo'naltiramiz
  if (!userRole) return <Navigate to="/login" />;

  // Agar role berilgan bo'lsa va foydalanuvchi roli ruxsat etilgan ro‘llar orasida bo‘lmasa, login sahifasiga yo'naltiramiz
  if (role && !role.includes(userRole)) return <Navigate to="/login" />;

  return children;
};

export default PrivateRoute;
