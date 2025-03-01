import React, { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
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
import TextArea from "antd/es/input/TextArea";

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

      let response = await updateOrder({ id, updates: values });
      message.success("Buyurtma muvaffaqiyatli yangilandi!");
      if (response.data.state) {
        navigate(-1);
      }
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring!");
      console.error("Validation Failed:", error);
    }
  };

  if (isFetching) return <p>Yuklanmoqda...</p>;

  return (
    <div className="order_Edit_Form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ paddingBottom: "70px" }}
      >
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

        <Row gutter={16}>
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

          <Col span={8}>
            <Form.Item
              name={["customer", "fullName"]}
              label="To'liq ism (faqat jismoniy shaxs)"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="estimatedDays"
              label="Taxminiy kunlar"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
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

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name={["customer", "director"]} label="Direktor">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={["address", "region"]} label="Viloyat">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={["address", "district"]} label="Tuman">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name={["address", "street"]} label="Manzil">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={["address", "location"]} label="Joylashuv">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name={["description"]} label="Qo'shimcha ma'lumot">
              <TextArea style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <h2
          style={{
            marginBottom: "20px",
            color: "#0A3D3A",
            textAlign: "center",
          }}
        >
          Buyurtmalar
        </h2>

        {order.innerData?.orders.map((item, index) => (
          <div
            key={index}
            style={{
              borderTop: "1px solid #444",
              paddingTop: "20px",
              marginTop: "20px",
            }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name={["orders", index, "name"]}
                  label="Buyurtma nomi"
                  rules={[{ required: true, message: "Majburiy maydon" }]}
                  initialValue={item.name} // Dastlabki qiymat
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={["orders", index, "budget"]}
                  label="Byudjet"
                  rules={[{ required: true, message: "Majburiy maydon" }]}
                  initialValue={item.budget}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}></Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name={["orders", index, "dimensions", "length"]}
                  label="Uzunlik (sm)"
                  rules={[{ required: true, message: "Majburiy maydon" }]}
                  initialValue={item.dimensions?.length}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={["orders", index, "dimensions", "width"]}
                  label="Kenglik (sm)"
                  rules={[{ required: true, message: "Majburiy maydon" }]}
                  initialValue={item.dimensions?.width}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={["orders", index, "dimensions", "height"]}
                  label="Balandlik (sm)"
                  rules={[{ required: true, message: "Majburiy maydon" }]}
                  initialValue={item.dimensions?.height}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        ))}

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
    </div>
  );
};

export default UpdateOrderForm;
