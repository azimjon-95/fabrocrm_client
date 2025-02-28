import React, { useState, useMemo } from "react";
import { useGetOrdersQuery } from "../../../context/service/orderApi";
import { Select, Table, Spin, Input, Alert } from "antd";
import { Link } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import "./style.css";

const ActiveOrders = () => {
  const { data: orders, error, isLoading } = useGetOrdersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const newOrders = orders?.innerData?.filter((order) => order.isType === true);

  const uniqueRegions = useMemo(() => {
    return [...new Set(newOrders?.map((order) => order?.address?.region).filter(Boolean))];
  }, [newOrders]);

  const filteredOrders = useMemo(() => {
    return newOrders?.filter((order) => {
      const matchesSearch = order.orders?.map((i) => i.name?.toLowerCase().includes(searchTerm?.toLowerCase()));
      const matchesRegion = selectedRegion ? order?.address?.region === selectedRegion : true;
      return matchesSearch && matchesRegion;
    });
  }, [newOrders, searchTerm, selectedRegion]);

  const formatDateUzbek = (date) => {
    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const d = new Date(date);
    return `${d.getDate()}-${months[d.getMonth()]}`;
  };

  const columns = [
    {
      title: "Mebel nomi",
      render: (_, record) => record?.orders?.map((i) => <p>{i.name}</p>)
    },
    { title: "Sanasi", dataIndex: "date", key: "date", render: formatDateUzbek },
    {
      title: "Manzili",
      key: "address",
      render: (_, record) => <span>{record.address.region}, {record.address.district}</span>,
    },
    {
      title: "Materiallar",
      dataIndex: "materials",
      key: "materials",
      align: "center",
      render: (_, record) => {
        return record ? (
          <Link to={`/store/materials/${record._id}`}>
            <EyeOutlined style={{ marginRight: 5, fontSize: "20px", color: "#0A3D3A" }} />
          </Link>
        ) : (
          "Mavjud emas"
        );
      },
    },
  ];

  if (isLoading) return <Spin size="large" className="loading-spinner" />;
  if (error) return <Alert message="Xatolik yuz berdi" type="error" showIcon />;

  return (
    <div className="stor_todolist">
      <div className="customer-navbar" >
        <Input
          size="small"
          placeholder="Mijozni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: "100%", height: 40 }}
          suffix={<SearchOutlined />}
        />
        <Select
          placeholder="Region tanlang"
          allowClear
          style={{ width: 200, height: 40 }}
          onChange={setSelectedRegion}
        >
          {uniqueRegions.map((region) => (
            <Select.Option key={region} value={region}>{region}</Select.Option>
          ))}
        </Select>

      </div>

      <div className="custom-tables" style={{ overflowX: 'auto' }}>
        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="_id"
          bordered
          pagination={false}
          size="small"
        />
      </div>


    </div>
  );
};

export default ActiveOrders;

