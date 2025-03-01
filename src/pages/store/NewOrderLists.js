import React from "react";
import { Table } from "antd";
import { useGetOrdersByisPaidQuery } from "../../context/service/newOredShops";
import dayjs from "dayjs";
import "dayjs/locale/uz";

dayjs.locale("uz");
const NewOrderList = () => {
  const { data, isLoading } = useGetOrdersByisPaidQuery(false);
  let shops = data?.innerData || [];

  const columns = [
    {
      title: "Do'kon",
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
        render: (price) => `${price?.toLocaleString()} so'm`,
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

  return (
    <div>
      <h2
        style={{
          color: "#0A3D3A",
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        Buyurtmalar Ro'yxati
      </h2>
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

export default NewOrderList;
