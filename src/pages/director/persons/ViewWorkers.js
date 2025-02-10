import React, { useState } from "react";
import { Table, Avatar, message, Select, Input, Button, Popconfirm, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import {
    EyeOutlined,
    EyeInvisibleOutlined,
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import {
    useGetWorkersQuery,
    useDeleteWorkerMutation,
} from "../../../context/service/worker";

const ViewWorkers = ({ searchTerm, formatBirthDate, formatPhoneNumber }) => {
    const navigate = useNavigate();
    const [visibleId, setVisibleId] = useState(null);
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

    const handleUpdate = (record) => {
        navigate("/persons/add", { state: { userData: record } });
    };

    const filteredWorkers = workers?.filter((worker) => {
        const fullName = `${worker?.firstName} ${worker?.lastName} ${worker?.middleName}`;
        const matchesSearch =
            fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            worker?.phone.includes(searchTerm) ||
            (worker.idNumber && worker.idNumber.includes(searchTerm));

        return matchesSearch;
    });



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
        <Table
            columns={columns}
            dataSource={filteredWorkers}
            rowKey="_id"
            loading={isLoading}
            pagination={false}
            size="small"
            bordered
        />

    );
};

export default ViewWorkers;



