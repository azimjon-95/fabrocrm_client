import React, { useState } from "react";
import { Table, Avatar, message, Select, Input, Button, Popconfirm, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import {
    SearchOutlined,
    UserOutlined,
    PlusOutlined,
    EditOutlined,
    DownloadOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useDeleteAdminMutation, useGetAdminsQuery } from '../../../context/service/adminApi'; // RTK Query hookini import qilamiz

import ViewWorkers from "./ViewWorkers";
const { Option } = Select;
const ViewPersons = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    // RTK Query hookidan ma'lumotlarni olamiz
    const { data: admins, isLoading } = useGetAdminsQuery();

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleRoleChange = (value) => {
        setSelectedRole(value);
    };

    // Ma'lumotlarni filter qilish
    const filteredData = admins
        ? admins?.innerData.filter((admin) => {
            const matchesSearchText = Object.values(admin).some((val) =>
                String(val).toLowerCase().includes(searchText.toLowerCase())
            );
            const matchesRole = selectedRole ? admin.role === selectedRole : true;
            return matchesSearchText && matchesRole;
        })
        : [];



    const handleUpdateAdmin = (record) => {
        console.log(record);
        navigate("/director/add/worker", { state: { userData: record } });
    };
    const [deleteAdmin] = useDeleteAdminMutation();

    const handleDeleteAdmin = async (record) => {
        try {
            await deleteAdmin(record._id).unwrap();
            message.success("Hodim muvaffaqiyatli o'chirildi!");
        } catch (error) {
            message.warning("Hodimni o‘chirishda xatolik:", error);
        }
    };


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

    const formatBirthDate = (dayOfBirth) => {
        if (!dayOfBirth) return "";

        const birthDate = new Date(dayOfBirth);
        const today = new Date();

        // Format date to "YYYY.MM.DD"
        const formattedDate = `${birthDate.getFullYear()}.${(birthDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}.${birthDate.getDate().toString().padStart(2, "0")}`;

        // Calculate age
        const age = today.getFullYear() - birthDate.getFullYear();
        const birthdayThisYear = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        );
        const adjustedAge = today < birthdayThisYear ? age - 1 : age;

        // Check if the birthday is today or tomorrow
        const isToday = today.toDateString() === birthdayThisYear.toDateString();
        const isTomorrow =
            new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toDateString() ===
            birthdayThisYear.toDateString();

        let birthdayMessage = "";
        if (isToday) {
            birthdayMessage = "Bugun tug‘ilgan kuni!";
        } else if (isTomorrow) {
            birthdayMessage = "Ertaga tug‘ilgan kuni!";
        }

        return { formattedDate, adjustedAge, birthdayMessage };
    };

    const columnsPerson = [
        {
            title: 'Ism Familiya',
            key: "fio",
            render: (_, record) => (
                <span>
                    {record.firstName} {record.lastName}
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
            title: "Tug'ilgan sana",
            dataIndex: "dayOfBirth",
            key: "dayOfBirth",
            render: (dayOfBirth) => {
                const { formattedDate, adjustedAge, birthdayMessage } = formatBirthDate(dayOfBirth);

                return (
                    <div>
                        <span>
                            {formattedDate} ({adjustedAge} yosh)
                        </span>
                        {birthdayMessage && (
                            <div style={{ color: "green", fontWeight: "bold", fontSize: "12px" }}>
                                {birthdayMessage}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Login',
            dataIndex: 'login',
            key: 'login',
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const roleMap = {
                    manager: 'Menejer',
                    seller: 'Sotuvchi',
                    director: 'Direktor',
                    accountant: 'Buxgalter',
                    warehouseman: 'Omborchi',
                    deputy_director: 'Direktor o‘rinbosari',
                };
                return roleMap[role] || 'Noma’lum';
            }
        },
        {
            title: "Amallar",
            key: "actions",
            render: (_, record) => (
                <div>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleUpdateAdmin(record)}
                        style={{ marginRight: 8 }}
                    />
                    <Popconfirm
                        title="Hodimni o'chirishni tasdiqlaysizmi?"
                        onConfirm={() => handleDeleteAdmin(record)}
                        okText="Ha"
                        cancelText="Yo'q"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </div>
            )
        },
    ];


    return (
        <div>
            {
                activeTab !== "active" ?
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            gap: "10px",
                        }}
                    >
                        <Input
                            placeholder="Qidirish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: "100%" }}
                            size="small"
                            prefix={<SearchOutlined style={{ color: "#cdcdcd", marginTop: "3px" }} />}
                        />
                        <Button
                            size="large"
                            type="primary"
                            style={{ background: "#0A3D3A", }}
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/worker/add")}
                        >
                            Ishchilarni qabul qilish
                        </Button>

                        <Button size="large" type="default" icon={<DownloadOutlined />}>
                            Excel
                        </Button>
                    </div>
                    :
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            gap: "10px",
                        }}
                    >
                        <Input
                            placeholder="Search..."
                            prefix={<SearchOutlined />}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ width: "100%" }}
                            size="small"
                        />
                        <Select
                            placeholder="Rolni tanlang"
                            onChange={handleRoleChange}
                            style={{ width: 200 }}
                            size="large"
                            allowClear
                        >
                            <Option value="manager">Menejer</Option>
                            <Option value="director">Direktor</Option>
                            <Option value="accountant">Buxgalter</Option>
                            <Option value="warehouseman">Omborchi</Option>
                            <Option value="deputy_director">Direktor o‘rinbosari</Option>
                        </Select>
                        <Button
                            size="large"
                            type="primary"
                            style={{ background: "#0A3D3A", }}
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/director/add/worker")}
                        >
                            Hodimlarni qabul qilish
                        </Button>

                    </div>
            }

            <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                <Tabs.TabPane tab="Ishchilar" key="all">
                    <ViewWorkers
                        formatBirthDate={formatBirthDate}
                        formatPhoneNumber={formatPhoneNumber}
                        activeTab={activeTab}
                        searchTerm={searchTerm}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Hodimlar" key="active">
                    <Table
                        dataSource={filteredData}
                        columns={columnsPerson}
                        size="small"
                        pagination={false}
                        rowKey="_id"
                        loading={isLoading}
                    />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
};

export default ViewPersons;



