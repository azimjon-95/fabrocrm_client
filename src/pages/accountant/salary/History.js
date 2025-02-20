import React, { useMemo, useCallback } from "react";
import { Table, Spin, Button, Empty } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useGetExpensesBySalaryQuery } from "../../../context/service/expensesApi";
import * as XLSX from "xlsx";
import "./style.css";

const History = () => {
  const navigate = useNavigate();
  const { date } = useParams();

  // Oy nomlarini o'zbek tilida aniqlash
  const uzMonths = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];

  // date ni to'g'ri formatga aylantirish
  const parsedDate = new Date(decodeURIComponent(date));
  const year = parsedDate.getFullYear();
  const monthIndex = parsedDate.getMonth();
  const month = String(monthIndex + 1).padStart(2, "0");
  const uzMonthName = uzMonths[monthIndex];

  // API dan ma'lumot olish
  const { data, isLoading, error } = useGetExpensesBySalaryQuery({
    year,
    month,
  });

  const columns = useMemo(() => [
    {
      title: "FIO",
      key: "firstName",
      render: (_, record) =>
        `${record?.lastName} ${record?.firstName} ${record?.middleName}`,
    },
    {
      title: "Kategoriya",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Miqdor",
      dataIndex: "amount",
      key: "amount",
      render: (text) => `${text.toLocaleString()} so'm`,
    },
    {
      title: "To'lov turi",
      dataIndex: "paymentType",
      key: "paymentType",
    },
    {
      title: "Izoh",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Sana",
      dataIndex: "date",
      key: "date",
      render: (text) => {
        const date = new Date(text);
        const day = date.getDate();
        const monthName = uzMonths[date.getMonth()];
        const time = date.toTimeString().slice(0, 5);
        return `${day}-${monthName} / ${time}`;
      },
    }
  ], []);

  // Excel yuklab olish funksiyasi
  const handleExportExcel = useCallback(() => {
    if (!data?.innerData?.length) {
      return;
    }

    // Ma'lumotlarni Excelga tayyorlash
    const excelData = data.innerData.map(item => {
      const date = new Date(item.date);
      const day = date.getDate();
      const monthName = uzMonths[date.getMonth()];
      const time = date.toTimeString().slice(0, 5);

      return {
        "FIO": `${item?.lastName} ${item?.firstName} ${item?.middleName}`,
        "Kategoriya": item.category,
        "Miqdor": `${item.amount.toLocaleString()} so'm`,
        "To'lov turi": item.paymentType,
        "Izoh": item.description,
        "Sana": `${day}-${monthName} / ${time}`,
      };
    });

    // Workbook yaratish
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ma'lumotlar");

    // Ustun kengliklarini avtomatik o'rnatish
    const columnWidths = excelData.length
      ? Object.keys(excelData[0]).map(key => ({
        wch: Math.max(
          key.length,
          ...excelData.map(item => item[key]?.toString().length || 0)
        ) + 2  // Qo'shimcha 5 ta joy kengligi uchun
      }))
      : [];

    worksheet["!cols"] = columnWidths;

    // Faylni yuklab olish
    XLSX.writeFile(workbook, `Ma'lumotlar_${year}-${month}.xlsx`);
  }, [data, year, month]);

  // Loading va Error holatlari
  if (isLoading)
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );

  if (error || !data?.innerData?.length)
    return (
      <Empty description="Ma'lumotlar topilmadi" />
    );

  // Jadvalni qaytarish
  return (
    <div>
      <div className="Salary_nav">
        <Button size="large" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Orqaga
        </Button>
        <h2>{uzMonthName} - Oy uchun Oylik Tarixi</h2>
        <Button icon={<FileExcelOutlined />} size="large" onClick={handleExportExcel}>
          Excel
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data?.innerData}
        rowKey="relevantId"
        pagination={false}
        size="small"
        bordered
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default History;




