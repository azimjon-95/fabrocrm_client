import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { FaEye } from "react-icons/fa";
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
  const { data: debtData } = useGetDebtQuery();
  const [createExpense] = useCreateExpenseMutation();
  const [updateBalance] = useUpdateBalanceMutation();
  const { data: balance, isFetching } = useGetBalanceQuery();
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
              {zakazlar
                ?.filter((i) => i.isType === true)
                ?.map((order, index) => (
                  <li key={index} className="order-item">
                    <div className="order-info">
                      <div>
                        {index + 1}){" "}
                        {order?.orders?.map((item, idx) => (
                          <span
                            key={idx}
                            style={{ color: "#0A3D3A" }}
                            className="order-name"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                      <div className="order-box order-box_one">
                        <div>
                          <span className="order-budget">
                            Mijoz turi: {order.customer?.type}
                          </span>
                        </div>

                        <div>
                          <span className="order-budget">
                            Byudjet:{" "}
                            {order?.orders
                              ?.reduce(
                                (total, item) => total + (item.budget || 0),
                                0
                              )
                              .toLocaleString()}{" "}
                            so'm
                          </span>
                        </div>
                      </div>
                      <div className="order-box">
                        <div>
                          <span className="order-budget">
                            {formatDate(order.date)}
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
                      <FaEye
                        style={{ color: "#0A3D3A" }}
                        className="eye-icon"
                        onClick={() =>
                          navigate(`/order/${order._id}`, { state: { order } })
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
