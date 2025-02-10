import React, { useState, useMemo } from "react";
import { useGetOrdersQuery } from "../../../context/service/orderApi";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import { LuNewspaper } from "react-icons/lu";
import { Select, Table, Spin, Form, Input, Alert, Image, Button, List } from "antd";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Link } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import "./style.css";
import SelectWarehouse from "../SelectWarehouse";

const { Option } = Select;

const NewOrder = () => {
  const { data: orders, error, isLoading } = useGetOrdersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [openOrderList, setOpenOrderList] = useState(false);
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();
  const [isDisabled, setIsDisabled] = useState(true);
  const [inputValues, setInputValues] = useState({});
  const newOrders = orders?.innerData?.filter((order) => order.isType === true);

  const uniqueRegions = useMemo(() => {
    return [...new Set(newOrders?.map((order) => order?.address?.region).filter(Boolean))];
  }, [newOrders]);

  const categoryOptions = [
    "Yog‘och va Plitalar", "Metal Profillar va Konstruktsiyalar",
    "Mexanizmlar va Slayderlar", "Mix va Qotirish Materiallari",
    "Qoplamali Materiallar", "Qoplamalar va Bezaklar", "Kraska va Yelim Mahsulotlari"
  ].map(label => ({ label, value: label }));


  const filteredOrders = useMemo(() => {
    return newOrders?.filter((order) => {
      const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion ? order?.address?.region === selectedRegion : true;
      return matchesSearch && matchesRegion;
    });
  }, [newOrders, searchTerm, selectedRegion]);

  if (isLoading) return <Spin size="large" className="loading-spinner" />;
  if (error) return <Alert message="Xatolik yuz berdi" type="error" showIcon />;

  const formatDateUzbek = (date) => {
    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const d = new Date(date);
    return `${d.getDate()}-${months[d.getMonth()]}`;
  };

  const handleInputChange = (record, value) => {
    setInputValues(prev => ({ ...prev, [record?._id]: value }));
  };

  const onFinish = (values) => {
    const uniqueId = `67dl${Math.random().toString(36).substr(2, 9)}new${items?.length + 1}`;
    const myNewOrder = {
      productId: uniqueId,
      name: values.name,
      category: values.category,
      pricePerUnit: values.pricePerUnit,
      quantity: values.quantity,
      unit: values.unit,
      supplier: values.supplier,
    }
    setItems(prevItems => [...prevItems, myNewOrder]);
    form.resetFields();
    setIsDisabled(true);
  };
  const handleAdd = (record) => {
    const quantityToAdd = inputValues[record?._id] || 0;

    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.name === record.name);

      if (existingItemIndex !== -1) {
        // Agar mahsulot mavjud bo‘lsa, quantity ni oshiramiz
        return prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: quantityToAdd }
            : item
        );
      } else {
        // Agar mahsulot mavjud bo‘lmasa, yangi qo‘shamiz
        return [...prevItems, {
          productId: record._id,
          name: record.name,
          category: record.category,
          pricePerUnit: record.pricePerUnit,
          quantity: quantityToAdd,
          unit: record.unit,
          supplier: record.supplier,
        }];
      }
    });
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
      render: (_, record) => <Link to={`/store/materials/${record._id}`}>Ko‘rish</Link>,
    },
  ];


  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleValuesChange = (_, allValues) => {
    const allFieldsFilled = Object.values(allValues).every(value => value !== undefined && value !== "");
    setIsDisabled(!allFieldsFilled);
  };
  return (
    <div className="stor_container">
      <div className="stor_todolist-one">
        <div className="list-container-nav"></div>
        <List
          bordered
          className="list-container"
          dataSource={items}
          renderItem={(item) => (
            <List.Item key={item.id} className="list-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">{item.quantity} {item.unit}</span>
                <span className="item-category">
                  {item.category.length > 7 ? item.category.slice(0, 7) + "..." : item.category}
                </span>

                <span className="item-price">
                  {item.pricePerUnit.toLocaleString('uz-UZ')} so‘m
                </span>
                <span className="item-price">
                  {(item.pricePerUnit * item.quantity).toLocaleString('uz-UZ')} so‘m
                </span>
              </div>
              <Button type="text" danger className="delete-btn" onClick={() => handleDelete(item.id)}>
                <DeleteOutlined />
              </Button>
            </List.Item>
          )}
        />
        <Form
          form={form}
          className="input-container"
          onFinish={onFinish}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          <div className="VscGitPullRequestGoToChanges">
            <Form.Item name="name" rules={[{ required: true, message: "Tovar nomini kiriting!" }]}>
              <Input style={{ width: "220px" }}
                placeholder="Tovar nomi"
              />
            </Form.Item>

            <Form.Item name="quantity" rules={[{ required: true, message: "Miqdorini kiriting!" }]}>
              <Input
                placeholder="Miqdori"
                type="number"
              />
            </Form.Item>

            <Form.Item name="pricePerUnit" rules={[{ required: true, message: "Narxni kiriting!" }]}>
              <Input
                placeholder="Narxi"
                type="number"
              />
            </Form.Item>

          </div>

          <div className="VscGitPullRequestGoToChanges">
            <Form.Item name="supplier" rules={[{ required: true, message: "Narxni kiriting!" }]}>
              <Input style={{ width: "150px" }}
                placeholder="Yetkazib beruvchi!"
              />
            </Form.Item>
            <Form.Item name="category" rules={[{ required: true, message: "Kategoriyani tanlang!" }]}>
              <Select placeholder="Kategoriya tanlang" allowClear style={{ width: 200 }} size="large">
                {categoryOptions.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="unit" rules={[{ required: true, message: "O‘lchov birligini tanlang!" }]}>
              <Select size="large" style={{ width: 90 }}
                placeholder="O‘lchov birligi"
              >
                <Option value="Dona">Dona</Option>
                <Option value="Metr">Metr</Option>
                <Option value="Kg">Kg</Option>
                <Option value="Litr">Litr</Option>
                <Option value="Kvadrat metr">Kvadrat metr</Option>
              </Select>
            </Form.Item>


            <div className="VscGitPullRequestGoToChanges-btns">
              <Button
                size="large"
                style={{ background: !isDisabled && "#0A3D3A", color: !isDisabled && "#fff" }}
                type="primary"
                htmlType="submit"
                disabled={isDisabled}
              >
                <IoMdCheckmarkCircleOutline style={{ fontSize: "20px", marginTop: "2px" }} />
              </Button>

              <Button onClick={() => setOpenOrderList(!openOrderList)} size="large" style={{ background: "#0A3D3A", color: "#fff" }} type="primary">
                {openOrderList ? <VscGitPullRequestGoToChanges /> : <LuNewspaper />}
              </Button>
            </div>
          </div>

        </Form>

      </div>
      {
        openOrderList ?
          <div className="stor_todolist">
            <SelectWarehouse inputValues={inputValues} handleAdd={handleAdd} handleInputChange={handleInputChange} />
          </div>
          :
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


      }
    </div >
  );
};

export default NewOrder;


