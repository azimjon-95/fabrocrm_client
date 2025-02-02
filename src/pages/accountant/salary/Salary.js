import React, { useState } from "react";
import { Table, Spin, Alert, DatePicker, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useGetMonthlyAttendanceQuery } from "../../../context/service/attendance";
import { FileExcelOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import './style.css'

const Salary = () => {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(dayjs());

    const year = selectedDate.year();
    const month = String(selectedDate.month() + 1).padStart(2, "0");

    const { data, isLoading, error } = useGetMonthlyAttendanceQuery({ year, month });


    if (isLoading) {
        return <Spin size="large" style={{ display: "block", margin: "20px auto" }} />;
    }

    if (error) {
        return <Alert message="Ma'lumotlarni yuklashda xatolik yuz berdi!" type="error" showIcon />;
    }

    // Ishchilarni guruhlash va ish soatlarini hisoblash
    const groupedData = {};
    data?.innerData?.forEach(({ workerId, workerName, date, workingHours }) => {
        if (!groupedData[workerId]) {
            groupedData[workerId] = { workerId, workerName, workingHours: 0, dates: {} };
        }
        groupedData[workerId].workingHours += +workingHours;
        groupedData[workerId].dates[date] = workingHours;
    });

    const tableData = Object.values(groupedData);

    // Oyni nomi va kunlar sonini olish
    const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();
    const months = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktyabr", "Noyabr", "Dekabr"
    ];
    // const monthName = months[selectedDate.month()];

    const currentDate = dayjs().format("YYYY-MM-DD"); // Bugungi sana
    const monthName = dayjs(`${year}-${month}-01`).format("MMMM"); // Oy nomi

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
                const isFutureDate = dayjs(date).isAfter(currentDate); // Kelajakdagi sana ekanligini tekshirish

                return {
                    title: `${day}`,
                    dataIndex: "dates",
                    key: date,
                    onCell: (record) => {
                        const value = record.dates[date];
                        const status = record.status?.loc; // status obyektidan loc ni olish

                        let backgroundColor = isFutureDate ? "transparent" : value ? "#4CAF50" : "#FF5733";
                        let color = isFutureDate ? "inherit" : value ? "#fff" : "#fff";

                        // Agar status loc "voxa" yoki "tashkent" bo'lsa, ranglarni o'zgartirish
                        if (status === "voxa") {
                            backgroundColor = "#FFC107"; // Misol uchun sariq rang
                            color = "#000"; // Matn rangi
                        } else if (status === "tashkent") {
                            backgroundColor = "#03A9F4"; // Misol uchun ko'k rang
                            color = "#fff"; // Matn rangi
                        }

                        const style = {
                            backgroundColor,
                            color,
                            textAlign: "center",
                            fontWeight: "normal",
                        };
                        return { style };
                    },
                    render: (dates) => dates[date] || "-", // Qiymatni ko'rsatish
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
        const worksheetData = tableData.map((item) => {
            let row = { "FIO": item.workerName, "Oy Soatlari": item.workingHours }; // Xodimning oylik jami ish soati

            for (let i = 1; i <= daysInMonth; i++) {
                const date = dayjs(`${year}-${month}-${String(i).padStart(2, "0")}`).format("YYYY-MM-DD");
                const hours = item.dates[date] || "-";
                row[i] = hours;
            }

            return row;
        });

        // Har bir kun uchun jami soatlarni hisoblash
        let totalHoursRow = { "FIO": "Jami:", "Oy Soatlari": tableData.reduce((sum, item) => sum + item.workingHours, 0) };
        for (let i = 1; i <= daysInMonth; i++) {
            totalHoursRow[i] = tableData.reduce((sum, item) => sum + (parseFloat(item.dates[dayjs(`${year}-${month}-${String(i).padStart(2, "0")}`).format("YYYY-MM-DD")]) || 0), 0);
        }

        worksheetData.push(totalHoursRow); // Umumiy natijani qo'shish

        const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
            header: ["FIO"]
        });

        // Eng uzun "FIO" ni topish va ustun kengligini moslashtirish
        let maxFioLength = Math.max(...tableData.map(item => item.workerName.length), 4); // Minimal 4 ta harf
        let colWidths = [{ wch: maxFioLength + 3 }, { wch: 10 }]; // "FIO" va "Oy Soatlari" kengliklari

        for (let i = 1; i <= daysInMonth; i++) {
            colWidths.push({ wch: 4 }); // Har bir kun uchun kichik kenglik (4 harf)
        }

        worksheet["!cols"] = colWidths; // Excel ustun kengliklarini sozlash

        // Ranglarni qo'shish: yashil va sariq
        worksheetData.forEach((row, rowIndex) => {
            for (let colIndex = 1; colIndex <= daysInMonth; colIndex++) {
                const cell = worksheet[XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex + 1 })]; // Adjusted index (rowIndex + 1, colIndex + 1)
                if (cell) {
                    const value = row[colIndex];
                    if (value !== "-" && value !== "") {
                        // Ishlangan soatlar uchun yashil rang
                        cell.s = { fill: { fgColor: { rgb: "00FF00" } }, font: { color: { rgb: "FFFFFF" } } };
                    } else {
                        // Ishlanmagan soatlar uchun sariq rang
                        cell.s = { fill: { fgColor: { rgb: "FFFF00" } }, font: { color: { rgb: "000000" } } };
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
        <div>
            <div className="Salary_nav">
                <Button onClick={() => navigate(-1)}>
                    <ArrowLeftOutlined />
                    Orqaga qaytish
                </Button>
                <h2>Xodimlar Ish Haqqi Berish</h2>
                <div>
                    <DatePicker
                        picker="month"
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(dayjs(date))}
                    />
                    <Button onClick={exportToExcel} icon={<FileExcelOutlined />}>
                        Excel
                    </Button>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={tableData}
                rowKey="workerId"
                pagination={false}
                size="small"
                bordered
            />
        </div>
    );
};

export default Salary;

