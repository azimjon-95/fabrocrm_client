import React, { useState } from "react";
import { Table, Spin, Alert, DatePicker, Button, Form, Radio, InputNumber, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, FileExcelOutlined, ClockCircleOutlined, DollarOutlined, DollarCircleOutlined } from "@ant-design/icons";
import { TbClockPlus } from "react-icons/tb";
import dayjs from "dayjs";
import { useGetAllWorkingHoursQuery } from '../../../context/service/workingHours';
import { useGetMonthlyAttendanceQuery } from "../../../context/service/attendance";
import "./style.css";

const Salary = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const { data: dataSalary } = useGetAllWorkingHoursQuery();
    const salaryDataObj = dataSalary?.innerData?.[0] || {};
    const [selectedPaymentType, setSelectedPaymentType] = useState("salary");
    const year = selectedDate.year();
    const month = String(selectedDate.month() + 1).padStart(2, "0");
    const monthName = selectedDate.format("MMMM");

    const { data, isLoading, error } = useGetMonthlyAttendanceQuery({ year, month });

    if (isLoading) return <Spin size="large" style={{ display: "block", margin: "20px auto" }} />;
    if (error) return <Alert message="Ma'lumotlarni yuklashda xatolik yuz berdi!" type="error" showIcon />;

    const groupedData = {};

    data?.innerData?.forEach(({ workerId, workerName, workingHours, status }) => {
        if (!groupedData[workerId]) {
            groupedData[workerId] = { workerId, workerName, hoursFrom1To10: 0, hoursAbove10: 0, voxa: 0, toshkent: 0 };
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

    const tableData = Object.values(groupedData).map((worker) => {
        const totalVoxa = worker.voxa * (salaryDataObj.wages + (salaryDataObj.wages * (salaryDataObj.voxa || 0) / 100));
        const totalToshkent = worker.toshkent * (salaryDataObj.wages + (salaryDataObj.wages * (salaryDataObj.toshkent || 0) / 100));

        return {
            ...worker,
            salary: worker.hoursFrom1To10 * salaryDataObj.wages,
            extraSalary: worker.hoursAbove10 * salaryDataObj.overtimeWages,
            totalVoxa,
            totalToshkent,
            totalSalary: worker.hoursFrom1To10 * salaryDataObj.wages + worker.hoursAbove10 * salaryDataObj.overtimeWages + totalVoxa + totalToshkent,
        };
    });

    // onSubmit function for payment
    const onSubmit = (values, record) => {
        console.log("Payment Submitted:", values);
        console.log("Worker Record:", record);
        // Here, you can handle the submission logic (e.g., sending to API, updating state)
    };

    // Render Salary Payment Form
    const SalaryPaymentForm = ({ remainingSalary, record, form, setSelectedPaymentType }) => (

        <Form form={form} onFinish={(values) => onSubmit(values, record)} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Radio.Group
                defaultValue="salary"
                onChange={(e) => setSelectedPaymentType(e.target.value)}
                name="paymentType"
            >
                <Tooltip title="Maosh berish"><Radio value="salary" /> Maosh</Tooltip>
                <Tooltip title="Avans sifatida maosh berish"><Radio value="advance" /> Avans</Tooltip>
            </Radio.Group>
            <Form.Item
                name="amount"
                rules={[
                    { required: true, message: "Iltimos, summa kiriting!" },
                    { type: "number", min: 0, max: remainingSalary, message: `Max allowed: ${remainingSalary.toLocaleString()} so‘m` }
                ]}
            >
                <InputNumber
                    placeholder={`${remainingSalary.toLocaleString()} so‘m`}
                    style={{ width: 120 }}
                />
            </Form.Item>
            <Button
                type="primary"
                htmlType="submit"
                disabled={form.getFieldValue("amount") > remainingSalary}
            >
                Yuborish
            </Button>
        </Form>
    );

    const columns = [
        { title: "F.I.O", dataIndex: "workerName", key: "workerName", fixed: 'left' },
        {
            title: 'Ish soat va Haqi',
            key: "workAndSalary",
            render: (_, record) => (
                <>
                    <div><ClockCircleOutlined /> <strong>{record.hoursFrom1To10}</strong> soat</div>
                    <div><DollarOutlined /> <strong>{record.salary.toLocaleString()}</strong> so‘m</div>
                </>
            ),
        },
        {
            title: "+ Ish soat va Haqi",
            key: "extraWorkAndSalary",
            render: (_, record) => (
                <>
                    <div><TbClockPlus /> <strong>{record.hoursAbove10}</strong> soat</div>
                    <div><DollarCircleOutlined /> <strong>{record.extraSalary.toLocaleString()}</strong> so‘m</div>
                </>
            ),
        },
        {
            title: `Toshkent ${salaryDataObj.toshkent || 0}%`,
            dataIndex: "toshkent",
            key: "toshkent",
            render: (_, record) => (
                <>
                    <div><TbClockPlus /> <strong>{record.toshkent}</strong> soat</div>
                    <div><DollarCircleOutlined /> <strong>{record.totalToshkent.toLocaleString()}</strong> so‘m</div>
                </>
            ),
        },
        {
            title: `Voxa ${salaryDataObj.voxa || 0}%`,
            dataIndex: "voxa",
            key: "voxa",
            render: (_, record) => (
                <>
                    <div><TbClockPlus /> <strong>{record.voxa}</strong> soat</div>
                    <div><DollarCircleOutlined /> <strong>{record.totalVoxa.toLocaleString()}</strong> so‘m</div>
                </>
            ),
        },
        { title: "Jami maosh", dataIndex: "totalSalary", key: "totalSalary", render: (text) => `${text.toLocaleString()} so'm` },
        {
            title: "Maosh", // Umumiy ish haqi va qoldiq summa
            key: "finalSalary",
            render: (_, record) => {
                const remainingSalary = record.totalSalary - (record.advance || 0); // Avans ayirilgan jami maosh
                return (
                    <>
                        <div>
                            <strong>Avans:</strong> {(record.advance || 0).toLocaleString()} so‘m
                        </div>
                        <div>
                            <strong>Qoldiq:</strong> {remainingSalary.toLocaleString()} so‘m
                        </div>
                    </>
                );
            },
        },

        {
            title: `Maosh Va Avans Berish`, key: "payment", fixed: 'right', render: (_, record) => {
                const remainingSalary = record.totalSalary - (record.advance || 0); // Avans ayirilgan jami maosh
                return <SalaryPaymentForm remainingSalary={remainingSalary} record={record} form={form} setSelectedPaymentType={setSelectedPaymentType} />;
            },
        },

    ];


    return (
        <div className="salary-container">
            <div className="Salary_nav">
                <Button onClick={() => navigate(-1)}><ArrowLeftOutlined /> Orqaga</Button>
                <h2>Xodimlar Ish Haqqi</h2>
                <div>
                    <DatePicker picker="month" value={selectedDate} onChange={(date) => setSelectedDate(dayjs(date))} />
                    <Button icon={<FileExcelOutlined />}>Excel</Button>
                </div>
            </div>
            <Table columns={columns} dataSource={tableData} rowKey="workerId" pagination={false} size="small" bordered scroll={{ x: 'max-content' }} />
        </div>
    );
};

export default Salary;


