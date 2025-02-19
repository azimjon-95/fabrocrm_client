import React, { useState, useEffect, useMemo } from "react";
import { useGetOrdersQuery } from "../../../context/service/orderApi";
import { Select, Table, Spin, Input, Alert, Image } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import "./style.css";

const ActiveOrders = () => {
  const navigate = useNavigate();
  const { data: orders, error, isLoading } = useGetOrdersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const newOrders = orders?.innerData?.filter((order) => order.isType === true);

  const uniqueRegions = useMemo(() => {
    return [...new Set(newOrders?.map((order) => order?.address?.region).filter(Boolean))];
  }, [newOrders]);

  const filteredOrders = useMemo(() => {
    return newOrders?.filter((order) => {
      const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase());
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
      title: "Rasimi",
      dataIndex: "image",
      key: "image",
      render: (image) => <Image src={image} alt="Mebel" width={50} height={50} style={{ objectFit: "cover", borderRadius: "8px" }} preview={{ mask: "Kattalashtirish" }} />,
    },
    { title: "Nomi", dataIndex: "name", key: "name" },
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
      render: (_, record) => {
        return record ? (
          <Link to={`/store/materials/${record._id}`}>
            Ko‘rish
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

      <div className="custom-table">
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


