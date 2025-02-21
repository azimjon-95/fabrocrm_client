import React, { useState } from "react";
import { TimePicker, Table, message, Input, Button, Space, Select, Form } from "antd";
import { SearchOutlined, CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetAttendanceByDateQuery, useCreateAttendanceMutation } from "../../../context/service/attendance";
import { useGetOrdersQuery } from "../../../context/service/orderApi";
import { useGetWorkersQuery } from "../../../context/service/worker";
import { MdLightMode, MdNightsStay } from "react-icons/md";
import moment from 'moment';
import './style.css';

const { Option } = Select;
const Attendance = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [changeTime, setChangeTime] = useState({});
    const [selectedOption, setSelectedOption] = useState({});


    const [startTime, setStartTime] = useState({});
    const [endTime, setEndTime] = useState({});
    const [nightStart, setNightStart] = useState({});
    const [nightEnd, setNightEnd] = useState({});

    const { data: orders } = useGetOrdersQuery();
    const addresses = orders?.innerData?.filter(i => i.isType)?.map((order) => ({
        value: order.address.location,
        label: `${order.address.region}, ${order.address.district}`,
    })) || [];

    const [createAttendance] = useCreateAttendanceMutation();
    const { data: workersData, isLoading: workersLoading } = useGetWorkersQuery();
    const workers = workersData?.innerData || [];
    const navigate = useNavigate();
    const formattedDate = new Date().toISOString().split('T')[0];
    const { data: attendanceData, isLoading: attendanceLoading } = useGetAttendanceByDateQuery(formattedDate);

    const filteredWorkers = workers?.filter(
        (worker) =>
            (worker?.firstName + " " + worker?.lastName)
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


    const handleEdit = async (user) => {
        const payload = {
            workerName: user?.firstName + " " + user?.lastName,
            workerId: user?._id,
            date: formattedDate,
            status: {
                foiz: 0,
                loc: selectedOption[user._id] || "",
            },
            inTime: {
                start: startTime[user._id] || "",
                end: endTime[user._id] || "",
                nightStart: nightStart[user._id] || "",
                nightEnd: nightEnd[user._id] || "",
            }
        };

        console.log(payload);

        try {
            await createAttendance(payload).unwrap();
            message.success("Davomat muvaffaqiyatli qo'shildi!");
            setSelectedOption(prev => ({ ...prev, [user._id]: null }));
            setStartTime(prev => ({ ...prev, [user._id]: null }));
            setEndTime(prev => ({ ...prev, [user._id]: null }));
            setNightStart(prev => ({ ...prev, [user._id]: null }));
            setNightEnd(prev => ({ ...prev, [user._id]: null }));
        } catch (error) {
            message.warning("Xatolik yuz berdi");
        }
    };


    const handleChangeTime = (recordId) => {
        setChangeTime((prevState) => ({
            ...prevState,
            [recordId]: !prevState[recordId]
        }));
    };

    const renderTimePickers = (record) => (
        <Form onFinish={() => handleEdit(record)} className="attendance-times-inp">
            <div className="time-picker">
                {changeTime[record._id] ? (
                    <>
                        <TimePicker
                            name={`nightStart-${record._id}`}
                            onChange={(time, timeString) => setNightStart(prev => ({
                                ...prev,
                                [record._id]: timeString
                            }))}
                            placeholder="Kechki boshlanish"
                            format="HH:mm"
                            style={{ width: 110 }}
                            size="small"
                            className="time-picker-inp"
                            value={nightStart[record._id] ? moment(nightStart[record._id], 'HH:mm') : null}
                        />
                        <TimePicker
                            name={`nightEnd-${record._id}`}
                            onChange={(time, timeString) => setNightEnd(prev => ({
                                ...prev,
                                [record._id]: timeString
                            }))}
                            placeholder="Kechki tugash"
                            format="HH:mm"
                            style={{ width: 120 }}
                            size="small"
                            className="time-picker-inp"
                            value={nightEnd[record._id] ? moment(nightEnd[record._id], 'HH:mm') : null}
                        />
                    </>
                ) : (
                    <>
                        <TimePicker
                            name={`start-${record._id}`}
                            onChange={(time, timeString) => setStartTime(prev => ({
                                ...prev,
                                [record._id]: timeString
                            }))}
                            placeholder="Boshlanish"
                            format="HH:mm"
                            style={{ width: 110 }}
                            size="small"
                            className="time-picker-inp"
                            value={startTime[record._id] ? moment(startTime[record._id], 'HH:mm') : null}
                        />
                        <TimePicker
                            name={`end-${record._id}`}
                            onChange={(time, timeString) => setEndTime(prev => ({
                                ...prev,
                                [record._id]: timeString
                            }))}
                            placeholder="Tugash"
                            format="HH:mm"
                            style={{ width: 120 }}
                            size="small"
                            className="time-picker-inp"
                            value={endTime[record._id] ? moment(endTime[record._id], 'HH:mm') : null}
                        />
                        <Select
                            name={`location-${record._id}`}
                            placeholder="Manzilni tanlang"
                            style={{ width: 190 }}
                            value={selectedOption[record._id]}
                            onChange={(value) => {
                                setSelectedOption(prev => ({
                                    ...prev,
                                    [record._id]: value
                                }));
                            }}
                        >
                            {addresses?.map((address, inx) => (
                                <Option key={inx} value={address.value}>
                                    {address.label}
                                </Option>
                            ))}
                        </Select>
                    </>
                )}
            </div>

            <Button
                icon={<CheckCircleOutlined />}
                size="middle"
                type="primary"
                htmlType="submit"
                disabled={
                    changeTime[record._id]
                        ? !nightStart[record._id] || !nightEnd[record._id]
                        : !startTime[record._id] || !endTime[record._id]
                }
            />
            <Button
                icon={changeTime[record._id] ? <MdLightMode /> : <MdNightsStay />}
                size="middle"
                onClick={() => handleChangeTime(record._id)}
                className={`nightsStay ${changeTime[record._id] ? 'active' : ''}`}
            />
        </Form>
    );


    const columns = [
        {
            title: "Ism Familya",
            key: "fio",
            render: (_, record) => (
                <span>{record.firstName} {record.lastName}</span>
            ),
        },
        {
            title: "Telefon",
            dataIndex: "phone",
            key: "phone",
            render: (phone) => formatPhoneNumber(phone),
        },
        {
            title: "Davomat",
            key: "attendance",
            render: (_, record) => {
                return (
                    <Space size="middle">
                        {renderTimePickers(record)}
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
        <div className="attendance-box">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <Input
                    placeholder="Qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "100%", height: "35px" }}
                    size="small"
                    prefix={<SearchOutlined style={{ color: "#cdcdcd" }} />}
                />
                <Button
                    type="default"
                    onClick={() => navigate("/attendance/story")}
                >
                    Davomat Tarixi
                </Button>
            </div>
            <Table
                className="custom-tableAtt"
                columns={columns}
                dataSource={filteredWorkers}
                rowKey="_id"
                loading={workersLoading || attendanceLoading}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: "max-content", y: 560 }}
            />
        </div>
    );
};

export default Attendance;


{/*  // const todayAttendance = attendanceData?.innerData.find(
                        //     (attendance) => attendance.workerId === record._id
                        // );
                        {todayAttendance ? (
                            <div className="todayAttendance">
                                <div>Kelgan vaqti: {todayAttendance?.inTime}</div>
                                <div>Ish soati: {todayAttendance?.workingHours}</div>
                                {todayAttendance?.status?.loc && (
                                    <div>Komandirovka: {todayAttendance?.status?.loc}</div>
                                )}
                            </div>
                        ) : (
                            )} */}