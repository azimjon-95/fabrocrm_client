import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Popover,
  Select,
  Col,
  Row,
  Radio,
  message,
  Divider, Space
} from "antd";

import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import { RiSendPlaneFill } from "react-icons/ri";
import { MdMenuOpen } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import {
  useGetShopsQuery,
  useAddShopMutation,
} from "../../context/service/shopsApi";
import {
  useGetAllStoresQuery,
  useGetStoreByCategoryQuery,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useCreateStoreMutation
} from "../../context/service/storeApi";
import { useCreateShopMutation, useGetAllShopsQuery, useAddMaterialMutation, useUpdateShopMutation } from "../../context/service/newOredShops";
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

const unitOptions = ["Dona", "Kg", "Litr", "Metr", "Kvadrat Metr"].map(
  (label) => ({ label, value: label.toLowerCase() })
);

const Warehouse = () => {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form] = Form.useForm();
  const [isContainerVisible, setIsContainerVisible] = useState(false);
  const { data: allStores = [], refetch: refetchAll } = useGetAllStoresQuery();
  const { data: filteredStores = [], refetch: refetchFiltered } = useGetStoreByCategoryQuery(selectedCategory, { skip: !selectedCategory });
  const [deleteStore] = useDeleteStoreMutation();
  const [addMaterial] = useAddMaterialMutation()
  const [createShop, { isLoading: isCreate }] = useCreateShopMutation();
  const { data: allShops = [], refetch: refetchAllShops } = useGetAllShopsQuery();
  const shop = allShops?.innerData?.find(i => i.isType === true) || {};
  const stores = selectedCategory ? filteredStores : allStores;
  const [editingItem, setEditingItem] = useState(null);
  const { data: shops } = useGetShopsQuery();
  const [addShop] = useAddShopMutation();
  const [name, setName] = useState("");
  const [updateShop, { isLoading: isUpdatingShop }] = useUpdateShopMutation();
  const [createStore, { isLoading: isUpdating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isCreating }] = useUpdateStoreMutation();
  useEffect(() => {
    if (isEditMode) {
      form.setFieldValue('quantity', undefined);
    }
  }, [form, isEditMode]);
  const openModal = (record = null) => {

    if (record) {
      setIsEditMode(true);
      setEditingItem(record);
      form.setFieldsValue(record);
    } else {
      setIsEditMode(false);
      setEditingItem(null);
      form.resetFields();
    }
    setIsModalOpen(true);

    setSelectedProduct(record);
    form.setFieldsValue(
      record || {
        name: "",
        category: "",
        quantity: 1,
        unit: "dona",
        pricePerUnit: 0,
        supplier: "",
      }
    );
  };

  const onFinish = async (values) => {
    if (!shop || !Object.keys(shop).length) {
      message.warning('Iltimos, avval roʻyxat yarating!');
      return;
    }
    const quantity = filteredData?.find(i => i._id === selectedProduct?._id);

    const updatedMater = {
      name: quantity?.name,
      category: quantity?.category,
      quantity: quantity?.quantity + values.quantity,
      unit: quantity?.unit,
      pricePerUnit: values?.pricePerUnit || quantity?.pricePerUnit,
    }
    try {
      if (isEditMode && editingItem) {
        const res = await updateStore({
          id: selectedProduct?._id,
          updatedData: updatedMater,
        });
        message.success(res?.data?.message);
      } else {
        const res = await createStore(values).unwrap();
        message.success(res?.data?.message);
      }

      const material = {
        name: values?.name,
        category: values?.category,
        quantity: values?.quantity,
        unit: values?.unit,
        pricePerUnit: values?.pricePerUnit,
      }

      await addMaterial({ ShopId: shop._id, material });
      refetchAllShops();

      form.resetFields();
      setIsModalOpen(false);
      refetchAll();
      refetchFiltered();
    } catch (error) {
      message.error(error?.data?.message);
    }
  };

  const handleDelete = async (data) => {
    try {
      const res = await deleteStore(data?._id);
      message.success(
        res?.data?.message || "Mahsulot muvaffaqiyatli o‘chirildi!"
      );
      refetchAll();
      refetchFiltered();
    } catch {
      message.error("O‘chirishda xatolik yuz berdi!");
    }
  };

  const filteredData = stores?.innerData?.filter((store) =>
    store?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );



  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    form.resetFields();
  };

  const location = useLocation();
  const isHidden =
    location.pathname === "/manag/warehouse" ||
    location.pathname === "/deput/warehouse";
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
    !isHidden && {
      title: "Harakatlar",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex" }}>
          <Button
            style={{ color: "#0A3D3A" }}
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Tahrirlash
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            O‘chirish
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);



  const handleCreateShop = async () => {
    try {
      await createShop();
      refetchAllShops();
    } catch (error) {
      console.error("Error creating shop:", error);
      alert("Failed to create shop");
    }
  };

  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Tashqariga klik qilishni tekshirish
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        !closeButtonRef.current.contains(event.target) // closeButton ustida klik bo‘lsa
      ) {
        setIsContainerVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // =======================================
  const onNameChange = (event) => {
    setName(event.target.value);
  };
  // Yangi shop qo'shish
  const addItem = async (e) => {
    e.preventDefault();
    if (name && !shops?.innerData?.some((shop) => shop.name.toLowerCase() === name.toLowerCase())) {
      await addShop({ name }).unwrap();
      setName("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Variantlarni qayta hisoblaydi
  const computedOptions = useMemo(() => {
    const isExisting = shops?.innerData?.some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    const newOptions = isExisting
      ? shops?.innerData
      : [...(shops?.innerData || []), { _id: null, name: name }];

    return newOptions.map((item) => ({
      value: JSON.stringify({ id: item._id, value: item.name }),  // JSON qilib uzatamiz
      label: (
        <Space>
          {item.name}
        </Space>
      ),
    }));
  }, [name, shops]);


  const onSelectChange = async (value) => {
    setIsContainerVisible(true)
    try {
      const parsedValue = JSON.parse(value);
      await updateShop({ id: shop._id, updatedShop: { shopsId: parsedValue.id, shopName: parsedValue.value } })

    } catch (error) {
      message.error(error);
    }
  }


  const onCloseChange = async () => {
    if (shop.materials?.length === 0) {
      message.warning('Boʻsh roʻyxatni buxgalteriyaga yuborib boʻlmaydi. Iltimos, mahsulotlarni qoʻshing.');
      return
    }
    if (shop?.shopName === "") {
      message.warning("Do'kon tanlanmagan! Iltimos, do'konni tanlang.");
      return
    }
    try {
      const res = await updateShop({ id: shop._id, updatedShop: { isType: false } })
      if (res.success) {
        message.success('Buxgalteryaga muvaffaqiyatli yuborildi!')
        setIsContainerVisible(false)
      }
    } catch (error) {
      message.error(error);
    }
  }

  const content = (
    <Button style={{ background: "#0A3D3A" }} loading={isUpdatingShop} onClick={onCloseChange} type="primary">
      Ha
    </Button>
  );


  return (
    <div className="warehouse-container">
      <div className="warehouse-navbar">
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
          className="warehouse-navbar_inp"
        />
        <Button className="create-shops-modal-btn" type="primary" onClick={() => openModal(null)}>
          Mahsulot qo‘shish
        </Button>
      </div>

      <div className="custom-tabl-scroll3">
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="_id"
          size="small"
          pagination={false}
        />
      </div>

      <Modal
        width={545}
        title={isEditMode ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo‘shish"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        {!shop?.isType &&
          <Button
            loading={isCreate}
            ref={closeButtonRef}
            onClick={() => handleCreateShop()}
            className="create-shops-btn"
          >
            Roʻyxat yarating!
          </Button>}
        <Form
          form={form} onFinish={onFinish}
          initialValues={{
            category: categoryOptions[0]?.value,
            quantity: undefined, // Quantity uchun initialValue yo'q
          }}
          layout="vertical">
          <Form.Item
            label="Mahsulot nomi"
            name="name"
            rules={[{ required: true, message: "Mahsulot nomini kiriting!" }]}
          >
            <Input placeholder="Mahsulot nomini kiriting" />
          </Form.Item>

          <Form.Item
            label="Kategoriya"
            name="category"
            initialValue={categoryOptions[0]?.value} // Birinchi kategoriyani tanlash
            rules={[{ required: true, message: "Kategoriya tanlang!" }]}
          >
            <Radio.Group
              className="radio_Group_inp"
              options={categoryOptions}
              onChange={(e) => form.setFieldValue('category', e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="O‘lchov birligi"
            name="unit"
            rules={[{ required: true, message: "O‘lchov birligini tanlang!" }]}
          >
            <Radio.Group options={unitOptions} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Miqdor"
                name="quantity"
                shouldUpdate={false}
                rules={[{ required: true, message: "Miqdorni kiriting!" }]}

              >
                <InputNumber min={1} style={{ width: "100%" }} placeholder="Miqdor" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Birlik narxi (so‘m)" name="pricePerUnit">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Birlik narxi"
                />
              </Form.Item>
            </Col>
          </Row>
          <Button
            style={{ background: "#0A3D3A", width: "100%", marginTop: "20px", height: "34px" }}
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
          >
            {isEditMode ? "Yangilash" : "Saqlash"}
          </Button>
        </Form>
      </Modal>

      {
        shop.isType === true &&
        <div ref={containerRef} className={`shopsnew-container ${isContainerVisible ? "show" : ""}`} >
          <Button
            ref={closeButtonRef}
            onClick={() => setIsContainerVisible(!isContainerVisible)}
            className="open-shops-modal-btn"
          >
            {isContainerVisible ? <IoCloseSharp style={{ color: "red" }} /> : <MdMenuOpen />}
          </Button>
          <div className="shopsnew-container-nav">
            <Select
              style={{ width: "220px" }}
              defaultValue={shop?.shopName}
              placeholder="Do'konni tanlang yoki yarating"
              loading={isUpdatingShop}
              onChange={(value) => {
                onSelectChange(value);
                setIsContainerVisible(true);
              }}
              dropdownRender={(menu) => (
                <div className="select-shops">
                  {menu}
                  <Divider
                    style={{
                      margin: "8px 0",
                    }}
                  />
                  <Space
                    style={{
                      padding: "0 8px 4px",
                    }}
                  >
                    <Input
                      placeholder="Yangi variant kiriting"
                      ref={inputRef}
                      value={name}
                      onChange={onNameChange}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button type="text" onClick={addItem}> <PlusOutlined /></Button>
                  </Space>
                </div>
              )}
              options={computedOptions}
              allowClear
            />
            <Popover
              trigger="click"
              content={content}
              title="Siz rostdan Buxgalteryaga yubarmoqchimisiz?"
            >
              <Button style={{ color: "#0A3D3A", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>Yuborish <RiSendPlaneFill /></Button>
            </Popover>
          </div>
          <h4>Omborga kelgan mahsulotlar ro'yxati</h4>
          {
            shop.materials?.map((item, inx) =>
            (<div key={inx} className="item-info-shop">
              <span className="item-name-shop">{item.name}</span>
              <span className="item-quantity-shop">
                {item.quantity} {item.unit}
              </span>


              <span className="item-price-shop">
                {item.pricePerUnit.toLocaleString("uz-UZ")} so‘m
              </span>
              <span className="item-price-shop">
                {(item.pricePerUnit * item.quantity).toLocaleString("uz-UZ")}{" "}
                so‘m
              </span>
            </div>
            ))
          }
        </div>
      }
    </div>
  );
};

export default Warehouse;


