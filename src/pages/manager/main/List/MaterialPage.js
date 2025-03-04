import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetOrderByIdQuery,
  useGetMaterialByIdQuery,
} from "../../../../context/service/orderApi";
import { useGetStoreByCustomerIdQuery } from "../../../../context/service/storeApi";
import { Card, List, Spin, Button } from "antd";
import { BsExclamationLg } from "react-icons/bs";
import { FiBox } from "react-icons/fi";

const MaterialItem = ({ material, orderId }) => {
  const { data: storeByCustomer, isLoading: isStoreLoading } =
    useGetStoreByCustomerIdQuery(material?.materialID);
  const { data: materialData, isLoading: isMaterialLoading } =
    useGetMaterialByIdQuery({ orderId, materialId: material._id });
  console.log(material);

  return (
    <List.Item key={material._id}>
      <Card
        title={
          <div className="storeByCustomer">
            <p>{material.name}</p>
            {material.quantity > storeByCustomer?.innerData?.quantity && (
              <p>
                {" "}
                <BsExclamationLg />
                Omborda: {storeByCustomer?.innerData?.quantity || 0}{" "}
                {material.unit} mavjud
              </p>
            )}
          </div>
        }
        style={{ minHeight: 120 }}
      >
        {isMaterialLoading || isStoreLoading ? (
          <Spin tip="Yuklanmoqda..." />
        ) : (
          <div className="material-stor-select">
            <div>
              <p>
                Miqdori: {material.quantity} {material.unit}
              </p>
              <p>
                Jami: {materialData?.totalQuantity || 0} {materialData?.unit}
              </p>
            </div>
            <div>
              <p>Narxi: {material.price.toLocaleString()} so‘m</p>
              <p>
                Jami:{" "}
                {(
                  +material.price * +materialData?.totalQuantity || 0
                ).toLocaleString()}{" "}
                so‘m
              </p>
            </div>
          </div>
        )}
      </Card>
    </List.Item>
  );
};

const MaterialPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: orderData, isLoading: isOrderLoading } =
    useGetOrderByIdQuery(id);

  if (isOrderLoading)
    return (
      <Spin
        tip="Yuklanmoqda..."
        style={{ display: "block", margin: "20px auto" }}
      />
    );
  if (!orderData?.innerData) return <p>Buyurtma topilmadi</p>;

  const order = orderData.innerData;

  let totalCost = 0;
  for (const item of order.orders) {
    let totalprice =
      item.materials.reduce(
        (acc, material) => acc + material.price * material.quantity,
        0
      ) || 0;

    totalCost += totalprice;
  }

  return (
    <div style={{ padding: "0 10px" }}>
      <div className="material-box">
        <Button onClick={() => navigate(-1)}>⬅ Orqaga</Button>
        <span style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h3>{order?.customer?.fullName}</h3>/
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>
            Jami xarajat: {totalCost.toLocaleString()} so‘m
          </div>
        </span>
        <Button
          style={{ background: "#0A3D3A" }}
          type="primary"
          icon={<FiBox style={{ fontSize: "20px" }} />}
          onClick={() => navigate(`/order/givn/material/${id}`)}
        />
      </div>
      {order.orders?.map((item, index) => (
        <List
          key={index}
          grid={{ gutter: 16, column: 3 }}
          dataSource={item.materials || []}
          renderItem={(material) => (
            <MaterialItem material={material} orderId={id} />
          )}
        />
      ))}
    </div>
  );
};

export default MaterialPage;
