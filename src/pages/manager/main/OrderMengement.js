import React, { useState, useEffect } from "react";
import { Input, Select, Button, Form, } from "antd";
import { SearchOutlined, ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetAllStoresQuery } from "../../../context/service/storeApi"
import { GiTakeMyMoney } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";
import { IoCheckmarkSharp } from "react-icons/io5";
import { MdOutlineAdd, MdOutlineAddShoppingCart } from "react-icons/md";
import { useCreateOrderMutation } from '../../../context/service/orderApi'
import "./style.css";

const unitOptions = [
  { label: "Dona", value: "dona" },
  { label: "Kg", value: "kg" },
  { label: "Litr", value: "litr" },
  { label: "Metr", value: "metr" }, // "Metor" -> "Metr" tuzatildi
  { label: "Kvadrat Metr", value: "kvadrat_metr" }, // `value` probelsiz bo‘lishi kerak
];

const OrderMengement = () => {
  const navigate = useNavigate();
  const { data: allStores = [] } = useGetAllStoresQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [openBudget, setOpenBudget] = useState(true);

  useEffect(() => {
    setOpenBudget(selectedMaterials.length === 0);
  }, [selectedMaterials]);

  const location = useLocation();
  const data = location.state;
  console.log(data);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [dataNew, setDataNew] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
    store: data?.store?.id,
    materials: [],
  });

  const [formDataNew, setFormDataNew] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
  });




  const handleSelectChange = (value) => {
    setFormDataNew((prevState) => ({
      ...prevState,
      unit: value,
    }));
  };

  const handleAddMaterialNew = () => {
    // Generate a unique ID using random string + length
    const uniqueId = `67d${Math.random().toString(36).substr(2, 9)}new${selectedMaterials.length + 1}`;

    const newMaterial = {
      id: uniqueId,
      name: formDataNew?.name,
      price: formDataNew?.price,
      quantity: formDataNew?.quantity,
      unit: formDataNew?.unit,
    };

    setSelectedMaterials(prevState => [...prevState, newMaterial]);

    setFormDataNew({
      name: "",
      price: "",
      quantity: "",
      unit: "",
    });
  };
  const handleDelete = (id) => {
    setSelectedMaterials(prevState => {
      return prevState.filter(material => material.id !== id); // Remove the item with the matching id
    });
  };

  const filteredData = allStores?.innerData?.filter(store =>
    store?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [inputValues, setInputValues] = useState({}); // Mahsulot ID va qiymatni saqlash

  // Mahsulot miqdorini o'zgartirish
  const handleInputChange = (matId, value) => {
    setInputValues(prevState => ({
      ...prevState,
      [matId]: value, // Har bir mahsulot uchun alohida qiymatni saqlash
    }));
  };

  // Tanlangan materialni qo'shish
  const handleAddMaterial = (mat) => {
    console.log(mat);
    setSelectedMaterials(prevState => {
      const existingMaterial = prevState.find(item => item.id === mat._id);
      const quantity = inputValues[mat._id] || 1; // Agar input bo'sh bo'lsa, 1 qiymatini oladi

      if (existingMaterial) {
        return prevState.map(item =>
          item.id === mat._id ? { ...item, quantity: Number(quantity) } : item
        );
      } else {
        return [...prevState, {
          id: mat._id, name: mat.name, quantity: Number(quantity), unit: mat.unit, price: mat.
            pricePerUnit
        }];
      }
    });

    setInputValues(prevState => ({
      ...prevState,
      [mat._id]: "", // Inputni tozalash
    }));
  };

  const totalPrice = selectedMaterials.reduce((sum, mat) => sum + mat.price * mat.quantity, 0);

  return (
    <>
      {/* Form ma'lumotlarini chiroyli chiqarish */}
      <div className="form-data-container">
        <div className="backnext">
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        </div>
        <Input
          placeholder="Mahsulotlarni qidiring..."
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: "100%" }}
          className="warehouse-navbar_inp"
        />
      </div>
      <Form layout="vertical" className="order-form-main">
        <div className="create_order_box">
          <div className="create_order_right">
            <h3>Ombor</h3>
            <div className="create_order_right-box">
              {filteredData?.map((mat) => (
                <div key={mat._id} className="material-item">
                  <div>
                    <p>{mat.name}</p> | <p>{mat.quantity} {mat.unit}</p> <p>1-{mat.unit} narxi: {mat.pricePerUnit.toLocaleString()}</p>

                  </div>
                  <Input
                    min={1}
                    style={{ width: "100px", height: "32px", marginRight: "5px" }}
                    size="small"
                    value={inputValues[mat._id] || ""}
                    onChange={(e) => handleInputChange(mat._id, e.target.value)}
                    className="full-width"
                    placeholder="Miqdori"
                  />
                  <Button onClick={() => handleAddMaterial(mat)}>
                    <IoCheckmarkSharp />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="create_order_main">
            <h3>Mebel uchun sarflanadigan mahsulotlar!</h3>
            <div className="inp_add_pro_myorder">
              {selectedMaterials.map((mat, inx) => (
                <div key={inx} className="selected-material-item">
                  <p><strong style={{ color: "#333" }}>{inx + 1})</strong>  {mat.name}</p>
                  <p>{mat.quantity} {mat.unit}</p>
                  <p>{(mat.price * mat.quantity).toLocaleString()} so'm</p>
                  <button
                    onClick={() => handleDelete(mat.id)} // Pass the id for deletion
                    className="delete-btn"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              ))}
            </div>

            <div className="inp_add_pro_cont">
              <Button onClick={() => setOpenBudget(!openBudget)} className="inp_add_pro_btn">
                {
                  openBudget ? <GiTakeMyMoney /> :
                    <MdOutlineAddShoppingCart />
                }
              </Button>
              <p>{openBudget ?
                "Omborda mavjud bo‘lmagan mahsulotni qo‘shish!" :
                "Mebel uchun sarflanadigan mahsulotlarning umumiy narxi!"
              }</p>
              {
                openBudget ?
                  <div className="inp_add_pro_box">
                    <Form layout="vertical" className="inp_add_pro_boxnewForm">
                      <Form.Item
                        label="Nomi"
                        rules={[{ required: true, message: "Nomi kiriting!" }]}
                        className="inp_add_pro"
                      >
                        <Input
                          name="name"
                          value={formDataNew?.name}
                          onChange={(e) => setFormDataNew((prevData) => ({ ...prevData, name: e.target.value }))}
                          placeholder="Material nomini kiriting"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Narxi"
                        rules={[{ required: true, message: "Narxni kiriting!" }]}
                        className="inp_add_pro"
                      >
                        <Input
                          name="price"
                          type="number"
                          value={formDataNew?.price}
                          onChange={(e) => setFormDataNew((prevData) => ({ ...prevData, price: e.target.value }))}
                          placeholder="Material narxini kiriting"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Miqdori"
                        rules={[{ required: true, message: "Miqdori kiriting!" }]}
                        className="inp_add_pro_in"
                      >
                        <Input
                          name="quantity"
                          type="number"
                          value={formDataNew?.quantity}
                          onChange={(e) => setFormDataNew((prevData) => ({ ...prevData, quantity: e.target.value }))}
                          placeholder="Material miqdorini kiriting"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Birlik"
                        rules={[{ required: true, message: "Birlikni tanlang!" }]}
                        className="inp_add_pro_in"
                      >
                        <Select
                          size="large"
                          placeholder="Birlikni tanlang"
                          value={formDataNew?.unit}
                          onChange={handleSelectChange}
                          options={unitOptions}
                        />
                      </Form.Item>

                      <Form.Item label=" ">
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => handleAddMaterialNew()}
                          disabled={
                            !formDataNew?.name || !formDataNew?.price || !formDataNew?.quantity || !formDataNew?.unit
                          }
                        >
                          <MdOutlineAdd />
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                  :
                  <div className="inp_add_pro_box_right">
                    <Form.Item label=" ">
                      <p>{totalPrice.toLocaleString()} so'm</p>
                    </Form.Item>
                    <Form.Item label="Buyurtma budjeti (so'm)">
                      <Input style={{ width: "250px" }} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Бюджет заказа" />
                    </Form.Item>
                  </div>
              }
            </div>

          </div>
        </div>
        <Form.Item>
          <Button style={{ width: "100%", height: "40px" }} type="primary" htmlType="submit">Buyurtmani yaratish</Button>
        </Form.Item>
      </Form>

    </>
  );
};

export default React.memo(OrderMengement);


