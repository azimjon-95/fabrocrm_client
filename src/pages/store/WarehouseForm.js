import React, { useState } from "react";
import { Modal, Table, Button, Form, Input, InputNumber, Row, Col, Radio, message, Select } from "antd";
import {
    useCreateStoreMutation,
    useGetAllStoresQuery,
    useGetStoreByCategoryQuery,
    useUpdateStoreMutation,
    useDeleteStoreMutation
} from "../../context/service/storeApi";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './style.css';

const { Option } = Select;

const categoryOptions = [
    { label: "Yog‘och va Plitalar", value: "Yog‘och va Plitalar" },
    { label: "Metal Profillar va Konstruktsiyalar", value: "Metal Profillar va Konstruktsiyalar" },
    { label: "Mexanizmlar va Slayderlar", value: "Mexanizmlar va Slayderlar" },
    { label: "Mix va Qotirish Materiallari", value: "Mix va Qotirish Materiallari" },
    { label: "Qoplamali Materiallar", value: "Qoplamali Materiallar" },
    { label: "Qoplamalar va Bezaklar", value: "Qoplamalar va Bezaklar" },
    { label: "Kraska va Yelim Mahsulotlari", value: "Kraska va Yelim Mahsulotlari" },
];

const unitOptions = [
    { label: "Dona", value: "dona" },
    { label: "Kg", value: "kg" },
    { label: "Litr", value: "litr" },
    { label: "Metr", value: "metor" },  // "Metor" o'rniga "Metr"
    { label: "Kvadrat Metr", value: "kvadrat metr" },
];

const Warehouse = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [form] = Form.useForm();

    const { data: allStores = [], refetch: refetchAll } = useGetAllStoresQuery();
    const { data: filteredStores = [], refetch: refetchFiltered } = useGetStoreByCategoryQuery(selectedCategory, { skip: !selectedCategory });
    const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
    const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
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
            if (isEditMode && selectedProduct) {
                await updateStore({ id: selectedProduct.id, ...values });
                message.success("Mahsulot muvaffaqiyatli yangilandi!");
            } else {
                await createStore(values);
                message.success("Mahsulot muvaffaqiyatli qo‘shildi!");
            }
            form.resetFields();
            setIsModalOpen(false);
            refetchAll();
            refetchFiltered();
        } catch (error) {
            message.error(error.data?.message || "Xatolik yuz berdi, qaytadan urinib ko‘ring!");
        }
    };

    const handleDelete = async (data) => {
        console.log(data);
        try {
            await deleteStore(data?._id);
            message.success("Mahsulot muvaffaqiyatli o‘chirildi!");
            refetchAll();
            refetchFiltered();
        } catch (error) {
            message.error("O‘chirishda xatolik yuz berdi!");
        }
    };

    const filteredData = stores?.innerData?.filter(store =>
        store?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        { title: "Mahsulot nomi", dataIndex: "name", key: "name" },
        { title: "Kategoriya", dataIndex: "category", key: "category" },
        {
            title: "Miqdor",
            dataIndex: "quantity",
            key: "quantity",
            render: (text, record) => `${record.quantity} ${record.unit}`
        },
        {
            title: "Birlik narxi",
            dataIndex: "pricePerUnit",
            key: "pricePerUnit",
            render: (price) => price.toLocaleString('uz-UZ') + " so'm"
        },
        {
            title: "Jami narx",
            key: "totalPrice",
            render: (_, record) => (record.quantity * record.pricePerUnit).toLocaleString('uz-UZ') + " so'm"
        },
        {
            title: "Harakatlar",
            key: "actions",
            render: (_, record) => (
                <>
                    <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>Tahrirlash</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>O‘chirish</Button>
                </>
            )
        }
    ];

    return (
        <>
            <div className="warehouse-navbar">
                <Select
                    placeholder="Kategoriya tanlang"
                    allowClear
                    style={{ width: 230 }}
                    onChange={(value) => setSelectedCategory(value)}
                    size="large"
                    suffixIcon={<SearchOutlined />}
                >
                    {categoryOptions.map(option => (
                        <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                </Select>

                <Input
                    placeholder="Mahsulotlarni qidiring..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    prefix={<SearchOutlined />}
                    className="warehouse-navbar_inp"
                />

                <Button size="large" type="primary" onClick={() => openModal()} icon={<PlusOutlined />}>
                    Mahsulot qo‘shish
                </Button>
            </div>

            <Table dataSource={filteredData} columns={columns} rowKey="id" size="small" pagination={false} />

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

                    <Button style={{ width: "100%", marginTop: "20px" }} type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                        {isEditMode ? "Yangilash" : "Saqlash"}
                    </Button>
                </Form>
            </Modal>

        </>
    );
};

export default Warehouse;
