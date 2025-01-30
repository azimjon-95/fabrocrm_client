import React from "react";
import "./Sidebar.css";
import { Link, NavLink } from "react-router-dom";
import { IoGrid } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
const { confirm } = Modal;

function Sidebar() {
  const navigate = useNavigate();
  const sidebar_links = [
    {
      id: 1,
      path: "/dashboard",
      label: "Dashboard",
      icon: <IoGrid />,
    },
    {
      id: 2,
      path: "/accountant",
      label: "Buxgalter",
      icon: <IoGrid />,
    },
    {
      id: 3,
      path: "/manager",
      label: "Meneger",
      icon: <IoGrid />,
    },
    {
      id: 4,
      path: "/director",
      label: "Direktor",
      icon: <IoGrid />,
    },
    {
      id: 4,
      path: "/director",
      label: "Direktor",
      icon: <IoGrid />,
    },
    {
      id: 4,
      path: "/director",
      label: "Direktor",
      icon: <IoGrid />,
    },
    {
      id: 4,
      path: "/director",
      label: "Direktor",
      icon: <IoGrid />,
    },
    {
      id: 4,
      path: "/director",
      label: "Direktor",
      icon: <IoGrid />,
    },
  ];

  const logOut = () => {
    confirm({
      title: "Tizimdan chiqmoqchimisiz?",
      okText: "Ha",
      okType: "danger",
      cancelText: "Yo'q",
      onOk() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      },
      onCancel() {},
    });
  };

  return (
    <aside>
      <div className="sidebar_logo">
        <Link>MebelX</Link>
      </div>
      <div className="sidebar_links">
        {sidebar_links.map((item) => (
          <NavLink key={item.id} to={item.path}>
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
