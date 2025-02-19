import React, { useState } from "react";
import { Modal, Table, Button, Form, Input, InputNumber, Select, Col, Row, Radio, message } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import {
    useCreateStoreMutation,
    useGetAllStoresQuery,
    useGetStoreByCategoryQuery,
    useUpdateStoreMutation,
    useDeleteStoreMutation
} from "../../context/service/storeApi";
import "./style.css";

const { Option } = Select;

const categoryOptions = [
    "Yog‘och va Plitalar",
    "Metal Profillar va Konstruktsiyalar",
    "Mexanizmlar va Slayderlar",
    "Mix va Qotirish Materiallari",
    "Qoplamali Materiallar",
    "Qoplamalar va Bezaklar",
    "Kraska va Yelim Mahsulotlari"
].map(label => ({ label, value: label }));

const unitOptions = ["Dona", "Kg", "Litr", "Metr", "Kvadrat Metr"].map(label => ({ label, value: label.toLowerCase() }));

const Warehouse = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [form] = Form.useForm();

    const { data: allStores = [], refetch: refetchAll } = useGetAllStoresQuery();
    const { data: filteredStores = [], refetch: refetchFiltered } = useGetStoreByCategoryQuery(selectedCategory, { skip: !selectedCategory });
    const [updateStore, { isLoading: isCreating }] = useUpdateStoreMutation();
    const [deleteStore] = useDeleteStoreMutation();

    const stores = selectedCategory ? filteredStores : allStores;

    const openModal = (record = null) => {
        setIsEditMode(!!record);
        setSelectedProduct(record);
        setIsModalOpen(true);
        form.setFieldsValue(record || { name: "", category: "", quantity: 1, unit: "dona", pricePerUnit: 0, supplier: "" });
    };

    const onFinish = async (values) => {
        try {
            const res = await updateStore({ id: selectedProduct?._id, updatedData: values })

            message.success(res?.data?.message);
            form.resetFields();
            setIsModalOpen(false);
            refetchAll();
            refetchFiltered();
        } catch (error) {
            message.error(error?.response?.data?.message);
        }
    };

    const handleDelete = async (data) => {
        try {
            const res = await deleteStore(data?._id);
            message.success(res?.data?.message || "Mahsulot muvaffaqiyatli o‘chirildi!");
            refetchAll();
            refetchFiltered();
        } catch {
            message.error("O‘chirishda xatolik yuz berdi!");
        }
    };

    const filteredData = stores?.innerData?.filter(store => store?.name?.toLowerCase().includes(searchQuery.toLowerCase()));


    const location = useLocation();
    const isHidden = location.pathname === "/manag/warehouse" || location.pathname === "/deput/warehouse";
    const columns = [
        { title: "Mahsulot nomi", dataIndex: "name", key: "name" },
        { title: "Kategoriya", dataIndex: "category", key: "category" },
        { title: "Miqdor", key: "quantity", render: ({ quantity, unit }) => `${quantity} ${unit}` },
        { title: "Birlik narxi", dataIndex: "pricePerUnit", key: "pricePerUnit", render: (price) => `${price.toLocaleString("uz-UZ")} so‘m` },
        { title: "Jami narx", key: "totalPrice", render: ({ quantity, pricePerUnit }) => `${(quantity * pricePerUnit).toLocaleString("uz-UZ")} so‘m` },
        !isHidden && { // isHidden true bo‘lsa, ustun qo‘shilmaydi
            title: "Harakatlar",
            key: "actions",
            render: (_, record) => (
                <div style={{ display: "flex" }}>
                    <Button style={{ color: "#0A3D3A" }} type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>Tahrirlash</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>O‘chirish</Button>
                </div>
            )
        }
    ].filter(Boolean); // undefined elementlarni olib tashlash

    return (
        <>
            <div className="warehouse-navbar">
                <Select placeholder="Kategoriya tanlang" allowClear style={{ width: 230 }} onChange={setSelectedCategory} size="large">
                    {categoryOptions.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
                </Select>
                <Input style={{ width: "100%" }} placeholder="Mahsulotlarni qidiring..." onChange={(e) => setSearchQuery(e.target.value)} prefix={<SearchOutlined />} className="warehouse-navbar_inp" />
            </div>

            <Table
                dataSource={filteredData}
                columns={columns}
                rowKey="_id"
                size="small"
                pagination={false}
                scroll={{ x: 'max-content', y: 570 }}
                className="custom-table-scroll"
            />

            <Modal width={545} title={isEditMode ? "Mahsulotni tahrirlash" : "Mahsulot qo‘shish"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item label="Mahsulot nomi" name="name" rules={[{ required: true, message: "Mahsulot nomini kiriting!" }]}>
                        <Input placeholder="Введите название продукта" />
                    </Form.Item>
                    <Form.Item label="Kategoriya" name="category" rules={[{ required: true, message: "Kategoriya tanlang!" }]}>
                        <Radio.Group className="radio_Group_inp" options={categoryOptions} />
                    </Form.Item>
                    <Form.Item label="O‘lchov birligi" name="unit" rules={[{ required: true, message: "O‘lchov birligini tanlang!" }]} >
                        <Radio.Group options={unitOptions} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Miqdor" name="quantity" rules={[{ required: true, message: "Miqdorni kiriting!" }]}>
                                <InputNumber min={1} style={{ width: "100%" }} placeholder="Введите количество" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Birlik narxi (so‘m)" name="pricePerUnit">
                                <InputNumber min={0} style={{ width: "100%" }} placeholder="Введите цену за единицу" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Yetkazib beruvchi" name="supplier">
                        <Input style={{ width: "100%" }} placeholder="Введите название поставщика" />
                    </Form.Item>

                    <Button style={{ width: "100%", marginTop: "20px" }} type="primary" htmlType="submit" loading={isCreating}>
                        {isEditMode ? "Yangilash" : "Saqlash"}
                    </Button>
                </Form>
            </Modal>
        </>
    );
};

export default Warehouse;
