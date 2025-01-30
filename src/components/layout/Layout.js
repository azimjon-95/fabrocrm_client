import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./style.css";
import Navbar from "../navbar/Navbar";
import { menuItems } from '../../utils/SidebarMenu'

function Layout() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role"); // LocalStorage-dan rolni olish



    // Agar role mavjud bo'lmasa yoki noto'g'ri bo'lsa, login sahifasiga yuborish
    if (!role || !menuItems[role]) {
        navigate("/login");
        return null;
    }

    return (
        <div className="layout">
            <Navbar />
            <div className="container">
                <aside className="sidebar">
                    <ul>
                        {menuItems[role].map((item) => (
                            <li key={item.path}>
                                <Link to={item.path}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </aside>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
