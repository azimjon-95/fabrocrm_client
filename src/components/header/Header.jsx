import React, { useEffect, useState } from "react";
import "./Header.css";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Modal } from "antd";

const { confirm } = Modal;
function Header() {
  const navigate = useNavigate();
  const isDollar = useSelector((state) => state.boolean.isDollar);
  const [dollarRate, setDollarRate] = useState(null);

  // API orqali kursni olish (bu yerda kursni olish uchun masalan, yandex yoki boshqa manba ishlatiladi)
  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((response) => response.json())
      .then((data) => {
        setDollarRate(data.rates.UZS); // USD/UZS kursini oling
      })
      .catch((error) => console.error("API xatolik: ", error));
  }, []);

  const adminFullname = localStorage.getItem("admin_fullname");
  const logOut = () => {
    confirm({
      title: "Tizimdan chiqmoqchimisiz?",
      okText: "Ha",
      okType: "danger",
      cancelText: "Yo'q",
      onOk() {
        ["token", "role", "admin"].forEach((item) =>
          localStorage.removeItem(item)
        );
        navigate("/login");
      },
    });
  };
  return (
    <header>
      <h4>{adminFullname}</h4>
      {/* {
        isDollar && */}
      <div className="dollarRate">
        <p>O'zbekiston Milliy Banki</p>
        <p>1$ = {dollarRate?.toLocaleString("uz-UZ")} so'm</p>
      </div>
      {/* } */}
      <button onClick={logOut}>
        <RiLogoutCircleRLine />
      </button>
    </header>
  );
}

export default Header;
