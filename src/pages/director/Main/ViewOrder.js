import React, { useState, useMemo, useCallback } from "react";
import { useGetOrdersQuery, useOrderProgressQuery } from "../../../context/service/orderApi";
import { Select, Card, Spin, Input, Alert, Modal, Button, Image, Progress } from "antd";
import { EditOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./style/CtrlWorkers.css";

const ViewOrder = () => {
  const navigate = useNavigate();
  const { data: orders, error, isLoading } = useGetOrdersQuery();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);

  const newOrders = useMemo(() => orders?.innerData?.filter((order) => order.isType === true) || [], [orders]);

  const uniqueRegions = useMemo(() => {
    return [...new Set(newOrders.map((order) => order?.address?.region).filter(Boolean))];
  }, [newOrders]);

  const filteredOrders = useMemo(() => {
    return newOrders.filter((order) => {
      const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion ? order?.address?.region === selectedRegion : true;
      return matchesSearch && matchesRegion;
    });
  }, [newOrders, searchTerm, selectedRegion]);

  const showCustomerInfo = useCallback((customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  }, []);

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
  };

  const OrderProgress = ({ record }) => {
    const { data: progressData, isLoading: progressLoading } = useOrderProgressQuery(record._id);
    return progressLoading ? <Spin size="small" /> : <Progress style={{ width: "95%" }} percent={progressData?.innerData?.percentage || 0} />;
  };

  const formatDateUzbek = (date) => {
    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const d = new Date(date);
    return `${d.getDate()}-${months[d.getMonth()]}`;
  };

  if (isLoading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
  if (error) return <Alert message="Xatolik yuz berdi" type="error" showIcon />;


  return (
    <div className="orderlist">
      <div className="customer-navbar" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Input
          size="small"
          placeholder="Mijozni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: "100%", height: 40 }}
          suffix={<SearchOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
        />
        <Select placeholder="Region tanlang" allowClear style={{ width: 200, height: 40 }} onChange={setSelectedRegion}>
          {uniqueRegions.map((region) => (
            <Select.Option key={region} value={region}>
              {region}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div className="order-cards">
        {filteredOrders.map((order) => (
          <Card
            key={order._id}
            hoverable
            cover={<Image src={order.image} alt="Mebel" className="Image-orders" />}
            actions={[
              <Button icon={<EditOutlined />} onClick={() => navigate(`/orders/materials/${order._id}`)} />,
              <Button icon={<EyeOutlined />} onClick={() => showCustomerInfo(order?.customer || {})} />

            ]}
          >
            <Card.Meta title={order.name} description={`Tulov turi: ${order.paymentType}`} />
            <div>{order.paid.toLocaleString()} so‘m</div>
            <div>
              <OrderProgress record={order} />
            </div>
            <div>{formatDateUzbek(order.date)}</div>
          </Card>
        ))}
      </div>

      <Modal
        title="Mijoz ma'lumotlari"
        open={modalVisible}
        onCancel={closeModal}
        footer={[<Button key="close" onClick={closeModal}>Yopish</Button>]}
      >
        {selectedCustomer ? (
          <ul>
            <li><strong>Turi:</strong> {selectedCustomer?.customer?.type || "Ma'lumot yo'q"}</li>
            {selectedCustomer?.customer?.fullName && <li><strong>F.I.O.:</strong> {selectedCustomer.customer.fullName}</li>}
            <li><strong>Telefon:</strong> {selectedCustomer?.customer?.phone || "Ma'lumot yo'q"}</li>
            {selectedCustomer?.customer?.companyName && <li><strong>Kompaniya nomi:</strong> {selectedCustomer.customer.companyName}</li>}
            {selectedCustomer?.customer?.director && <li><strong>Direktor:</strong> {selectedCustomer.customer.director}</li>}
            {selectedCustomer?.customer?.inn && <li><strong>INN:</strong> {selectedCustomer.customer.inn}</li>}
            {selectedCustomer?.address && (
              <li>
                <strong>Manzil:</strong>
                {selectedCustomer?.address?.region || ""} {selectedCustomer?.address?.district || ""} {selectedCustomer?.address?.street || ""}
              </li>
            )}
          </ul>
        ) : (
          <p>Ma'lumot mavjud emas</p>
        )}
      </Modal>

    </div>
  );
};

export default ViewOrder;

