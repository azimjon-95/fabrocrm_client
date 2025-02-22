import React, { useEffect, useState } from "react";
import { Table, Spin, Alert, message, DatePicker, Button, Input } from "antd";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftOutlined,
  FileExcelOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  useGetMonthlyAttendanceQuery,
  useUpdateAttendanceMutation,
} from "../../../context/service/attendance";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import socket from "../../../socket";

const Story = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get("workerId");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [updateAttendance] = useUpdateAttendanceMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  const location = useLocation();
  const [attendance] = useState(location.pathname === "/all/attendance");
  console.log(attendance);

  const year = selectedDate.year();
  const month = String(selectedDate.month() + 1).padStart(2, "0");
  const { data, isLoading, error, refetch } = useGetMonthlyAttendanceQuery({
    year,
    month,
  });

  useEffect(() => {
    socket.on("attendance_update", () => refetch());
    return () => socket.off("attendance_update");
  }, [refetch]);
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

  // Filterlangan ma'lumotlar
  const filteredData = React.useMemo(() => {
    return workerId
      ? data?.innerData?.filter((item) => item.workerId === workerId)
      : data?.innerData;
  }, [data, workerId]);

  if (isLoading)
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );
  if (error)
    return (
      <Alert
        message="Ma'lumotlarni yuklashda xatolik yuz berdi!"
        type="error"
        showIcon
      />
    );

  // Ishchilarni guruhlash va ish soatlarini hisoblash
  const groupedData = {};
  filteredData?.forEach(({ workerId, workerName, date, workingHours }) => {
    if (!groupedData[workerId]) {
      groupedData[workerId] = {
        workerId,
        workerName,
        workingHours: 0,
        dates: {},
      };
    }
    groupedData[workerId].workingHours += +workingHours;
    groupedData[workerId].dates[date] = workingHours;
  });

  const tableData = Object.values(groupedData);
  const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();
  const currentDate = dayjs().format("YYYY-MM-DD");
  // const monthName = dayjs(`${year}-${month}-01`).format("MMMM");

  // **UPDATE Attendance**
  const handleUpdateAttendance = async (workerId, name, date, value) => {
    const updatedData = {
      workerId,
      workerName: name,
      date,
      workingHours: value,
    };

    try {
      const res = await updateAttendance(updatedData).unwrap();
      message.success(res.message);
      setEditedData({});
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    }
  };

  const onCellClick = (record, date) => {
    if (!isEditing) return;
    setEditedData((prev) => ({
      ...prev,
      [record.workerId]: {
        ...prev[record.workerId],
        [date]: record.dates[date] || "",
      },
    }));
  };

  const onChange = (workerId, date, value) => {
    setEditedData((prev) => ({
      ...prev,
      [workerId]: { ...prev[workerId], [date]: value },
    }));
  };

  const columns = [
    {
      title: "FIO",
      dataIndex: "workerName",
      key: "workerName",
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
              pointerEvents: isFutureDate ? "none" : "auto",
              userSelect: isFutureDate ? "none" : "auto",
              WebkitUserSelect: isFutureDate ? "none" : "auto",
              msUserSelect: isFutureDate ? "none" : "auto",
              MozUserSelect: isFutureDate ? "none" : "auto",
              padding: isEditing ? "0px" : "5px",
            },
            onClick: () => onCellClick(record, date),
          }),
          render: (dates, record) => {
            if (
              isEditing &&
              editedData[record.workerId]?.[date] !== undefined
            ) {
              return (
                <Input
                  className="updateAttendance-inp"
                  size="small"
                  value={editedData[record.workerId][date]}
                  onChange={(e) =>
                    onChange(record.workerId, date, e.target.value)
                  }
                  onBlur={() =>
                    handleUpdateAttendance(
                      record.workerId,
                      record.workerName,
                      date,
                      editedData[record.workerId][date]
                    )
                  }
                  onPressEnter={() =>
                    handleUpdateAttendance(
                      record.workerId,
                      record.workerName,
                      date,
                      editedData[record.workerId][date]
                    )
                  }
                  autoFocus
                  placeholder="..."
                />
              );
            }
            return dates[date] || "-";
          },
        };
      }),
    },
    {
      title: "Jami Ish Soatlari",
      dataIndex: "workingHours",
      key: "workingHours",
    },
  ];

  const exportToExcel = () => {
    const worksheetData = tableData?.map((item) => {
      let row = { FIO: item.workerName, "Oy Soatlari": item.workingHours }; // Xodimning oylik jami ish soati

      for (let i = 1; i <= daysInMonth; i++) {
        const date = dayjs(
          `${year}-${month}-${String(i).padStart(2, "0")}`
        ).format("YYYY-MM-DD");
        const hours = item.dates[date] || "-";
        row[i] = hours;
      }

      return row;
    });

    // Har bir kun uchun jami soatlarni hisoblash
    let totalHoursRow = {
      FIO: "Jami:",
      "Oy Soatlari": tableData.reduce(
        (sum, item) => sum + item.workingHours,
        0
      ),
    };
    for (let i = 1; i <= daysInMonth; i++) {
      totalHoursRow[i] = tableData.reduce(
        (sum, item) =>
          sum +
          (parseFloat(
            item.dates[
              dayjs(`${year}-${month}-${String(i).padStart(2, "0")}`).format(
                "YYYY-MM-DD"
              )
            ]
          ) || 0),
        0
      );
    }

    worksheetData.push(totalHoursRow); // Umumiy natijani qo'shish

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
      header: ["FIO"],
    });

    // Eng uzun "FIO" ni topish va ustun kengligini moslashtirish
    let maxFioLength = Math.max(
      ...tableData.map((item) => item.workerName?.length),
      4
    ); // Minimal 4 ta harf
    let colWidths = [{ wch: maxFioLength + 3 }, { wch: 10 }]; // "FIO" va "Oy Soatlari" kengliklari

    for (let i = 1; i <= daysInMonth; i++) {
      colWidths.push({ wch: 4 }); // Har bir kun uchun kichik kenglik (4 harf)
    }

    worksheet["!cols"] = colWidths; // Excel ustun kengliklarini sozlash

    // Ranglarni qo'shish: yashil va sariq
    worksheetData.forEach((row, rowIndex) => {
      for (let colIndex = 1; colIndex <= daysInMonth; colIndex++) {
        const cell =
          worksheet[
            XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex + 1 })
          ]; // Adjusted index (rowIndex + 1, colIndex + 1)
        if (cell) {
          const value = row[colIndex];
          if (value !== "-" && value !== "") {
            // Ishlangan soatlar uchun yashil rang
            cell.s = {
              fill: { fgColor: { rgb: "00FF00" } },
              font: { color: { rgb: "FFFFFF" } },
            };
          } else {
            // Ishlanmagan soatlar uchun sariq rang
            cell.s = {
              fill: { fgColor: { rgb: "FFFF00" } },
              font: { color: { rgb: "000000" } },
            };
          }
        }
      }
    });

    // Freeze the first row (header)
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Davomat Tarixi");
    XLSX.writeFile(workbook, `Davomat_Tarixi_${year}_${month}.xlsx`);
  };

  return (
    <div className="story_table">
      <div className="story_nav">
        {!attendance && (
          <Button size="large" onClick={() => navigate(-1)}>
            <ArrowLeftOutlined />
            Orqaga qaytish
          </Button>
        )}
        <h2>{isEditing ? "Davomatni taxrirlash" : "Davomat tarixi"}</h2>
        <div>
          <DatePicker
            className="datePicker_nav"
            picker="month"
            size="large"
            value={selectedDate}
            onChange={(date) => setSelectedDate(dayjs(date))}
          />
          {!attendance && (
            <Button
              size="large"
              onClick={() => setIsEditing(!isEditing)}
              icon={<EditOutlined />}
            >
              {isEditing ? "Saqlash" : "Tahrirlash"}
            </Button>
          )}
          {!attendance && (
            <Button
              size="large"
              onClick={exportToExcel}
              icon={<FileExcelOutlined />}
            >
              Excel
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="workerId"
        pagination={false}
        size="small"
        bordered
        scroll={{ x: "max-content" }}
        className="custom-table-scroll-view"
      />
    </div>
  );
};

export default Story;
