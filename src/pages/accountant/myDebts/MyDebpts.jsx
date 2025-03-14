import React, { useEffect } from "react";
import { Table } from "antd";
import { useGetIsPaidFalseQuery } from "../../../context/service/mydebtService";
import socket from "../../../socket";
import moment from "moment";

const MyDebpts = () => {
  const { data, isLoading, refetch } = useGetIsPaidFalseQuery();

  useEffect(() => {
    const handleUpdateOrder = (data) => refetch();
    socket.on("updateMyDebt", handleUpdateOrder);
    return () => socket.off("updateMyDebt", handleUpdateOrder);
  }, [refetch]);

  const expandedRowRender = (record) => {
    const materialColumns = [
      {
        title: "To'lov miqdori",
        dataIndex: "amount",
        key: "amount",
        render: (price) => `${price?.toLocaleString()} so'm`,
      },
      {
        title: "Sana",
        dataIndex: "date",
        key: "date",
        render: (date) => moment(date).format("YYYY-MM-DD HH:mm"),
      },
    ];
    return (
      <Table
        size="small"
        columns={materialColumns}
        dataSource={record.payments}
        rowKey="productId"
        pagination={false}
      />
    );
  };
  const columnsList = [
    {
      title: "Kimdan",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Qancha",
      dataIndex: "amount",
      key: "amount",
      render: (price) => `${price?.toLocaleString()} so'm`,
    },
    // total paid
    {
      title: "To'langan",
      render: (_, record) => {
        const paid = record.payments.reduce(
          (acc, curr) => acc + curr.amount,
          0
        );
        return `${paid.toLocaleString()} so'm`;
      },
    },
    {
      title: "Holat",
      key: "status",
      align: "center",
      render: (_, record) => (record.isPaid ? "To'langan" : "To'lanmagan"),
    },
    {
      title: "Sanasi",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm"),
    },
  ];
  return (
    <div className="myDebts">
      <h2
        style={{
          color: "#0A3D3A",
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        Qarzlar
      </h2>

      <Table
        columns={columnsList}
        dataSource={data?.innerData || []}
        rowKey="_id"
        pagination={false}
        loading={isLoading}
        expandable={{ expandedRowRender }}
      />
    </div>
  );
};

export default MyDebpts;
