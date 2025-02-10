import React, { useState, useMemo } from "react";
import { useGetOrdersQuery, useOrderProgressQuery } from "../../../../context/service/orderApi";
import { Select, Table, Spin, Input, Alert, Modal, Button, Image, Progress } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import "./style.css";
import { useNavigate } from "react-router-dom"; // Sahifaga yo‘naltirish uchun


const OrderStory = () => {
  const navigate = useNavigate();
  const { data: orders, error, isLoading } = useGetOrdersQuery();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const newOrders = orders?.innerData?.filter((order) => order.isType === false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Unikal regionlarni olish
  const uniqueRegions = useMemo(() => {
    const regions = newOrders?.map((order) => order?.address?.region).filter(Boolean);
    return [...new Set(regions)];
  }, [newOrders]);

  // Buyurtmalarni qidirish va filterlash
  const filteredOrders = useMemo(() => {
    return newOrders?.filter((order) => {
      const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion ? order?.address?.region === selectedRegion : true;
      return matchesSearch && matchesRegion;
    });
  }, [newOrders, searchTerm, selectedRegion]);

  const showCustomerInfo = (customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
  };

  if (isLoading)
    return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;

  if (error)
    return <Alert message="Xatolik yuz berdi" type="error" showIcon />;

  const OrderProgress = ({ record }) => {
    const { data: progressData, isLoading: progressLoading } = useOrderProgressQuery(record._id);

    return progressLoading ? (
      <Spin size="small" />
    ) : (
      <Progress style={{ width: "100px" }} percent={progressData?.percentage || 0} />
    );
  };

  const formatDateUzbek = (date) => {
    const months = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
      "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ];

    const d = new Date(date);
    const day = d.getDate();
    const month = months[d.getMonth()];

    return `${day}-${month}`;
  };
  const CustomerInfoModal = ({ visible, onClose, customerData }) => (
    <Modal
      title="Mijoz ma'lumotlari"
      open={visible}
      onCancel={onClose}
      footer={null}
      className="customer-info-modal"
    >
      {customerData && (
        <ul>
          <li><strong>Turi:</strong> {customerData.customer.type}</li>
          {customerData.customer.fullName && <li><strong>F.I.O.:</strong> {customerData.customer.fullName}</li>}
          <li><strong>Telefon:</strong> {customerData.customer.phone}</li>
          {customerData.customer.companyName && <li><strong>Kompaniya nomi:</strong> {customerData.customer.companyName}</li>}
          {customerData.customer.director && <li><strong>Direktor:</strong> {customerData.customer.director}</li>}
          {customerData.customer.inn && <li><strong>INN:</strong> {customerData.customer.inn}</li>}
          {customerData.address && <li
            style={{ display: "flex", gap: "8px" }}>
            <strong>Manzil:</strong>
            {customerData.address.region}  {customerData.address.district}  {customerData.address.street}
          </li>}
        </ul>
      )}
    </Modal>
  );


  const columns = [
    {
      title: "Rasimi",
      dataIndex: "image",
      key: "image",

      render: (image) => (
        <Image
          src={image}
          alt="Mebel"
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: "8px" }}
          preview={{ mask: "Kattalashtirish" }}
        />
      ),
    },
    { title: "Nomi", dataIndex: "name", key: "name" },
    {
      title: "Budjet",
      render: (paid) => (
        <div className="text-green-500">
          <span>Tulov turi: {paid.paymentType} </span>
          <span>{paid.budget.toLocaleString()} so‘m</span>
        </div>),
    },
    {
      title: "To‘langan",
      dataIndex: "paid",
      key: "paid",
      render: (paid) => `${paid.toLocaleString()} so‘m`,
    },
    {
      title: "Foiz",
      key: "percentage",
      render: (_, record) => <OrderProgress record={record} />,
    },
    {
      title: "Sanasi",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDateUzbek(date),
    },
    { title: "Taxminiy kunlar", dataIndex: "estimatedDays", key: "estimatedDays" },
    {
      title: "Mijoz turi",
      render: (paid) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {paid.customer.type}
          <Button icon={<EyeOutlined />} onClick={() => showCustomerInfo(paid)} />
        </div>
      ),
    },
    {
      title: "Materiallar",
      dataIndex: "materials",
      key: "materials",
      render: (_, record) => <Link to={`/orders/materials/${record._id}`}>Ko‘rish</Link>,
    },

  ];

  return (
    <div className="orderlist">
      <div className="customer-navbar" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button
          size="large"
          style={{ background: "#0A3D3A" }}
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />
        <Input
          size="small"
          placeholder="Mijozni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: "100%", height: 40 }}
          suffix={<SearchOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
        />
        <Select
          placeholder="Region tanlang"
          allowClear
          style={{ width: 200, height: 40 }}
          onChange={setSelectedRegion}
        >
          {uniqueRegions.map((region) => (
            <Select.Option key={region} value={region}>{region}</Select.Option>
          ))}
        </Select>
      </div>

      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="_id"
        bordered
        pagination={false}
        size="small"
      />
      <CustomerInfoModal
        visible={modalVisible}
        onClose={closeModal}
        customerData={selectedCustomer}
      />
    </div>
  );
};

export default OrderStory;


