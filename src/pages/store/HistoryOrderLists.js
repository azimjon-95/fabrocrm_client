import React from "react";
import { Table, Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/uz";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { useGetOrdersByisPaidQuery } from "../../context/service/newOredShops";

dayjs.locale("uz");

const uzMonths = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];

const HistoryOrderLists = ({ list }) => {
  const navigator = useNavigate();
  const { data, isLoading } = useGetOrdersByisPaidQuery(false);
  let shops = data?.innerData || [];
  console.log(shops);

  const columns = [
    {
      title: "Umumiy narx",
      dataIndex: "shopName",
      key: "shopName",
    },
    {
      title: "Umumiy narx",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `${price.toLocaleString()} so'm`,
    },
    {
      title: "Holat",
      key: "status",
      render: (_, record) => (record.isPaid ? "To'langan" : "To'lanmagan"),
    },
    {
      title: "Sana",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Yuklab olish",
      key: "download",
      render: (record) => (
        <Button
          type="primary"
          onClick={() => handleExport(record)}
          style={{ background: "#0A3D3A" }}
        >
          <FileExcelOutlined /> Excel
        </Button>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const materialColumns = [
      {
        title: "Mahsulot nomi",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Kategoriya",
        dataIndex: "category",
        key: "category",
      },
      {
        title: "Narx (dona)",
        dataIndex: "pricePerUnit",
        key: "pricePerUnit",
        render: (price) => `${price.toLocaleString()} so'm`,
      },
      {
        title: "Miqdori",
        key: "quantity_unit",
        render: (_, record) => `${record.quantity} ${record.unit}`,
      },
      // {
      //   title: "Yetkazib beruvchi",
      //   dataIndex: "supplier",
      //   key: "supplier",
      // },
    ];
    return (
      <Table
        size="small"
        columns={materialColumns}
        dataSource={record.materials}
        rowKey="productId"
        pagination={false}
      />
    );
  };

  const handleExport = (record) => {
    const order = data?.innerData.find((order) => order._id === record?._id);
    if (!order) return;

    const wsData = [];

    // **Asosiy header**
    wsData.push([
      "Umumiy narx",
      "Holat",
      "Yangi",
      "Buxgalterga yuborilgan",
      "Buxgalter tasdiqladi",
      "Omborga qo'shildi",
      "Sanasi",
    ]);

    // **Sanani formatlash**
    const orderDate = dayjs(order.createdAt).format("YYYY-MM-DD_HH-mm");

    // **Buyurtma ma'lumotlari**
    wsData.push([
      order.totalPrice.toLocaleString() + " so'm",
      order.isPaid ? "To'langan" : "To'lanmagan",
      order.isNew ? "Ha" : "Yo'q",
      order.sentToDistributor ? "Ha" : "Yo'q",
      order.approvedByDistributor ? "Ha" : "Yo'q",
      order.addedToData ? "Ha" : "Yo'q",
      `${dayjs(order.createdAt).date()}-${
        uzMonths[dayjs(order.createdAt).month()]
      } / ${dayjs(order.createdAt).format("HH:mm")}`,
    ]);

    wsData.push([], [], [], []); // Bo'sh qatorlar

    // **Mahsulotlar headeri**
    wsData.push([
      "Mahsulot nomi",
      "Kategoriya",
      "Narx (dona)",
      "Miqdori",
      "Umumiy narx",
      "Yetkazib beruvchi",
    ]);

    // **Mahsulot ma'lumotlari**
    order.materials.forEach((material) => {
      const totalPrice = material.pricePerUnit * material.quantity;
      wsData.push([
        material.name,
        material.category,
        material.pricePerUnit.toLocaleString() + " so'm",
        `${material.quantity} ${material.unit}`,
        totalPrice.toLocaleString() + " so'm",
        material.supplier,
      ]);
    });

    wsData.push([]); // Yakuniy bo'sh qator

    // **Ustun kengliklarini avtomatik moslash**
    const colWidths = wsData[0].map(
      (_, i) =>
        Math.max(
          ...wsData.map((row) => (row[i] ? row[i].toString().length : 10))
        ) + 2
    );

    // **Excel yaratish va saqlash**
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = colWidths.map((w) => ({ wch: w }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // **Yangi fayl nomi**
    XLSX.writeFile(wb, `Omdor_Buyurtma_${orderDate}.xlsx`);
  };

  return (
    <div>
      <div className="stororderhistory">
        <Button
          style={{ background: "#0A3D3A", color: "#fff" }}
          onClick={() => navigator(-1)}
        >
          ⬅ Orqaga
        </Button>
        <h2
          style={{
            color: "#0A3D3A",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Ombor buyurtmalar tarixi
        </h2>
      </div>

      <Table
        columns={columns}
        dataSource={shops}
        rowKey="_id"
        pagination={false}
        loading={isLoading}
        expandable={{ expandedRowRender }}
        size="small"
      />
    </div>
  );
};

export default HistoryOrderLists;
