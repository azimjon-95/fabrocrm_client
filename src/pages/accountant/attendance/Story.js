import React, { useState } from "react";
import { Table, Spin, Alert, DatePicker, Button } from "antd";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useGetMonthlyAttendanceQuery } from "../../../context/service/attendance";
import { CiEdit } from "react-icons/ci";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

const Story = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const workerId = searchParams.get("workerId");
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const location = useLocation();
    const [attendance] = useState(location.pathname === "/all/attendance");
    const year = selectedDate.year();
    const month = String(selectedDate.month() + 1).padStart(2, "0");
    const { data, isLoading, error } = useGetMonthlyAttendanceQuery({ year, month });
    const months = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktyabr", "Noyabr", "Dekabr"
    ];
    const monthName = months[selectedDate.month()];

    // Filterlangan ma'lumotlar
    const filteredData = React.useMemo(() => {
        return workerId ? data?.innerData?.filter(item => item.workerId === workerId) : data?.innerData;
    }, [data, workerId]);
    if (isLoading) return <Spin size="large" style={{ display: "block", margin: "20px auto" }} />;
    if (error) return <Alert message="Ma'lumotlarni yuklashda xatolik yuz berdi!" type="error" showIcon />;

    const groupedData = filteredData?.reduce((acc, { workerId, workerName, date, workingHours, nightWorkingHours }) => {
        // Agar workerId mavjud bo'lmasa, yangi obyekt yaratamiz
        if (!acc[workerId]) {
            acc[workerId] = {
                workerId,
                workerName,
                workingHours: 0,
                nightWorkingHours: 0,
                dates: {}
            };
        }

        // Umumiy ish va tun ishlagan soatlarni qo'shamiz
        acc[workerId].workingHours += Number(workingHours) || 0;
        acc[workerId].nightWorkingHours += Number(nightWorkingHours) || 0;

        // Har bir sanaga mos ish va tun ishlagan soatlarni kiritamiz
        acc[workerId].dates[date] = {
            workingHours: Number(workingHours) || 0,
            nightWorkingHours: Number(nightWorkingHours) || 0
        };

        return acc;
    }, {});
    const tableData = Object.values(groupedData);
    const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();
    const currentDate = dayjs().format("YYYY-MM-DD");

    const getCellStyle = (isFutureDate, hasData) => ({
        backgroundColor: isFutureDate ? "transparent" : hasData ? "#4CAF50" : "#FF5733",
        color: "#fff",
        textAlign: "center",
        cursor: isFutureDate ? "not-allowed" : "pointer",
        pointerEvents: isFutureDate ? "none" : "auto",
        userSelect: isFutureDate ? "none" : "auto",
        WebkitUserSelect: isFutureDate ? "none" : "auto",
        msUserSelect: isFutureDate ? "none" : "auto",
        MozUserSelect: isFutureDate ? "none" : "auto",
        position: "relative"
    });

    const handleEditClick = (workerName) => {
        navigate(`/edit/attendance/${workerName}`);
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
                const date = dayjs(`${year}-${month}-${String(day).padStart(2, "0")}`).format("YYYY-MM-DD");
                const isFutureDate = dayjs(date).isAfter(currentDate);

                return {
                    title: `${day}`,
                    dataIndex: "dates",
                    key: date,
                    onCell: (record) => ({
                        style: getCellStyle(isFutureDate, record.dates[date]),
                    }),
                    render: (dates, record) => {
                        const dayData = dates[date] || {};
                        const { workingHours = 0, nightWorkingHours = 0 } = dayData;
                        return (
                            <div className="workingHours-nightWorkingHours">
                                {
                                    workingHours > 0 &&
                                    <span className={nightWorkingHours > 0 && `workingHours`} style={{ color: "#ffffff" }}>{workingHours}</span>
                                }
                                {
                                    nightWorkingHours > 0 && workingHours > 0 && (
                                        <div className="night-slesh"></div>
                                    )
                                }
                                {nightWorkingHours > 0 && (
                                    <span className={workingHours > 0 && "nightWorkingHours"} style={{ color: "#ffffff" }}>{nightWorkingHours}</span>
                                )}
                            </div>
                        );
                    },
                };
            }),
        },
        {
            title: "Ish Soati",
            dataIndex: "workingHours",
            key: "workingHours",
        },
        {
            title: "Tungi Soat",
            dataIndex: "nightWorkingHours",
            key: "nightWorkingHours",
        },
        {
            title: "Tahrirlash",
            key: "edit",
            render: (_, record) => (
                <Button className="editAttendance-btn"
                    type="link"
                    onClick={() => handleEditClick(record.workerId)}
                >
                    <CiEdit />
                </Button>
            ),
        }

    ];


    const handleExportToExcel = () => {
        const excelData = tableData.map((row) => {
            const rowData = {
                FIO: row.workerName,
                "Ish Soati": row.workingHours,
                "Tungi Soat": row.nightWorkingHours
            };

            for (let i = 1; i <= daysInMonth; i++) {
                const date = dayjs(`${year}-${month}-${String(i).padStart(2, "0")}`).format("YYYY-MM-DD");
                const dayData = row.dates[date] || {};
                const workingHours = dayData.workingHours || 0;
                const nightWorkingHours = dayData.nightWorkingHours || 0;

                rowData[` ${i}`] = workingHours || nightWorkingHours
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
            wch: Math.max(...excelData.map((row) => (row[key] || "").toString().length)) + 5,
        }));
        worksheet["!cols"] = columnWidths;

        XLSX.writeFile(workbook, `Davomat_${monthName}_${year}.xlsx`);
    };



    return (
        <div className="story_table">
            <div className="story_nav">
                {
                    !attendance &&
                    <Button size="middle" style={{ height: "36px" }} onClick={() => navigate(-1)}>
                        <ArrowLeftOutlined />
                        Orqaga qaytish
                    </Button>
                }
                <h2>Davomat tarixi</h2>
                <div>
                    <DatePicker className="datePicker_nav"
                        picker="month" size="large"
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(dayjs(date))}
                    />
                    {
                        !attendance &&
                        <Button onClick={handleExportToExcel} size="large" icon={<FileExcelOutlined />}>
                            Excel
                        </Button>
                    }
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={tableData}
                rowKey="workerId"
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 'max-content' }}
                className="custom-table-scroll-view"
            />
        </div>
    );
};

export default Story;


