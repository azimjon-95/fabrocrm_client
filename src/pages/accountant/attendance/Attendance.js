import React, { useEffect, useState } from "react";
import {
  TimePicker,
  Table,
  message,
  Input,
  Button,
  Space,
  Select,
  Form,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  useGetAttendanceByDateQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
} from "../../../context/service/attendance";
import { useGetOrdersQuery } from "../../../context/service/orderApi";
import { useGetWorkersQuery } from "../../../context/service/worker";
import { MdLightMode, MdNightsStay } from "react-icons/md";
import moment from "moment";
import "./style.css";
import socket from "../../../socket";

const { Option } = Select;

const Attendance = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [changeTime, setChangeTime] = useState({});
  const [selectedOption, setSelectedOption] = useState({});

  const [startTime, setStartTime] = useState({});
  const [endTime, setEndTime] = useState({});
  const [nightStart, setNightStart] = useState({});
  const [nightEnd, setNightEnd] = useState({});
  const [isNight, setIsNight] = useState({ status: false, id: null });

  const [isAttendance, setIsAttendance] = useState({
    status: false,
    id: null,
  });

  const [createAttendance] = useCreateAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();

  const { data: orders, refetch: refetchOrders } = useGetOrdersQuery();
  const addresses =
    orders?.innerData
      ?.filter((i) => i.isType)
      ?.map((order) => ({
        value: order.address.location,
        label: `${order.address.region}, ${order.address.district}`,
      })) || [];

  const {
    data: workersData,
    isLoading: workersLoading,
    refetch: refetchWorkers,
  } = useGetWorkersQuery();
  const workers = workersData?.innerData || [];
  const formattedDate = new Date().toISOString().split("T")[0];
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useGetAttendanceByDateQuery(formattedDate);

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

  useEffect(() => {
    socket.on("attendance_update", (data) => {
      refetchAttendance();
      refetchWorkers();
      refetchOrders();
    });
  }, [refetchOrders, refetchAttendance, refetchWorkers]);

  const handleEdit = async (user) => {
    let inTime =
      attendanceData?.innerData?.find(
        (attendance) => attendance?.workerId === user?._id
      )?.inTime || {};

    const payload = {
      workerName: user?.firstName + " " + user?.lastName,
      workerId: user?._id,
      date: formattedDate,
      status: {
        foiz: 0,
        loc: selectedOption[user._id] || "",
      },
      inTime: {
        start: inTime?.start || startTime[user._id] || "",
        end: inTime?.end || endTime[user._id] || "",
        nightStart: inTime?.nightStart || nightStart[user._id] || "",
        nightEnd: inTime?.nightEnd || nightEnd[user._id] || "",
      },
    };

    try {
      if (startTime[user._id]) {
        await createAttendance(payload).unwrap();
        message.success("Davomat muvaffaqiyatli qo'shildi!");
      } else {
        await updateAttendance({
          ...payload,
          _id: user._id,
        }).unwrap();
        message.success("Davomat muvaffaqiyatli yangilandi!");
      }

      // State-larni tozalash
      setSelectedOption((prev) => ({ ...prev, [user._id]: null }));
      setStartTime((prev) => ({ ...prev, [user._id]: null }));
      setEndTime((prev) => ({ ...prev, [user._id]: null }));
      setNightStart((prev) => ({ ...prev, [user._id]: null }));
      setNightEnd((prev) => ({ ...prev, [user._id]: null }));

      // isAttendance ni yangilash
      setIsAttendance({ id: user._id, status: true });
    } catch (error) {
      message.warning("Xatolik yuz berdi");
    }
  };

  const renderTimePickers = (record) => {
    const todayAttendance = attendanceData?.innerData?.find(
      (attendance) => attendance?.workerId === record?._id
    );
    const inTime = todayAttendance?.inTime || {};
    const status = todayAttendance?.status || {};

    return (
      <Form
        onFinish={() => handleEdit(record)}
        className="attendance-times-inp"
      >
        <div className="time-picker">
          {isNight.id === record._id ? (
            <>
              <TimePicker
                name={`nightStart-${record._id}`}
                onChange={(time, timeString) =>
                  setNightStart((prev) => ({
                    ...prev,
                    [record._id]: timeString,
                  }))
                }
                placeholder="Kechki boshlanish"
                format="HH:mm"
                style={{ width: 110 }}
                size="small"
                className="time-picker-inp"
                value={
                  inTime.nightStart
                    ? moment(inTime.nightStart, "HH:mm")
                    : nightStart[record._id]
                      ? moment(nightStart[record._id], "HH:mm")
                      : null
                }
                disabled={inTime.nightStart}
              />
              <TimePicker
                name={`nightEnd-${record._id}`}
                onChange={(time, timeString) =>
                  setNightEnd((prev) => ({
                    ...prev,
                    [record._id]: timeString,
                  }))
                }
                placeholder="Kechki tugash"
                format="HH:mm"
                style={{ width: 120 }}
                size="small"
                className="time-picker-inp"
                value={
                  inTime.nightEnd
                    ? moment(inTime.nightEnd, "HH:mm")
                    : nightEnd[record._id]
                      ? moment(nightEnd[record._id], "HH:mm")
                      : null
                }
                disabled={!!inTime.nightEnd}
              />
            </>
          ) : (
            <>
              <TimePicker
                name={`start-${record._id}`}
                onChange={(time, timeString) =>
                  setStartTime((prev) => ({
                    ...prev,
                    [record._id]: timeString,
                  }))
                }
                placeholder="Boshlanish"
                format="HH:mm"
                style={{ width: 110 }}
                size="small"
                className="time-picker-inp"
                value={
                  inTime.start
                    ? moment(inTime.start, "HH:mm")
                    : startTime[record._id]
                      ? moment(startTime[record._id], "HH:mm")
                      : null
                }
                disabled={inTime.start}
              />
              <TimePicker
                name={`end-${record._id}`}
                onChange={(time, timeString) =>
                  setEndTime((prev) => ({
                    ...prev,
                    [record._id]: timeString,
                  }))
                }
                placeholder="Tugash"
                format="HH:mm"
                style={{ width: 120 }}
                size="small"
                className="time-picker-inp"
                value={
                  inTime.end
                    ? moment(inTime.end, "HH:mm")
                    : endTime[record._id]
                      ? moment(endTime[record._id], "HH:mm")
                      : null
                }
                disabled={inTime.end}
              />
              <Select
                name={`location-${record._id}`}
                placeholder="Manzilni tanlang"
                style={{ width: 190 }}
                value={status.loc ? status.loc : selectedOption[record._id]}
                onChange={(value) => {
                  setSelectedOption((prev) => ({
                    ...prev,
                    [record._id]: value,
                  }));
                }}
                disabled={status.loc}
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
        //   disabled={
        //     changeTime[record._id]
        //       ? !nightStart[record._id] || !nightEnd[record._id]
        //       : !startTime[record._id] || !endTime[record._id]
        //   }
        />
        <Button
          icon={isNight.id === record._id ? <MdLightMode /> : <MdNightsStay />}
          size="middle"
          onClick={() =>
            setIsNight({
              status: !isNight.status,
              id: isNight.id === record._id ? null : record._id,
            })
          }
          className={`nightsStay ${isNight.id === record._id ? "active" : ""}`}
        />
      </Form>
    );
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
      render: (phone) => formatPhoneNumber(phone),
    },
    {
      title: "Davomat",
      key: "attendance",
      render: (_, record) => {
        return <Space size="middle">{renderTimePickers(record)}</Space>;
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Input
          placeholder="Qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", height: "35px" }}
          size="small"
          prefix={<SearchOutlined style={{ color: "#cdcdcd" }} />}
        />
        <Button type="default" onClick={() => navigate("/attendance/story")}>
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