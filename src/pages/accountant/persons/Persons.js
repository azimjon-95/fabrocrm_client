import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, Input, Avatar, Button, Row, Col, Select, Spin, message } from "antd";
import {
    UploadOutlined,
    ArrowLeftOutlined,
    UserOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateWorkerMutation, useUpdateWorkerMutation } from "../../../context/service/worker";
import "./style.css";

const RegisterWorker = () => {
    const navigate = useNavigate();
    const [createWorker, { isLoading: isCreateLoading }] = useCreateWorkerMutation();
    const [updateWorker, { isLoading: isUpdateLoading }] = useUpdateWorkerMutation();
    const { control, handleSubmit, reset, setValue } = useForm();
    const [imageUrl, setImageUrl] = useState(null);
    const location = useLocation();
    const userData = location.state?.userData;

    // If userData exists, prefill the form with the userData
    useEffect(() => {
        if (userData) {
            setValue("firstName", userData.firstName);
            setValue("lastName", userData.lastName);
            setValue("middleName", userData.middleName);
            setValue("address", userData.address);
            setValue("dayOfBirth", userData.dayOfBirth);
            setValue("phone", userData.phone);
            setValue("idNumber", userData.idNumber);
            setValue("workerType", userData.workerType);
            setImageUrl(userData.imageUrl || null); // If there's an image URL
        }
    }, [userData, setValue]);

    const onSubmit = async (data) => {
        console.log(data);
        try {
            const formData = new FormData();
            formData.append("firstName", data.firstName);
            formData.append("lastName", data.lastName);
            formData.append("middleName", data.middleName);
            formData.append("address", data.address);
            formData.append("dayOfBirth", data.dayOfBirth);
            formData.append("phone", data.phone);
            formData.append("idNumber", data.idNumber);
            formData.append("workerType", data.workerType);

            if (imageUrl) {
                formData.append("image", imageUrl);
            }

            let response;

            if (userData) {
                // Update worker if userData exists
                response = await updateWorker({ id: userData._id, data: formData }).unwrap();
                message.success("Foydalanuvchi yangilandi");
            } else {
                // Create new worker if userData does not exist
                response = await createWorker(formData).unwrap();
                message.success(response.message);
            }

            reset();
            setImageUrl(null);
        } catch (error) {
            message.error(error?.data?.message || "Xatolik yuz berdi");
        }
    };



    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <div className="nav_add">
                <button style={{ background: "#0A3D3A", marginTop: "10px" }} className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeftOutlined />
                    Orqaga qaytish
                </button>
                <h2 className="create-worker-title">{userData ? "Hodimni ma'lumotlarini yangilash" : "Hodimlarni Ro‘yxatdan O‘tkazish"}</h2>
            </div>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item required={true} label="Pasport seriya ">
                            <Controller
                                name="idNumber"
                                control={control}
                                rules={{ required: "Majburiy maydon" }}
                                render={({ field }) => (
                                    <Input
                                        size="large"
                                        {...field}
                                        value={field.value}
                                        placeholder="Введите серию паспорта (AA1234567)"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item required={true} label="Ism">
                            <Controller
                                name="firstName"
                                control={control}
                                rules={{ required: "Majburiy maydon" }}
                                render={({ field }) => (
                                    <Input size="large" {...field} placeholder="Введите имя" />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item required={true} label="Familiya">
                            <Controller
                                name="lastName"
                                control={control}
                                rules={{ required: "Majburiy maydon" }}
                                render={({ field }) => (
                                    <Input
                                        size="large"
                                        {...field}
                                        placeholder="Введите фамилию"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Otasining ismi">
                            <Controller
                                name="middleName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        size="large"
                                        {...field}
                                        placeholder="Введите отчество"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item required label="Kasbi">
                            <Controller name="workerType" control={control} rules={{ required: true }} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>




                </Row>


                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Manzil">
                            <Controller
                                name="address"
                                control={control}
                                render={({ field }) => (
                                    <Input size="large" {...field} placeholder="Введите адрес" />
                                )}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tug‘ilgan sana">
                            <Controller
                                name="dayOfBirth"
                                control={control}
                                render={({ field }) => (
                                    <Input size="large" {...field} placeholder="ГГГГ-ММ-ДД" />
                                )}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item required={true} label="Telefon">
                            <Controller
                                name="phone"
                                control={control}
                                rules={{ required: "Majburiy maydon" }}
                                render={({ field }) => (
                                    <Input
                                        size="large"
                                        {...field}
                                        placeholder="Введите номер телефона"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label=" " >
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
                                            icon={isCreateLoading || isUpdateLoading ? <Spin /> : <UserOutlined />}
                                            className="create-avatar"
                                        />
                                        <div onClick={() => setImageUrl(null)} className="avatar-close-button">
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
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item>
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={isCreateLoading || isUpdateLoading}
                        style={{ width: "200px", background: "#0A3D3A", marginTop: "20px" }}
                        block
                    >
                        {userData ? "Yangilash" : "Ro‘yxatdan o‘tkazish"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegisterWorker;


