import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrderByIdQuery, useGiveMaterialMutation, useGetMaterialByIdQuery } from "../../../context/service/orderApi";
import { Card, Input, List, Spin, Button, message } from "antd";
import { FiBox } from "react-icons/fi";
import { TfiCheckBox } from "react-icons/tfi";

// Har bir material uchun alohida komponent
const MaterialItem = ({ material, orderId, inputValues, loadingStates, handleInputChange, handleAddMaterial }) => {
    const { data: materialData, isLoading: isMaterialLoading } = useGetMaterialByIdQuery({
        orderId,
        materialId: material._id,
    });
    console.log(materialData);

    if (isMaterialLoading) return <Spin tip="Yuklanmoqda..." />;

    return (
        <List.Item key={material._id}>
            <Card title={material.name}>
                <div className="material-stor-box">
                    <p>Miqdori: {material.quantity} {material.unit}</p> /
                    <p>{materialData?.totalQuantity || 0} {material.unit}</p>
                    <div className="material-stor">
                        <Input
                            className="inp_add_pro"
                            placeholder="Miqdori"
                            value={inputValues[material._id] || ""}
                            onChange={(e) => handleInputChange(e, material._id)}
                            style={{ width: "100px", marginLeft: "25px" }}
                        />
                        <Button
                            size="large"
                            style={{ minWidth: "40px", padding: "5px" }}
                            loading={loadingStates[material._id] || false}
                            onClick={() => handleAddMaterial(material)}
                        >
                            <TfiCheckBox style={{ fontSize: "20px", marginTop: "3px" }} />
                        </Button>
                    </div>
                </div>
            </Card>
        </List.Item>
    );
};

const Material = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: orderData, isLoading: isOrderLoading } = useGetOrderByIdQuery(id);
    const [giveMaterial] = useGiveMaterialMutation();
    const [inputValues, setInputValues] = useState({});
    const [loadingStates, setLoadingStates] = useState({});

    if (isOrderLoading) return <Spin tip="Yuklanmoqda..." style={{ display: "block", margin: "20px auto" }} />;

    const order = orderData?.innerData;
    if (!order) return <p>Buyurtma topilmadi</p>;

    const handleInputChange = (e, materialId) => {
        const { value } = e.target;
        setInputValues((prev) => ({
            ...prev,
            [materialId]: value,
        }));
    };

    const handleAddMaterial = async (material) => {
        const quantity = inputValues[material._id];

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            message.error("Iltimos, to‘g‘ri miqdor kiriting!");
            return;
        }

        setLoadingStates((prev) => ({ ...prev, [material._id]: true }));

        try {
            const response = await giveMaterial({
                orderId: id,
                materialName: material.name,
                givenQuantity: quantity,
            }).unwrap();

            message.success(response.message || "Material muvaffaqiyatli berildi!");
            setInputValues((prev) => ({ ...prev, [material._id]: "" }));
        } catch (error) {
            message.error(error.data?.message || "Xatolik yuz berdi, qayta urinib ko‘ring!");
        } finally {
            setLoadingStates((prev) => ({ ...prev, [material._id]: false }));
        }
    };

    return (
        <div style={{ padding: "0 10px" }}>
            <div className="material-box">
                <Button onClick={() => window.history.back()}>⬅ Orqaga</Button>
                <h3>{order.name} uchun materiallar</h3>
                <Button
                    style={{ minWidth: "35px", background: "#0A3D3A" }}
                    type="primary"
                    icon={<FiBox style={{ fontSize: "20px", marginTop: "1px" }} />}
                    onClick={() => navigate(`/store/givn/material/${id}`)}
                >
                </Button>
            </div>
            <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={order.materials || []}
                renderItem={(material) => (
                    <MaterialItem
                        material={material}
                        orderId={id}
                        inputValues={inputValues}
                        loadingStates={loadingStates}
                        handleInputChange={handleInputChange}
                        handleAddMaterial={handleAddMaterial}
                    />
                )}
            />
        </div >
    );
};

export default Material;

