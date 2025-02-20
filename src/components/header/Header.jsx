import React from "react";
import "./Header.css";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";

const { confirm } = Modal;

function Header() {
  const navigate = useNavigate();

  const adminFullname = localStorage.getItem("admin_fullname");
  const logOut = () => {
    confirm({
      title: "Tizimdan chiqmoqchimisiz?",
      okText: "Ha",
      okType: "danger",
      cancelText: "Yo'q",
      onOk() {
        ["token", "role", "admin"].forEach(item => localStorage.removeItem(item));
        navigate("/login");
      },
    });
  };
  return (
    <header>
      <h4>{adminFullname}</h4>
      {/* <FaUserCircle /> */}
      <button onClick={logOut}>
        <RiLogoutCircleRLine />
      </button>
    </header>
  );
}

export default Header;
