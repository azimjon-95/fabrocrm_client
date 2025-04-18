import React from "react";
import { Table } from "antd";
import { useGetOrdersByisPaidQuery } from "../../../context/service/newOredShops";
import dayjs from "dayjs";
import "dayjs/locale/uz";

dayjs.locale("uz");
function ShopsDebts() {
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
      render: (price) => `${price?.toLocaleString()} so'm`,
    },
    {
      title: "To'langan",
      key: "paid",
      dataIndex: "paid",
      render: (paid) => `${paid?.toLocaleString()} so'm`,
    },
    {
      title: "Qolgan qarz",
      render: (_, item) => {
        let debt = +item.totalPrice - +item.paid;
        return `${debt?.toLocaleString()} so'm`;
      },
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
    ];
    return (
      <Table
        columns={materialColumns}
        dataSource={record.materials}
        rowKey="productId"
        pagination={false}
      />
    );
  };
  return (
    <Table
      columns={columns}
      dataSource={shops}
      rowKey="_id"
      pagination={false}
      loading={isLoading}
      expandable={{ expandedRowRender }}
      size="small"
    />
  );
}

export default ShopsDebts;
