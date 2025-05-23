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
  Divider,
  Space,
  Switch
} from "antd";

import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
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
  useCreateStoreMutation,
} from "../../context/service/storeApi";
import {
  useCreateShopMutation,
  useGetAllShopsQuery,
  useAddMaterialMutation,
  useUpdateShopMutation,
} from "../../context/service/newOredShops";
import "./style.css";

import {
  useGetDriversQuery,
  useCreateDriverMutation,
} from "../../context/service/driverApi";

import {
  useGetDebtorsQuery
} from "../../context/service/orderApi";

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

const { TextArea } = Input;
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
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverPrice, setDriverPrice] = useState(null);
  const [openDriverModal, setOpenDriverModal] = useState(false);

  const [selectedOrders, setSelectedOrders] = useState([]);

  const { data: allStores = [], refetch: refetchAll } = useGetAllStoresQuery();
  const { data: filteredStores = [], refetch: refetchFiltered } =
    useGetStoreByCategoryQuery(selectedCategory, { skip: !selectedCategory });
  const [deleteStore] = useDeleteStoreMutation();
  const [addMaterial] = useAddMaterialMutation();
  const [createShop, { isLoading: isCreate }] = useCreateShopMutation();
  const { data: allShops = [], refetch: refetchAllShops } =
    useGetAllShopsQuery();
  let shop = allShops?.innerData?.find((i) => i.isType === true) || {};
  const stores = selectedCategory ? filteredStores : allStores;
  const { data: shops } = useGetShopsQuery();
  const [addShop] = useAddShopMutation();
  const [name, setName] = useState("");
  const [updateShop, { isLoading: isUpdatingShop }] = useUpdateShopMutation();
  const [createStore, { isLoading: isUpdating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isCreating }] = useUpdateStoreMutation();
  const [checked, setChecked] = useState(false);
  const { data: driversData } = useGetDriversQuery();
  const [createDriver] = useCreateDriverMutation();
  const drivers = driversData?.innerData || [];
  const driverForSelect = drivers?.map((item) => ({
    phone: item.phone,
    value: item._id,
    label: item.name,
  }));

  const { data: debtorsData } = useGetDebtorsQuery();
  const onChange = (checked) => {
    setChecked(checked);
  };


  const openModal = (record = null) => {
    if (record) {
      setIsEditMode(true);
      form.setFieldsValue(record);
    } else {
      setIsEditMode(false);
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
    if (!checked) {
      if (!shop || !Object.keys(shop).length) {
        message.warning("Iltimos, avval roʻyxat yarating!");
        return;
      }
    }

    const updatedMater = {
      name: values?.name,
      category: values?.category,
      quantity: values?.quantity,
      unit: values?.unit,
      pricePerUnit: values?.pricePerUnit,
    };
    try {
      if (checked) {
        const res = await updateStore({
          id: selectedProduct?._id,
          updatedData: updatedMater,
        });
        return message.success(res?.data?.message);
      } else {
        const res = await createStore(updatedMater).unwrap();
        message.success(res?.data?.message);
      }

      const material = {
        name: values?.name,
        category: values?.category,
        quantity: values?.quantity,
        unit: values?.unit,
        pricePerUnit: values?.pricePerUnit,
      };

      await addMaterial({ ShopId: shop._id, material });

      const materialTotal = material.pricePerUnit * material.quantity;
      const newTotalPrice = (shop.totalPrice || 0) + materialTotal;
      await updateShop({
        id: shop._id,
        body: { totalPrice: newTotalPrice },
      });

      form.resetFields();
      setIsModalOpen(false);

      refetchAllShops();
      refetchAll();
      refetchFiltered();
    } catch (error) {
      console.log(error);
      // message.error(error?.data?.message || ">>>");
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
  const onNameChange = (event) => setName(event.target.value);
  // Yangi shop qo'shish
  const addItem = async (e) => {
    e.preventDefault();
    if (
      name &&
      !shops?.innerData?.some(
        (shop) => shop.name.toLowerCase() === name.toLowerCase()
      )
    ) {
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
      value: JSON.stringify({ id: item._id, value: item.name }), // JSON qilib uzatamiz
      label: <Space>{item.name}</Space>,
    }));
  }, [name, shops]);

  const onSelectChange = async (value) => {
    setIsContainerVisible(true);
    try {
      const parsedValue = JSON.parse(value);

      await updateShop({
        id: shop._id,
        body: { shopsId: parsedValue.id, shopName: parsedValue.value },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onCloseChange = async () => {
    if (shop.materials?.length === 0) {
      return message.warning(
        "Boʻsh roʻyxatni buxgalteriyaga yuborib boʻlmaydi. Iltimos, mahsulotlarni qoʻshing."
      );
    }

    if (shop?.shopName === "") {
      setIsContainerVisible(true);
      return message.warning("Do'kon tanlanmagan! Iltimos, do'konni tanlang.");
    }

    let shopInfo = JSON.parse(selectedShop);

    if (!shopInfo?.value) {
      setIsContainerVisible(true);
      return message.error("Do'kon tanlanmagan! Iltimos, do'konni tanlang.");
    }

    if (shopInfo.value !== "soldo") {
      if (selectedDriver === null) {
        setIsContainerVisible(true);
        return message.error(
          "Haydovchi tanlanmagan! Iltimos, haydovchini tanlang."
        );
      }

      if (driverPrice === null) {
        setIsContainerVisible(true);
        return message.error("Yo'lkira narxi kiritilmagan!");
      }
    }

    try {
      if (shopInfo.value !== "soldo") {
        await newDriver();
      }

      const res = await updateShop({
        id: shop._id,
        body: {
          isType: false,
          isPaid: shopInfo.value === "soldo" ? true : false,
        },
      });

      if (res.data.state) {
        message.success("Buxgalteryaga muvaffaqiyatli yuborildi!");
        setIsContainerVisible(false);
        setSelectedShop(null);
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
        "Buxgalteryaga yuborishda xatolik yuz berdi!"
      );
    }
  };

  const content = (
    <Button
      style={{ background: "#0A3D3A" }}
      loading={isUpdatingShop}
      onClick={onCloseChange}
      type="primary"
    >
      Ha
    </Button>
  );

  const newDriver = async () => {
    try {
      await createDriver({
        driver: selectedDriver,
        description: selectedDriver.description,
        state: "olib keldi",
        fare: +driverPrice,
        selectedOrders
      });
    } catch (e) {
      console.log(e);
    }
  };


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
        <Button
          className="create-shops-modal-btn"
          type="primary"
          onClick={() => openModal(null)}
        >
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

        {
          isEditMode &&
          <Form.Item
            label={checked ? "Qo'shish" : "Tahrirlash"}
          >
            <Switch
              checkedChildren="Ha"
              unCheckedChildren="Yo'q"
              checked={checked}
              onChange={onChange} />
          </Form.Item>
        }


        {!shop?.isType && (
          <>
            {
              !checked &&
              <Button
                loading={isCreate}
                ref={closeButtonRef}
                onClick={() => handleCreateShop()}
                className="create-shops-btn"
              >
                Roʻyxat yarating!
              </Button>
            }
          </>
        )}
        <Form
          form={form}
          onFinish={onFinish}
          initialValues={{
            category: categoryOptions[0]?.value,
          }}
          layout="vertical"
        >
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
              onChange={(e) => form.setFieldValue("category", e.target.value)}
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
                rules={[{ required: true, message: "Miqdorni kiriting!" }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Miqdor"
                />
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
            style={{
              background: "#0A3D3A",
              width: "100%",
              marginTop: "20px",
              height: "34px",
            }}
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
          >
            {isEditMode ? "Yangilash" : "Saqlash"}
          </Button>
        </Form>
      </Modal>

      {shop.isType === true && (
        <div
          ref={containerRef}
          className={`shopsnew-container ${isContainerVisible ? "show" : ""}`}
        >
          <Button
            ref={closeButtonRef}
            onClick={() => setIsContainerVisible(!isContainerVisible)}
            className="open-shops-modal-btn"
          >
            {isContainerVisible ? (
              <IoCloseSharp style={{ color: "red" }} />
            ) : (
              <MdMenuOpen />
            )}
          </Button>
          <div className="shopsnew-container-nav">
            <Select
              style={{ width: "220px" }}
              // defaultValue={shop?.shopName}
              placeholder="Do'konni tanlang yoki yarating"
              loading={isUpdatingShop}
              onChange={(value) => {
                onSelectChange(value);
                setIsContainerVisible(true);
                setSelectedShop(value);
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
                    <Button type="text" onClick={addItem}>
                      {" "}
                      <PlusOutlined />
                    </Button>
                  </Space>
                </div>
              )}
              options={computedOptions}
              allowClear
            />
            <Button onClick={() => setOpenDriverModal(true)}>Haydovchi</Button>
            <Popover
              trigger="click"
              content={content}
              title="Siz rostdan Buxgalteryaga yubarmoqchimisiz?"
            >
              <Button
                style={{
                  color: "#0A3D3A",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Yuborish <RiSendPlaneFill />
              </Button>
            </Popover>
          </div>
          <h4>Omborga kelgan mahsulotlar ro'yxati</h4>
          {shop.materials?.map((item, inx) => (
            <div key={inx} className="item-info-shop">
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
          ))}
        </div>
      )}

      {/* havdovchi modali */}

      <Modal
        width={545}
        title="Haydovchi qo‘shish"
        open={openDriverModal}
        onCancel={() => {
          setIsContainerVisible(true);
          setOpenDriverModal(false);
        }}
        footer={null}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>

          <Select
            style={{ width: "100%" }}
            placeholder="Haydovchi tanlang"
            options={driverForSelect.map(driver => ({
              name: driver.label,
              label: `${driver.label} - ${driver.phone}`,
              value: driver.value,
            }))}
            onChange={(value, option) =>
              setSelectedDriver(prev => ({
                ...prev,
                id: option.value,
                name: option.name,
              }))
            }
          />

          {/* Buyurtmalarni tanlash */}
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Buyurtmalarni tanlang"
            options={debtorsData?.innerData?.map(order => ({
              label: order.customer.fullName,
              value: order._id,
            }))}
            onChange={setSelectedOrders}
          />

          <Divider plain>Yoki yangi haydovchi qo‘shing</Divider>
          {/* Yangi haydovchi qo‘shish formasi */}
          <div className="add-driver-box" >
            <Input
              placeholder="Yangi haydovchi ismi"
              value={selectedDriver?.name || ""}
              onChange={e =>
                setSelectedDriver(prev => ({
                  ...prev,
                  id: null,
                  name: e.target.value,
                }))
              }
            />
            <Input
              addonBefore="+998"
              placeholder="Telefon raqami"
              maxLength={9}
              value={selectedDriver?.phone || ""}
              onChange={e =>
                setSelectedDriver(prev => ({
                  ...prev,
                  id: null,
                  phone: e.target.value,
                }))
              }
            />
          </div>

          <Divider plain>Yetkazib beruvchi haqi</Divider>

          <Input
            type="number"
            placeholder="Narxi"
            value={driverPrice}
            onChange={e => setDriverPrice(e.target.value)}
          />

          <TextArea
            rows={3}
            placeholder="Izoh kiriting (ixtiyoriy)"
            value={selectedDriver?.description || ""}
            onChange={e =>
              setSelectedDriver(prev => ({
                ...prev,
                id: null,
                description: e.target.value,
              }))
            }
          />
        </Space>
      </Modal>

    </div>
  );
};

export default Warehouse;
