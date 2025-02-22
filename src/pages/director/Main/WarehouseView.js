import React, { useEffect, useState } from "react";
import { Table, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  useGetAllStoresQuery,
  useGetStoreByCategoryQuery,
} from "../../../context/service/storeApi";
import "./main.css";
import socket from "../../../socket";

const { Option } = Select;

const categoryOptions = [
  "Yog‘och va Plitalar",
  "Metal Profillar va Konstruktsiyalar",
  "Mexanizmlar va Slayderlar",
  "Mix va Qotirish Materiallari",
  "Qoplamali Materiallar",
  "Qoplamalar va Bezaklar",
  "Kraska va Yelim Mahsulotlari",
].map((label) => ({ label, value: label }));

const WarehouseView = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allStores = [], refetch: refetchAll } = useGetAllStoresQuery();
  const { data: filteredStores = [], refetch: refetchFiltered } =
    useGetStoreByCategoryQuery(selectedCategory, { skip: !selectedCategory });
  const stores = selectedCategory ? filteredStores : allStores;
  const filteredData = stores?.innerData?.filter((store) =>
    store?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleNewStore = () => {
      refetchAll();
      if (selectedCategory) {
        refetchFiltered();
      }
    };

    socket.on("newStore", handleNewStore);

    return () => {
      socket.off("newStore", handleNewStore);
    };
  }, [refetchAll, refetchFiltered, selectedCategory]);

  const columns = [
    { title: "Mahsulot nomi", dataIndex: "name", key: "name" },
    { title: "Kategoriya", dataIndex: "category", key: "category" },
    {
      title: "Miqdor",
      key: "quantity",
      render: ({ quantity, unit }) => `${quantity} ${unit}`,
    },
    {
      title: "Birlik narxi",
      dataIndex: "pricePerUnit",
      key: "pricePerUnit",
      render: (price) => `${price.toLocaleString("uz-UZ")} so‘m`,
    },
    {
      title: "Jami narx",
      key: "totalPrice",
      render: ({ quantity, pricePerUnit }) =>
        `${(quantity * pricePerUnit).toLocaleString("uz-UZ")} so‘m`,
    },
  ]; // undefined elementlarni olib tashlash

  return (
    <div className="warehouse-container-view">
      <div className="warehouse-navbar-view">
        <Select
          placeholder="Kategoriya tanlang"
          allowClear
          style={{ width: 230 }}
          onChange={setSelectedCategory}
          size="large"
        >
          {categoryOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
        <Input
          style={{ width: "100%" }}
          placeholder="Mahsulotlarni qidiring..."
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined />}
          className="warehouse-navbar_inp-view"
        />
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        size="small"
        pagination={false}
        scroll={{ x: "max-content", y: 570 }}
        className="custom-table-scroll-view"
      />
    </div>
  );
};

export default WarehouseView;
