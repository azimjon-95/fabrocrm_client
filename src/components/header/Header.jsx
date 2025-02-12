import React from "react";
import "./Header.css";
import { FaUserCircle } from "react-icons/fa";


function Header() {
  const adminFullname = localStorage.getItem("admin_fullname");

  return (
    <header>
      <h4>{adminFullname}</h4>
      {/* <FaUserCircle /> */}
    </header>
  );
}

export default Header;
