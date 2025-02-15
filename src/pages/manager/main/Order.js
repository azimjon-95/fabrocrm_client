import React, { useState, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Input, Button, message, Row, Col, Radio, Select, Form, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import { HiArrowSmRight } from "react-icons/hi";
import { regions } from "../../../utils/regions";
import moment from "moment";
import "./style.css";


const { Option } = Select;
const Order = () => {
  const [fileList, setFileList] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const navigate = useNavigate();
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      paymentType: "Naqd",
      customerType: "Yuridik shaxs",
      dimensions: { length: "", width: "", height: "" },
    },
  });

  const handleRegionChange = (value) => {
    const foundRegion = regions[value]; // value ni regions dan to'g'ridan-to'g'ri olish
    if (foundRegion) {
      sessionStorage.setItem('location', foundRegion.location)
    } else {
      message.warning("Region topilmadi");
    }
  };

  const customerType = watch("customerType");
  const { fields } = useFieldArray({ control, name: "dimensions" });

  const onSubmit = useCallback(
    (data) => {
      // // Agar barcha majburiy maydonlar to'ldirilmagan bo'lsa, funksiyani to'xtatish
      if (!data.name || !data.customerType || !data.paymentType || !data.fullName || !data.phone || !data.address) {
        message.warning("Iltimos, barcha majburiy maydonlarni to'ldiring!");
        return;
      }

      const formData = {
        name: data.name,
        customerType: data.customerType,
        fullName: data.fullName,
        phone: data.phone,
        address: {
          region: data.address.region,
          district: data.address.district,
          street: data.address.street,
          location: sessionStorage.getItem('location'),
        },
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

      // return
      navigate("/order/mengement", { state: formData });
      // reset inputs
    },
    [customerType, fileList, navigate]
  );

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

  return (
    <>
      <Form
        onFinish={handleSubmit(onSubmit)}
        layout="vertical"
        className="order-form"
      >
        <h2 style={{ color: "#0A3D3A" }}>Buyurtma qabul qilish</h2>
        <Row gutter={12}>
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
          {/* <Col span={6}>
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
          </Col> */}

        </Row>

        <Row gutter={12}>
          <Col span={6}>
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
          <Col span={6}>
            <Form.Item label="Taxminiy tayyor bolish vaqt">
              <Controller
                name="estimatedDays"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Примерное время готовности" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
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

        </Row>

        {customerType === "Yuridik shaxs" && (
          <>
            <Row gutter={12}>
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
          <Col span={selectedRegion ? 6 : 12}>
            <Form.Item label="Viloyat">
              <Controller
                name="address.region"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    showSearch
                    onChange={(value) => {
                      field.onChange(value);
                      handleRegionChange(value);
                      setSelectedRegion(value)
                    }}
                    placeholder="Выберите область"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {Object.keys(regions).map((region) => (
                      <Option key={region} value={region}>
                        {region}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          {selectedRegion && (
            <Col span={6}>
              <Form.Item label="Tuman">
                <Controller
                  name="address.district"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      size="large"
                      showSearch
                      placeholder="Выберите район"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {regions[selectedRegion]?.districts?.map((district) => (
                        <Option key={district} value={district}>
                          {district}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          )}
          <Col span={12}>
            <Form.Item label="Manzil">
              <Controller
                name="address.street"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Введите адрес" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Rasm yuklash">
              <Upload accept="image/*" {...uploadProps} listType="picture">
                {fileList.length === 0 && ( // Agar fayl tanlanmagan bo'lsa, tugmani ko'rsatish
                  <Button icon={<UploadOutlined />}>Fayl tanlash</Button>
                )}
              </Upload>
            </Form.Item>

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

        </Row>

        <Button
          style={{ width: "200px", background: "#0A3D3A", marginTop: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}
          size="large"
          type="primary"
          htmlType="submit"
        >
          Omborga o'tish <HiArrowSmRight style={{ marginTop: "4px", fontSize: "22px", marginLeft: "15px" }} />
        </Button>
      </Form>
    </>
  );
};

export default React.memo(Order);










// import React, { useState } from "react";
// import { Select } from "antd";

// const { Option } = Select;


// const RegionSelect = () => {
//

//   return (

//   );
// };

// export default RegionSelect;
