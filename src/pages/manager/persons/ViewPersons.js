import React, { useEffect, useState } from "react";
import { Table, Avatar, message, Input, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from '@ant-design/icons';
import axios from "axios";

const WorkersTable = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkers = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get("/worker/all");
                setWorkers(data);
            } catch (error) {
                message.error("Ishchilarni yuklashda xatolik yuz berdi!");
            }
            setLoading(false);
        };
        fetchWorkers();
    }, []);

    const filteredWorkers = workers.filter(
        (worker) =>
            worker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            worker.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            worker.phone.includes(searchTerm) ||
            (worker.passport && worker.passport.includes(searchTerm))
    );

    const columns = [
        {
            title: "Rasm",
            dataIndex: "img",
            key: "img",
            render: (img) => <Avatar shape="square" size={50} src={img} />,
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
            dataIndex: "passport",
            key: "passport",
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
