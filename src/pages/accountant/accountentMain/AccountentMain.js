import React, { useState } from "react";
import "./style.css"; // Stil faylini import qilamiz
import { FaEye, FaCheck } from "react-icons/fa";
import { Button, message, Select, } from "antd";
import { useGetExpensesByPeriodQuery, useCreateExpenseMutation } from "../../../context/service/expensesApi";
import { useNavigate } from "react-router-dom";
import ExpenseRegister from "./ExpenseRegister";
import { useGetOrdersQuery, useUpdateOrderMutation, useGetDebtQuery } from "../../../context/service/orderApi";
import moment from "moment"; // For handling date formatting

const AccountentMain = () => {
    const navigate = useNavigate();
    const { data: ordersData, isLoading } = useGetOrdersQuery();
    const [updateOrder] = useUpdateOrderMutation();
    const [inputValues, setInputValues] = useState({}); // Har bir order uchun input qiymati
    const [selectValues, setSelectValues] = useState({}); // Har bir order uchun input qiymati
    const { data: debtData } = useGetDebtQuery();
    const [createExpense] = useCreateExpenseMutation();


    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [selectedDates, setSelectedDates] = useState([startOfMonth, endOfMonth]);
    const { data: expenses } = useGetExpensesByPeriodQuery(
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

    // O'zbekcha oy nomlari
    const uzMonths = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];


    // Sana formatini o'zbek tiliga o'tkazish
    const formatDate = (dateStr) => {
        const dateObj = new Date(dateStr);
        return `${dateObj.getDate()}-${uzMonths[dateObj.getMonth()]}`;
    };


    const handlePayment = async (orderId, currentPaid) => {
        const amount = parseInt(inputValues[orderId]) || 0;
        const paymentType = selectValues[orderId] || 0;
        if (amount > 0) {

            const formData = {
                name: "Buyurtma to‘lov",                // qisqa va loʻnda nom
                amount: Number(amount),                // raqam sifatida uzatilishi
                type: "Kirim",                         // Enum ichidagi qiymat: "Kirim" yoki "Chiqim"
                category: "Mijoz to‘lovlari",           // Enum ichidagi qiymat
                description: "Buyurtma uchun to‘lov amalga oshirildi",
                paymentType: paymentType               // "Naqd", "Karta orqali" yoki "Bank orqali"
            };
            try {
                const response = await updateOrder({
                    id: orderId,
                    updates: {
                        paid: currentPaid + amount,
                        paidAt: new Date().toISOString(), // Hozirgi vaqtni yuborish
                    }
                }).unwrap();
                const res = await createExpense(formData).unwrap();

                if (response?.state && res?.state) {
                    message.success("To'lov muvaffaqiyatli bajarildi!"); // AntD success xabari
                    setInputValues((prev) => ({ ...prev, [orderId]: "" })); // Faqat shu order uchun inputni tozalash
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

    return (
        <div className="accountent-container">
            {/* Yuqori qismdagi kartalar */}
            <div className="cards-container">
                <div className="card income"><h3>Daromad</h3><p>10,000,000 so'm</p></div>
                <div className="card expense"><h3>Xarajatlar</h3><p>4,000,000 so'm</p></div>
                <div className="card balance"><h3>Balans</h3><p>6,000,000 so'm</p></div>
                <div className="card debt"><h3>Qarz</h3><p>{debtData?.innerData}</p></div>
            </div>

            {/* Pastki qismdagi qutilar */}
            <div className="boxes-container">
                <ExpenseRegister />
                <div className="box new-orders">
                    <h3 style={{ color: "#0A3D3A" }}>Buyurtmalar</h3>
                    {isLoading ? (
                        <p>Yuklanmoqda...</p>
                    ) : (
                        <ul>
                            {ordersData?.innerData?.map((order, index) => (
                                <li key={index} className="order-item">
                                    <div className="order-info">
                                        <div>
                                            <span style={{ color: "#0A3D3A" }} className="order-name">{index + 1}) {order.name}</span>
                                            <span className="order-budget">{formatDate(order.date)}</span>
                                        </div>
                                        <div className="order-box order-box_one">
                                            <div>
                                                <span className="order-budget">Mijoz turi: {order.customer?.type}</span>
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
                                        <FaEye style={{ color: "#0A3D3A" }}
                                            className="eye-icon"
                                            onClick={() => navigate(`/order/${order.id}`, { state: { order } })}
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
