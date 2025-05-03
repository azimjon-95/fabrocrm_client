import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrderByIdQuery, useGiveMaterialMutation, useGetMaterialByIdQuery, useCreateAdditionalMaterialMutation } from "../../../context/service/orderApi";
import { Card, Input, List, Spin, Button, message, Modal } from "antd";
import { IoMdAdd } from "react-icons/io";
import { AiOutlineColumnWidth, AiOutlineColumnHeight, AiOutlineBorder } from 'react-icons/ai';
import { MdOutlineHistory } from "react-icons/md";
import { TfiCheckBox } from "react-icons/tfi";
import AddMaterials from './AddMaterials';

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
                    <div className="material-stor-box-value">
                        <p>Miqdori: {material.quantity} {material.unit}</p> |
                        <p>{materialData?.totalQuantity || 0} {material.unit}</p>
                    </div>
                    <div className="material-stor">
                        <Input
                            className="inp_add_pro-addit"
                            size="small"
                            placeholder="Miqdori"
                            value={inputValues[material._id] || ""}
                            onChange={(e) => handleInputChange(e, material._id)}
                        />
                        <Button
                            size="small"
                            loading={loadingStates[material._id] || false}
                            onClick={() => handleAddMaterial(material, orderCardId)}
                        >
                            <TfiCheckBox />
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
    const { data: orderData, refetch: refetchOrderData, isLoading: isOrderLoading } = useGetOrderByIdQuery(id);
    const [giveMaterial] = useGiveMaterialMutation();
    const [inputValues, setInputValues] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [createAdditionalMaterial, { loading: isCreating }] = useCreateAdditionalMaterialMutation();

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


    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const showModal = (material) => {
        setSelectedMaterial(material);
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const [additionalInp, setAdditionalInp] = useState({})
    const handleAdditionalChange = (record, value) => {
        setAdditionalInp((prev) => ({ ...prev, [record?._id]: value }));
    };

    const handleAdd = async (record) => {
        const quantityToAdd = additionalInp[record._id] || 0;

        if (!quantityToAdd > 0) {
            return message.warning("Maxsulot miqdorini kiriting!");
        }

        const newAdditional = {
            materialID: record?._id,
            name: record?.name,
            quantity: quantityToAdd,
            unit: record?.unit,
            price: record?.pricePerUnit,
            orderId: selectedMaterial?.orderId,
            orderCardId: selectedMaterial?.orderCardId,
        };
        try {
            const response = await createAdditionalMaterial(newAdditional).unwrap();
            message.success(response.message || "Material muvaffaqiyatli berildi!");
            refetchOrderData()
            setIsModalVisible(false);
            setAdditionalInp({});
        }
        catch (error) {
            message.error(error.message || "Xatolik yuz berdi, qayta urinb ko'ring!")
        }
    };


    if (isOrderLoading) return <Spin tip="Yuklanmoqda..." style={{ display: "block", margin: "20px auto" }} />;
    const order = orderData?.innerData;
    if (!order) return <p>Buyurtma topilmadi</p>;
    return (
        <div >
            <div className="material-box">
                <Button onClick={() => window.history.back()}>⬅ Orqaga</Button>
                <h3>{order?.address?.region}, {order?.address?.district}, {order?.address?.street}</h3>
                <Button
                    style={{ minWidth: "35px", background: "#0A3D3A" }}
                    type="primary"
                    icon={<MdOutlineHistory style={{ fontSize: "20px", marginTop: "1px" }} />}
                    onClick={() => navigate(`/store/givn/material/${id}`)}
                >
                </Button>
            </div>
            <div className="store-material-box">
                {order?.orders?.map((material, inx) => {
                    // order.orders uzunligini olish
                    const orderLength = order?.orders?.length;

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
                                <Button className="add-button-matr" onClick={() => showModal(
                                    {
                                        orderId: order?._id,
                                        orderCardId: material?._id
                                    }
                                )}><IoMdAdd /></Button>

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

            {/* Modal qismi */}
            <Modal
                title="Material Tafsilotlari"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={650}
            >
                <AddMaterials
                    isCreating={isCreating}
                    inputValues={additionalInp}
                    handleAdd={handleAdd}
                    handleInputChange={handleAdditionalChange}
                />
            </Modal>
        </div >
    );
};

export default Material;


