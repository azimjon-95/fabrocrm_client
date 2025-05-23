import React, { useState, useMemo } from "react";
import { Table, Avatar, message, Input, Button, Popconfirm, Space } from "antd";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useGetWorkersQuery, useDeleteWorkerMutation } from "../../../context/service/worker";

const ViewPersons = () => {
    const navigate = useNavigate();
    const [visibleId, setVisibleId] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteWorker] = useDeleteWorkerMutation();
    const { data: workersData, isLoading } = useGetWorkersQuery();

    // Handle Mongoose _doc structure
    const workers = useMemo(() =>
        (workersData?.innerData || []).map(worker => ({ ...worker._doc, _id: worker._id })),
        [workersData]
    );

    const roleMapping = {
        manager: "Menejer",
        seller: "Sotuvchi",
        director: "Direktor",
        accountant: "Buxgalter",
        warehouseman: "Omborchi",
        deputy: "Direktor o‘rinbosari",
        distributor: "Yetkazib beruvchi",
    };

    const formatPhoneNumber = (phone) =>
        phone?.replace(/[^\d]/g, "").length === 9
            ? `+998 ${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 7)} ${phone.slice(7, 9)}`
            : phone || "";

    const formatBirthDate = (dayOfBirth) => {
        if (!dayOfBirth) return { formattedDate: "", adjustedAge: 0, birthdayMessage: "" };
        const birthDate = new Date(dayOfBirth);
        const today = new Date();
        const formattedDate = birthDate.toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).split("-").join(".");
        const age = today.getFullYear() - birthDate.getFullYear();
        const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const adjustedAge = today < birthdayThisYear ? age - 1 : age;
        const isToday = today.toDateString() === birthdayThisYear.toDateString();
        const isTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toDateString() === birthdayThisYear.toDateString();

        return {
            formattedDate,
            adjustedAge,
            birthdayMessage: isToday ? "Bugun tug‘ilgan kuni!" : isTomorrow ? "Ertaga tug‘ilgan kuni!" : "",
        };
    };

    const filteredWorkers = useMemo(() => {
        return workers.filter((worker) => {
            const fullName = `${worker.firstName} ${worker.lastName} ${worker.middleName}`.toLowerCase();
            return (
                fullName.includes(searchTerm.toLowerCase()) ||
                worker.phone.includes(searchTerm) ||
                (worker.idNumber && worker.idNumber.includes(searchTerm))
            );
        });
    }, [workers, searchTerm]);

    const handleDelete = async (id) => {
        try {
            const response = await deleteWorker(id);
            message.success(response.data.message);
        } catch (error) {
            message.error(error?.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const exportToExcel = () => {
        const exportData = filteredWorkers.map((worker) => ({
            FIO: `${worker.firstName} ${worker.lastName} ${worker.middleName}`,
            Telefon: formatPhoneNumber(worker.phone),
            Manzil: worker.address || "",
            "Tug'ilgan sana": formatBirthDate(worker.dayOfBirth).formattedDate,
            Yoshi: formatBirthDate(worker.dayOfBirth).adjustedAge.toString(),
            Pasport: "*********",
            "ID (Hover qiling)": worker.idNumber,
            Kasbi: roleMapping[worker.role] || worker.workerType,
            "Rasm URL": worker.img || "Rasm yo‘q",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        worksheet["!cols"] = Object.keys(exportData[0]).map((key) => ({
            wch: Math.max(key.length, ...exportData.map((row) => (row[key] ? row[key].toString().length : 0))) + 2,
        }));

        filteredWorkers.forEach((worker, index) => {
            const cellRef = `F${index + 2}`;
            worksheet[cellRef] = { t: "s", v: "*********" };
            worksheet[cellRef].c = [{ t: "s", v: `ID: ${worker.idNumber}` }];
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Hodimlar");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }), "Hodimlar.xlsx");
    };

    const columns = [
        {
            title: "Rasm",
            dataIndex: "img",
            key: "img",
            render: (img) => <Avatar shape="square" size={70} src={img} icon={<UserOutlined />} />,
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
            render: formatPhoneNumber,
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
                    <Button type="text" icon={visibleId ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => setVisibleId(!visibleId)} />
                </Space>
            ),
            dataIndex: "idNumber",
            key: "idNumber",
            render: (text) => (visibleId ? text : "*********"),
        },
        {
            title: "Kasbi",
            key: "role",
            render: ({ role, workerType }) => roleMapping[role] || workerType,
        },
        {
            title: "Amallar",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => navigate("/persons/add", { state: { userData: record } })} />
                    <Popconfirm title="Ishchini o'chirishni tasdiqlaysizmi?" onConfirm={() => handleDelete(record._id)} okText="Ha" cancelText="Yo'q">
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "10px" }} className="table-responsive">
            <Space style={{ marginBottom: 10, width: "100%", justifyContent: "space-between" }}>
                <Input
                    placeholder="Qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<SearchOutlined style={{ color: "#cdcdcd" }} />}
                    size="small"
                    style={{ minWidth: "400px", height: "35px" }}
                    allowClear
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/worker/add")}
                        style={{ background: "#0A3D3A" }}
                    >
                        Hodimlarni qabul qilish
                    </Button>
                    <Button type="default" icon={<DownloadOutlined />} onClick={exportToExcel}>
                        Excel
                    </Button>
                </Space>
            </Space>
            <Table
                columns={columns}
                dataSource={filteredWorkers}
                rowKey="_id"
                loading={isLoading}
                pagination={false}
                bordered
                size="small"
            />
        </div>
    );
};

export default ViewPersons;