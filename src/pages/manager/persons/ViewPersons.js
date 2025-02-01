import React, { useEffect, useState } from "react";
import { Table, Avatar, message, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';
import axios from "../../../api";

const WorkersTable = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token"); // Tokenni localStorage'dan olish (agar token saqlangan bo'lsa)

                const { data } = await axios.get("/api/worker/all", {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Tokenni headerga qo‘shish
                    }
                });

                setWorkers(data.innerData);
            } catch (error) {
                message.error("Ishchilarni yuklashda xatolik yuz berdi!");
            }
            setLoading(false);
        };
        fetchWorkers();
    }, []);
    console.log(workers);
    const filteredWorkers = workers?.filter(
        (worker) =>
            worker?.firstName.toLowerCase().includes(searchTerm?.toLowerCase()) ||
            worker?.lastName.toLowerCase().includes(searchTerm?.toLowerCase()) ||
            worker?.phone.includes(searchTerm) ||
            (worker.idNumber && worker.idNumber.includes(searchTerm))
    );

    const columns = [
        {
            title: "Rasm",
            dataIndex: "img",
            key: "img",
            render: (img) => (
                img ? (
                    <Avatar
                        shape="square"
                        size={50}
                        src={img}
                    />
                ) : (
                    <Avatar
                        shape="square"
                        size={50}
                        icon={<UserOutlined />} // Icon ko‘rsatish
                    />
                )
            ),
        },
        {
            title: "Ism",
            dataIndex: "firstName",
            key: "firstName",
        },
        {
            title: "Familiya",
            dataIndex: "lastName",
            key: "lastName",
        },
        {
            title: "Telefon",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Pasport",
            dataIndex: "idNumber",
            key: "idNumber",
        },
    ];

    return (
        <div>
            {/* Navbar */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <div className="navbar_search">


                    <Input
                        placeholder="Qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 600 }}
                        size="large"
                        prefix={<SearchOutlined style={{ color: "#cdcdcd", marginTop: "3px" }} />} // Qidirish ikonkasi
                    />

                </div>

                <Button size="large" type="primary" icon={<PlusOutlined />} onClick={() => navigate("/persons/add")}>
                    Ishchilarni qabul qilish
                </Button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredWorkers}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 5 }}
                style={{ marginTop: 20 }}
                bordered
            />
        </div>
    );
};

export default WorkersTable;
