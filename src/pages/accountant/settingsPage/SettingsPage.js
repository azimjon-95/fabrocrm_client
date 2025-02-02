import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Table, message, Space, Row, Col } from 'antd';
import { useCreateWorkingHoursMutation, useGetAllWorkingHoursQuery, useUpdateWorkingHoursMutation, useDeleteWorkingHoursMutation } from '../../../context/service/workingHours';

const SettingsPage = () => {
    // Hooks for CRUD operations
    const { data, isLoading, error } = useGetAllWorkingHoursQuery();
    const [createWorkingHours] = useCreateWorkingHoursMutation();
    const [updateWorkingHours] = useUpdateWorkingHoursMutation();
    const [deleteWorkingHours] = useDeleteWorkingHoursMutation();

    console.log(data);

    const [editingId, setEditingId] = useState(null); // Store the ID of the item being edited
    const [form] = Form.useForm();

    // Handle form submission
    const onFinish = async (values) => {
        try {
            if (editingId) {
                // Update existing entry
                await updateWorkingHours({ id: editingId, ...values });
                message.success('Ish Haqqi va Ish Vaqti yangilandi!');
            } else {
                // Create new entry
                await createWorkingHours(values);
                message.success('Ish Haqqi va Ish Vaqti qo\'shildi!');
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
            wages: record.wages,
            workingHours: record.workingHours,
            overtimeWages: record.overtimeWages,
            commanderLocation: record.commanderLocation,
            voxa: record.voxa,
            toshkent: record.toshkent,
            vodiy: record.vodiy,
        });
        setEditingId(record.id);
    };

    // Handle delete operation
    const handleDelete = async (id) => {
        try {
            await deleteWorkingHours(id);
            message.success('Ma\'lumot muvaffaqiyatli o\'chirildi!');
        } catch (err) {
            message.error('Xatolik yuz berdi, qaytadan urinib ko\'ring.');
        }
    };

    // Table columns definition
    const columns = [
        {
            title: 'Ish Haqqi (soatda)',
            dataIndex: 'wages',
            key: 'wages',
            render: (text) => new Intl.NumberFormat('uz-UZ').format(text) + ' Sum',
        },
        {
            title: 'Oshiqcha Soat Uchun:  Ish Haqqi',
            dataIndex: 'overtimeWages',
            key: 'overtimeWages',
            render: (text) => new Intl.NumberFormat('uz-UZ').format(text) + ' Sum',
        },
        {
            title: 'Ish Vaqti',
            dataIndex: 'workingHours',
            key: 'workingHours',
        },
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
        {
            title: 'Amallar',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        Tahrirlash
                    </Button>
                    <Button type="danger" onClick={() => handleDelete(record.id)}>
                        O\'chirish
                    </Button>
                </Space>
            ),
        },
    ];

    // If data is loading or there’s an error
    if (isLoading) return <p>Ma'lumotlar yuklanmoqda...</p>;
    if (error) return <p>Xatolik yuz berdi!</p>;

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#4CAF50' }}>Ish Haqqi va Ish Vaqti Sozlamalari</h2>

            {/* Form for creating and editing */}
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    wages: 0,
                    workingHours: '09:00 - 18:00',
                    commanderLocation: { voxa: 0, toshkent: 0, vodiy: 0 }
                }} // Default values
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="wages"
                            label="Ish Haqqi (soatda)"
                            rules={[{ required: true, message: 'Ish haqini kiriting!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                placeholder="Masalan: 15,000"
                                addonAfter="UZS"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="overtimeWages"
                            label="Oshiqcha Soat Uchun:  Ish Haqqi"
                            rules={[{ required: true, message: 'Overtime haqqini kiriting!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                placeholder="Masalan: 20,000"
                                addonAfter="UZS"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="workingHours"
                            label="Ish Vaqti"
                            rules={[{ required: true, message: 'Ish vaqtini kiriting!' }]}
                        >
                            <Input placeholder="Masalan: 09:00 - 18:00" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="voxa"
                            label="Voxa (Latitude)"
                            rules={[{ required: true, message: 'Voxa joylashuvini kiriting!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Masalan: 20%"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="toshkent"
                            label="Toshkent (Longitude)"
                            rules={[{ required: true, message: 'Toshkent joylashuvini kiriting!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Masalan: 15%"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="vodiy"
                            label="Vodiy (Altitude)"
                            rules={[{ required: true, message: 'Vodiy joylashuvini kiriting!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Masalan: 0%"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item style={{ textAlign: 'center' }}>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        {editingId ? 'Yangilash' : 'Qo\'shish'}
                    </Button>
                </Form.Item>
            </Form>

            {/* Table for displaying and managing entries */}
            <Table
                columns={columns}
                dataSource={data?.innerData || []}
                rowKey="id"
                pagination={false}
                style={{ marginTop: '20px' }}
            />
        </div>
    );
};

export default SettingsPage;


