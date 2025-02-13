import React, { useState } from "react";
import "./style.css"; // Stil faylini import qilamiz
import { FaEye, FaCheck } from "react-icons/fa";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import ExpenseRegister from "./ExpenseRegister";
import { useGetOrdersQuery, useUpdateOrderMutation } from "../../../context/service/orderApi";

const AccountentMain = () => {
    const navigate = useNavigate();
    const { data: ordersData, isLoading } = useGetOrdersQuery();
    const [updateOrder] = useUpdateOrderMutation();

    // O'zbekcha oy nomlari
    const uzMonths = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];


    // Sana formatini o'zbek tiliga o'tkazish
    const formatDate = (dateStr) => {
        const dateObj = new Date(dateStr);
        return `${dateObj.getDate()}-${uzMonths[dateObj.getMonth()]}`;
    };

    const [inputValues, setInputValues] = useState({}); // Har bir order uchun input qiymati

    const handlePayment = async (orderId, currentPaid) => {
        const amount = parseInt(inputValues[orderId]) || 0;
        if (amount > 0) {
            try {
                const response = await updateOrder({
                    id: orderId,
                    updates: {
                        paid: currentPaid + amount,
                        paidAt: new Date().toISOString(), // Hozirgi vaqtni yuborish
                    }
                }).unwrap();

                if (response?.state) {
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


    return (
        <div className="accountent-container">
            {/* Yuqori qismdagi kartalar */}
            <div className="cards-container">
                <div className="card income"><h3>Daromad</h3><p>10,000,000 so'm</p></div>
                <div className="card expense"><h3>Xarajatlar</h3><p>4,000,000 so'm</p></div>
                <div className="card balance"><h3>Balans</h3><p>6,000,000 so'm</p></div>
                <div className="card debt"><h3>Qarz</h3><p>2,000,000 so'm</p></div>
            </div>

            {/* Pastki qismdagi qutilar */}
            <div className="boxes-container">
                <ExpenseRegister />
                <div className="box new-orders">
                    <h3>Buyurtmalar</h3>
                    {isLoading ? (
                        <p>Yuklanmoqda...</p>
                    ) : (
                        <ul>
                            {ordersData?.innerData?.map((order, index) => (
                                <li key={index} className="order-item">
                                    <div className="order-info">
                                        <div>
                                            <span className="order-name">{index + 1}) {order.name}</span>
                                            <span className="order-budget">{formatDate(order.date)}</span>
                                        </div>
                                        <div className="order-box order-box_one">
                                            <div>
                                                <span className="order-budget">Mijoz turi: {order.customer?.type}</span>
                                            </div>
                                            <div>
                                                <span className="order-budget">To'lov turi: {order.paymentType}</span>
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
                                                />
                                            </div>
                                        ) : (
                                            <span className="fully-paid">To'langan</span>
                                        )}
                                        <FaEye
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
