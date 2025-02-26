import React, { useState, useMemo, useEffect } from "react";
import {
  useGetOrdersQuery,
  useOrderProgressQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from "../../../../context/service/orderApi";
import {
  Dropdown,
  Menu,
  Select,
  Table,
  Spin,
  Input,
  Alert,
  Popconfirm,
  Modal,
  Button,
  Image,
  Progress,
  message,
  Avatar,
} from "antd";
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { BookOutlined } from "@ant-design/icons";
import { EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import "./style.css";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"; // Sahifaga yo‘naltirish uchun
import socket from "../../../../socket";

const { Search } = Input;
const ViewOrder = () => {
  const navigate = useNavigate();
  const {
    data: orders,
    error,
    isLoading,
    refetch: refetchOrders,
  } = useGetOrdersQuery();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const newOrders = orders?.innerData?.filter((order) => order.isType === true);
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);

  let newOrders2 = [];
  orders?.innerData.map((i) => {
    let { orders, ...qolgani } = i;
    orders.map((j) => {
      newOrders2.push({ ...j, ...qolgani });
    });
  });

  useEffect(() => {
    socket.on("newOrder", () => {
      refetchOrders();
    });

    return () => {
      socket.off("newOrder");
    };
  }, [refetchOrders]);

  useEffect(() => {
    socket.on("updateOrder", (data) => {
      console.log("Buyurtma yangilandi", data);
      refetchOrders();
    });
    return () => {
      socket.off("updateOrder");
    };
  }, [refetchOrders]);

  const handleClick = async (orderId) => {
    try {
      await updateOrder({ id: orderId, updates: { isType: false } });
      message.success("Buyurtma yopildi");
    } catch (error) {
      message.error(error.message || "Buyurtma yopishda xatolik yuz berdi");
      console.error("Xatolik yuz berdi:", error);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await deleteOrder(orderId).unwrap();
      message.success("Buyurtma o‘chirildi");
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
      message.error(error.message || "Buyurtma o‘chirishda xatolik yuz berdi");
    }
  };

  // Unikal regionlarni olish
  const uniqueRegions = useMemo(() => {
    const regions = newOrders2
      ?.map((order) => order?.address?.region)
      .filter(Boolean);
    return [...new Set(regions)];
  }, [newOrders2]);

  // Buyurtmalarni qidirish va filterlash
  const filteredOrders = useMemo(() => {
    return newOrders2?.filter((order) => {
      const matchesSearch = order?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion
        ? order?.address?.region === selectedRegion
        : true;
      return matchesSearch && matchesRegion;
    });
  }, [newOrders2, searchTerm, selectedRegion]);

  const showCustomerInfo = (customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
  };

  if (isLoading)
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );

  if (error) return <Alert message="Xatolik yuz berdi" type="error" showIcon />;

  const OrderProgress = ({ record }) => {
    const { data: progressData, isLoading: progressLoading } =
      useOrderProgressQuery(record._id);

    return progressLoading ? (
      <Spin size="small" />
    ) : (
      <Progress
        style={{
          width: "150px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
        percent={progressData?.innerData?.percentage || 0}
      />
    );
  };

  const formatDateUzbek = (date) => {
    const months = [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "Iyun",
      "Iyul",
      "Avgust",
      "Sentabr",
      "Oktabr",
      "Noyabr",
      "Dekabr",
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
          <li>
            <strong>Turi:</strong> {customerData.customer.type}
          </li>
          {customerData.customer.fullName && (
            <li>
              <strong>F.I.O.:</strong> {customerData.customer.fullName}
            </li>
          )}
          <li>
            <strong>Telefon:</strong> {customerData.customer.phone}
          </li>
          {customerData.customer.companyName && (
            <li>
              <strong>Kompaniya nomi:</strong>{" "}
              {customerData.customer.companyName}
            </li>
          )}
          {customerData.customer.director && (
            <li>
              <strong>Direktor:</strong> {customerData.customer.director}
            </li>
          )}
          {customerData.customer.inn && (
            <li>
              <strong>INN:</strong> {customerData.customer.inn}
            </li>
          )}
          {customerData.address && (
            <li style={{ display: "flex", gap: "8px" }}>
              <strong>Manzil:</strong>
              {customerData.address.region} {customerData.address.district}{" "}
              {customerData.address.street}
            </li>
          )}
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
      title: "Rasmi",
      dataIndex: "image",
      key: "image",

      render: (image) => {
        return image ? (
          <Image
            src={image}
            alt="Mebel"
            width={50}
            height={50}
            style={{ objectFit: "cover", borderRadius: "8px" }}
            preview={{ mask: "Kattalashtirish" }}
          />
        ) : (
          <Avatar shape="square" size={50} icon={<UserOutlined />} />
        );
      },
    },
    { title: "Nomi", dataIndex: "name", key: "name" },
    {
      title: "Budjet",
      render: (paid, item) => (
        <div className="text-green-500">
          {item?.paymentType ? <p>Tulov turi: {item?.paymentType} </p> : ""}
          <p>{item?.budget?.toLocaleString()} so‘m</p>
        </div>
      ),
    },
    {
      title: "To‘langan",
      dataIndex: "paid",
      key: "paid",
      render: (paid) => `${paid?.toLocaleString()} so‘m`,
    },
    {
      title: "Tayyorlik darajasi",
      key: "percentage",
      render: (_, record) => <OrderProgress record={record} />,
    },
    {
      title: "Buyurtma va mudat",
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              // alignItems: "center",
              // gap: "10px",
            }}
          >
            <div>{formatDateUzbek(orderDate)}</div> {/* Sanani ko‘rsatish */}
            {/* / */}
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
          <Button
            icon={<EyeOutlined />}
            onClick={() => showCustomerInfo(paid)}
          />
        </div>
      ),
    },
    {
      title: "Materiallar",
      dataIndex: "materials",
      key: "materials",
      render: (_, record) => (
        <Link to={`/orders/materials/${record._id}`}>Ko‘rish</Link>
      ),
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
  console.log(filteredOrders);

  return (
    <div className="orderlist">
      <div
        className="customer-navbar"
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
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
            <Select.Option key={region} value={region}>
              {region}
            </Select.Option>
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

export default ViewOrder;
