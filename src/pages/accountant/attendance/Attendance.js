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
  useUpdateByAttendanceMutation,
} from "../../../context/service/attendance";
import { useGetAllWorkingHoursQuery } from '../../../context/service/workingHours';

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
  const [selectedOption, setSelectedOption] = useState({});
  const [startTime, setStartTime] = useState({});
  const [endTime, setEndTime] = useState({});
  const [nightStart, setNightStart] = useState({});
  const [nightEnd, setNightEnd] = useState({});
  const [isNight, setIsNight] = useState({ status: false, id: null });
  const [createAttendance] = useCreateAttendanceMutation();
  const [updateByAttendance] = useUpdateByAttendanceMutation();
  const { data: orders, refetch: refetchOrders } = useGetOrdersQuery();
  const { data: location } = useGetAllWorkingHoursQuery();


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
  const uzbekistanDate = new Date().toLocaleDateString("uz-UZ", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // Formatlash (YYYY-MM-DD)
  const formattedDate = uzbekistanDate.split('.').reverse().join('-');

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
      ) || {};

    // Avval hamma o'zgaruvchilarni e'lon qilamiz
    const start = inTime?.inTime?.start || startTime[user._id] || "";
    const end = inTime?.inTime?.end || endTime[user._id] || "";
    const nightStartValue = inTime?.inTime?.nightStart || nightStart[user._id] || "";
    const nightEndValue = inTime?.inTime?.nightEnd || nightEnd[user._id] || "";

    // Kunning ish vaqti hisoblanmoqda
    let workingHours = 0;
    if (start && end) {
      const startTimeObj = new Date(`1970-01-01T${start}:00`);
      const endTimeObj = new Date(`1970-01-01T${end}:00`);
      const diffMs = endTimeObj - startTimeObj;
      workingHours = diffMs / (1000 * 60 * 60); // Millisekundlarni soatga o'zgartirish
    }

    // Tun ishlagan soatlarni hisoblash
    let nightWorkingHours = 0;
    if (nightStartValue && nightEndValue) {
      let nightStartTimeObj = new Date(`1970-01-01T${nightStartValue}:00`);
      let nightEndTimeObj = new Date(`1970-01-01T${nightEndValue}:00`);

      // Agar tun ishlash vaqti ertalabgacha davom etsa
      if (nightEndTimeObj < nightStartTimeObj) {
        nightEndTimeObj.setDate(nightEndTimeObj.getDate() + 1);
      }

      const diffNightMs = nightEndTimeObj - nightStartTimeObj;
      nightWorkingHours = diffNightMs / (1000 * 60 * 60);
    }

    // Payload obyektini tuzish
    const selectedRegion = selectedOption[user._id];
    let foiz = 0;

    if (selectedRegion) {
      // innerData ichidagi barcha key-value juftliklarini ko'rib chiqamiz
      Object.entries(location?.innerData?.[0] || {}).forEach(([key, value]) => {
        if (key === selectedRegion?.toLowerCase()) {
          foiz = value; // Agar key selectedRegion ga teng bo'lsa, value ni foiz ga olamiz
        }
      });
    }

    // Payload obyektini tuzish
    const payload = {
      workerName: user?.firstName + " " + user?.lastName,
      workerId: user?._id,
      date: formattedDate,
      status: {
        foiz,
        loc: selectedOption[user._id] || "",
      },
      inTime: {
        start,
        end,
        nightStart: nightStartValue,
        nightEnd: nightEndValue,
      },
      workingHours,
      nightWorkingHours,
    };

    try {
      if (startTime[user._id] || startTime[user._id] === undefined) {
        await createAttendance(payload).unwrap();
        message.success("Davomat muvaffaqiyatli qo'shildi!");
      } else {
        await updateByAttendance({
          id: inTime?._id,
          updatedData: payload,
        }).unwrap();
        message.success("Davomat muvaffaqiyatli yangilandi!");
      }

      // State-larni tozalash
      refetchAttendance();
      setSelectedOption((prev) => ({ ...prev, [user._id]: null }));
      setStartTime((prev) => ({ ...prev, [user._id]: null }));
      setEndTime((prev) => ({ ...prev, [user._id]: null }));
      setNightStart((prev) => ({ ...prev, [user._id]: null }));
      setNightEnd((prev) => ({ ...prev, [user._id]: null }));
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
          className="check-btnIs"
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
          gap: 10,
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
        <Button style={{ height: "35px" }} type="default" onClick={() => navigate("/attendance/story")}>
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