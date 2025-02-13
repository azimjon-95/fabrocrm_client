import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, Input, Avatar, Button, Row, Col, Select, Spin, message } from "antd";
import { UploadOutlined, ArrowLeftOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateAdminMutation, useUpdateAdminMutation } from "../../../context/service/adminApi";
import "./style.css";

const { Option } = Select;

const Persons = () => {
    const navigate = useNavigate();
    const [createAdmin, { isLoading: isCreateLoading }] = useCreateAdminMutation();
    const [updateAdmin, { isLoading: isUpdateLoading }] = useUpdateAdminMutation();
    const { control, handleSubmit, reset, setValue } = useForm();
    const [imageUrl, setImageUrl] = useState(null);
    const location = useLocation();
    const userData = location.state?.userData;

    useEffect(() => {
        if (userData) {
            setValue("firstName", userData.firstName);
            setValue("lastName", userData.lastName);
            setValue("dayOfBirth", userData.dayOfBirth);
            setValue("phone", `+998${userData.phone}`);
            setValue("login", userData.login);
            setValue("role", userData.role);
            setImageUrl(userData.imageUrl || null);
        }
    }, [userData, setValue]);

    const onSubmit = async (data) => {
        try {
            const formData = {
                firstName: data.firstName,
                lastName: data.lastName,
                dayOfBirth: data.dayOfBirth,
                phone: data.phone.replace("+998", ""),
                login: data.login,
                password: data.password,
                role: data.role,
            };

            let response;
            if (userData) {
                response = await updateAdmin({ id: userData._id, data: formData }).unwrap();
                message.success("Foydalanuvchi yangilandi");
            } else {
                response = await createAdmin(formData);
                message.success(response.message);
            }

            reset();
            setImageUrl(null);
            navigate(-1)
        } catch (error) {
            message.error(error?.data?.message || "Xatolik yuz berdi");
        }
    };


    return (
        <div>
            <div className="nav_add">
                <button style={{ background: "#0A3D3A" }} className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeftOutlined />
                    Orqaga qaytish
                </button>
                <h2 className="create-worker-title">
                    {userData ? "Hodim ma'lumotlarini yangilash" : "Hodimlarni Ro‘yxatdan O‘tkazish"}
                </h2>
            </div>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item required label="Ism">
                            <Controller name="firstName" control={control} rules={{ required: true }} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item required label="Familiya">
                            <Controller name="lastName" control={control} rules={{ required: true }} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item required label="Login">
                            <Controller name="login" control={control} rules={{ required: true }} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item required label="Parol">
                            <Controller name="password" control={control} rules={{ required: true }} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item required label="Tug‘ilgan sana">
                            <Controller name="dayOfBirth" control={control} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item required label="Telefon">
                            <Controller name="phone" control={control} rules={{ required: true }} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item required label="Role">
                            <Controller name="role" control={control} rules={{ required: true }} render={({ field }) => (
                                <Select size="large" {...field}>
                                    <Option value="manager">Menejer</Option>
                                    <Option value="director">Direktor</Option>
                                    <Option value="accountant">Buxgalter</Option>
                                    <Option value="warehouseman">Omborchi</Option>
                                    <Option value="deputy_director">Direktor o‘rinbosari</Option>
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item>
                    <Button style={{
                        background: "#0A3D3A",
                        width: "200px",
                        marginTop: "20px"

                    }} size="large" type="primary" htmlType="submit" loading={isCreateLoading || isUpdateLoading} block>
                        {userData ? "Yangilash" : "Ro‘yxatdan o‘tkazish"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Persons;
