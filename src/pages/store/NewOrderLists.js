import React from "react";
import { Table } from "antd";
import { useGetOrderListsQuery } from "../../context/service/listApi";

const NewOrderList = () => {
    const { data, isLoading } = useGetOrderListsQuery();

    const columns = [
        {
            title: "Umumiy narx",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (price) => `${price.toLocaleString()} so'm`,
        },
        {
            title: "Holat",
            key: "status",
            render: (_, record) => (
                record.isPaid ? "To'langan" : "To'lanmagan"
            ),
        },
        {
            title: "Yangi",
            dataIndex: "isNew",
            key: "isNew",
            render: (isNew) => (isNew ? "Ha" : "Yo'q"),
        },
        {
            title: "Buxgalterga yuborilgan",
            dataIndex: "sentToAccountant",
            key: "sentToAccountant",
            render: (sentToAccountant) => (sentToAccountant ? "Ha" : "Yo'q"),
        },
        {
            title: "Buxgalter tasdiqladi",
            dataIndex: "approvedByAccountant",
            key: "approvedByAccountant",
            render: (approvedByAccountant) => (approvedByAccountant ? "Ha" : "Yo'q"),
        },
        {
            title: "Ma'lumotlarga qo'shildi",
            dataIndex: "addedToData",
            key: "addedToData",
            render: (addedToData) => (addedToData ? "Ha" : "Yo'q"),
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
                title: "Miqdor",
                dataIndex: "quantity",
                key: "quantity",
            },
            {
                title: "O'lchov birligi",
                dataIndex: "unit",
                key: "unit",
            },
            {
                title: "Yetkazib beruvchi",
                dataIndex: "supplier",
                key: "supplier",
            },
        ];
        return <Table size="small" columns={materialColumns} dataSource={record.materials} rowKey="productId" pagination={false} />;
    };

    return (
        <Table
            columns={columns}
            dataSource={data?.innerData}
            rowKey="_id"
            pagination={false}
            loading={isLoading}
            expandable={{ expandedRowRender }}
            size="small"
        />
    );
};

export default NewOrderList;
