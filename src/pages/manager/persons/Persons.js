import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, Input, Avatar, Button, Row, Col, Spin, message } from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCreateWorkerMutation } from "../../../context/service/worker";
import "./style.css";

const RegisterWorker = () => {
  const navigate = useNavigate();
  const [createWorker, { isLoading }] = useCreateWorkerMutation();
  const { control, handleSubmit, reset } = useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [img, setImg] = useState(null);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("middleName", data.middleName);
      formData.append("address", data.address);
      formData.append("dayOfBirth", data.dayOfBirth);
      formData.append("phone", data.phone);
      formData.append("idNumber", data.idNumber);

      if (img) {
        formData.append("image", img);
      }

      const response = await createWorker(formData).unwrap();
      message.success(response.message);
      reset();
      setImageUrl(null);
    } catch (error) {
      message.error(error?.data?.message);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImg(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="nav_add">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined />
          Orqaga qaytish
        </button>
        <h2 className="create-worker-title">Ishchi Ro‘yxatdan O‘tkazish</h2>
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
          <Col span={12}>
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
        </Row>
        <Row gutter={16}>
          <Col span={12}>
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
            <Form.Item label=" ">
              <div style={{ display: "flex", gap: "20px", gap: "16px" }}>
                <div
                  style={{ display: "flex", gap: "20px", position: "relative" }}
                >
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
                        icon={isLoading ? <Spin /> : <UserOutlined />}
                        className="create-avatar"
                      />
                      <div
                        onClick={() => setImageUrl(null)}
                        className="avatar-close-button"
                      >
                        <CloseOutlined />
                      </div>
                    </>
                  )}
                  <input
                    type="file"
                    // only image
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
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
          >
            Ro‘yxatdan o‘tkazish
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterWorker;
