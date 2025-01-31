import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Input, Avatar, Button, Row, Col, Spin, message } from "antd";
import { UploadOutlined, ArrowLeftOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "../../../api";
import './style.css'

const RegisterWorker = ({ onRegisterSuccess }) => {
    const {
        register,
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
            const payload = { ...data, images: [imageUrl] }; // Send the uploaded image URL
            await axios.post("/worker/create", payload);
            message.success("Ishchi muvaffaqiyatli qo‘shildi!");
            reset();
            setImageUrl(null); // Reset image after submission
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
                setImageUrl(reader.result); // Set the image URL after loading
                setLoading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageUrl(null); // Remove the selected image
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
                            <Input size="large" {...register("idNumber", { required: "Majburiy maydon" })} placeholder="Введите серию паспорта (AA1234567)" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="* Ism">
                            <Input size="large" {...register("firstName", { required: "Majburiy maydon" })} placeholder="Введите имя" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="* Familiya">
                            <Input size="large" {...register("lastName", { required: "Majburiy maydon" })} placeholder="Введите фамилию" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Otasining ismi">
                            <Input size="large" {...register("middleName")} placeholder="Введите отчество" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Manzil">
                            <Input size="large" {...register("address")} placeholder="Введите адрес" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tug‘ilgan sana">
                            <Input size="large" {...register("dayOfBirth")} placeholder="ГГГГ-ММ-ДД" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="* Telefon">
                            <Input size="large" {...register("phone", { required: "Majburiy maydon" })} placeholder="Введите номер телефона" />
                        </Form.Item>
                    </Col>


                    <Col span={12}>
                        <Form.Item label=" ">
                            <div style={{ display: "flex", gap: "20px", gap: "16px" }}>
                                <div style={{ display: "flex", gap: "20px", position: "relative" }}>
                                    <Button size="large"
                                        icon={<UploadOutlined />}
                                        onClick={() => document.getElementById("fileInput").click()}
                                        style={{ height: "100%", alignSelf: "center" }}
                                    >
                                        Rasm yuklash (3x4)
                                    </Button>
                                    {
                                        imageUrl &&
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
                                            {imageUrl && (
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
                                            )}
                                        </>
                                    }
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
        </div >
    );
};

export default RegisterWorker;
