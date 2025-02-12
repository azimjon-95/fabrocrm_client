import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrderByIdQuery, useGetMaterialByIdQuery } from "../../../../context/service/orderApi";
import { useGetStoreByCustomerIdQuery } from "../../../../context/service/storeApi";
import { Card, List, Spin, Button } from "antd";
import { FiBox } from "react-icons/fi";

const MaterialItem = ({ material, orderId }) => {
    const { data: storeByCustomer, isLoading: isStoreLoading } = useGetStoreByCustomerIdQuery(material?.materialID);
    const { data: materialData, isLoading: isMaterialLoading } = useGetMaterialByIdQuery({ orderId, materialId: material._id });
    console.log(storeByCustomer.innerData.quantity);
    return (
        <List.Item key={material._id}>
            <Card title={material.name} style={{ minHeight: 120 }}>
                {(isMaterialLoading || isStoreLoading) ? (
                    <Spin tip="Yuklanmoqda..." />
                ) : (
                    <div className="material-stor-select">
                        <div>
                            <p>Miqdori: {material.quantity} {material.unit}</p>
                            <p>Omborda: {storeByCustomer?.innerData?.quantity || 0} {material.unit}</p>
                            <p>Jami: {materialData?.totalQuantity || 0} {material.unit}</p>
                        </div>
                        <div>
                            <p>Narxi: {material.price.toLocaleString()} so‘m</p>
                            <p>Jami: {(material.price * material.quantity).toLocaleString()} so‘m</p>
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
    const { data: orderData, isLoading: isOrderLoading } = useGetOrderByIdQuery(id);

    if (isOrderLoading) return <Spin tip="Yuklanmoqda..." style={{ display: "block", margin: "20px auto" }} />;
    if (!orderData?.innerData) return <p>Buyurtma topilmadi</p>;

    const order = orderData.innerData;
    const totalCost = order.materials?.reduce((acc, material) => acc + (material.price * material.quantity), 0) || 0;

    return (
        <div style={{ padding: "0 10px" }}>
            <div className="material-box">
                <Button onClick={() => navigate(-1)}>⬅ Orqaga</Button>
                <span style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <h3>{order.name} uchun materiallar</h3>
                    /
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
            <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={order.materials || []}
                renderItem={(material) => <MaterialItem material={material} orderId={id} />}
            />
        </div>
    );
};

export default MaterialPage;

