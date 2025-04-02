import React, { useState, useMemo, useEffect } from "react";
import {
  useGetOrdersQuery,
  useOrderProgressQuery,
  useDeleteOrderMutation,
  useCompleteOrderMutation,
  useUpdateOrderMutation,
} from "../../../../context/service/orderApi";
import {
  Dropdown,
  Menu,
  Select,
  Table,
  Spin,
  Input,
  Alert,
  Modal,
  Button,
  Progress,
  message,
} from "antd";
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { BookOutlined } from "@ant-design/icons";
import { EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { FaToggleOn } from "react-icons/fa";
import { SearchOutlined } from "@ant-design/icons";
import "./style.css";
import dayjs from "dayjs";
import { FaFileDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Sahifaga yo‘naltirish uchun
import socket from "../../../../socket";

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
  const [deleteOrder] = useDeleteOrderMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  //   useUpdateOrderMutation
  const [updateOrder] = useUpdateOrderMutation();
  const [completeOrder] = useCompleteOrderMutation();

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
      await completeOrder({ orderId }).unwrap();
      message.success("Buyurtma yopildi");
      refetchOrders();
    } catch (error) {
      message.error(error.message || "Buyurtma yopishda xatolik yuz berdi");
      console.error("Xatolik yuz berdi:", error);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await deleteOrder(orderId).unwrap();
      message.success("Buyurtma o‘chirildi");
      refetchOrders();
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
      message.error(error.message || "Buyurtma o‘chirishda xatolik yuz berdi");
    }
  };

  // Unikal regionlarni olish
  const uniqueRegions = useMemo(() => {
    const regions = newOrders
      ?.map((order) => order?.address?.region)
      .filter(Boolean);
    return [...new Set(regions)];
  }, [newOrders]);

  // Buyurtmalarni qidirish va filterlash
  const filteredOrders = useMemo(() => {
    return newOrders?.filter((order) => {
      const matchesSearch = order?.orders?.some((item) =>
        item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
      const matchesRegion = selectedRegion
        ? order?.address?.region === selectedRegion
        : true;
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
        percent={progressData?.percentage || 0}
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
        key="update"
        onClick={() => navigate(`/orders/update/${record._id}`)}
        icon={<EditOutlined />}
      >
        Yangilash
      </Menu.Item>
      <Menu.Item
        key="active"
        style={{ color: !record?.isActive ? "green" : "red" }}
        icon={<FaToggleOn />}
        onClick={() => handleIsActive(record)}
      >
        {!record?.isActive ? "Aktiv qilish" : "No Aktiv"}
      </Menu.Item>

      <Menu.Item
        key="delete"
        onClick={() => handleDelete(record._id)}
        icon={<DeleteOutlined />}
        danger
      >
        Zakazni o‘chirish
      </Menu.Item>
    </Menu>
  );

  const handleIsActive = async (record) => {
    try {
      await updateOrder({
        id: record._id,
        updates: { isActive: !record.isActive },
      }).unwrap();
      message.success(
        record.isActive
          ? "Buyurtma  no aktivlashtirildi"
          : "Buyurtma aktivlashtirildi"
      );
      refetchOrders();
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
      message.error(error.message || "Buyurtma o‘chirishda xatolik yuz berdi");
    }
  };

  const columns = [
    // {
    //   title: "Rasmi",
    //   dataIndex: "image",
    //   key: "image",

    //   render: (image) => {
    //     return image ? (
    //       <Image
    //         src={image}
    //         alt="Mebel"
    //         width={50}
    //         height={50}
    //         style={{ objectFit: "cover", borderRadius: "8px" }}
    //         preview={{ mask: "Kattalashtirish" }}
    //       />
    //     ) : (
    //       <Avatar shape="square" size={50} icon={<UserOutlined />} />
    //     );
    //   },
    // },
    {
      title: "Holati",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive) => (
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: isActive ? "green" : "red",
            boxShadow: `0 0 5px ${isActive ? "green" : "red"}`,
            animation: "pulse 1.5s infinite",
          }}
        />
      ),
    },
    {
      title: "Nomi",
      dataIndex: "name",
      key: "name",
      render: (_, item) => (
        <div className="order-names">
          {item.orders?.map((order) => (
            <p key={order._id} className="order-name">
              {order.name} - {order.quantity}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: "Budjet",
      render: (paid, item) => {
        const totalBudget =
          item?.orders?.reduce((sum, item) => sum + item.budget, 0) || 0;

        return (
          <div className="text-green-500">
            {item?.paymentType ? <p>Tulov turi: {item?.paymentType} </p> : ""}
            <p>{totalBudget?.toLocaleString()} so‘m</p>
          </div>
        );
      },
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
      align: "center",
      render: (_, record) => (
        <Link
          style={{ color: "#0A3D3A" }}
          to={`/orders/materials/${record._id}`}
        >
          Ko‘rish
        </Link>
      ),
    },
    {
      title: "Tijorat Taklifi",
      align: "center",
      render: (_, record) => (
        <Link
          to={`/order-list/${record._id}`}
          style={{ fontSize: "20px", color: "#0A3D3A" }}
        >
          <FaFileDownload />
        </Link>
      ),
    },
    {
      title: "Amallar",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Dropdown overlay={menu(record)} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

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
          dataSource={filteredOrders.map((item, index) => ({
            ...item,
            key: `${item._id || "custom"}-${index}`,
          }))}
          columns={columns}
          rowKey="key"
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
