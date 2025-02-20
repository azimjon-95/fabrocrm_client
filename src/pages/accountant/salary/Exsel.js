import React, { useMemo } from "react";
import { Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useGetMonthlyAttendanceQuery } from "../../../context/service/attendance";
import { useGetAllWorkingHoursQuery } from "../../../context/service/workingHours";
import { useGetRelevantExpensesQuery } from "../../../context/service/expensesApi";
import "./style.css";

const Exsel = ({ selectedDate }) => {
  const year = selectedDate.year();
  const month = String(selectedDate.month() + 1).padStart(2, "0");

  // Ma'lumotlarni olish
  const { data: dataSalary } = useGetAllWorkingHoursQuery();
  const salaryDataObj = dataSalary?.innerData?.[0] || {};

  const { data } = useGetMonthlyAttendanceQuery({ year, month });

  // Bu yerda hookdan foydalanamiz
  const { data: allExpensesData, isLoading } = useGetRelevantExpensesQuery({
    date: selectedDate.toISOString(),
  });

  // Ma'lumotlarni guruhlash va qayta ishlash
  const tableData = useMemo(() => {
    const groupedData = {};

    data?.innerData?.forEach(({ workerId, workerName, workingHours, status }) => {
      if (!groupedData[workerId]) {
        groupedData[workerId] = {
          workerId,
          workerName,
          hoursFrom1To10: 0,
          hoursAbove10: 0,
          voxa: 0,
          toshkent: 0,
        };
      }
      const hours = +workingHours;
      if (status?.loc === "voxa") groupedData[workerId].voxa += hours;
      else if (status?.loc === "toshkent") groupedData[workerId].toshkent += hours;
      else {
        if (hours > 10) {
          groupedData[workerId].hoursFrom1To10 += 10;
          groupedData[workerId].hoursAbove10 += hours - 10;
        } else {
          groupedData[workerId].hoursFrom1To10 += hours;
        }
      }
    });

    return Object.values(groupedData).map((worker) => {
      const workerExpenses =
        allExpensesData?.innerData?.filter(
          (expense) => expense.relevantId === worker.workerId
        ) || [];

      const totalAvans = workerExpenses
        .filter((expense) => expense.category === "Avans")
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const totalIshHaqi = workerExpenses
        .filter((expense) => expense.category === "Ish haqi")
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const remainingSalary =
        worker.hoursFrom1To10 * salaryDataObj.wages +
        worker.hoursAbove10 * salaryDataObj.overtimeWages -
        totalIshHaqi -
        totalAvans;

      const totalVoxa =
        worker.voxa *
        (salaryDataObj.wages +
          (salaryDataObj.wages * (salaryDataObj.voxa || 0)) / 100);
      const totalToshkent =
        worker.toshkent *
        (salaryDataObj.wages +
          (salaryDataObj.wages * (salaryDataObj.toshkent || 0)) / 100);

      return {
        ...worker,
        salary: worker.hoursFrom1To10 * salaryDataObj.wages,
        extraSalary: worker.hoursAbove10 * salaryDataObj.overtimeWages,
        totalVoxa,
        totalToshkent,
        maosh: {
          totalIshHaqi,
          totalAvans,
          remainingSalary,
        },
        totalSalary:
          worker.hoursFrom1To10 * salaryDataObj.wages +
          worker.hoursAbove10 * salaryDataObj.overtimeWages +
          totalVoxa +
          totalToshkent,
      };
    });
  }, [data, salaryDataObj, allExpensesData]);

  const handleExport = () => {
    const formattedData = tableData.map((record) => ({
      "Ism Familya": record.workerName,
      "Ish soat va Haqi": `${record.hoursFrom1To10} soat\n${record.salary.toLocaleString()} so‘m`,
      "+ Ish soat va Haqi": `${record.hoursAbove10} soat\n${record.extraSalary.toLocaleString()} so‘m`,
      "Toshkent 15%": `${record.toshkent} soat\n${record.totalToshkent.toLocaleString()} so‘m`,
      "Voxa 20%": `${record.voxa} soat\n${record.totalVoxa.toLocaleString()} so‘m`,
      "Jami maosh": `${record.totalSalary.toLocaleString()} so'm`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maosh malumotlari");

    const columnWidths = Object.keys(formattedData[0] || {}).map((key) => {
      const maxLength = Math.max(
        ...formattedData.map((item) => item[key]?.toString().length || 0)
      );
      return { wch: maxLength + 5 };
    });
    worksheet["!cols"] = columnWidths;

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maosh_malumotlari.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button
      size="large"
      loading={isLoading}
      onClick={handleExport}
      icon={<FileExcelOutlined />}
    >
      Excel
    </Button>
  );
};

export default Exsel;
