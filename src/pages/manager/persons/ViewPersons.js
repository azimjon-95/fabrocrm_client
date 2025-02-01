import React, { useState } from "react";
import { Table, Avatar, message, Input, Button, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  useGetWorkersQuery,
  useDeleteWorkerMutation,
} from "../../../context/service/worker";

const WorkersTable = () => {
  const navigate = useNavigate();
  const [visibleId, setVisibleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [deleteWorker] = useDeleteWorkerMutation();
  const { data: workersData, isLoading } = useGetWorkersQuery();
  const workers = workersData?.innerData || [];

  const handleDelete = async (id) => {
    try {
      let response = await deleteWorker(id);
      message.success(response.data.message);
    } catch (error) {
      message.error(error?.response?.data?.message);
    }
  };

  // const handleUpdate = (workerId) => {
  //     navigate(`/workers/update/${workerId}`); // Redirect to update page
  // };
  const handleUpdate = (record) => {
    const userData = record;
    navigate("/persons/add", { state: { userData } });
  };

  const filteredWorkers = workers?.filter(
    (worker) =>
      (worker?.firstName + " " + worker?.lastName + " " + worker?.middleName)
        .toLowerCase()
        .includes(searchTerm?.toLowerCase()) ||
      worker?.phone.includes(searchTerm) ||
      (worker.idNumber && worker.idNumber.includes(searchTerm))
  );

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const formattedPhone = phone.replace(/[^\d]/g, "");
    return formattedPhone.length === 9
      ? `+998 ${formattedPhone.slice(0, 2)} ${formattedPhone.slice(
          2,
          5
        )} ${formattedPhone.slice(5, 7)} ${formattedPhone.slice(7, 9)}`
      : phone;
  };

  const columns = [
    {
      title: "Rasm",
      dataIndex: "img",
      key: "img",
      render: (img) =>
        img ? (
          <Avatar shape="square" size={50} src={img} />
        ) : (
          <Avatar shape="square" size={50} icon={<UserOutlined />} />
        ),
    },
    {
      title: "FIO",
      key: "fio",
      render: (_, record) => (
        <span>
          {record.firstName} {record.lastName} {record.middleName}
        </span>
      ),
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => formatPhoneNumber(phone), // Format phone number
    },
    {
      title: "Manzil",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Tug'ilgan sana",
      dataIndex: "dayOfBirth",
      key: "dayOfBirth",
      render: (dayOfBirth) => {
        if (!dayOfBirth) return "";

        const birthDate = new Date(dayOfBirth);
        const today = new Date();

        // Format date to "YYYY.MM.DD"
        const formattedDate = `${birthDate.getFullYear()}.${(
          birthDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}.${birthDate
          .getDate()
          .toString()
          .padStart(2, "0")}`;

        // Calculate age
        const age = today.getFullYear() - birthDate.getFullYear();
        const birthdayThisYear = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );
        const adjustedAge = today < birthdayThisYear ? age - 1 : age;

        // Check if the birthday is today or tomorrow
        const isToday =
          today.toDateString() === birthdayThisYear.toDateString();
        const isTomorrow =
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
          ).toDateString() === birthdayThisYear.toDateString();

        let birthdayMessage = "";
        if (isToday) {
          birthdayMessage = "Bugun tug‘ilgan kuni!";
        } else if (isTomorrow) {
          birthdayMessage = "Ertaga tug‘ilgan kuni!";
        }

        return (
          <div>
            <span>
              {formattedDate} ({adjustedAge} yosh)
            </span>
            {birthdayMessage && (
              <div
                style={{ color: "green", fontWeight: "bold", fontSize: "12px" }}
              >
                {birthdayMessage}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <div className="EyeInvisibleOutlined">
          Pasport
          <button onClick={() => setVisibleId((i) => !i)}>
            {!visibleId ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </button>
        </div>
      ),
      dataIndex: "idNumber",
      key: "idNumber",
      render: (text, record) => (
        <div>
          {visibleId ? <span>{record.idNumber}</span> : <span>*********</span>}
        </div>
      ),
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <div>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="Ishchini o'chirishni tasdiqlaysizmi?"
            onConfirm={() => handleDelete(record._id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div className="navbar_search">
          <Input
            placeholder="Qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 600 }}
            size="large"
            prefix={
              <SearchOutlined style={{ color: "#cdcdcd", marginTop: "3px" }} />
            }
          />
        </div>

        <Button
          size="large"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/persons/add")}
        >
          Ishchilarni qabul qilish
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredWorkers}
        rowKey="_id"
        loading={isLoading}
        pagination={false}
        style={{ marginTop: 20 }}
        size="small"
        bordered
      />
    </div>
  );
};

export default WorkersTable;
