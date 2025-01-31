import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";
import Layout from "./components/layout/Layout";
import { routes } from "./routes/Route";

const App = () => {
  return (
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
    </Routes>
  );
};

export default App;
