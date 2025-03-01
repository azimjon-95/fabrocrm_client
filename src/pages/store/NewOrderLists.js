import React, { useEffect } from "react";
import { Table, message, Button } from "antd";
import {
  useGetOrderListsQuery,
  useDeleteOrderListMutation,
} from "../../context/service/listApi";
import { useGetAllShopsQuery } from "../../context/service/newOredShops";
import { useGetWorkersQuery } from "../../context/service/worker";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/uz";
import socket from "../../socket";

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

const NewOrderList = () => {
  const { data, isLoading, refetch } = useGetOrderListsQuery();
  const [deleteOrderList] = useDeleteOrderListMutation();
  const { data: workersData } = useGetWorkersQuery();
  const { data: shopsData } = useGetAllShopsQuery();
  const shopList = shopsData?.innerData?.filter((i) => i.isType === false);

  useEffect(() => {
    const handleUpdateOrder = (data) => refetch();
    socket.on("updateOrder", handleUpdateOrder);
    return () => socket.off("updateOrder", handleUpdateOrder);
  }, [refetch]);

  const handleDelete = async (record) => {
    try {
      await deleteOrderList({
        id: record?._id,
      }).unwrap();
      message.success("Ro'yxat o'chirildi");
    } catch (error) {
      message.error(error.message || "Yangilashda xatolik yuz berdi.");
    }
  };

  const columns = [
    {
      title: "Umumiy narx",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `${price?.toLocaleString()} so'm`,
    },
    {
      title: "Holat",
      key: "status",
      align: "center",
      render: (_, record) => (record.isPaid ? "Yuborildi" : "Yuborilmadi"),
    },
    {
      title: "Taminotchi",
      align: "center",
      render: (i) => {
        const distributor = workersData?.innerData?.find(
          (worker) => worker._id === i.distributorId
        );
        return distributor
          ? `${distributor.firstName} ${distributor.lastName}`
          : "Noma'lum";
      },
    },
    {
      title: "Sanasi",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) => {
        const d = dayjs(date);
        return `${d.date()}-${uzMonths[d.month()]} / ${d.format("HH:mm")}`;
      },
    },
    {
      title: "Amallar",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          icon={<DeleteOutlined />}
          style={{ color: "red" }}
          onClick={() => handleDelete(record)}
        >
          O'chirish
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
        size="small"
        columns={materialColumns}
        dataSource={record.materials}
        rowKey="productId"
        pagination={false}
      />
    );
  };
  const columnsList = [
    {
      title: "Do'kon nomi",
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
      render: (date) => {
        const d = dayjs(date);
        return `${d.date()}-${uzMonths[d.month()]} / ${d.format("HH:mm")}`;
      },
    },
  ];
  return (
    <div className="allLists-box">
      <div>
        <h2
          style={{
            color: "#0A3D3A",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Taminotchiga Yuborilgan Ro'yxati
        </h2>

        <Table
          columns={columns}
          dataSource={data?.innerData?.slice().reverse()}
          rowKey="_id"
          pagination={false}
          loading={isLoading}
          expandable={{ expandedRowRender }}
          size="small"
        />
      </div>
      <div>
        <h2
          style={{
            color: "#0A3D3A",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Buxgalterga Yuborilgan Ro'yxati
        </h2>

        <Table
          columns={columnsList}
          dataSource={shopList?.slice().reverse()}
          rowKey="_id"
          pagination={false}
          loading={isLoading}
          expandable={{ expandedRowRender }}
          size="small"
        />
      </div>
    </div>
  );
};

export default NewOrderList;
