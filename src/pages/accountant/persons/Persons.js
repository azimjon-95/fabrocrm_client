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
  InputNumber,
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
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      address: "",
      dayOfBirth: "",
      phone: "",
      idNumber: "",
      password: "",
      login: "",
      salary: "",
      role: "worker",
      workerType: "",
    },
  });

  const [createWorker, { isLoading: isCreateLoading }] = useCreateWorkerMutation();
  const [updateWorker, { isLoading: isUpdateLoading }] = useUpdateWorkerMutation();
  const [imageUrl, setImageUrl] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [workerType, setWorkerType] = useState(userData?.workerType || "");

  useEffect(() => {
    if (userData) {
      const fields = [
        "firstName",
        "lastName",
        "middleName",
        "address",
        "dayOfBirth",
        "phone",
        "idNumber",
        "password",
        "login",
        "role",
        "workerType",
      ];
      fields.forEach((field) => setValue(field, userData[field] || ""));
      setValue("salary", userData.salary?.[0]?.salary || "");
      setImageUrl(userData.imageUrl || null);
      setWorkerType(userData.workerType || "");
    }
  }, [userData, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      const payload = {
        firstName: String(data.firstName || ""),
        lastName: String(data.lastName || ""),
        middleName: String(data.middleName || ""),
        address: String(data.address || ""),
        dayOfBirth: String(data.dayOfBirth || ""),
        phone: String(data.phone || ""),
        idNumber: String(data.idNumber || ""),
        password: String(data.password || ""),
        login: String(data.login || ""),
        workerType: String(data.workerType || ""),
        role: String(data.role || "worker"),
      };

      // Barcha oddiy maydonlarni qo‘shish
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // `salary` ni to‘g‘ri formatda qo‘shish
      formData.append("salary[0][salary]", String(data.salary || ""));

      // `image` maydonini qo‘shish (serverda kutilgan nomga moslashtirilgan)
      if (imageUrl) {
        formData.append("image", imageUrl); // Serverda `image` nomi kutilmoqda
      }


      const response = userData
        ? await updateWorker({ id: userData._id, body: formData }).unwrap()
        : await createWorker(formData).unwrap();

      message.success(response.message || (userData ? "Ma'lumotlar yangilandi" : "Hodim ro‘yxatdan o‘tdi"));
      reset();
      setImageUrl(null);
      setFilePreview(null);
      navigate(-1);
    } catch (error) {
      console.error("Xato:", error?.data);
      message.error(error?.data?.message || "Xatolik yuz berdi");
    }
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        message.error("Fayl hajmi 5MB dan kichik bo‘lishi kerak");
        return;
      }
      setImageUrl(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const options = [
    { label: "Xodimlar", value: "hodimlar" },
    { label: "Ishchilar", value: "ishchilar" },
  ];

  return (
    <div>
      <div className="nav_add">
        <Button
          style={{ background: "#0A3D3A", marginTop: "10px" }}
          className="back-btns"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Orqaga qaytish
        </Button>
        <h2 className="create-worker-title">
          {userData ? "Hodimni ma'lumotlarini yangilash" : "Hodimlarni Ro‘yxatdan O‘tkazish"}
        </h2>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Xodim turi" required>
              <Radio.Group
                options={options}
                optionType="button"
                buttonStyle="solid"
                size="large"
                onChange={(e) => {
                  setWorkerType(e.target.value);
                  setValue("workerType", e.target.value);
                }}
                value={workerType}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Pasport seriya" required>
              <Controller
                name="idNumber"
                control={control}
                rules={{
                  required: "Pasport seriya kiritish majburiy",
                  pattern: {
                    value: /^[A-Z]{2}[0-9]{7}$/,
                    message: "Pasport seriya formati noto‘g‘ri (AA1234567)",
                  },
                }}
                render={({ field }) => (
                  <Input
                    size="large"
                    {...field}
                    placeholder="AA1234567"
                    maxLength={9}
                  />
                )}
              />
              {errors.idNumber && <p style={{ color: "red" }}>{errors.idNumber.message}</p>}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Ism" required>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: "Ism kiritish majburiy" }}
                render={({ field }) => (
                  <Input size="large" {...field} placeholder="Ism" />
                )}
              />
              {errors.firstName && <p style={{ color: "red" }}>{errors.firstName.message}</p>}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Familiya" required>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: "Familiya kiritish majburiy" }}
                render={({ field }) => (
                  <Input size="large" {...field} placeholder="Familiya" />
                )}
              />
              {errors.lastName && <p style={{ color: "red" }}>{errors.lastName.message}</p>}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Otasining ismi">
              <Controller
                name="middleName"
                control={control}
                render={({ field }) => (
                  <Input size="large" {...field} placeholder="Otasining ismi" />
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
                  <Select
                    size="large"
                    {...field}
                    placeholder="Lavozim tanlang"
                    style={{ height: "37px", marginTop: "5px" }}
                  >
                    <Option value="manager">Menejer</Option>
                    <Option value="distributor">Yetkazib beruvchi</Option>
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
            <Form.Item label="Oylik maosh" required>
              <Controller
                name="salary"
                control={control}
                rules={{ required: "Oylik maosh kiritish majburiy" }}
                render={({ field }) => (
                  <InputNumber
                    size="large"
                    {...field}
                    placeholder="Oylik maosh"
                    style={{ width: "100%" }}
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  />
                )}
              />
              {errors.salary && <p style={{ color: "red" }}>{errors.salary.message}</p>}
            </Form.Item>
          </Col>
          {workerType !== "ishchilar" ? (
            <>
              <Col span={6}>
                <Form.Item label="Login" required>
                  <Controller
                    name="login"
                    control={control}
                    rules={{ required: "Login kiritish majburiy" }}
                    render={({ field }) => (
                      <Input size="large" {...field} placeholder="Login" />
                    )}
                  />
                  {errors.login && <p style={{ color: "red" }}>{errors.login.message}</p>}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Parol" required>
                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: "Parol kiritish majburiy" }}
                    render={({ field }) => (
                      <Input.Password size="small" {...field} placeholder="Parol" />
                    )}
                  />
                  {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
                </Form.Item>
              </Col>
            </>
          ) : (
            <Col span={6}>
              <Form.Item label="Ishchi kasbi" required>
                <Controller
                  name="workerType"
                  control={control}
                  rules={{ required: "Ishchi kasbini kiritish majburiy" }}
                  render={({ field }) => (
                    <Input size="large" {...field} placeholder="Ishchi kasbi" />
                  )}
                />
                {errors.workerType && <p style={{ color: "red" }}>{errors.workerType.message}</p>}
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
                  <Input size="large" {...field} placeholder="Manzil" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tug‘ilgan sana">
              <Controller
                name="dayOfBirth"
                control={control}
                rules={{
                  pattern: {
                    value: /^\d{4}-\d{2}-\d{2}$/,
                    message: "Tug‘ilgan sana formati GGGG-MM-DD bo‘lishi kerak",
                  },
                }}
                render={({ field }) => (
                  <Input size="large" {...field} placeholder="GGGG-MM-DD" />
                )}
              />
              {errors.dayOfBirth && <p style={{ color: "red" }}>{errors.dayOfBirth.message}</p>}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Telefon" required>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Telefon raqami kiritish majburiy",
                  pattern: {
                    value: /^[0-9]{9}$/,
                    message: "Telefon raqami 9 ta raqamdan iborat bo‘lishi kerak",
                  },
                }}
                render={({ field }) => (
                  <Input
                    size="large"
                    {...field}
                    placeholder="xx xxx xx xx"
                    maxLength={9}
                    onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
                  />
                )}
              />
              {errors.phone && <p style={{ color: "red" }}>{errors.phone.message}</p>}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Rasm">
              <div style={{ display: "flex", gap: "20px", position: "relative" }}>
                <Button
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  Rasm yuklash (3x4)
                </Button>
                {filePreview && (
                  <>
                    <Avatar
                      size={100}
                      src={filePreview}
                      icon={isCreateLoading || isUpdateLoading ? <Spin /> : <UserOutlined />}
                      className="create-avatar"
                    />
                    <Button
                      type="link"
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setImageUrl(null);
                        setFilePreview(null);
                      }}
                      style={{ position: "absolute", top: 0, right: 0 }}
                    />
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
          >
            {userData ? "Yangilash" : "Ro‘yxatdan o‘tkazish"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterWorker;