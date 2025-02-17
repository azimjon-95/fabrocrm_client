import React, { useState, useMemo } from "react";
import { useGetOrdersQuery, useOrderProgressQuery, useUpdateOrderMutation, useDeleteOrderMutation } from "../../../../context/service/orderApi";
import { Dropdown, Menu, Select, Table, Spin, Input, Alert, Popconfirm, Modal, Button, Image, Progress } from "antd";
import { MoreOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { BookOutlined } from "@ant-design/icons";
import { EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import "./style.css"; import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"; // Sahifaga yo‘naltirish uchun

const { Search } = Input;
const OrderList = () => {
  const navigate = useNavigate();
  const { data: orders, error, isLoading } = useGetOrdersQuery();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const newOrders = orders?.innerData?.filter((order) => order.isType === true);
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleClick = async (orderId) => {
    try {
      await updateOrder({ id: orderId, updates: { isType: false } });
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await deleteOrder(orderId).unwrap();
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    }
  };

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
      <Progress style={{ width: "130px" }} percent={progressData?.innerData?.percentage || 0} />
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

  const menu = (record) => (
    <Menu>
      <Menu.Item
        key="close"
        onClick={() => handleClick(record._id)}
        icon={<CheckOutlined />}
      >
        Zakazni yopish
      </Menu.Item>
      <Menu.Item
        key="delete"
        onClick={() => handleDelete(record._id)}
        icon={<DeleteOutlined />}
        danger
      >
        Zakazni o‘chirish
      </Menu.Item>
      <Menu.Item
        key="update"
        onClick={() => navigate(`/orders/update/${record._id}`)}
        icon={<EditOutlined />}
      >
        Yangilash
      </Menu.Item>
    </Menu>
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
      title: "Tayyorlik darajasi",
      key: "percentage",
      render: (_, record) => <OrderProgress record={record} />,
    },
    {
      title: "Buyurtma va qolgan kunlar",
      dataIndex: "date",
      key: "date",
      render: (date, record) => {
        const orderDate = dayjs(date).format("YYYY-MM-DD"); // Buyurtma sanasi
        const today = dayjs(); // Bugungi sana
        const daysLeft = record.estimatedDays - today.diff(dayjs(date), "day"); // Qolgan kunlar

        let color = "black"; // Standart rang
        if (daysLeft <= 3) color = "orange";
        if (daysLeft <= 2) color = "red"; // 2 yoki undan kam bo‘lsa qizil tusga o‘tadi

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div>{formatDateUzbek(orderDate)}</div> {/* Sanani ko‘rsatish */}
            /
            <div style={{ color }}>{daysLeft} kun</div> {/* Qolgan kunlar */}
          </div>
        );
      },
    },
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
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Dropdown overlay={menu(record)} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];


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

        <Button
          size="large"
          style={{ background: "#0A3D3A" }}
          type="primary"
          icon={<BookOutlined />}
          onClick={() => navigate("/orders/story")}
        />
      </div>
      <div className="custom-table">
        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="_id"
          bordered
          pagination={false}
          size="small"
        />
      </div>

      <CustomerInfoModal
        visible={modalVisible}
        onClose={closeModal}
        customerData={selectedCustomer}
      />
    </div>
  );
};

export default OrderList;


