import React, { useState } from "react";
import { Table, Avatar, message, Input, Space, Button, Popconfirm, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import {
    EyeOutlined,
    EyeInvisibleOutlined,
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    PlusOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import {
    useGetWorkersQuery,
    useDeleteWorkerMutation,
} from "../../../context/service/worker";


const ViewPersons = () => {
    const navigate = useNavigate();
    const [visibleId, setVisibleId] = useState(false);
    const [deleteWorker] = useDeleteWorkerMutation();
    const { data: workersData, isLoading } = useGetWorkersQuery();
    const workers = workersData?.innerData || [];
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const handleDelete = async (id) => {
        try {
            let response = await deleteWorker(id);
            message.success(response.data.message);
        } catch (error) {
            message.error(error?.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return phone;
        const formattedPhone = phone.replace(/[^\d]/g, "");
        return formattedPhone.length === 9
            ? `+998 ${formattedPhone.slice(0, 2)} ${formattedPhone.slice(2, 5)} ${formattedPhone.slice(5, 7)} ${formattedPhone.slice(7, 9)}`
            : phone;
    };

    const handleUpdate = (record) => {
        navigate("/persons/add", { state: { userData: record } });
    };

    const filteredWorkers = workers.filter((worker) => {
        const fullName = `${worker.firstName} ${worker.lastName} ${worker.middleName}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            worker.phone.includes(searchTerm) ||
            (worker.idNumber && worker.idNumber.includes(searchTerm))
        );
    });

    const formatBirthDate = (dayOfBirth) => {
        if (!dayOfBirth) return "";
        const birthDate = new Date(dayOfBirth);
        const today = new Date();
        const formattedDate = `${birthDate.getFullYear()}.${(birthDate.getMonth() + 1).toString().padStart(2, "0")}.${birthDate.getDate().toString().padStart(2, "0")}`;
        const age = today.getFullYear() - birthDate.getFullYear();
        const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const adjustedAge = today < birthdayThisYear ? age - 1 : age;
        const isToday = today.toDateString() === birthdayThisYear.toDateString();
        const isTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toDateString() === birthdayThisYear.toDateString();

        let birthdayMessage = "";
        if (isToday) birthdayMessage = "Bugun tug‘ilgan kuni!";
        if (isTomorrow) birthdayMessage = "Ertaga tug‘ilgan kuni!";

        return { formattedDate, adjustedAge, birthdayMessage };
    };



    const roleMapping = {
        manager: "Menejer",
        seller: "Sotuvchi",
        director: "Direktor",
        accountant: "Buxgalter",
        warehouseman: "Omborchi",
        deputy: "Direktor o‘rinbosari",
        distributor: "Yetkazib beruvchi"
    };
    const columns = [
        {
            title: "Rasm",
            dataIndex: "img",
            key: "img",
            render: (img) => img ? <Avatar shape="square" size={50} src={img} /> : <Avatar shape="square" size={50} icon={<UserOutlined />} />,
        },
        {
            title: "FIO",
            key: "fio",
            render: (_, record) => `${record.firstName} ${record.lastName} ${record.middleName}`,
        },
        {
            title: "Telefon",
            dataIndex: "phone",
            key: "phone",
            render: (phone) => formatPhoneNumber(phone),
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
                const { formattedDate, adjustedAge } = formatBirthDate(dayOfBirth);
                return `${formattedDate} (${adjustedAge} yosh)`;
            },
        },
        {
            title: (
                <Space>
                    Pasport
                    <Button
                        type="text"
                        icon={!visibleId ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        onClick={() => setVisibleId(!visibleId)}
                    />
                </Space>
            ),
            dataIndex: "idNumber",
            key: "idNumber",
            render: (text) => visibleId ? text : "*********",
        },
        {
            title: "Kasbi",
            render: (val) => roleMapping[val.role] || val.workerType
        },
        {
            title: "Amallar",
            key: "actions",
            render: (_, record) => (
                <div>
                    <Button icon={<EditOutlined />} onClick={() => handleUpdate(record)} style={{ marginRight: 8 }} />
                    <Popconfirm title="Ishchini o'chirishni tasdiqlaysizmi?" onConfirm={() => handleDelete(record._id)} okText="Ha" cancelText="Yo'q">
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: "flex", gap: "10px" }}>
                <Input placeholder="Qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small" prefix={<SearchOutlined style={{ color: "#cdcdcd" }} />} />
                <Button size="large" type="primary" style={{ background: "#0A3D3A" }} icon={<PlusOutlined />} onClick={() => navigate(activeTab === "active" ? "/director/add/worker" : "/worker/add")}>
                    Hodimlarni qabul qilish
                </Button>
                <Button size="large" type="default" icon={<DownloadOutlined />}>Excel</Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredWorkers}
                rowKey="_id"
                loading={isLoading}
                pagination={false}
                size="small"
                bordered
                scroll={{ y: 500 }}  // Scroll berish uchun
                style={{
                    maxHeight: '650px',
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    marginTop: "5px"
                }}
            />
        </div>
    );
};

export default ViewPersons;



