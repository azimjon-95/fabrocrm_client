import React, { useState, useCallback } from "react";
import {
  Table,
  Spin,
  Alert,
  DatePicker,
  message,
  Button,
  Form,
  Radio, Empty,
  Tooltip,
  Input,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { PiSealCheckBold } from "react-icons/pi";
import { TbClockPlus } from "react-icons/tb";
import dayjs from "dayjs";
import { RiHistoryFill } from "react-icons/ri";
import { useGetAllWorkingHoursQuery } from "../../../context/service/workingHours";
import { useGetMonthlyAttendanceQuery } from "../../../context/service/attendance";
import { useCreateExpenseMutation, useGetRelevantExpensesQuery } from "../../../context/service/expensesApi";
import "./style.css";
import Exsel from "./Exsel";


const Salary = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { data: dataSalary } = useGetAllWorkingHoursQuery();
  const salaryDataObj = dataSalary?.innerData?.[0] || {};

  const year = selectedDate.year();
  const month = String(selectedDate.month() + 1).padStart(2, "0");
  const monthName = selectedDate.format("MMMM");
  const { data, isLoading, error } = useGetMonthlyAttendanceQuery({
    year,
    month,
  });
  const [createExpense] = useCreateExpenseMutation();

  // Submit function that includes server interaction
  const handleSubmit = useCallback(
    (remainingSalary, paymentType, amount, record) => {
      if (amount > 0 && amount <= remainingSalary) {
        message.success("Ma'lumot yuborildi:", {
          paymentType,
          amount,
          workerId: record.workerId,
        });


        // Create the salary entry using your schema data
        const isAdvance = paymentType === "Avans";
        const expenseData = {
          name: isAdvance ? "Ishchiga avans" : "Ishchiga oylik to'lov",
          amount: Number(amount),
          type: "Chiqim",
          category: paymentType,
          description: `Ishchiga ${record.workerName} uchun ${isAdvance ? "avans" : "oylik"} to'lov`,
          paymentType: "Naqd",
          relevantId: record.workerId,
          date: selectedDate.toDate(),
        };

        // Call createExpense mutation or server interaction to save the data
        createExpense(expenseData);
      } else {
        message.warning(
          "Salom, avans yoki ish haqidan katta summa kiritilmadi!"
        );
      }
    },
    [createExpense]
  );


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
    const { voxa, toshkent, workingHours, nightWorkingHours } = worker;
    const { wages, overtimeWages, voxa: voxaPercent = 0, toshkent: toshkentPercent = 0 } = salaryDataObj || {};

    const baseSalary = workingHours * (wages || 0);
    const extraSalary = nightWorkingHours * (overtimeWages || 0);

    const totalVoxa = voxa * (wages + (wages * voxaPercent) / 100);
    const totalToshkent = toshkent * (wages + (wages * toshkentPercent) / 100);

    return {
      ...worker,
      salary: baseSalary,
      extraSalary,
      totalVoxa,
      totalToshkent,
      totalSalary: baseSalary + extraSalary + totalVoxa + totalToshkent,
    };
  });

  // Render Salary Payment Form
  const SalaryPaymentForm = ({ remainingSalary, record }) => {
    const [formState, setFormState] = useState({
      paymentType: "Ish haqi",
      amount: null,
    });
    const { paymentType, amount } = formState;
    const handleChange = (key, value) =>
      setFormState((prevState) => ({ ...prevState, [key]: value }));

    return (
      <Form className="form-value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Form.Item>
          <Radio.Group
            onChange={(e) => handleChange("paymentType", e.target.value)}
            value={paymentType}
          >
            <Tooltip title="Maosh berish">
              <Radio value="Ish haqi" />
            </Tooltip>
            <Tooltip title="Avans sifatida maosh berish">
              <Radio value="Avans" />
            </Tooltip>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Input
            onChange={(e) => handleChange("amount", +e.target.value)}
            max={remainingSalary}
            min={0}
            value={amount}
            type="number"
            style={{ width: 120, marginTop: "15px" }}
            placeholder={`${remainingSalary?.toLocaleString()} so‘m`}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          onClick={() =>
            handleSubmit(remainingSalary, paymentType, amount, record)
          }
          disabled={amount > remainingSalary || amount <= 0 || amount === null}
        >
          <PiSealCheckBold />
        </Button>
      </Form>
    );
  };

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

    const remainingSalary = record.totalSalary - totalIshHaqi - totalAvans;

    return (
      <div className="css-dev-only-do-box">
        <div>
          <strong>Avans:</strong> {totalAvans.toLocaleString()} so‘m
        </div>
        <div>
          <strong>Ish haqi:</strong> {totalIshHaqi.toLocaleString()} so‘m
        </div>
        <div>
          <strong>Qoldiq:</strong> {remainingSalary.toLocaleString()} so‘m
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
      title: "Maosh", // Umumiy ish haqi va qoldiq summa
      key: "finalSalary",
      render: (_, record) => {
        return <UserExpenses record={record} />
      },
    },
    {
      title: `Maosh Va Avans Berish`,
      key: "payment",
      fixed: "right",
      render: (_, record) => {
        const remainingSalary = record.totalSalary - (record.advance || 0); // Avans ayirilgan jami maosh
        return (
          <SalaryPaymentForm
            remainingSalary={remainingSalary}
            record={record}
          />
        );
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
        <Button size="large" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Orqaga
        </Button>
        <h2>Xodimlar Ish Haqqi</h2>
        <div>
          <DatePicker
            picker="month"
            value={selectedDate}
            onChange={(date) => setSelectedDate(dayjs(date))}
          />
          <Exsel selectedDate={selectedDate} />
          <Button style={{ padding: "10px 4px 3px 4px" }} size="large" onClick={() => navigate(`/salary/history/${selectedDate}`)}>
            <RiHistoryFill style={{ fontSize: "20px" }} />
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
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default Salary;


