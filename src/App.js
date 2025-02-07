import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";
import Layout from "./components/layout/Layout";
import { routes } from "./routes/Route";
import Login from "./components/login/Login";

const App = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const maxW = window.innerWidth;
      const maxH = window.innerHeight;

      if (role !== "director" && (maxW < maxH)) {
        setShowMessage(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [role, navigate]);

  return (
    <>
      {showMessage ? (
        <div className="checkScreenSize"
        >
          <p>Sizga ushbu dasturga faqat kompyuterdan kirish ruxsat etilgan!</p>
        </div>
      ) : (
        <Routes>
          <Route element={<Layout />}>
            {routes.map(({ path, element, private: isPrivate, role }) => (
              <Route
                key={path}
                path={path}
                element={
                  isPrivate ? (
                    <PrivateRoute role={role}>{element}</PrivateRoute>
                  ) : (
                    element
                  )
                }
              />
            ))}
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
    </>
  );
};

export default App;
