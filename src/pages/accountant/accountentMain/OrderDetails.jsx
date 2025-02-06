import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./style.css";

const OrderDetails = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state || !state.order) {
        return <h2>Buyurtma topilmadi</h2>;
    }

    const {
        name,
        budget,
        paid,
        date,
        materials,
        estimatedDays,
        customer,
        dimensions,
        image,
        paymentType,
    } = state.order;

    // Jami narxni hisoblash
    const totalPrice = materials.reduce((sum, material) => sum + material.price * material.quantity, 0);

    return (
        <div className="order-details-page">
            <div className="order-details-page_box">
                <button onClick={() => navigate(-1)}>⬅ Orqaga</button>
                <div>
                    <h2>{name}</h2>
                </div>
            </div>

            <div className="order-details-page_box_owner-main">
                <div className="order-details-page_box_owner">
                    {/* Buyurtma ma'lumotlari */}
                    <p><strong>Byudjet:</strong> {budget.toLocaleString()} so'm</p>
                    <p><strong>To'langan:</strong> {paid.toLocaleString()} so'm</p>
                    <p><strong>Sarflanadigan mahsulotlar narxi:</strong> {totalPrice.toLocaleString()} so'm</p>
                    <p><strong>Sana:</strong> {date}</p>
                    <p><strong>Taxminiy tayyor bo'lish muddati:</strong> {estimatedDays} kun</p>
                    <p><strong>To'lov turi:</strong> {paymentType}</p>
                    <p><strong>Mebel o'lchamlari:</strong> {dimensions.length}sm (uzunlik) x {dimensions.width}sm (kenglik) x {dimensions.height}sm (balandlik)</p>
                    <div className="order-line">
                        <div></div>
                        <p>Mijoz</p>
                        <div></div>
                    </div>
                    <p><strong>Mijoz turi:</strong> {customer?.type}</p>
                    <p><strong>Ism, Familya:</strong> {customer?.fullName}</p>
                    <p><strong>Telefon raqami:</strong> {customer?.phone}</p>
                    {customer?.type === "Yuridik shaxs" && (
                        <>
                            <p><strong>Kompaniya nomi:</strong> {customer?.companyName}</p>
                            <p><strong>Menejer:</strong> {customer?.manager?.fullName} ({customer?.manager?.position})</p>
                            <p><strong>Direktor:</strong> {customer?.director}</p>
                            <p><strong>Manzil:</strong> {customer?.address}</p>
                        </>
                    )}
                </div>

                {/* Mebel rasmi */}
                <div className="order-details-page_image">
                    <img src={image} alt={name} />
                </div>
            </div>

            {/* Materiallar ro'yxati */}
            <h3>Materiallar:</h3>
            <div className="materials-list">
                {materials.map((material, index) => (
                    <div key={index} className="material-item">
                        <span className="material-name">{material.name}</span>
                        <span className="material-quantity">{material.quantity} dona</span>
                        <span className="material-price">{(material.price * material.quantity).toLocaleString()} so'm</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderDetails;