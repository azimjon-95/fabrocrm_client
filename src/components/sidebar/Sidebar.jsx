import React, { useState } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { MdLogout, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { menuItems } from "../../utils/SidebarMenu";
import mebelxLogo from "../../assets/shoxMebelLogo.png";

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
        ["token", "role", "admin"].forEach(item => localStorage.removeItem(item));
        navigate("/login");
      },
    });
  };

  const [openMenus, setOpenMenus] = useState({});
  const toggleMenu = (label) => setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside>
      <div className="sidebar_logo">
        <img src={mebelxLogo} alt="" />
      </div>
      {/* <div className="sidebar_logo">
        <img src={mebelxLogo} alt="" />
        <i>Avtomatlashtirish - kelajak bugun</i>
      </div> */}
      <div className="sidebar_links">
        {menuItems[role]?.map((item) => (
          item.children ? (
            <div key={item.label} className="sidebar_menu">
              <button onClick={() => toggleMenu(item.label)} className="sidebar_menu_button">
                <span>{item.icon} {item.label}</span>
                {openMenus[item.label] ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </button>
              {openMenus[item.label] && (
                <div className="sidebar_submenu">
                  {item.children.map((subItem) => (
                    <NavLink key={subItem.path} to={subItem.path} className="sidebar_submenu_item">
                      {subItem.icon} <span>{subItem.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink key={item.path} to={item.path} className="sidebar_menu_item">
              {item.icon} <span>{item.label}</span>
            </NavLink>
          )
        ))}
        <div className="sidebar_logout_container">
          <button onClick={logOut}>
            Tizimdan chiqish <MdLogout />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
