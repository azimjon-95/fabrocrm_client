import React, { useState } from "react";
import { Table, message, Input, Button, Space, Select } from "antd";
import { SearchOutlined, CheckOutlined, CheckCircleOutlined, DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";  // Navigatsiya uchun
import {
    useGetAttendanceByDateQuery,
    useCreateAttendanceMutation,
} from "../../../context/service/attendance";
import { useGetWorkersQuery } from "../../../context/service/worker";
import './style.css';
import { FaHistory } from "react-icons/fa";


const Attendance = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOption, setSelectedOption] = useState("");
    const [attendanceTime, setAttendanceTime] = useState(null);
    const [workingHours, setWorkingHours] = useState("");
    const [attendanceStatus, setAttendanceStatus] = useState({});
    const [width, setWidth] = useState("fit-content");

    const [createAttendance] = useCreateAttendanceMutation();
    const { data: workersData, isLoading: workersLoading } = useGetWorkersQuery();
    const workers = workersData?.innerData || [];

    const navigate = useNavigate();  // Router navigatsiya funksiyasi

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const { data: attendanceData, isLoading: attendanceLoading } = useGetAttendanceByDateQuery(formattedDate);

    const filteredWorkers = workers?.filter(
        (worker) =>
            (worker?.firstName + " " + worker?.lastName + " " + worker?.middleName)
                .toLowerCase()
                .includes(searchTerm?.toLowerCase()) ||
            worker?.phone.includes(searchTerm) ||
            (worker.idNumber && worker.idNumber.includes(searchTerm))
    );

    const handleAttendance = (recordId) => {
        const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        setAttendanceStatus((prevState) => ({
            ...prevState,
            [recordId]: { isCheckedIn: true, currentTime: time }
        }));
        setAttendanceTime(time);
    };

    const handleEdit = async (user) => {
        const payload = {
            workerName: user?.lastName + " " + user?.firstName + " " + user?.middleName,
            workerId: user?._id,
            inTime: attendanceTime,
            workingHours,
            date: new Date().toISOString().slice(0, 10),
            status: {
                foiz: selectedOption?.foiz || 0,
                loc: selectedOption?.loc || "",
            },
        };

        try {
            let res = await createAttendance(payload).unwrap();
            console.log(res);
            message.success("Davomat muvaffaqiyatli qo'shildi!");
            setSelectedOption(null);
        } catch (error) {
            message.warning("Xatolik yuz berdi");
        }
    };

    const columns = [
        {
            title: "Ism Familya",
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
        },
        {
            title: "Davomat",
            key: "attendance",
            render: (_, record) => {
                const todayAttendance = attendanceData?.innerData.find(
                    (attendance) => attendance.workerId === record._id
                );
                return (
                    <Space size="middle">
                        {todayAttendance ? (
                            <div className="todayAttendance">
                                <div className="attendanceItem">
                                    <label>Kelgan vaqti:</label>
                                    <p>{todayAttendance?.inTime}</p>
                                </div>
                                <div className="attendanceItem">
                                    <label>Ish soati:</label>
                                    <p>{todayAttendance?.workingHours}</p>
                                </div>
                                {todayAttendance.status && (todayAttendance?.status?.foiz || todayAttendance?.status?.loc) && (
                                    <div className="attendanceItem">
                                        <label>Komandirovka:</label>
                                        <p>{todayAttendance?.status?.loc}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Button
                                    type="primary"
                                    icon={attendanceStatus[record._id]?.isCheckedIn ? null : <CheckOutlined />}
                                    onClick={() => handleAttendance(record._id)}
                                >
                                    {attendanceStatus[record._id]?.isCheckedIn
                                        ? attendanceStatus[record._id].currentTime
                                        : "Keldi"}
                                </Button>
                                <Input
                                    onChange={(e) => setWorkingHours(e.target.value)}
                                    placeholder="Soati..."
                                    style={{ width: 80 }}
                                />
                                <Select
                                    onChange={(value) => setSelectedOption(value)}
                                    style={{ width }}
                                    onFocus={() => setWidth("90px")}
                                    onBlur={() => setWidth("fit-content")}
                                >
                                    <Select.Option value="voxa">Voxa</Select.Option>
                                    <Select.Option value="tashken">Tashken</Select.Option>
                                    <Select.Option value="vodiy">Vodiy</Select.Option>
                                </Select>
                                <Button
                                    icon={<CheckCircleOutlined />}
                                    size="middle"
                                    onClick={() => handleEdit(record)}
                                    disabled={!attendanceStatus[record._id] || !workingHours}
                                />
                            </>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Tarix",
            key: "story",
            render: (_, record) => (
                <Button
                    type="default"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/attendance/story?workerId=${record._id}`)}
                >
                    Ko'rish
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, gap: "10px" }}>
                <div className="navbar_search">
                    <Input
                        placeholder="Qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 600 }}
                        size="large"
                        prefix={<SearchOutlined style={{ color: "#cdcdcd", marginTop: "3px" }} />}
                    />
                </div>
                <Button style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"

                }}
                    size="large"
                    type="default"
                    onClick={() => navigate("/attendance/story")}
                >
                    <FaHistory /> Davomat
                </Button>

            </div>

            <Table
                columns={columns}
                dataSource={filteredWorkers}
                rowKey="_id"
                loading={workersLoading || attendanceLoading}
                pagination={false}
                style={{ marginTop: 20 }}
                size="small"
                bordered
            />
        </div>
    );
};

export default Attendance;