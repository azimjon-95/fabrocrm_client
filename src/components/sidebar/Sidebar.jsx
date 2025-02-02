import React from "react";
import "./Sidebar.css";
import { Link, NavLink } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { menuItems } from "../../utils/SidebarMenu";
const { confirm } = Modal;

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // LocalStorage-dan rolni olish

  const logOut = () => {
    confirm({
      title: "Tizimdan chiqmoqchimisiz?",
      okText: "Ha",
      okType: "danger",
      cancelText: "Yo'q",
      onOk() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("admin");
        navigate("/login");
      },
      onCancel() { },
    });
  };

  return (
    <aside>
      <div className="sidebar_logo">
        <Link>MebelX</Link>
      </div>
      <div className="sidebar_links">
        {menuItems[role]?.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        <div className="sidebar_logout_container">
          <button onClick={() => logOut()}>
            Tizimdan chiqish <MdLogout />{" "}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
