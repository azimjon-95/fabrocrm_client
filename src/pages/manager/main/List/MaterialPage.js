import React from "react";
import { useParams } from "react-router-dom";
import { useGetOrderByIdQuery } from "../../../../context/service/orderApi";
import { Card, List, Spin } from "antd";

const MaterialPage = () => {
    const { id } = useParams();
    const { data, isLoading } = useGetOrderByIdQuery(id);

    if (isLoading) return <Spin tip="Yuklanmoqda..." style={{ display: "block", margin: "20px auto" }} />;

    const order = data?.innerData;
    if (!order) return <p>Buyurtma topilmadi</p>;

    return (
        <div style={{ padding: "5px" }}>
            <h2>{order.name} uchun materiallar</h2>
            <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={order.materials || []}
                renderItem={(material) => (
                    <List.Item key={material._id}>
                        <Card title={material.name}>
                            <p>Miqdori: {material.quantity}{material.unit}</p>
                            <p>Narxi: {material.price.toLocaleString()} so‘m</p>
                            <p>Jami: {(material.price * material.quantity).toLocaleString()} so‘m</p>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default MaterialPage;
