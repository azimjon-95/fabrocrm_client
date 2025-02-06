import React, { useState } from 'react';
import './style.css'; // Stil faylini import qilamiz
import { FaEye, FaMoneyBillWave, FaCheck } from 'react-icons/fa';
import { Button } from 'antd';
import { useNavigate } from "react-router-dom";
import ExpenseRegister from './ExpenseRegister';

const AccountentMain = () => {
    const navigate = useNavigate();
    // O'zbekcha oy nomlari
    const uzMonths = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ];

    // Buyurtmalar ro'yxati
    const [orders, setOrders] = useState([
        {
            id: 1,
            name: "Divan",
            budget: 2000000,
            paid: 1000000,
            date: "2024-02-01",
            estimatedDays: 10,
            dimensions: { length: 200, width: 80, height: 90 }, // Mebel o‘lchamlari (sm)
            image: "https://example.com/divan.jpg", // Mebel rasmi
            customer: {
                type: "Jismoniy shaxs",
                fullName: "Aliyev Sanjar",
                phone: "+99890 123 45 67",
            },
            paymentType: "Naqd", // To‘lov turi
            materials: [
                { name: "Yog'och", quantity: 10, price: 50000 },
                { name: "Mato", quantity: 5, price: 20000 },
                { name: "Pompa", quantity: 2, price: 30000 },
                { name: "Shum", quantity: 2, price: 15000 },
                { name: "Samaras", quantity: 1, price: 50000 },
                { name: "Ugol", quantity: 3, price: 70000 },
            ],
        },
        {
            id: 2,
            name: "Ofis stoli",
            budget: 5000000,
            paid: 2000000,
            date: "2024-05-10",
            estimatedDays: 15,
            dimensions: { length: 150, width: 70, height: 75 },
            image: "https://example.com/office-table.jpg",
            customer: {
                type: "Yuridik shaxs",
                companyName: "IT Solutions LLC",
                manager: { fullName: "Muhammadov Anvar", position: "Bosh menejer" },
                director: "Shodmonov Akmal",
                address: "Toshkent sh., Amir Temur ko'chasi, 12",
                phone: "+99894 567 89 01",
            },
            paymentType: "Karta orqali",
            materials: [
                { name: "Yog'och", quantity: 8, price: 40000 },
                { name: "Metall", quantity: 3, price: 100000 },
                { name: "Shum", quantity: 1, price: 10000 },
                { name: "Samaras", quantity: 2, price: 40000 },
                { name: "Ugol", quantity: 2, price: 50000 },
            ],
        },
        {
            id: 3,
            name: "Uy mebeli",
            budget: 7500000,
            paid: 5000000,
            date: "2024-06-01",
            estimatedDays: 20,
            dimensions: { length: 250, width: 100, height: 180 },
            image: "https://example.com/home-furniture.jpg",
            customer: {
                type: "Jismoniy shaxs",
                fullName: "Tursunov Erkin",
                phone: "+99890 112 22 33",
            },
            paymentType: "Bank orqali",
            materials: [
                { name: "Metall", quantity: 30, price: 150000 },
                { name: "Yog'och", quantity: 40, price: 70000 },
                { name: "Plastik", quantity: 15, price: 25000 },
                { name: "Shum", quantity: 5, price: 20000 },
                { name: "Samaras", quantity: 10, price: 60000 },
                { name: "Ugol", quantity: 20, price: 80000 },
            ],
        },
        {
            id: 4,
            name: "Kreslo",
            budget: 3000000,
            paid: 1000000,
            date: "2024-04-27",
            estimatedDays: 12,
            dimensions: { length: 90, width: 80, height: 100 },
            image: "https://example.com/kreslo.jpg",
            customer: {
                type: "Jismoniy shaxs",
                fullName: "Shodmonova Nargiza",
                phone: "+99893 345 67 89",
            },
            paymentType: "Karta orqali",
            materials: [
                { name: "Mato", quantity: 6, price: 25000 },
                { name: "Yog'och", quantity: 4, price: 60000 },
                { name: "Pompa", quantity: 1, price: 15000 },
                { name: "Shum", quantity: 3, price: 20000 },
                { name: "Samaras", quantity: 2, price: 60000 },
                { name: "Ugol", quantity: 4, price: 80000 },
            ],
        },
        {
            id: 5,
            name: "Kuchli ofis mebellari",
            budget: 12000000,
            paid: 5000000,
            date: "2024-07-01",
            estimatedDays: 30,
            dimensions: { length: 300, width: 150, height: 200 },
            image: "https://example.com/office-furniture.jpg",
            customer: {
                type: "Yuridik shaxs",
                companyName: "MegaTech Corp",
                manager: { fullName: "Raxmonov Bekzod", position: "Bosh hisobchi" },
                director: "Rustamov Alisher",
                address: "Samarqand sh., Ibn Sino ko'chasi, 45",
                phone: "+99897 654 32 10",
            },
            paymentType: "Bank orqali",
            materials: [
                { name: "Metall", quantity: 30, price: 150000 },
                { name: "Yog'och", quantity: 40, price: 70000 },
                { name: "Plastik", quantity: 15, price: 25000 },
            ],
        },
        {
            id: 4,
            name: "Kreslo",
            budget: 3000000,
            paid: 1000000,
            date: "2024-04-27",
            estimatedDays: 12,
            dimensions: { length: 90, width: 80, height: 100 },
            image: "https://example.com/kreslo.jpg",
            customer: {
                type: "Jismoniy shaxs",
                fullName: "Shodmonova Nargiza",
                phone: "+99893 345 67 89",
            },
            paymentType: "Karta orqali",
            materials: [
                { name: "Mato", quantity: 6, price: 25000 },
                { name: "Yog'och", quantity: 4, price: 60000 },
                { name: "Pompa", quantity: 1, price: 15000 },
                { name: "Shum", quantity: 3, price: 20000 },
                { name: "Samaras", quantity: 2, price: 60000 },
                { name: "Ugol", quantity: 4, price: 80000 },
            ],
        },
        {
            id: 5,
            name: "Kuchli ofis mebellari",
            budget: 12000000,
            paid: 5000000,
            date: "2024-07-01",
            estimatedDays: 30,
            dimensions: { length: 300, width: 150, height: 200 },
            image: "https://example.com/office-furniture.jpg",
            customer: {
                type: "Yuridik shaxs",
                companyName: "MegaTech Corp",
                manager: { fullName: "Raxmonov Bekzod", position: "Bosh hisobchi" },
                director: "Rustamov Alisher",
                address: "Samarqand sh., Ibn Sino ko'chasi, 45",
                phone: "+99897 654 32 10",
            },
            paymentType: "Bank orqali",
            materials: [
                { name: "Metall", quantity: 30, price: 150000 },
                { name: "Yog'och", quantity: 40, price: 70000 },
                { name: "Plastik", quantity: 15, price: 25000 },
            ],
        },
    ]);


    const [paymentAmount, setPaymentAmount] = useState({});

    // To'lov qilish funksiyasi
    const handlePayment = (orderId) => {
        const amount = parseInt(paymentAmount[orderId]) || 0;
        if (amount > 0) {
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId
                        ? { ...order, paid: order.paid + amount }
                        : order
                )
            );
            setPaymentAmount((prev) => ({ ...prev, [orderId]: "" }));
        }
    };

    // Sana formatini o'zbek tiliga o'tkazish
    const formatDate = (dateStr) => {
        const dateObj = new Date(dateStr);
        const day = dateObj.getDate();
        const month = uzMonths[dateObj.getMonth()];
        return `${day}-${month}`;
    };

    return (
        <div className="accountent-container">
            {/* Yuqori qismdagi kartalar */}
            <div className="cards-container">
                <div className="card income">
                    <h3>Daromad</h3>
                    <p>10,000,000 so'm</p>
                </div>
                <div className="card expense">
                    <h3>Xarajatlar</h3>
                    <p>4,000,000 so'm</p>
                </div>
                <div className="card balance">
                    <h3>Balans</h3>
                    <p>6,000,000 so'm</p>
                </div>
                <div className="card debt">
                    <h3>Qarz</h3>
                    <p>2,000,000 so'm</p>
                </div>
            </div>

            {/* Pastki qismdagi qutilar */}
            <div className="boxes-container">
                <ExpenseRegister />
                <div className="box new-orders">
                    <h3>Buyurtmalar</h3>
                    <ul>
                        {orders.map((order, inx) => (
                            <li key={inx} className="order-item">
                                <div className="order-info">
                                    <div>
                                        <span className="order-name">{inx + 1}) {order.name}</span>
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
                                                type="string"
                                                placeholder="To'lov miqdori"
                                                value={paymentAmount[order.id] || ""}
                                                onChange={(e) =>
                                                    setPaymentAmount({
                                                        ...paymentAmount,
                                                        [order.id]: e.target.value,
                                                    })
                                                }
                                            />
                                            <Button
                                                type="primary"
                                                icon={<FaCheck />}
                                                onClick={() => handlePayment(order.id)}
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
                </div>
            </div>
        </div>
    );
};

export default AccountentMain;




