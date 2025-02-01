import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, Input, Avatar, Button, Row, Col, Spin, message } from "antd";
import { UploadOutlined, ArrowLeftOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './style.css';

const RegisterWorker = ({ onRegisterSuccess }) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token"); // Tokenni olish

            const formData = new FormData();
            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            formData.append('middleName', data.middleName);
            formData.append('address', data.address);
            formData.append('dayOfBirth', data.dayOfBirth);
            formData.append('phone', data.phone);
            formData.append('idNumber', data.idNumber);


            if (imageUrl) {
                formData.append("image", imageUrl);
            }


            const response = await axios.post('http://localhost:5000/api/worker/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`, // Tokenni qo‘shish
                },
            });


            console.log(response);
            message.success("Ishchi muvaffaqiyatli qo‘shildi!");
            reset();
            setImageUrl(null);
            onRegisterSuccess();
        } catch (error) {
            message.error("Xatolik yuz berdi. Qayta urinib ko‘ring.");
        }
        setLoading(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setLoading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
                setLoading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageUrl(null);
    };

    return (
        <div>
            <div className="nav_add">
                <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />} >
                    Orqaga qaytish
                </Button>
                <h2 style={{ textAlign: "center", margin: "20px 0" }}>Ishchi Ro‘yxatdan O‘tkazish</h2>
            </div>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="* Pasport seriya ">
                            <Controller
                                name="idNumber"
                                control={control}
                                rules={{ required: "Majburiy maydon" }}
                                render={({ field }) => <Input size="large" {...field} value={field.value} placeholder="Введите серию паспорта (AA1234567)" />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="* Ism">
                            <Controller
                                name="firstName"
                                control={control}
                                rules={{ required: "Majburiy maydon" }}
                                render={({ field }) => <Input size="large" {...field} placeholder="Введите имя" />}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="* Familiya">
                            <Controller
                                name="lastName"
                                control={control}
                                rules={{ required: "Majburiy maydon" }}
                                render={({ field }) => <Input size="large" {...field} placeholder="Введите фамилию" />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Otasining ismi">
                            <Controller
                                name="middleName"
                                control={control}
                                render={({ field }) => <Input size="large" {...field} placeholder="Введите отчество" />}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Manzil">
                            <Controller
                                name="address"
                                control={control}
                                render={({ field }) => <Input size="large" {...field} placeholder="Введите адрес" />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tug‘ilgan sana">
                            <Controller
                                name="dayOfBirth"
                                control={control}
                                render={({ field }) => <Input size="large" {...field} placeholder="ГГГГ-ММ-ДД" />}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="* Telefon">
                            <Controller
                                name="phone"
                                control={control}
                                rules={{ required: "Majburiy maydon" }}
                                render={({ field }) => <Input size="large" {...field} placeholder="Введите номер телефона" />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label=" ">
                            <div style={{ display: "flex", gap: "20px", gap: "16px" }}>
                                <div style={{ display: "flex", gap: "20px", position: "relative" }}>
                                    <Button
                                        size="large"
                                        icon={<UploadOutlined />}
                                        onClick={() => document.getElementById("fileInput").click()}
                                        style={{ height: "100%", alignSelf: "center" }}
                                    >
                                        Rasm yuklash (3x4)
                                    </Button>
                                    {imageUrl && (
                                        <>
                                            <Avatar
                                                size={100}
                                                src={imageUrl || null}
                                                icon={loading ? <Spin /> : <UserOutlined />}
                                                style={{
                                                    borderRadius: "10px",
                                                    cursor: "pointer",
                                                    border: "2px solid #4CAF50",
                                                    transition: "transform 0.3s ease-in-out",
                                                }}
                                            />
                                            <div
                                                onClick={handleRemoveImage}
                                                style={{
                                                    position: "absolute",
                                                    top: "5px",
                                                    right: "5px",
                                                    width: "20px",
                                                    height: "20px",
                                                    backgroundColor: "#070000",
                                                    color: "white",
                                                    borderRadius: "50%",
                                                    border: "1px solid #ff0000",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <CloseOutlined />
                                            </div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                        id="fileInput"
                                    />
                                </div>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item>
                    <Button size="large" type="primary" htmlType="submit" loading={loading} block>
                        Ro‘yxatdan o‘tkazish
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegisterWorker;
