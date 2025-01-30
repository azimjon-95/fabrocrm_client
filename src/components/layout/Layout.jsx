import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./Layout.css";
import { menuItems } from "../../utils/SidebarMenu";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";

function Layout() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  if (!role || !menuItems[role]) return navigate("/login");

  return (
    <div className="layout">
      <div className="layout_left">
        <Sidebar />
      </div>
      <div className="layout_right">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
