import React, { useEffect, useRef, useState } from "react";
import "./style.css"; // Stil faylini import qilamiz
import { FaEye, FaCheck } from "react-icons/fa";
import { Button, message, Select, Spin } from "antd";
import {
  useGetExpensesByPeriodQuery,
  useCreateExpenseMutation,
  useGetBalanceReportQuery,
} from "../../../context/service/expensesApi";
import {
  useUpdateBalanceMutation,
  useGetBalanceQuery,
} from "../../../context/service/balanceApi";
import { useNavigate } from "react-router-dom";
import ExpenseRegister from "./ExpenseRegister";
import MainCards from "./MainCards";
import {
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useGetDebtQuery,
} from "../../../context/service/orderApi";
import moment from "moment"; // For handling date formatting
import socket from "../../../socket";

const AccountentMain = () => {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const {
    data: ordersData,
    isLoading,
    refetch: refetchOrders,
  } = useGetOrdersQuery();
  const [updateOrder] = useUpdateOrderMutation();
  const [inputValues, setInputValues] = useState({}); // Har bir order uchun input qiymati
  const [selectValues, setSelectValues] = useState({}); // Har bir order uchun input qiymati
  const { data: debtData } = useGetDebtQuery();
  const [createExpense] = useCreateExpenseMutation();
  const [updateBalance] = useUpdateBalanceMutation();
  const { data: balance, isFetching } = useGetBalanceQuery();
  const [activeBox, setActiveBox] = useState(false);
  const [open, setOpen] = useState(false);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const endOfMonthToday = today; // Bugungi sana

  const [selectedDates, setSelectedDates] = useState([
    startOfMonth,
    endOfMonth,
  ]);
  const { data: expenses, refetch } = useGetExpensesByPeriodQuery(
    {
      startDate: selectedDates.length
        ? moment(selectedDates[0]).format("YYYYMMDD")
        : undefined,
      endDate: selectedDates.length
        ? moment(selectedDates[1]).format("YYYYMMDD")
        : undefined,
    },
    { skip: !selectedDates.length }
  );
  useEffect(() => {
    const handleNewExpense = (data) => refetch();
    const handleNewOrder = (data) => refetchOrders();

    socket.on("newExpense", handleNewExpense);
    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("newExpense", handleNewExpense);
      socket.off("newOrder", handleNewOrder);
    };
  }, [socket, refetch, refetchOrders]);

  const [selectedReportDates, setSelectedReportDates] = useState([
    startOfMonth,
    endOfMonthToday,
  ]);
  const { data: balanceReport } = useGetBalanceReportQuery(
    {
      startDate: selectedReportDates.length
        ? moment(selectedReportDates[0]).format("YYYYMMDD")
        : undefined,
      endDate: selectedReportDates.length
        ? moment(selectedReportDates[1]).format("YYYYMMDD")
        : undefined,
    },
    { skip: !selectedReportDates.length }
  );

  // O'zbekcha oy nomlari
  const uzMonths = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];

  // Sana formatini o'zbek tiliga o'tkazish
  const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr);
    return `${dateObj.getDate()}-${uzMonths[dateObj.getMonth()]}`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString("uz-UZ").replace(/,/g, " ");
  };

  const handlePayment = async (orderId, currentPaid) => {
    const amount = parseInt(inputValues[orderId]) || 0;
    const paymentType = selectValues[orderId] || 0;
    if (amount > 0) {
      const formData = {
        name: "Buyurtma to‘lov", // qisqa va loʻnda nom
        amount: Number(amount), // raqam sifatida uzatilishi
        type: "Kirim", // Enum ichidagi qiymat: "Kirim" yoki "Chiqim"
        category: "Mijoz to‘lovlari", // Enum ichidagi qiymat
        description: "Buyurtma uchun to‘lov amalga oshirildi",
        paymentType: paymentType, // "Naqd", "Karta orqali" yoki "Bank orqali"
      };
      try {
        const response = await updateOrder({
          id: orderId,
          updates: {
            paid: currentPaid + amount,
            paidAt: new Date().toISOString(), // Hozirgi vaqtni yuborish
          },
        }).unwrap();
        const res = await createExpense(formData).unwrap();

        // Balansni yangilash
        const balanceRes = await updateBalance({
          amount: amount,
          type: "add", // Balansga qo‘shish
        }).unwrap();

        if (response?.state && res?.state && balanceRes?.state) {
          message.success("To'lov muvaffaqiyatli bajarildi!"); // AntD success xabari
          setInputValues((prev) => ({ ...prev, [orderId]: "" })); // Faqat shu order uchun inputni tozalash
          setSelectValues((prev) => ({ ...prev, [orderId]: "" }));
        }
      } catch (error) {
        message.error("To'lovni amalga oshirishda xatolik!"); // Xatolik bo'lsa xabar chiqarish
        console.error(error);
      }
    } else {
      message.warning("To'lov miqdorini kiriting!"); // 0 yoki noto‘g‘ri qiymat kiritilganda
    }
  };

  const paymentTypeControl = [
    { label: "Naqd", value: "Naqd" },
    { label: "Karta orqali", value: "Karta orqali" },
    { label: "Bank orqali", value: "Bank orqali" },
  ];

  const cardRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const updateDimensions = () => {
      const { width, height } = card.getBoundingClientRect(); // Element hajmini olish
      setDimensions({ width, height });
    };

    // ResizeObserver bilan element hajmini kuzatish
    const resizeObserver = new ResizeObserver(() => updateDimensions());
    resizeObserver.observe(card);

    updateDimensions(); // Dastlab hajmini olish

    return () => resizeObserver.disconnect(); // Tozalash
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  let zakazlar = ordersData?.innerData || [];
  console.log(zakazlar);
  return (
    <div className="accountent-container">
      {/* Yuqori qismdagi kartalar */}
      <MainCards
        expenses={expenses}
        balanceReport={balanceReport}
        selectedReportDates={selectedReportDates}
        setSelectedReportDates={setSelectedReportDates}
      />

      {/* Pastki qismdagi qutilar */}
      <div className="boxes-container">
        <ExpenseRegister
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          expenses={expenses}
        />

        <div className="box new-orders">
          <h3 style={{ color: "#0A3D3A" }}>Buyurtmalar</h3>
          {isLoading ? (
            <p>Yuklanmoqda...</p>
          ) : (
            <ul>
              {zakazlar?.map((order, index) => (
                <li key={index} className="order-item">
                  <div className="order-info">
                    <div>
                      <span style={{ color: "#0A3D3A" }} className="order-name">
                        {index + 1}) {order.name}
                      </span>
                      <span className="order-budget">
                        {formatDate(order.date)}
                      </span>
                    </div>
                    <div className="order-box order-box_one">
                      <div>
                        <span className="order-budget">
                          Mijoz turi: {order.customer?.type}
                        </span>
                      </div>
                      <div>
                        <Select
                          size="small"
                          placeholder="Tulov turi tanlang"
                          value={selectValues[order._id] || undefined}
                          onChange={(value) =>
                            setSelectValues((prev) => ({
                              ...prev,
                              [order._id]: value,
                            }))
                          }
                          allowClear
                        >
                          {paymentTypeControl.map(({ value, label }) => (
                            <Select.Option key={value} value={value}>
                              {label}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <div className="order-box">
                      <div>
                        <span className="order-budget">
                          Byudjet: {order.budget.toLocaleString()} so'm
                        </span>
                      </div>
                      <div>
                        <span className="order-budget">
                          To'langan: {order.paid.toLocaleString()} so'm
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="order-actions">
                    {order.paid < order.budget ? (
                      <div className="payment-input">
                        <input
                          type="number"
                          placeholder="To'lov miqdori"
                          value={inputValues[order._id] || ""}
                          onChange={(e) =>
                            setInputValues((prev) => ({
                              ...prev,
                              [order._id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          type="primary"
                          icon={<FaCheck />}
                          onClick={() => handlePayment(order._id, order.paid)}
                          style={{ background: "#0A3D3A" }}
                        />
                      </div>
                    ) : (
                      <span className="fully-paid">To'langan</span>
                    )}
                    <FaEye
                      style={{ color: "#0A3D3A" }}
                      className="eye-icon"
                      onClick={() =>
                        navigate(`/order/${order.id}`, { state: { order } })
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountentMain;
