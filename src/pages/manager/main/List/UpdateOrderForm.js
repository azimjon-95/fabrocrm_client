import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  message,
} from "antd";
import {
  useUpdateOrderMutation,
  useGetOrderByIdQuery,
} from "../../../../context/service/orderApi";
import { useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./style.css";
import { useNavigate } from "react-router-dom"; // Sahifaga yo‘naltirish uchun
import dayjs from "dayjs";

const { Option } = Select;

const UpdateOrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [updateOrder, { isLoading }] = useUpdateOrderMutation();
  const { data: order, isFetching } = useGetOrderByIdQuery(id);

  useEffect(() => {
    if (order?.innerData) {
      form.setFieldsValue({
        ...order.innerData,
        date: order.date ? dayjs(order.innerData) : null,
        customer: {
          ...order.innerData.customer,
        },
        dimensions: {
          ...order.innerData.dimensions,
        },
      });
    }
  }, [order?.innerData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateOrder({ id, ...values });
      message.success("Buyurtma muvaffaqiyatli yangilandi!");
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring!");
      console.error("Validation Failed:", error);
    }
  };

  if (isFetching) return <p>Yuklanmoqda...</p>;

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <div className="">
        <Button
          size="large"
          style={{ background: "#0A3D3A" }}
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />
        <h2
          style={{
            marginBottom: "20px",
            color: "#0A3D3A",
            textAlign: "center",
          }}
        >
          Buyurtmani Taxrirlash
        </h2>
      </div>
      {/* Buyurtma nomi, byudjet va to'langan summa */}
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="name"
            label="Buyurtma nomi"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="budget" label="Byudjet" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="estimatedDays"
            label="Taxminiy kunlar"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      {/* Sana, taxminiy kunlar va o'lchamlar */}
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={["dimensions", "length"]}
            label="Uzunlik (m)"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["dimensions", "width"]}
            label="Kenglik (m)"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["dimensions", "height"]}
            label="Balandlik (m)"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      {/* Kenglik, balandlik va rasm URL */}
      {/* <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="image" label="Rasm URL">
                        <Input />
                    </Form.Item>
                </Col>
            </Row> */}

      {/* To'lov turi va mijoz ma'lumotlari */}
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="paymentType"
            label="To'lov turi"
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="Naqd">Naqd</Option>
              <Option value="Karta orqali">Karta orqali</Option>
              <Option value="Bank orqali">Bank orqali</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["customer", "type"]}
            label="Mijoz turi"
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="Jismoniy shaxs">Jismoniy shaxs</Option>
              <Option value="Yuridik shaxs">Yuridik shaxs</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["customer", "phone"]}
            label="Telefon raqami"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      {/* Mijoz qo'shimcha ma'lumotlari */}
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={["customer", "fullName"]}
            label="To'liq ism (faqat jismoniy shaxs)"
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["customer", "companyName"]}
            label="Kompaniya nomi (faqat yuridik shaxs)"
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={["customer", "inn"]} label="INN">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      {/* Yuborish tugmasi */}
      <Form.Item>
        <Button
          size="large"
          type="primary"
          htmlType="submit"
          style={{
            background: "#0A3D3A",
            width: "300px",
            marginTop: "20px",
          }}
          loading={isLoading}
        >
          Yangilash
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UpdateOrderForm;
