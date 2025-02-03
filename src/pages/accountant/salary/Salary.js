import React, { useState, useCallback } from "react";
import {
  Table,
  Spin,
  Alert,
  DatePicker,
  message,
  Button,
  Form,
  Radio,
  InputNumber,
  Tooltip,
  Input,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  FileExcelOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { TbClockPlus } from "react-icons/tb";
import dayjs from "dayjs";
import { useGetAllWorkingHoursQuery } from "../../../context/service/workingHours";
import { useGetMonthlyAttendanceQuery } from "../../../context/service/attendance";
import { useCreateSalaryMutation } from "../../../context/service/salaryApi";
import "./style.css";

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
  const [createSalary] = useCreateSalaryMutation();

  // Submit function that includes server interaction
  const handleSubmit = useCallback(
    (remainingSalary, paymentType, amount, record) => {
      if (amount > 0 && amount <= remainingSalary) {
        message.success("Ma'lumot yuborildi:", {
          paymentType,
          amount,
          workerId: record.workerId,
        });
        console.log("Ma'lumot yuborildi:", {
          paymentType,
          amount,
          workerId: record.workerId,
        });

        // Create the salary entry using your schema data
        const salaryData = {
          workerId: record.workerId,
          amount,
          salaryType: paymentType, // Ensure the correct type ("avans" or "salary")
        };

        // Call createSalary mutation or server interaction to save the data
        createSalary(salaryData);
      } else {
        message.warning(
          "Salom, avans yoki ish haqidan katta summa kiritilmadi!"
        );
      }
    },
    [createSalary]
  );

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
    else if (status?.loc === "toshkent")
      groupedData[workerId].toshkent += hours;
    else {
      if (hours > 10) {
        groupedData[workerId].hoursFrom1To10 += 10;
        groupedData[workerId].hoursAbove10 += hours - 10;
      } else {
        groupedData[workerId].hoursFrom1To10 += hours;
      }
    }
  });

  const tableData = Object.values(groupedData).map((worker) => {
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
      totalSalary:
        worker.hoursFrom1To10 * salaryDataObj.wages +
        worker.hoursAbove10 * salaryDataObj.overtimeWages +
        totalVoxa +
        totalToshkent,
    };
  });

  // Render Salary Payment Form
  const SalaryPaymentForm = ({ remainingSalary, record }) => {
    const [formState, setFormState] = useState({
      paymentType: "salary",
      amount: null,
    });
    const { paymentType, amount } = formState;
    const handleChange = (key, value) =>
      setFormState((prevState) => ({ ...prevState, [key]: value }));

    return (
      <Form style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Form.Item>
          <Radio.Group
            onChange={(e) => handleChange("paymentType", e.target.value)}
            value={paymentType}
          >
            <Tooltip title="Maosh berish">
              <Radio value="salary" />
            </Tooltip>
            <Tooltip title="Avans sifatida maosh berish">
              <Radio value="advance" />
            </Tooltip>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          {/* <InputNumber
            min={0}
            max={remainingSalary}
            value={amount}
            onChange={(e) => handleChange("amount", e)}
            placeholder={`${remainingSalary.toLocaleString()} so‘m`}
            style={{ width: 120 }}
          /> */}
          <Input
            onChange={(e) => handleChange("amount", +e.target.value)}
            max={remainingSalary}
            min={0}
            value={amount}
            type="number"
            style={{ width: 120 }}
            placeholder={`${remainingSalary?.toLocaleString()} so‘m`}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          onClick={() =>
            handleSubmit(remainingSalary, paymentType, amount, record)
          }
          disabled={amount > remainingSalary || amount <= 0 || amount === null}
        >
          Yuborish
        </Button>
      </Form>
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
            <ClockCircleOutlined /> <strong>{record.hoursFrom1To10}</strong>{" "}
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
            <TbClockPlus /> <strong>{record.hoursAbove10}</strong> soat
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
        const remainingSalary = record.totalSalary - (record.advance || 0); // Avans ayirilgan jami maosh
        return (
          <>
            <div>
              <strong>Avans:</strong> {(record.advance || 0).toLocaleString()}{" "}
              so‘m
            </div>
            <div>
              <strong>Qoldiq:</strong> {remainingSalary.toLocaleString()} so‘m
            </div>
          </>
        );
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

  return (
    <div className="salary-container">
      <div className="Salary_nav">
        <Button onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Orqaga
        </Button>
        <h2>Xodimlar Ish Haqqi</h2>
        <div>
          <DatePicker
            picker="month"
            value={selectedDate}
            onChange={(date) => setSelectedDate(dayjs(date))}
          />
          <Button icon={<FileExcelOutlined />}>Excel</Button>
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
