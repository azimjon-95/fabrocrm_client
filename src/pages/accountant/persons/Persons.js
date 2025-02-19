import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Radio,
  Form,
  Input,
  Avatar,
  Button,
  Row,
  Col,
  Select,
  Spin,
  message,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useCreateWorkerMutation,
  useUpdateWorkerMutation,
} from "../../../context/service/worker";
import "./style.css";

const { Option } = Select;

const RegisterWorker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;
  const { control, handleSubmit, reset, setValue } = useForm();

  const [createWorker, { isLoading: isCreateLoading }] =
    useCreateWorkerMutation();
  const [updateWorker, { isLoading: isUpdateLoading }] =
    useUpdateWorkerMutation();

  const [imageUrl, setImageUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [workerType, setWorkerType] = useState("");

  useEffect(() => {
    if (userData) {
      setValue("firstName", userData.firstName);
      setValue("lastName", userData.lastName);
      setValue("middleName", userData.middleName);
      setValue("address", userData.address);
      setValue("dayOfBirth", userData.dayOfBirth);
      setValue("login", userData.login);
      setValue("password", userData.password);
      setValue("phone", userData.phone);
      setValue("idNumber", userData.idNumber);
      setValue("salary", userData.salary);
      setValue("role", userData.role);
      setValue("workerType", null);
      setImageUrl(userData.imageUrl || null); // If there's an image URL
    }
  }, [userData, setValue]);

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
      formData.append("password", data.password);
      formData.append("salary", +data.salary);
      formData.append("login", data.login);
      formData.append("workerType", data.workerType);
      formData.append("role", data.role);

      if (imageUrl) {
        formData.append("image", imageUrl);
      }

      let response;

      if (userData) {
        response = await updateWorker({
          id: userData._id,
          data: formData,
        }).unwrap();
        message.success("Foydalanuvchi yangilandi");
      } else {
        response = await createWorker(formData).unwrap();
        message.success(response.message);
      }
      console.log(response);

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
      reader.onloadend = () => {
        setImageUrl(file);
        setFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const options = [
    { label: "Xodimlar", value: "hodimlar" },
    { label: "Ishchilar", value: "ishchilar" },
  ];

  return (
    <div>
      <div className="nav_add">
        <button
          style={{ background: "#0A3D3A", marginTop: "10px" }}
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftOutlined />
          Orqaga qaytish
        </button>
        <h2 className="create-worker-title">
          {userData
            ? "Hodimni ma'lumotlarini yangilash"
            : "Hodimlarni Ro‘yxatdan O‘tkazish"}
        </h2>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Xodim turi:">
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                options={options}
                size="large"
                onChange={(e) => setWorkerType(e.target.value)} // useState holatini yangilash
                value={workerType} // useState qiymatini o'rnatish
              />
            </Form.Item>
          </Col>
          <Col span={6}>
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
          <Col span={4}>
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

          <Col span={4}>
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
          <Col span={4}>
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
          <Col span={6}>
            <Form.Item label="Lavozim">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select size="large" {...field} placeholder="Lavozim tanlang">
                    <Option value="manager">Menejer</Option>
                    <Option value="seller">Sotuvchi</Option>
                    <Option value="director">Direktor</Option>
                    <Option value="accountant">Buxgalter</Option>
                    <Option value="warehouseman">Omborchi</Option>
                    <Option value="deputy">Direktor o‘rinbosari</Option>
                    <Option value="worker">Ishchi</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item required label="Oylik maoshi">
              <Controller
                name="salary"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>
          {workerType !== "ishchilar" ? (
            <>
              <Col span={6}>
                <Form.Item required label="Login">
                  <Controller
                    name="login"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item required label="Parol">
                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
              </Col>
            </>
          ) : (
            <Col span={6}>
              <Form.Item required label="Ishchi kasbi">
                <Controller
                  name="workerType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
            </Col>
          )}
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
                    placeholder="Введите номер телефона (xx xxx xx xx)"
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label=" ">
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
                {file && (
                  <>
                    <Avatar
                      size={100}
                      src={file || null}
                      icon={
                        isCreateLoading || isUpdateLoading ? (
                          <Spin />
                        ) : (
                          <UserOutlined />
                        )
                      }
                      className="create-avatar"
                    />
                    <div
                      onClick={() => {
                        setImageUrl(null);
                        setFile(null);
                      }}
                      className="avatar-close-button"
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
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={isCreateLoading || isUpdateLoading}
            style={{
              width: "200px",
              background: "#0A3D3A",
              marginTop: "20px",
            }}
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
