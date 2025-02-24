import React, { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, Button, message, List, Row, Col, Radio, Select, Form, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import { HiArrowSmRight } from "react-icons/hi";
import { IoMdImages } from "react-icons/io";
import { GrAdd } from "react-icons/gr";
import { regions } from "../../../utils/regions";
import { useCreateOrderMutation } from "../../../context/service/orderApi";
import moment from "moment";
import "./style.css";


const { Option } = Select;
const Order = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const navigate = useNavigate();
  const [savedFurniture, setSavedFurniture] = useState([]);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [image, setImage] = useState(null);
  const { control, handleSubmit, watch, reset } = useForm({
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

  // const onSubmit = useCallback(
  //   (data) => {
  //     // Agar barcha majburiy maydonlar to'ldirilmagan bo'lsa, funksiyani to'xtatish
  //     if (!data.customerType || !data.fullName || !data.phone || !data.address) {
  //       message.warning("Iltimos, barcha majburiy maydonlarni to'ldiring!");
  //       return;
  //     }

  //     const myData = {
  //       customerType: data.customerType,
  //       fullName: data.fullName,
  //       paid: +0,
  //       address: {
  //         region: data.address.region,
  //         district: data.address.district,
  //         street: data.address.street,
  //         location: sessionStorage.getItem("location"),
  //       },
  //       description: data.description,
  //       date: moment(data.date).toISOString(),
  //       estimatedDays: data.estimatedDays,
  //       customer: {
  //         type: data.customerType,
  //         fullName: data.fullName,
  //         phone: data.phone,
  //         companyName: data.companyName,
  //         director: data.director,
  //         inn: +data.inn,
  //         paymentType: data.paymentType,
  //       },
  //       orders: savedFurniture, // savedFurniture qo'shildi
  //     };

  //     const formData = new FormData();

  //     formData.append("date", myData.date);
  //     formData.append("estimatedDays", myData.estimatedDays);
  //     formData.append("customerType", myData.customerType);
  //     formData.append("paid", myData.paid);

  //     // Mijoz ma'lumotlarini qo'shish
  //     formData.append("customer[type]", myData.customer.type);
  //     formData.append("customer[fullName]", myData.customer.fullName);
  //     formData.append("customer[phone]", myData.customer.phone);
  //     formData.append("customer[companyName]", myData.customer.companyName);
  //     formData.append("customer[director]", myData.customer.director);
  //     formData.append("customer[inn]", myData.customer.inn);

  //     // **Saved Furniture ma'lumotlarini qo'shish**
  //     savedFurniture.forEach((item, index) => {
  //       formData.append(`savedFurniture[${index}][name]`, item.name);
  //       formData.append(`savedFurniture[${index}][dimensions][length]`, item.dimensions.length);
  //       formData.append(`savedFurniture[${index}][dimensions][width]`, item.dimensions.width);
  //       formData.append(`savedFurniture[${index}][dimensions][height]`, item.dimensions.height);

  //       // Rasmlarni qo'shish (agar mavjud bo'lsa)
  //       if (item.images && item.images.length > 0) {
  //         item.images.forEach((image, imgIndex) => {
  //           formData.append(`savedFurniture[${index}][images][${imgIndex}]`, image);
  //         });
  //       }
  //     });

  //     // Manzilni optimallashtirib qo'shish
  //     Object.entries(myData.address).forEach(([key, value]) => {
  //       formData.append(`address[${key}]`, value);
  //     });

  //     createOrder(formData)
  //       .then((res) => {
  //         console.log(res);
  //         message.success("Buyurtma muvaffaqiyatli yaratildi!");
  //         navigate("/order/mengement", { state: res?._id });
  //       })
  //       .catch((err) => {
  //         message.error("Xatolik yuz berdi! Iltimos, qaytadan urinib ko'ring.");
  //       });
  //   },
  //   [savedFurniture, navigate]
  // );
  const onSubmit = useCallback(
    (data) => {
      if (!data.customerType || !data.fullName || !data.phone || !data.address) {
        message.warning("Iltimos, barcha majburiy maydonlarni to'ldiring!");
        return;
      }

      const myData = {
        customerType: data.customerType,
        fullName: data.fullName,
        paid: +0,
        address: {
          region: data.address.region,
          district: data.address.district,
          street: data.address.street,
          location: sessionStorage.getItem("location"),
        },
        description: data.description,
        date: moment(data.date).toISOString(),
        estimatedDays: data.estimatedDays,
        customer: {
          type: data.customerType,
          fullName: data.fullName,
          phone: data.phone,
          companyName: data.companyName,
          director: data.director,
          inn: data.inn || "",
          paymentType: data.paymentType,
        },
        savedFurniture: savedFurniture,
      };

      const formData = new FormData();
      formData.append("date", myData.date);
      formData.append("estimatedDays", myData.estimatedDays);
      formData.append("customerType", myData.customerType);
      formData.append("paid", myData.paid);

      // Mijoz ma'lumotlarini qo'shish
      formData.append("customer[type]", myData.customer.type);
      formData.append("customer[fullName]", myData.customer.fullName);
      formData.append("customer[phone]", myData.customer.phone);
      formData.append("customer[companyName]", myData.customer.companyName);
      formData.append("customer[director]", myData.customer.director);
      formData.append("customer[inn]", myData.customer.inn);

      // **Saved Furniture ma'lumotlarini qo'shish**
      savedFurniture.forEach((item, index) => {
        formData.append(`savedFurniture[${index}][name]`, item.name);
        formData.append(`savedFurniture[${index}][dimensions][length]`, item.dimensions.length);
        formData.append(`savedFurniture[${index}][dimensions][width]`, item.dimensions.width);
        formData.append(`savedFurniture[${index}][dimensions][height]`, item.dimensions.height);
        formData.append(`savedFurniture[${index}][budget]`, item.budget);

        // Rasmlarni qo'shish (agar mavjud bo'lsa)
        if (item.images && item.images.length > 0) {
          item.images.forEach((image, imgIndex) => {
            formData.append(`savedFurniture[${index}][images][${imgIndex}]`, image);
          });
        }
      });
      Object.entries(myData.address).forEach(([key, value]) => {
        formData.append(`address[${key}]`, value);
      });

      createOrder(formData)
        .then((res) => {
          console.log(res);
          message.success("Buyurtma muvaffaqiyatli yaratildi!");
          navigate("/order/mengement", { state: res?._id });
        })
        .catch((err) => {
          message.error("Xatolik yuz berdi! Iltimos, qaytadan urinib ko'ring.");
        });
    },
    [savedFurniture, navigate]
  );

  const options = [
    { label: "Jismoniy shaxs", value: "Jismoniy shaxs" },
    { label: "Yuridik shaxs", value: "Yuridik shaxs" },
  ];


  // const { control, handleSubmit, reset } = useForm(); // useForm hooki orqali formni boshqarish
  const [formData, setFormData] = useState({
    name: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setFormData({ ...formData, name: value });
    } else {
      setFormData({
        ...formData,
        dimensions: {
          ...formData.dimensions,
          [name]: value,
        },
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSaveFurniture = () => {
    if (
      formData.name &&
      formData.dimensions.length &&
      formData.dimensions.width &&
      formData.dimensions.height &&
      image
    ) {
      const newFurniture = {
        name: formData.name,
        dimensions: {
          length: formData.dimensions.length,
          width: formData.dimensions.width,
          height: formData.dimensions.height,
        },
        image,
      };
      setSavedFurniture([...savedFurniture, newFurniture]);
      setFormData({
        name: '',
        dimensions: {
          length: '',
          width: '',
          height: '',
        },
      });
      setImage(null);
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

          <Col span={5}>
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

          <Col span={7}>
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
                onClick={handleSaveFurniture}
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
              style={{ marginTop: '20px' }}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Nomi:</strong> {item.name}
                      <br />
                      <strong>Razmerlar:</strong> {item.dimensions.length}sm (U) × {item.dimensions.width}sm (E) × {item.dimensions.height}sm (B)
                    </div>
                    <div>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Col>

          <Col span={12}>
            <Form.Item label="Taxminiy tayyor bolish vaqt">
              <Controller
                name="estimatedDays"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Примерное время готовности" />
                )}
              />
            </Form.Item>
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
                  <Input.TextArea {...field} autoSize={{ minRows: 5.8, maxRows: 5.8 }} placeholder="Tavsif" />
                )}
              />
            </Form.Item>
            {/* </Form.Item> */}
          </Col>


        </Row>

        <Button
          style={{ width: "200px", background: "#0A3D3A", marginTop: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}
          size="large"
          type="primary"
          htmlType="submit"
          loading={isLoading}
        >
          Omborga o'tish <HiArrowSmRight style={{ marginTop: "4px", fontSize: "22px", marginLeft: "15px" }} />
        </Button>
      </Form>
    </>
  );
};

export default React.memo(Order);

