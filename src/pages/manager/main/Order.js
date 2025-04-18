import React, { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Input,
  Button,
  message,
  List,
  Row,
  Col,
  Radio,
  Select,
  Form,
} from "antd";
import { useNavigate } from "react-router-dom";
import { HiArrowSmRight } from "react-icons/hi";
import { IoMdImages } from "react-icons/io";
import { GrAdd } from "react-icons/gr";
import { regions } from "../../../utils/regions";
import { useCreateOrderMutation } from "../../../context/service/orderApi";
import moment from "moment";
import "./style.css";
import { original } from "@reduxjs/toolkit";

const { Option } = Select;
const Order = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const navigate = useNavigate();
  const [savedFurniture, setSavedFurniture] = useState([]);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  // const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const { control, handleSubmit, watch, errors } = useForm({
    defaultValues: {
      paymentType: "Naqd",
      customerType: "Yuridik shaxs",
      dimensions: { length: "", width: "", height: "" },
    },
  });

  const handleRegionChange = (value) => {
    const foundRegion = regions[value]; // value ni regions dan to'g'ridan-to'g'ri olish
    if (foundRegion) {
      sessionStorage.setItem("location", foundRegion.location);
    } else {
      message.warning("Region topilmadi");
    }
  };

  const customerType = watch("customerType");

  const onSubmit = useCallback(
    (data) => {
      if (
        !data.customerType ||
        !data.fullName ||
        !data.phone ||
        !data.address.region || // Viloyat
        !data.address.district || // Tuman
        !data.address.street || // Uy
        !data.estimatedDays
      ) {
        message.warning("Iltimos, barcha majburiy maydonlarni to'ldiring!");
        return;
      }

      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("paid", 0);
      formData.append("address[region]", data.address.region);
      formData.append("address[district]", data.address.district);
      formData.append("address[street]", data.address.street);
      formData.append("address[location]", sessionStorage.getItem("location"));
      formData.append("description", data.description);
      formData.append("date", moment(data.date).toISOString());
      formData.append("estimatedDays", data.estimatedDays);
      formData.append("customer[type]", data.customerType);
      formData.append("customer[fullName]", data.fullName);
      formData.append("customer[phone]", data.phone);
      formData.append("customer[companyName]", data.companyName);
      formData.append("customer[director]", data.director);
      formData.append("customer[inn]", data.inn || "");
      formData.append("customer[paymentType]", data.paymentType);
      formData.append("isType", true);
      formData.append("nds", data.nds);

      // `orders` massivida har bir buyumni FormData ichiga joylash
      savedFurniture.forEach((item, index) => {
        formData.append(`orders[${index}][name]`, item.name);
        formData.append(
          `orders[${index}][dimensions][length]`,
          item.dimensions.length
        );
        formData.append(
          `orders[${index}][dimensions][width]`,
          item.dimensions.width
        );
        formData.append(
          `orders[${index}][dimensions][height]`,
          item.dimensions.height
        );
        formData.append(`orders[${index}][originalPrice]`, item.budget);
        // formData.append(`orders[${index}][budget]`, item.budget);
        const ndsAmount = (item.budget * data.nds) / 100; // NDS summasini hisoblash
        const updatedBudget = item.budget + ndsAmount; // Asl budgetga NDS qo'shish
        formData.append(`orders[${index}][budget]`, Math.round(updatedBudget)); // Ikkita kasr xonasi bilan
        formData.append(`orders[${index}][quantity]`, item.quantity);
        formData.append(`orders[${index}][description]`, item.description);

        if (item.image) {
          formData.append("images", item.image);
        }
      });

      createOrder(formData)
        .then((res) => {
          // message.success("Buyurtma muvaffaqiyatli yaratildi!");
          if (res?.data?.innerData) {
            navigate("/order/mengement/" + res?.data?.innerData?._id);
          }
        })
        .catch((err) => {
          console.error("Xatolik yuz berdi:", err);
          message.error("Xatolik yuz berdi! Iltimos, qaytadan urinib ko'ring.");
        });
    },
    [savedFurniture, navigate, createOrder]
  );

  const options = [
    { label: "Jismoniy shaxs", value: "Jismoniy shaxs" },
    { label: "Yuridik shaxs", value: "Yuridik shaxs" },
  ];

  // const { control, handleSubmit, reset } = useForm(); // useForm hooki orqali formni boshqarish
  const [formData, setFormData] = useState({
    name: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    budget: "",
    quantity: 1,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["length", "width", "height"].includes(name)) {
      // O'lchamlar (dimensions) obyektini yangilash
      setFormData((prevData) => ({
        ...prevData,
        dimensions: {
          ...prevData.dimensions,
          [name]: value,
        },
      }));
    } else {
      // Barcha boshqa maydonlarni (name, budget, quantity) yangilash
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // setImage(URL.createObjectURL(file));
      setFile(file);
    }
  };

  const handleSaveFurniture = () => {
    if (
      formData.name && formData.budget
    ) {
      const newFurniture = {
        name: formData.name,
        dimensions: {
          length: formData.dimensions.length,
          width: formData.dimensions.width,
          height: formData.dimensions.height,
        },
        image: file,
        quantity: +formData.quantity,
        originalPrice: +formData.budget,
        budget: +formData.budget * +formData.quantity,
        description: formData.description,
      };
      setSavedFurniture([...savedFurniture, newFurniture]);
      setFormData({
        name: "",
        dimensions: {
          length: "",
          width: "",
          height: "",
        },
        quantity: 0,
        budget: "",
        description: "",
      });
      setFile(null);
    }
  };

  return (
    <>
      <Form
        onFinish={handleSubmit(onSubmit)}
        layout="vertical"
        className="order-form"
      >
        <h2 style={{ color: "#0A3D3A" }}>Buyurtma qabul qilish</h2>
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

          {/* <Col span={12}>
            <Form.Item label="Telefon raqami">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Введите номер телефона" />
                )}
              />
            </Form.Item>
          </Col> */}
          <Col span={12}>
            <Form.Item
              label="Telefon raqami"
              validateStatus={errors?.phone ? "error" : ""}
              help={errors?.phone?.message}
            >
              <Controller
                name="phone"
                control={control}
                rules={{ required: "Telefon raqami majburiy" }}
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
            <Form.Item required label="Viloyat">
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
                      setSelectedRegion(value);
                    }}
                    placeholder="Выберите область"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
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
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
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
          <Col span={6}>
            <Form.Item label="Mebel nomi">
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Mebel nomini kiriting"
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Miqdori">
              <Input
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Mebel sonini kiriting"
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Budjeti">
              <Input
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Mebel narxini kiriting"
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item label="Uzunligi (sm)">
              <Input
                name="length"
                value={formData.dimensions.length}
                onChange={handleChange}
                placeholder="Uzunlik (sm)"
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Eni (sm)">
              <Input
                name="width"
                value={formData.dimensions.width}
                onChange={handleChange}
                placeholder="Eni (sm)"
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Balandligi (sm)">
              <Input
                name="height"
                value={formData.dimensions.height}
                onChange={handleChange}
                placeholder="Balandlik (sm)"
              />
            </Form.Item>
          </Col>
          <Col span={1.5}>
            <Form.Item label="Rasm">
              <label className="uploadButton">
                <IoMdImages />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="uploadInput"
                />
              </label>
            </Form.Item>
          </Col>

          {/* Save Button with Icon */}

          <Col span={1.5}>
            <Form.Item label="Qo'shish">
              <Button
                type="primary"
                onClick={() => handleSaveFurniture()}
                className="saveButton"
              >
                <GrAdd />
              </Button>
            </Form.Item>
          </Col>
        </Row>

        {/* Saqlangan mebellarni ro'yxat shaklida ko'rsatish */}
        <Row gutter={12}>
          <Col span={12}>
            <List
              header={<div>Mebellar</div>}
              bordered
              dataSource={savedFurniture}
              style={{ marginTop: "20px" }}
              renderItem={(item) => (
                <List.Item>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <strong>Nomi:</strong> {item.name}
                        </div>
                        <div>
                          <strong>Miqdori:</strong> {item.quantity}
                        </div>
                        <div>
                          <strong>Narxi:</strong> {item.budget}
                        </div>
                        <div>
                          <strong>Jami:</strong> {+item.budget * +item.quantity}
                        </div>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <strong>Razmerlar:</strong> {item.dimensions.length}sm
                          (U) × {item.dimensions.width}sm (E) ×{" "}
                          {item.dimensions.height}
                          sm (B)
                        </div>
                      </div>
                    </div>
                    {item.image && (
                      <img
                        // src={item.image}
                        src={URL.createObjectURL(item.image)}
                        alt={item.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                  </div>
                </List.Item>
              )}
            />
          </Col>

          <Col span={12}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="Taxminiy tayyor bolish vaqt">
                  <Controller
                    name="estimatedDays"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Примерное время готовности"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="NDS">
                  <Controller
                    name="nds"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="NDS" />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* <Form.Item label="Tavsif">
              <Input.TextArea
                name="description"
                value={formData.dimensions.height}
                onChange={handleChange}
                placeholder="Tavsif"
                autoSize={{ minRows: 5.8, maxRows: 5.8 }} // 5 qatordan iborat qilib belgilandi
              /> */}
            <Form.Item label="Tavsif">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    autoSize={{ minRows: 5.8, maxRows: 5.8 }}
                    placeholder="Tavsif"
                    onChange={handleChange}
                  />
                )}
              />
            </Form.Item>
            {/* </Form.Item> */}
          </Col>
        </Row>

        <Button
          style={{
            width: "200px",
            background: "#0A3D3A",
            marginTop: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          size="large"
          type="primary"
          htmlType="submit"
          loading={isLoading}
        >
          Omborga o'tish{" "}
          <HiArrowSmRight
            style={{ marginTop: "4px", fontSize: "22px", marginLeft: "15px" }}
          />
        </Button>
      </Form>
    </>
  );
};

export default React.memo(Order);
