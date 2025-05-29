import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";
import Layout from "./components/layout/Layout";
import { routes } from "./routes/Route";
import Login from "./components/login/Login";
import { message } from "antd";
import api from "./api";
import noData from "./assets/noServer.png";

const App = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token"); // Check for token
  const [showMessage, setShowMessage] = useState(false);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const maxW = window.innerWidth;
      const maxH = window.innerHeight;

      if ((role !== "director" && role !== "distributor") && maxW < maxH) {
        setShowMessage(true);
      } else {
        setShowMessage(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [role]);

  // Server connection check
  const checkServerConnection = async () => {
    try {
      const res = await api.get("/ping", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        setServerError(false);
      }
    } catch (err) {
      setServerError(true);
      message.error(`Serverga ulanib bo‘lmadi. Iltimos, internetni yoki serverni tekshiring: ${err.message}.`);
    }
    // window.location.reload()
  };

  // Monitor internet connection and server status
  useEffect(() => {
    // Redirect to login if no token
    if (!token) {
      navigate("/login");
    }



    // Periodic server check every 30 seconds
    const interval = setInterval(() => {
      if (!navigator.onLine) {
        setServerError(true);
      }
    }, 30000);

    // Listen for online/offline events
    const handleOnline = () => {
      setServerError(false);

    };

    const handleOffline = () => {
      setServerError(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [token, navigate]);

  // Display error page if server is down
  if (serverError && token) {
    return (
      <div className="error-container">
        <img src={noData} alt="Server down" className="error-image" />
        <button onClick={checkServerConnection} className="retry-button">
          Qayta urinish
        </button>
      </div>
    );
  }

  // Redirect to login if no token
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      {showMessage ? (
        <div className="checkScreenSize">
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