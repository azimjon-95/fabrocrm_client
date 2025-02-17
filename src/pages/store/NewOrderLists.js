import React from "react";
import { Table, Button, message } from "antd";
import {
  useGetOrderListsQuery,
  useUpdateOrderListMutation,
} from "../../context/service/listApi";
import { FileExcelOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/uz";
import * as XLSX from "xlsx";

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

const NewOrderList = ({ filteredLists, list }) => {
  const [updateOrderList] = useUpdateOrderListMutation();
  const { data, isLoading } = useGetOrderListsQuery();

  const handlePayment = async (record) => {
    try {
      const response = await updateOrderList({
        id: record._id,
        updateData: { isPaid: true, approvedByAccountant: false },
      });
      if (response) {
        message.success("To‘lov muvaffaqiyatli bajarildi!");
      } else {
        throw new Error("To‘lov amalga oshirilmadi.");
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDebtPayment = async (record) => {
    try {
      const response = await updateOrderList({
        id: record._id,
        updateData: { approvedByAccountant: true },
      });
      if (response) {
        message.success("To‘lov muvaffaqiyatli bajarildi!");
      } else {
        throw new Error("To‘lov amalga oshirilmadi.");
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Umumiy narx",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `${price.toLocaleString()} so'm`,
    },
    ...(!list
      ? [
          {
            title: "Holat",
            key: "status",
            render: (_, record) =>
              record.isPaid ? "To'langan" : "To'lanmagan",
          },
        ]
      : [
          {
            title: "To‘lovni kechiktirish",
            key: "pay",
            render: (record) =>
              record.approvedByAccountant ? (
                <span style={{ color: "red", fontWeight: "bold" }}>Qarz</span>
              ) : (
                <Button
                  type="primary"
                  onClick={() => handleDebtPayment(record)}
                  style={{ background: "#0A3D3A" }}
                >
                  Qarzga olish
                </Button>
              ),
          },
        ]),
    ...(!list
      ? [
          {
            title: "Yangi",
            dataIndex: "isNew",
            key: "isNew",
            render: (isNew) => (isNew ? "Ha" : "Yo'q"),
          },
        ]
      : []),
    ...(!list
      ? [
          {
            title: "Buxgalterga yuborilgan",
            dataIndex: "sentToAccountant",
            key: "sentToAccountant",
            render: (sentToAccountant) => (sentToAccountant ? "Ha" : "Yo'q"),
          },
        ]
      : []),

    ...(list
      ? [
          {
            title: "To‘lov amali",
            key: "pay",
            render: (record) => (
              <Button
                type="primary"
                onClick={() => handlePayment(record)}
                style={{ background: "#0A3D3A" }}
              >
                To‘lash
              </Button>
            ),
          },
        ]
      : [
          {
            title: "Buxgalter tasdiqladi",
            dataIndex: "approvedByAccountant",
            key: "approvedByAccountant",
            render: (approvedByAccountant) =>
              approvedByAccountant ? "Ha" : "Yo'q",
          },
        ]),

    ...(!list
      ? [
          {
            title: "Omborga qo'shildi",
            dataIndex: "addedToData",
            key: "addedToData",
            render: (addedToData) => (addedToData ? "Ha" : "Yo'q"),
          },
        ]
      : []),
    {
      title: "Sanasi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        const d = dayjs(date);
        return `${d.date()}-${uzMonths[d.month()]} / ${d.format("HH:mm")}`;
      },
    },
    // Agar `list` true bo'lsa, ushbu ustunni qo'shmaymiz
    ...(!list
      ? [
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
        ]
      : []),
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
      {
        title: "Yetkazib beruvchi",
        dataIndex: "supplier",
        key: "supplier",
      },
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
      order.sentToAccountant ? "Ha" : "Yo'q",
      order.approvedByAccountant ? "Ha" : "Yo'q",
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
      {!list && (
        <h2
          style={{
            color: "#0A3D3A",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Buyurtmalar Ro'yxati
        </h2>
      )}
      <Table
        columns={columns}
        dataSource={filteredLists || data?.innerData}
        rowKey="_id"
        pagination={false}
        loading={isLoading}
        expandable={{ expandedRowRender }}
        size="small"
      />
    </div>
  );
};

export default NewOrderList;
