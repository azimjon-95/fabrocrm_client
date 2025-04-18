import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./style.css";
import moment from "moment";

const OrderDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.order) {
    return <h2>Buyurtma topilmadi</h2>;
  }

  const {
    paid,
    estimatedDays,
    name,
    date,
    customer,
    paymentType,
    orders,
    address,
  } = state.order;

  let totalPrice = 0;
  for (const item of orders) {
    let price = item.materials?.reduce(
      (sum, material) => sum + material.price * material.quantity,
      0
    );
    totalPrice += price;
  }

  const budget = orders.reduce((a, b) => a + b.budget, 0);

  return (
    <div className="order-details-page">
      <div className="order-details-page_box">
        <button onClick={() => navigate(-1)}>⬅ Orqaga</button>
        <div>
          <h2>{customer.fullName}</h2>
        </div>
      </div>

      <div className="order-details-page_box_owner-main">
        <div className="order-details-page_box_owner">
          {/* Buyurtma ma'lumotlari */}
          <p>
            <strong>Byudjet:</strong> {budget?.toLocaleString()} so'm
          </p>
          <p>
            <strong>To'langan:</strong> {paid?.toLocaleString() || 222} so'm
          </p>
          <p>
            <strong>Sarflanadigan mahsulotlar narxi:</strong>{" "}
            {totalPrice.toLocaleString()} so'm
          </p>
          <p>
            <strong>Olingan sana:</strong> {moment(date).format("YYYY-MM-DD")}
          </p>
          <p>
            <strong>Taxminiy tayyor bo'lish muddati:</strong> {estimatedDays}{" "}
            kun
          </p>
          <p>
            <strong>To'lov turi:</strong> {paymentType || "-"}
          </p>
          <div className="order-line">
            <div></div>
            <p>O'lchamlari</p>
            <div></div>
          </div>
          {orders?.map((item, index) => (
            <p key={index}>
              <strong>{item?.name}:</strong> {item?.dimensions?.length}sm
              (uzunlik) x {item?.dimensions?.width}sm (kenglik) x{" "}
              {item?.dimensions?.height}sm (balandlik)
            </p>
          ))}
          <div className="order-line">
            <div></div>
            <p>Mijoz</p>
            <div></div>
          </div>
          <p>
            <strong>Mijoz turi:</strong> {customer?.type}
          </p>
          <p>
            <strong>Ism, Familya:</strong> {customer?.fullName}
          </p>
          <p>
            <strong>Telefon raqami:</strong> {customer?.phone}
          </p>
          {customer?.type === "Yuridik shaxs" && (
            <>
              <p>
                <strong>Kompaniya nomi:</strong> {customer?.companyName}
              </p>
              <p>
                <strong>Menejer:</strong> {customer?.manager?.fullName} (
                {customer?.manager?.position})
              </p>
              <p>
                <strong>Direktor:</strong> {customer?.director}
              </p>
              <p>
                <strong>Manzil:</strong> {address?.region}
              </p>
            </>
          )}
        </div>

        {/* Mebel rasmi */}
        <div className="order-details-page_image">
          {orders.map(({ image }, index) => (
            <img src={image} alt={name} key={index} />
          ))}
        </div>
      </div>

      {/* Materiallar ro'yxati */}
      <h3>Materiallar:</h3>
      <div className="materials-list">
        {orders.map((item, index) => (
          <div key={index}>
            <h3>{item.name}</h3>
            {item.materials.map((m, i) => (
              <div key={i} className="material-item">
                <span className="material-name">{m.name}</span>
                <span className="material-quantity">{m.quantity} dona</span>
                <span className="material-price">
                  {(m.price * m.quantity).toLocaleString()} so'm
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetails;
