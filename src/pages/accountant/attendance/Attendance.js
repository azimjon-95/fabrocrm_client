import React, { useState, useMemo } from "react";
import {
  Table,
  Spin,
  Input,
  Modal,
  Select,
  DatePicker,
  Button,
  message,
} from "antd";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  useGetMonthlyAttendanceQuery,
  useUpdateAttendanceMutation,
} from "../../../context/service/attendance";
import { FileExcelOutlined } from "@ant-design/icons";
import { useGetWorkersQuery } from "../../../context/service/worker";
import { useGetAllWorkingHoursQuery } from "../../../context/service/workingHours";
import { useGetOrdersQuery } from "../../../context/service/orderApi";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import "./style.css";

const Attendance = () => {
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get("workerId");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const year = selectedDate.year();
  const location = useLocation();
  const [attendance] = useState(location.pathname === "/all/attendance");
  const [updateAttendance] = useUpdateAttendanceMutation();
  const month = String(selectedDate.month() + 1).padStart(2, "0");
  const { data, isLoading,
    refetch: attendanceRefetch,
  } = useGetMonthlyAttendanceQuery({ year, month });
  const { data: ordersData } = useGetOrdersQuery();
  const activeOrders = ordersData?.innerData?.filter((i) => i.isType);
  // useGetAllWorkingHoursQuery
  const { data: workingHoursData } = useGetAllWorkingHoursQuery();

  const months = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktyabr",
    "Noyabr",
    "Dekabr",
  ];
  const monthName = months[selectedDate.month()];
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    workerId: null,
    date: null,
    workingHours: "",
    nightWorkingHours: "",
    location: "",
  });

  const {
    data: workersData,
    isLoading: workersLoading,
    refetch: workersRefetch,
  } = useGetWorkersQuery();
  const adminRoles = [
    // "manager",
    // "seller",
    "director",
    // "accountant",
    // "warehouseman",
    "deputy_director",
  ];

  const Workers = workersData?.innerData.filter(
    (worker) => !adminRoles.includes(worker.role)
  );

  // Filterlangan ma'lumotlar
  const filteredData = useMemo(() => {
    return workerId
      ? data?.innerData?.filter((item) => item.workerId === workerId)
      : data?.innerData;
  }, [data, workerId]);

  // Ishchilarni workersData dan olish va davomat bilan birlashtirish
  const combinedData = Workers?.map((worker) => {
    const attendanceData =
      filteredData?.filter((item) => item.workerId === worker._id) || [];

    const dates = attendanceData.reduce(
      (acc, { date, workingHours, nightWorkingHours }) => {
        acc[date] = {
          workingHours: Number(workingHours) || 0,
          nightWorkingHours: Number(nightWorkingHours) || 0,
        };
        return acc;
      },
      {}
    );

    const { voxa, toshkent, umumiyWorkingHours } = attendanceData.reduce(
      (acc, item) => {
        const hours = Number(item.workingHours) || 0;
        const loc = item.status?.loc?.toLowerCase(); // loc ni kichik harfda olamiz
        if (loc === "voxa") {
          acc.voxa += hours;
        } else if (loc === "toshkent") {
          acc.toshkent += hours;
        } else {
          acc.umumiyWorkingHours += hours;
        }
        return acc;
      },
      { voxa: 0, toshkent: 0, umumiyWorkingHours: 0 }
    );

    return {
      workerId: worker._id,
      workerName: worker.firstName + " " + worker.lastName,
      dates,
      voxa,
      toshkent,
      workingHours: umumiyWorkingHours,
      nightWorkingHours: attendanceData.reduce(
        (sum, item) => sum + (Number(item.nightWorkingHours) || 0),
        0
      ),
    };
  });

  const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();
  const currentDate = dayjs().format("YYYY-MM-DD");

  const handleOpenModal = (record, date) => {
    setModalData({
      workerId: record.workerId,
      date,
      workingHours: record.dates[date]?.workingHours || "",
      nightWorkingHours: record.dates[date]?.nightWorkingHours || "",
      location: record.dates[date]?.location || "",
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalData({
      workerId: null,
      date: null,
      workingHours: "",
      nightWorkingHours: "",
      location: "",
    });
  };

  const handleSave = async () => {
    // workingHoursData ichidan location ga mos keluvchi prosentni olish
    const selectedData = workingHoursData?.innerData.find((item) => {
      return item[modalData.location.toLowerCase()] !== undefined;
    });

    const updatedData = {
      workerId: modalData.workerId,
      date: modalData.date,
      location: modalData.location,
      prosent: selectedData
        ? selectedData[modalData.location.toLowerCase()]
        : 0,
      workingHours: modalData.workingHours,
      nightWorkingHours: modalData.nightWorkingHours,
    };

    try {
      const res = await updateAttendance(updatedData).unwrap();
      message.success(res.message);
      workersRefetch();
      attendanceRefetch()
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    }

    handleCloseModal();
  };

  const [selectedCell, setSelectedCell] = useState(null);
  const onCellClick = (record, date) => {
    setSelectedCell(`${record.workerId}-${date}`);
  };

  const columns = [
    {
      title: "FIO",
      dataIndex: "workerName",
      key: "workerName",
      fixed: "left",
    },
    {
      title: monthName,
      children: Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const date = dayjs(
          `${year}-${month}-${String(day).padStart(2, "0")}`
        ).format("YYYY-MM-DD");
        const isFutureDate = dayjs(date).isAfter(currentDate);

        return {
          title: `${day}`,
          dataIndex: "dates",
          key: date,
          onCell: (record) => ({
            style: {
              backgroundColor: isFutureDate
                ? "transparent"
                : record.dates[date]
                  ? "#4CAF50"
                  : "#FF5733",
              color: "#fff",
              textAlign: "center",
              cursor: isFutureDate ? "not-allowed" : "pointer",
              borderColor:
                selectedCell === `${record.workerId}-${date}` &&
                "2px solid #1890ff",
            },
            onClick: () => {
              if (!isFutureDate) {
                handleOpenModal(record, date);
                onCellClick(record, date);
              }
            },
          }),
          render: (dates, record) => {
            const dayData = dates[date] || {};
            const { workingHours = 0, nightWorkingHours = 0 } = dayData;

            return (
              <div className="workingHours-nightWorkingHours">
                {workingHours > 0 && (
                  <span
                    // className={nightWorkingHours > 0 && `workingHours`}
                    className={nightWorkingHours > 0 ? "workingHours" : ""}
                    style={{ color: "#ffffff" }}
                  >
                    {workingHours}
                  </span>
                )}
                {nightWorkingHours > 0 && workingHours > 0 && (
                  <div className="night-slesh"></div>
                )}
                {nightWorkingHours > 0 && (
                  <span
                    // className={workingHours > 0 && "nightWorkingHours"}
                    className={workingHours > 0 ? "nightWorkingHours" : ""}
                    style={{ color: "#ffffff" }}
                  >
                    {nightWorkingHours}
                  </span>
                )}
              </div>
            );
          },
        };
      }),
    },
    {
      title: "Ish soatlar",
      children: [
        {
          title: "Kunduzgi",
          dataIndex: "workingHours",
          key: "workingHours",
          align: "center",
          fixed: "right",
        },
        {
          title: "Tungi",
          dataIndex: "nightWorkingHours",
          key: "nightWorkingHours",
          align: "center",
          fixed: "right",
        },
      ],
      fixed: "right",
    },
    {
      title: "Xizmat safari",
      children: [
        {
          title: "Voxa",
          dataIndex: "voxa",
          key: "voxa",
          align: "center",
          fixed: "right",
        },
        {
          title: "Toshkent",
          dataIndex: "toshkent",
          key: "toshkent",
          align: "center",
          fixed: "right",
        },
      ],
      fixed: "right",
    },
  ];

  const handleExportToExcel = () => {
    const excelData = combinedData.map((row) => {
      const rowData = {
        FIO: row.workerName,
        "Ish Soati": row.workingHours,
        "Tungi Soat": row.nightWorkingHours,
        "Voxa Soati": row.voxa, // Voxa ish soatlari
        "Toshkent Soati": row.toshkent, // Toshkent ish soatlari
      };

      for (let i = 1; i <= daysInMonth; i++) {
        const date = dayjs(
          `${year}-${month}-${String(i).padStart(2, "0")}`
        ).format("YYYY-MM-DD");
        const dayData = row.dates[date] || {};
        const workingHours = dayData.workingHours || 0;
        const nightWorkingHours = dayData.nightWorkingHours || 0;

        rowData[` ${i}`] =
          workingHours || nightWorkingHours
            ? `${workingHours} / ${nightWorkingHours}`
            : "";
      }

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Davomat");

    // Avtomatik kenglikni o'rnatish
    const columnWidths = Object.keys(excelData[0]).map((key) => ({
      wch:
        Math.max(
          ...excelData.map((row) => (row[key] || "").toString().length)
        ) + 5,
    }));
    worksheet["!cols"] = columnWidths;

    XLSX.writeFile(workbook, `Davomat_${monthName}_${year}.xlsx`);
  };

  const workerName =
    Workers?.find((worker) => worker._id === modalData.workerId)?.firstName +
    " " +
    Workers?.find((worker) => worker._id === modalData.workerId)?.lastName;

  const uzMonths = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];

  const formatUzbekDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = uzMonths[date.getMonth()];
    return `${day}-${month}`;
  };

  if (isLoading || workersLoading)
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );
  return (
    <div className="story_table">
      <div className="story_nav">
        <DatePicker
          className="datePicker_nav"
          picker="month"
          size="large"
          value={selectedDate}
          onChange={(date) => setSelectedDate(dayjs(date))}
        />
        <h2>Davomat tarixi</h2>
        <Button
          size="large"
          icon={<FileExcelOutlined />}
          onClick={handleExportToExcel}
        >
          Excel
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={combinedData}
        pagination={false}
        rowKey="workerId"
        size="small"
        bordered
        scroll={{ x: "max-content" }}
        className="custom-table-scroll-view" // Add this class to the Table component
      />
      {!attendance && (
        <Modal
          title={
            <div className="modal-title">
              <div>Davomatni: {formatUzbekDate(modalData.date)}</div>
              <div>{workerName}</div>
            </div>
          }
          open={modalVisible}
          onOk={handleSave}
          onCancel={handleCloseModal}
          className="updateAttendance-modal"
          width={250}
        >
          <div className="updateAttendance-box">
            <div>
              <span>Kun: Soat:</span>
              <Input
                type="number"
                className="updateAttendance-inp"
                min={0}
                value={modalData.workingHours}
                onChange={(e) =>
                  setModalData({ ...modalData, workingHours: e.target.value })
                }
              />
            </div>
            <div>
              <span>Tun: Soat:</span>
              <Input
                type="number"
                className="updateAttendance-inp"
                min={0}
                value={modalData.nightWorkingHours}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    nightWorkingHours: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <span>Manzil:</span>
            <Select
              className="updateAttendance-sel"
              size="small"
              placeholder="Komandirovka joyi"
              value={modalData.location}
              onChange={(value) => {
                const selectedData = activeOrders.find(
                  (item) => item.location === value
                );
                setModalData({
                  ...modalData,
                  location: value,
                  region: selectedData ? selectedData.region : "",
                  district: selectedData ? selectedData.district : "",
                });
              }}
            >
              {activeOrders?.map((item) => (
                <Select.Option key={item._id} value={item?.address.location}>
                  {item?.address.region}, {item?.address.district}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Attendance;
