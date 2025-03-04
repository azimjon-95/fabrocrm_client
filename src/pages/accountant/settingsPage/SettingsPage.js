import React, { useState } from 'react';
import { Form, Input, InputNumber, Divider, Button, Table, message, Space, Row, Col } from 'antd';
import { useCreateWorkingHoursMutation, useGetAllWorkingHoursQuery, useUpdateWorkingHoursMutation, useDeleteWorkingHoursMutation } from '../../../context/service/workingHours';

const SettingsPage = () => {
    // Hooks for CRUD operations
    const { data, isLoading, error, refetch } = useGetAllWorkingHoursQuery();
    const [createWorkingHours] = useCreateWorkingHoursMutation();
    const [updateWorkingHours] = useUpdateWorkingHoursMutation();
    const [deleteWorkingHours] = useDeleteWorkingHoursMutation();

    const [editingId, setEditingId] = useState(null); // Store the ID of the item being edited
    const [form] = Form.useForm();

    // Handle form submission
    const onFinish = async (values) => {

        try {
            if (editingId) {
                // Update existing entry
                await updateWorkingHours({ id: editingId, ...values });
                message.success('Ish Haqqi va Ish Vaqti yangilandi!');
                refetch()
            } else {
                // Create new entry
                await createWorkingHours(values);
                message.success('Ish Haqqi va Ish Vaqti qo\'shildi!');
                refetch()
            }
            form.resetFields();
            setEditingId(null); // Reset editing state
        } catch (err) {
            message.error('Xatolik yuz berdi, qaytadan urinib ko\'ring.');
        }
    };

    // Handle editing an existing item
    const handleEdit = (record) => {
        form.setFieldsValue({
            voxa: record.voxa,
            toshkent: record.toshkent,
            vodiy: record.vodiy,
            companyName: record.companyName,
            address: record.address,
            INN: record.INN,
            MFO: record.MFO,
            accountNumber: record.accountNumber,
            phoneNumber: record.phoneNumber,
        });
        setEditingId(record._id);
    };

    // Handle delete operation
    const handleDelete = async (id) => {
        try {
            await deleteWorkingHours(id);
            message.success('Данные успешно удалены!');
            refetch();
        } catch (err) {
            message.error('Произошла ошибка, попробуйте снова.');
        }
    };

    // Table columns definition
    const columns = [
        {
            title: 'Kompaniya nomi',
            dataIndex: 'companyName',
            key: 'companyName',
        },
        {
            title: 'Manzil',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'STIR',
            dataIndex: 'INN',
            key: 'INN',
        },
        {
            title: 'MFO',
            dataIndex: 'MFO',
            key: 'MFO',
        },
        {
            title: 'Hisob raqami',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
        },
        {
            title: 'Telefon raqami',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: "Qo'shimcha foizlar",
            children: [
                {
                    title: 'Voxa',
                    dataIndex: 'voxa',
                    key: 'voxa',
                    render: (text) => `${text}%`,
                },
                {
                    title: 'Toshkent',
                    dataIndex: 'toshkent',
                    key: 'toshkent',
                    render: (text) => `${text}%`,
                },
                {
                    title: 'Vodiy',
                    dataIndex: 'vodiy',
                    key: 'vodiy',
                    render: (text) => `${text}%`,
                },
            ]
        },
        {
            title: 'Amallar',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button style={{ background: "#0A3D3A" }} type="primary" onClick={() => handleEdit(record)}>
                        Tahrirlash
                    </Button>
                    <Button style={{ color: "#0A3D3A" }} type="danger" onClick={() => handleDelete(record._id)}>
                        O‘chirish
                    </Button>
                </Space>
            ),
        },
    ];


    // If data is loading or there’s an error
    if (error) return <p>Произошла ошибка!</p>;

    return (
        <div style={{ background: '#fff', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', color: '#0A3D3A' }}>Kompaniya malumotlari</h2>

            {/* Form for creating and editing */}
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="companyName"
                            label="Kompaniya Nomi"
                            rules={[{ required: true, message: 'Введите название компании!' }]}
                        >
                            <Input placeholder="Введите название компании" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="address"
                            label="Manzil"
                            rules={[{ required: true, message: 'Введите адрес!' }]}
                        >
                            <Input placeholder="Введите адрес" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            name="INN"
                            label="INN"
                            rules={[{ required: true, message: 'Введите ИНН!' }]}
                        >
                            <Input placeholder="Введите ИНН" />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="MFO"
                            label="MFO"
                            rules={[{ required: true, message: 'Введите МФО!' }]}
                        >
                            <Input placeholder="Введите МФО" />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="accountNumber"
                            label="Hisob Raqami"
                            rules={[{ required: true, message: 'Введите номер счета!' }]}
                        >
                            <Input placeholder="Введите номер счета" />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="phoneNumber"
                            label="Telefon Raqami"
                            rules={[{ required: true, message: 'Введите номер телефона!' }]}
                        >
                            <Input placeholder="Введите номер телефона" />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider>Kamanderovka ish soati foizlari</Divider>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="voxa"
                            label="Voxa"
                            rules={[{ required: true, message: 'Введите значение для Вокзала!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Например: 20%"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="toshkent"
                            label="Toshkent"
                            rules={[{ required: true, message: 'Введите значение для Ташкента!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Например: 15%"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="vodiy"
                            label="Vodiy"
                            rules={[{ required: true, message: 'Введите значение для Долины!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Например: 0%"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item style={{ textAlign: 'center' }}>
                    <Button type="primary" htmlType="submit" style={{ background: "#0A3D3A", width: '100%' }}>
                        {editingId ? 'Yangilash' : 'Qo\'shish'}
                    </Button>
                </Form.Item>
            </Form>

            {/* Table for displaying and managing entries */}
            <Table
                columns={columns}
                dataSource={data?.innerData || []}
                rowKey="_id"
                pagination={false}
                style={{ marginTop: '20px' }}
                loading={isLoading}
                bordered
                size="small"
            />
        </div>
    );
};

export default SettingsPage;
