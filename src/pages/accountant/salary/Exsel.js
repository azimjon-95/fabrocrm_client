import React, { useState } from "react";
import { Button } from "antd";
import dayjs from "dayjs";
import { useGetAllWorkingHoursQuery } from "../../../context/service/workingHours";
import { FileExcelOutlined } from "@ant-design/icons";
import { useGetWorkersQuery } from "../../../context/service/worker";
import { useGetMonthlyAttendanceQuery } from "../../../context/service/attendance";
import "./style.css"; import * as XLSX from "xlsx";

const Exsel = () => {
  const [selectedDate] = useState(dayjs());
  const { data: dataSalary } = useGetAllWorkingHoursQuery();
  const salaryDataObj = dataSalary?.innerData?.[0] || {};

  const year = selectedDate.year();
  const month = String(selectedDate.month() + 1).padStart(2, "0");
  const { data: dataWorkers } = useGetWorkersQuery();
  const adminRoles = [
    "manager",
    "seller",
    "director",
    "accountant",
    "warehouseman",
    "deputy_director",
  ];
  const Workers = dataWorkers?.innerData.filter(
    (worker) => !adminRoles.includes(worker.role)
  );

  const { data, isLoading } = useGetMonthlyAttendanceQuery({
    year,
    month,
  });

  const groupedData = data?.innerData?.reduce((acc, curr) => {
    const { workerId, workerName, workingHours, nightWorkingHours, status } =
      curr;
    const hours = +workingHours || 0;
    const nightHours = +nightWorkingHours || 0;
    const location = status?.loc?.toLowerCase();

    acc[workerId] = acc[workerId] || {
      workerId,
      workerName,
      workingHours: 0,
      nightWorkingHours: 0,
      voxa: 0,
      toshkent: 0,
    };

    acc[workerId].nightWorkingHours += nightHours;

    if (location === "voxa") {
      acc[workerId].voxa += hours;
    } else if (location === "toshkent") {
      acc[workerId].toshkent += hours;
    } else {
      acc[workerId].workingHours += hours;
    }

    return acc;
  }, {});

  // Agar groupedData mavjud bo'lmasa, bo'sh massiv qaytariladi
  const tableData = Object.values(groupedData || {}).map((worker) => {
    const { voxa, toshkent, workingHours, nightWorkingHours, workerId } =
      worker;

    const {
      voxa: voxaPercent = 0,
      toshkent: toshkentPercent = 0,
    } = salaryDataObj || {};
    // Worker ma'lumotlarini Workers massividan olish
    const matchingWorker = Workers?.find((w) => w._id === workerId);
    const workerName = matchingWorker
      ? `${matchingWorker.firstName} ${matchingWorker.lastName}`
      : worker.workerName;

    const wages = +matchingWorker?.hourlySalary;
    const overtimeWages = +matchingWorker?.hourlySalary * 2;

    const baseSalary = workingHours * (wages || 0);
    const extraSalary = nightWorkingHours * (overtimeWages || 0);

    const monthlySalary = +matchingWorker?.salary;
    const totalVoxa = voxa * (wages + (wages * voxaPercent) / 100);
    const totalToshkent = toshkent * (wages + (wages * toshkentPercent) / 100);

    return {
      ...worker,
      workerName, // Yangilangan ism va familya
      salary: baseSalary,
      extraSalary,
      monthlySalary,
      totalVoxa,
      totalToshkent,
      totalSalary: baseSalary + extraSalary + totalVoxa + totalToshkent,
    };
  });

  const handleExport = () => {
    const wsData = tableData.map((worker) => ({
      "Ism Familya": worker.workerName,
      "Ish soat va Haqi": `${worker.workingHours} soat / ${worker.salary.toLocaleString()} so‘m`,
      "+ Ish soat va Haqi": `${worker.nightWorkingHours} soat / ${worker.extraSalary.toLocaleString()} so‘m`,
      [`Toshkent ${salaryDataObj.toshkent || 0}%`]: `${worker.toshkent} soat / ${worker.totalToshkent.toLocaleString()} so‘m`,
      [`Voxa ${salaryDataObj.voxa || 0}%`]: `${worker.voxa} soat / ${worker.totalVoxa.toLocaleString()} so‘m`,
      "Jami maosh": `${worker.totalSalary.toLocaleString()} so‘m`,
      "Berilgan maosh": `${worker.totalSalary.toLocaleString()} so‘m`,
      "Qoldiq": `${worker.totalSalary.toLocaleString()} so‘m`,
      "Maosh": `${worker.monthlySalary.toLocaleString()} so‘m`,
    }));

    // Create worksheet from the data
    const ws = XLSX.utils.json_to_sheet(wsData);

    // Apply autofilter to headers
    ws["!autofilter"] = { ref: ws['!ref'] };

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salary Data");

    // Trigger file download
    XLSX.writeFile(wb, "salary_data.xlsx");
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
