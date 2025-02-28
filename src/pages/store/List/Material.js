import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrderByIdQuery, useGiveMaterialMutation, useGetMaterialByIdQuery } from "../../../context/service/orderApi";
import { Card, Input, List, Spin, Button, message } from "antd";
import { AiOutlineColumnWidth, AiOutlineColumnHeight, AiOutlineBorder } from 'react-icons/ai';
import { MdOutlineHistory } from "react-icons/md";
import { TfiCheckBox } from "react-icons/tfi";

// Har bir material uchun alohida komponent
const MaterialItem = ({ material, orderCardId, orderId, inputValues, loadingStates, handleInputChange, handleAddMaterial }) => {
    const { data: materialData, isLoading: isMaterialLoading } = useGetMaterialByIdQuery({
        orderId,
        materialId: material._id,
    });

    if (isMaterialLoading) return <List.Item><Card style={{ height: "140px" }}><Spin tip="Yuklanmoqda..." /></Card></List.Item>;

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
                            style={{ width: "75px", marginLeft: "25px", }}
                        />
                        <Button
                            size="large"
                            style={{ minWidth: "40px", padding: "5px" }}
                            loading={loadingStates[material._id] || false}
                            onClick={() => handleAddMaterial(material, orderCardId)}
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

    const handleAddMaterial = async (material, orderCardId) => {
        const quantity = inputValues[material._id];

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            message.error("Iltimos, to‘g‘ri miqdor kiriting!");
            return;
        }

        setLoadingStates((prev) => ({ ...prev, [material._id]: true }));

        try {

            const response = await giveMaterial({
                orderCardId,
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
        <div >
            <div className="material-box">
                <Button onClick={() => window.history.back()}>⬅ Orqaga</Button>
                <h3>{order.name} uchun materiallar</h3>
                <Button
                    style={{ minWidth: "35px", background: "#0A3D3A" }}
                    type="primary"
                    icon={<MdOutlineHistory style={{ fontSize: "20px", marginTop: "1px" }} />}
                    onClick={() => navigate(`/store/givn/material/${id}`)}
                >


                </Button>
            </div>
            <div className="store-material-box">
                {order.orders?.map((material, inx) => {
                    // order.orders uzunligini olish
                    const orderLength = order.orders.length;

                    // column va kenglik qiymatini dinamik belgilash
                    let columnValue;
                    let cardWidth;

                    if (orderLength >= 3) {
                        columnValue = 1;
                        cardWidth = "32.5%";
                    } else if (orderLength === 2) {
                        columnValue = 2;
                        cardWidth = "49%";
                    } else {
                        columnValue = 3;
                        cardWidth = "100%";
                    }

                    return (
                        <div key={inx}
                            className="store-material-card"
                            style={{ width: cardWidth }} // Dinamik kenglikni belgilash
                        >
                            <div className="material-name-box">
                                <h4>{material.name}</h4>

                                <span className="material-dimensions">
                                    <span className="dimension-item">
                                        <AiOutlineColumnWidth /> Uzunlik: {material.dimensions?.length} cm
                                    </span>
                                    <span className="dimension-item">
                                        <AiOutlineBorder /> Kenglik: {material.dimensions?.width} cm
                                    </span>
                                    <span className="dimension-item">
                                        <AiOutlineColumnHeight /> Balandlik: {material.dimensions?.height} cm
                                    </span>
                                </span>
                            </div>
                            <div>
                                <List
                                    grid={{ gutter: 16, column: columnValue }}
                                    dataSource={material.materials || []}
                                    renderItem={(value) => (
                                        <MaterialItem
                                            orderId={id}
                                            orderCardId={material._id}
                                            material={value}
                                            inputValues={inputValues}
                                            loadingStates={loadingStates}
                                            handleInputChange={handleInputChange}
                                            handleAddMaterial={handleAddMaterial}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div >
    );
};

export default Material;

