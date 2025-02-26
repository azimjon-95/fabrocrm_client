import React, { useState, useEffect } from "react";
import { Button, List, Input, message, Modal, Popover, Select, Form } from "antd";
import { FaAngleLeft } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { FaCheck, FaPlus } from "react-icons/fa6";

import {
    useGetOrderListsQuery,
    useUpdateMaterialByIdMutation,
    useCreateMaterialMutation,
    useUpdateOrderListMutation
} from "../../context/service/listApi";
import { useGetShopsQuery } from "../../context/service/shopsApi";
import socket from "../../socket";
import "./style.css";

const Distributor = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal holati
    const { data, refetch } = useGetOrderListsQuery();
    const newLists = data?.innerData || null;
    const filteredLists = newLists?.filter(list => list.sentToDistributor && list.approvedByDistributor === false);
    const [selectedListId, setSelectedListId] = useState(null);
    const { data: shopsData } = useGetShopsQuery();
    const shops = shopsData?.innerData || null;
    const [updateMaterialById] = useUpdateMaterialByIdMutation();
    const [createMaterial] = useCreateMaterialMutation(); // Yangi material yaratish
    const [editMode, setEditMode] = useState({});
    const [editData, setEditData] = useState({});
    const [updateOrderList] = useUpdateOrderListMutation();


    const categoryOptions = [
        "Yog‘och va Plitalar",
        "Metal Profillar va Konstruktsiyalar",
        "Mexanizmlar va Slayderlar",
        "Mix va Qotirish Materiallari",
        "Qoplamali Materiallar",
        "Qoplamalar va Bezaklar",
        "Kraska va Yelim Mahsulotlari",
    ].map((label) => ({ label, value: label }));
    useEffect(() => {
        socket.on("newMaterial", refetch);
        return () => {
            socket.off("newMaterial");
        };
    }, [refetch]);

    const handleToggleList = (id) => {
        setSelectedListId(selectedListId === id ? null : id);
    };

    const handleEdit = (productId, item) => {
        setEditMode({ ...editMode, [productId]: true });
        setEditData({
            ...editData,
            [productId]: {
                pricePerUnit: item?.pricePerUnit,
                quantity: item.quantity
            }
        });
    };

    const handleChange = (productId, field, value) => {
        setEditData({
            ...editData,
            [productId]: {
                ...editData[productId],
                [field]: value
            }
        });
    };

    const handleUpdate = (orderId, productId) => {
        const updatedData = editData[productId];
        const list = filteredLists?.find(list => list._id === orderId);
        const originalData = list?.materials?.find(m => m.productId === productId);

        const changedData = Object.fromEntries(
            Object.entries(updatedData).filter(
                ([key, value]) => value !== originalData?.[key]
            )
        );

        if (Object.keys(changedData).length === 0) {
            message.info("Hech qanday o'zgarish yo'q!");
            return;
        }

        updateMaterialById({
            orderId,
            materialId: productId,
            updateData: changedData
        })
            .unwrap()
            .then(() => {
                message.success("Ma'lumot yangilandi!");
                setEditMode({ ...editMode, [productId]: false });
                refetch();
            })
            .catch(() => {
                message.error("Xatolik yuz berdi!");
            });
    };

    const getShopName = (shopsId) => {
        return shops?.find(shop => shop._id === shopsId)?.name || "Unknown Shop";
    };

    // Modalni ochish va yopish
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    // Yangi material qo'shish
    const onFinish = async (values) => {
        try {
            // Materialni yaratish
            await createMaterial({
                orderId: selectedListId,
                material: values,
            }).unwrap();

            // Muvaffaqiyatli holat
            message.success("Yangi material qo'shildi!");
            setIsModalOpen(false);
            refetch();  // Yangi ma'lumotlarni olish
        } catch (error) {
            // Xatolikni qayta ishlash
            message.error("Xatolik yuz berdi!");
            console.error(error);  // Xatolikni konsolga chiqarish (debug uchun)
        }
    };

    const showCloseShops = async (record) => {
        try {
            const response = await updateOrderList({
                id: record._id,
                updateData: { approvedByDistributor: true },
            });
            if (response) {
                refetch();
                message.success("Savdo yakunlandi!");
            } else {
                throw new Error("To‘lov amalga oshirilmadi.");
            }
        } catch (error) {
            message.error(error.message);
        }
    };
    const renderPopoverContent = (record) => (
        <div>
            <p style={{ margin: "10px 0" }}>Savdoni yakunlashni tasdiqlaysizmi?</p>
            <Button className="showCloseShops" type="primary" onClick={() => showCloseShops(record)}>
                <FaCheck /> Tasdiqlash
            </Button>
        </div>
    );

    return (
        <div className="stor_todolist-shop">
            {filteredLists?.map((list) => (
                <div key={list._id} className="order-list-container-shop">
                    {!selectedListId && (
                        <div className="order-header">
                            <strong>{getShopName(list.shopsId)}</strong>
                            <Button
                                style={{ background: "#0A3D3A" }}
                                type="primary"
                                onClick={() => handleToggleList(list._id)}
                            >
                                Xomashyolar
                            </Button>
                        </div>
                    )}

                    {selectedListId === list._id && (
                        <div className="list-container-shop">
                            <List
                                bordered
                                className="list-container"
                                header={
                                    <div className="list-market-name">
                                        <Button
                                            type="default"
                                            onClick={() => handleToggleList(list._id)}
                                        >
                                            <FaAngleLeft />
                                        </Button>

                                        <strong>{getShopName(list.shopsId)}</strong>
                                        <div className="showCloseShops-box">
                                            <Popover
                                                trigger="click"
                                                content={renderPopoverContent(list)} // list ni argument sifatida o'tkazish
                                                title="Savdoni yakunlash"
                                            >
                                                <Button type="primary" className="showCloseShops">
                                                    <FaCheck />
                                                </Button>
                                            </Popover>
                                            <Button
                                                type="dashed"
                                                onClick={showModal}
                                                icon={<FaPlus />}
                                            >
                                                Material Qo'shish
                                            </Button>
                                        </div>
                                    </div>
                                }
                                dataSource={list?.materials}
                                renderItem={(item) => (
                                    <List.Item key={item.productId} className="list-item-shop">
                                        <div className="item-info-shop">
                                            <span className="item-name-shop">{item.name}</span>
                                            <span className="item-category-shop">{item.category}</span>

                                            {editMode[item.productId] ? (
                                                <>
                                                    <Input
                                                        type="number"
                                                        size="small"
                                                        placeholder="Miqdor"
                                                        value={editData[item.productId]?.quantity || item.quantity}
                                                        onChange={(e) =>
                                                            handleChange(item.productId, "quantity", e.target.value)
                                                        }
                                                        style={{ width: "100px", marginRight: "10px", height: "33px" }}
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="Narx"
                                                        size="small"
                                                        value={editData[item.productId]?.pricePerUnit || item?.pricePerUnit}
                                                        onChange={(e) =>
                                                            handleChange(item.productId, "pricePerUnit", e.target.value)
                                                        }
                                                        style={{ width: "100px", marginRight: "10px", height: "33px" }}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <span className="item-quantity-shop">
                                                        {item.quantity} {item.unit}
                                                    </span>
                                                    <span className="item-price-shop">
                                                        {item?.pricePerUnit?.toLocaleString("uz-UZ")} so‘m
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {editMode[item.productId] && (
                                            <Button
                                                className="editMode-shop"
                                                type="primary"
                                                onClick={() => handleUpdate(list._id, item.productId)}
                                            >
                                                <FaCheck />
                                            </Button>
                                        )}
                                        {!editMode[item.productId] && (
                                            <Button
                                                className="editMode-shop"
                                                type="primary"
                                                onClick={() => handleEdit(item.productId, item)}
                                            >
                                                <CiEdit />
                                            </Button>
                                        )}
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                </div>
            ))}

            <Modal
                title="Yangi Material Qo'shish"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
            >
                <Form onFinish={onFinish}>
                    <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
                        <Input placeholder="Material nomi" />
                    </Form.Item>
                    <Form.Item name="quantity" label="Miqdor" rules={[{ required: true }]}>
                        <Input type="number" placeholder="Miqdor" />
                    </Form.Item>
                    <Form.Item name="pricePerUnit" label="Narxi" rules={[{ required: true }]}>
                        <Input size="small" type="number" placeholder="Narxi" />
                    </Form.Item>
                    <Form.Item
                        label="Kategoriya"
                        name="category"
                        rules={[{ required: true, message: "Kategoriyani tanlang!" }]}
                    >
                        <Select options={categoryOptions} />
                    </Form.Item>
                    <Form.Item
                        label="O'lchov birligi"
                        name="unit"
                        rules={[{ required: true, message: "O'lchov birligini tanlang!" }]}
                    >
                        <Select>
                            <Select.Option value="dona">Dona</Select.Option>
                            <Select.Option value="kg">Kilogramm</Select.Option>
                            <Select.Option value="litr">Litr</Select.Option>
                            <Select.Option value="metr">Metr</Select.Option>
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        Saqlash
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default Distributor;

