import React, { useState, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Input, Button, message, Row, Col, Radio, Form, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import "./style.css";

const OrderForm = () => {
  const [fileList, setFileList] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      paymentType: "Naqd",
      customerType: "Yuridik shaxs",
      dimensions: { length: "", width: "", height: "" },
    },
  });

  const navigate = useNavigate();
  const customerType = watch("customerType");

  const { fields } = useFieldArray({ control, name: "dimensions" });

  const onSubmit = useCallback(
    (data) => {
      // Agar barcha majburiy maydonlar to'ldirilmagan bo'lsa, funksiyani to'xtatish
      // if (!data.name || !data.customerType || !data.paymentType || !data.fullName || !data.phone || !data.address) {
      //   message.warning("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      //   return;
      // }

      const formData = {
        name: data.name,
        customerType: data.customerType,
        paymentType: data.paymentType,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        date: moment(data.date).toISOString(),
        companyName:
          data.customerType === "Yuridik shaxs" ? data.companyName : undefined,
        inn: data.customerType === "Yuridik shaxs" ? data.inn : undefined,
        director:
          data.customerType === "Yuridik shaxs" ? data.director : undefined,
        images: fileList[0],
        dimensions: data.dimensions,
        estimatedDays: data.estimatedDays,
      };

      navigate("/order/mengement", { state: formData });
    },
    [customerType, fileList, navigate]
  );

  // const uploadProps = {
  //   fileList,
  //   beforeUpload: (file) => {
  //     setFileList(file);
  //     return false;
  //   },
  //   onRemove: () => setFileList(null),
  // };

  const uploadProps = {
    fileList,
    beforeUpload: (file) => {
      setFileList([file]); // Faqat bitta faylni saqlash
      return false; // Faylni avtomatik yuklamaslik
    },
    onRemove: () => setFileList([]), // Faylni o‘chirish
  };

  const options = [
    { label: "Jismoniy shaxs", value: "Jismoniy shaxs" },
    { label: "Yuridik shaxs", value: "Yuridik shaxs" },
  ];

  const paymentTypeControl = [
    { label: "Naqd", value: "Naqd" },
    { label: "Karta orqali", value: "Karta orqali" },
    { label: "Bank orqali", value: "Bank orqali" },
  ];
  return (
    <>
      <Form
        onFinish={handleSubmit(onSubmit)}
        layout="vertical"
        className="order-form"
      >
        <h2>Buyurtma qabul qilish</h2>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Buyurtmaning nomi">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Название заказа" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Masul Shaxs Ism Familyasi">
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Введите Имя" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={6}>
            <Form.Item label="Mijoz turi:">
              <Controller
                name="customerType"
                control={control}
                render={({ field }) => (
                  <Radio.Group
                    {...field}
                    optionType="button"
                    buttonStyle="solid"
                    options={options}
                    size="large"
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Tulov turi:">
              <Controller
                name="paymentType"
                control={control}
                render={({ field }) => (
                  <Radio.Group
                    {...field}
                    optionType="button"
                    buttonStyle="solid"
                    options={paymentTypeControl}
                    size="large"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Telefon raqami">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Введите номер телефона" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Manzil">
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Введите адрес" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {customerType === "Yuridik shaxs" && (
          <>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Kompaniya nomi">
                  <Controller
                    name="companyName"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Название компании" />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Direktorning ismi">
                  <Controller
                    name="director"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Имя директора" />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="INN (Soliq identifikatsiya raqami)">
                  <Controller
                    name="inn"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="ИНН" />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Row gutter={12}>
          <Col span={12}>
            {/* <Form.Item label="Rasm yuklash">
              <Upload accept="image/*" {...uploadProps} listType="picture">
                <Button icon={<UploadOutlined />}>Fayl tanlash</Button>
              </Upload>
            </Form.Item> */}
            <Form.Item label="Rasm yuklash">
              <Upload accept="image/*" {...uploadProps} listType="picture">
                {fileList.length === 0 && ( // Agar fayl tanlanmagan bo'lsa, tugmani ko'rsatish
                  <Button icon={<UploadOutlined />}>Fayl tanlash</Button>
                )}
              </Upload>
            </Form.Item>
            ;
          </Col>
          <Col span={4}>
            <Form.Item label="Razmerlar: Uzunligi (sm)">
              <Controller
                name="dimensions.length"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Введите длину (см)" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Razmerlar: Eni (sm)">
              <Controller
                name="dimensions.width"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Введите ширину (см)" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Razmerlar: Balandligi (sm)">
              <Controller
                name="dimensions.height"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Введите высоту (см)" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Taxminiy vaqt">
              <Controller
                name="estimatedDays"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Введите высоту (см)" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Button
          style={{ width: "100%", marginTop: "15px" }}
          size="large"
          type="primary"
          htmlType="submit"
        >
          Omborga o'tish
        </Button>
      </Form>
    </>
  );
};

export default React.memo(OrderForm);
