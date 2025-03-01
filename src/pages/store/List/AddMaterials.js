import React, { useState } from "react";
import { Table, Button, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import {
  useGetAllStoresQuery,
  useGetStoreByCategoryQuery,
} from "../../../context/service/storeApi";
import "./style.css";

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

const AddMaterials = ({
  isCreating,
  handleInputChange,
  inputValues,
  handleAdd,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allStores = [] } = useGetAllStoresQuery();
  const { data: filteredStores = [] } = useGetStoreByCategoryQuery(
    selectedCategory,
    { skip: !selectedCategory }
  );

  const stores = selectedCategory ? filteredStores : allStores;
  const filteredData = stores?.innerData?.filter((store) =>
    store?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { title: "Mahsulot nomi", dataIndex: "name", key: "name" },
    { title: "Kategoriya", dataIndex: "category", key: "category" },
    {
      title: "Miqdor",
      key: "quantity",
      render: ({ quantity, unit }) => `${quantity} ${unit}`,
    },
    {
      title: "Buyurtma",
      key: "add",
      render: (record) => {
        return (
          <div style={{ display: "flex", gap: "5px" }}>
            <Input
              style={{ width: "60px", height: "30px" }}
              type="number"
              size="small"
              placeholder="0"
              value={inputValues[record?._id]}
              onChange={(e) => handleInputChange(record, e.target.value)}
            />

            <Button
              style={{
                background: "#0A3D3A",
                width: "30px",
                height: "30px",
                padding: "0",
              }}
              type="primary"
              onClick={() => handleAdd(record)}
            >
              <IoMdCheckmarkCircleOutline
                style={{ fontSize: "20px", marginTop: "4px" }}
              />
            </Button>

          </div>
        );
      },
    },
  ];

  return (
    < >
      <div className="warehouse-navbar">
        <Input
          suffix={<SearchOutlined />}
          style={{ width: "100%" }}
          placeholder="Mahsulotlarni qidiring..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="warehouse-navbar_inp"
        />
        <Select
          placeholder="Kategoriya tanlang"
          allowClear
          style={{ width: 230, height: 38 }}
          onChange={setSelectedCategory}
          size="large"
        >
          {categoryOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        size="small"
        pagination={false}
        scroll={{ x: "max-content", y: 570 }}
        className="custom-table-scroll"
      />
    </>
  );
};

export default AddMaterials;
