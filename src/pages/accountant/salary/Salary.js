import React, { useState } from "react";
import {
  Table,
  Spin, DatePicker, Empty
} from "antd";
import {
  ClockCircleOutlined,
  DollarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { TbClockPlus } from "react-icons/tb";
import dayjs from "dayjs";
import { useGetAllWorkingHoursQuery } from "../../../context/service/workingHours";
import { useGetWorkersQuery } from "../../../context/service/worker";
import { useGetMonthlyAttendanceQuery } from "../../../context/service/attendance";
import { useGetRelevantExpensesQuery } from "../../../context/service/expensesApi";
import "./style.css";
import Exsel from "./Exsel";


const Salary = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { data: dataSalary } = useGetAllWorkingHoursQuery();
  const salaryDataObj = dataSalary?.innerData?.[0] || {};

  const year = selectedDate.year();
  const month = String(selectedDate.month() + 1).padStart(2, "0");
  const { data: dataWorkers } = useGetWorkersQuery();
  const adminRoles = ["manager", "seller", "director", "accountant", "warehouseman", "deputy_director"];
  const Workers = dataWorkers?.innerData.filter(worker => !adminRoles.includes(worker.role));

  const { data, isLoading, error } = useGetMonthlyAttendanceQuery({
    year,
    month,
  });

  const groupedData = data?.innerData?.reduce((acc, curr) => {
    const { workerId, workerName, workingHours, nightWorkingHours, status } = curr;
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
    const { voxa, toshkent, workingHours, nightWorkingHours, workerId } = worker;
    const { wages, overtimeWages, voxa: voxaPercent = 0, toshkent: toshkentPercent = 0 } = salaryDataObj || {};

    // Worker ma'lumotlarini Workers massividan olish
    const matchingWorker = Workers?.find(w => w._id === workerId);
    const workerName = matchingWorker ? `${matchingWorker.firstName} ${matchingWorker.lastName}` : worker.workerName;

    const baseSalary = workingHours * (wages || 0);
    const extraSalary = nightWorkingHours * (overtimeWages || 0);

    const totalVoxa = voxa * (wages + (wages * voxaPercent) / 100);
    const totalToshkent = toshkent * (wages + (wages * toshkentPercent) / 100);

    return {
      ...worker,
      workerName, // Yangilangan ism va familya
      salary: baseSalary,
      extraSalary,
      totalVoxa,
      totalToshkent,
      totalSalary: baseSalary + extraSalary + totalVoxa + totalToshkent,
    };
  });

  // Agar groupedData mavjud bo'lmasa, bo'sh massiv qaytariladi


  // Custom Hook
  const UserExpenses = ({ record }) => {
    const { data: expensesData, isLoading } = useGetRelevantExpensesQuery({
      relevantId: [record.workerId],
      date: selectedDate.toISOString(),
    });

    // Avans va Ish haqi bo'yicha filterlash
    const avansExpenses = expensesData?.innerData?.filter(
      (expense) => expense.category === "Avans" && expense.relevantId === record.workerId
    ) || [];

    const ishHaqiExpenses = expensesData?.innerData?.filter(
      (expense) => expense.category === "Ish haqi" && expense.relevantId === record.workerId
    ) || [];

    // Har birini alohida reduce qilish
    const totalAvans = avansExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );

    const totalIshHaqi = ishHaqiExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );
    return (
      <div className="css-dev-only-do-box">
        <div>
          <strong>Avans:</strong> {totalAvans.toLocaleString()} so‘m
        </div>
        <div>
          <strong>Ish haqi:</strong> {totalIshHaqi.toLocaleString()} so‘m
        </div>
      </div>
    );
  };
  // Custom Hook
  const UserSalary = ({ record }) => {
    const { data: expensesData, isLoading } = useGetRelevantExpensesQuery({
      relevantId: [record.workerId],
      date: selectedDate.toISOString(),
    });

    // Avans va Ish haqi bo'yicha filterlash
    const avansExpenses = expensesData?.innerData?.filter(
      (expense) => expense.category === "Avans" && expense.relevantId === record.workerId
    ) || [];

    const ishHaqiExpenses = expensesData?.innerData?.filter(
      (expense) => expense.category === "Ish haqi" && expense.relevantId === record.workerId
    ) || [];

    // Har birini alohida reduce qilish
    const totalAvans = avansExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );

    const totalIshHaqi = ishHaqiExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );

    const remainingSalary = record.totalSalary - totalIshHaqi - totalAvans;

    return (
      <div className="css-dev-only-do-box">
        <div>
          <strong></strong> {remainingSalary.toLocaleString()} so‘m
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: "Ism Familya",
      dataIndex: "workerName",
      key: "workerName",
      fixed: "left",
    },
    {
      title: "Ish soat va Haqi",
      key: "workAndSalary",
      render: (_, record) => (
        <>
          <div>
            <ClockCircleOutlined /> <strong>{record.workingHours}</strong>{" "}
            soat
          </div>
          <div>
            <DollarOutlined /> <strong>{record.salary.toLocaleString()}</strong>{" "}
            so‘m
          </div>
        </>
      ),
    },
    {
      title: "+ Ish soat va Haqi",
      key: "extraWorkAndSalary",
      render: (_, record) => (
        <>
          <div>
            <TbClockPlus /> <strong>{record.nightWorkingHours}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{" "}
            <strong>{record.extraSalary.toLocaleString()}</strong> so‘m
          </div>
        </>
      ),
    },
    {
      title: `Toshkent ${salaryDataObj.toshkent || 0}%`,
      dataIndex: "toshkent",
      key: "toshkent",
      render: (_, record) => (
        <>
          <div>
            <TbClockPlus /> <strong>{record.toshkent}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{" "}
            <strong>{record.totalToshkent.toLocaleString()}</strong> so‘m
          </div>
        </>
      ),
    },
    {
      title: `Voxa ${salaryDataObj.voxa || 0}%`,
      dataIndex: "voxa",
      key: "voxa",
      render: (_, record) => (
        <>
          <div>
            <TbClockPlus /> <strong>{record.voxa}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{" "}
            <strong>{record.totalVoxa.toLocaleString()}</strong> so‘m
          </div>
        </>
      ),
    },
    {
      title: "Jami maosh",
      dataIndex: "totalSalary",
      key: "totalSalary",
      render: (text) => `${text.toLocaleString()} so'm`,
    },
    {
      title: "Berilgan maosh", // Umumiy ish haqi va qoldiq summa
      key: "finalSalary",
      render: (_, record) => {
        return <UserExpenses record={record} />
      },
    },
    {
      title: "Qoldiq maosh", // Umumiy ish haqi va qoldiq summa
      key: "finalSalary",
      render: (_, record) => {
        return <UserSalary record={record} />
      },
    },
  ];

  if (isLoading)
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );
  if (error)
    return (
      <Empty description="Ma'lumotlar topilmadi" />
    );

  return (
    <div className="salary-container">
      <div className="Salary_nav">

        <DatePicker
          picker="month"
          value={selectedDate}
          onChange={(date) => setSelectedDate(dayjs(date))}
        />
        <h2>Xodimlar Ish Haqqi</h2>
        <Exsel selectedDate={selectedDate} />

      </div>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="workerId"
        pagination={false}
        size="small"
        bordered
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default Salary;