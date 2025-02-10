import React from "react";
import { useParams } from "react-router-dom";
import { Table, Spin, Button } from "antd";
import { useGetAllMaterialByIdQuery } from "../../../context/service/orderApi";

const GivnMaterial = () => {
    const { id } = useParams();
    const { data: materialsData, isLoading: isMaterialsLoading } = useGetAllMaterialByIdQuery(id);

    const columns = [
        {
            title: "Material Nomi",
            dataIndex: "materialName",
            key: "materialName",
        },
        {
            title: "Berilgan Miqdor",
            key: "quantityUnit",
            render: (_, record) => `${record.givenQuantity} ${record.unit}`,
        },
        {
            title: "Berilgan Sana",
            dataIndex: "date",
            key: "date",
            render: (text) => {
                const date = new Date(text);
                const uzMonths = [
                    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
                    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
                ];
                const day = date.getDate();
                const month = uzMonths[date.getMonth()];
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");

                return `${day}-${month} / ${hours}:${minutes}`;
            }
        }
    ];

    return (
        <div>
            {isMaterialsLoading ? (
                <Spin size="large" />
            ) : (
                <div className="">
                    <Button style={{ marginBottom: "5px" }} onClick={() => window.history.back()}>⬅ Orqaga</Button>
                    <Table
                        dataSource={materialsData?.innerData}
                        columns={columns}
                        rowKey="_id"
                        bordered
                        pagination={false}
                        size="small"

                    />
                </div>
            )}
        </div>
    );
};

export default GivnMaterial;
