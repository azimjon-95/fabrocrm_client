import React, { useState, useEffect } from "react";
import { Input, Select, Button, message, Form } from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { TbArrowBackUpDouble } from "react-icons/tb";
import { useGetAllStoresQuery } from "../../../context/service/storeApi";
import { GiTakeMyMoney } from "react-icons/gi";
import { useNavigate, useParams } from "react-router-dom";
import { IoCheckmarkSharp } from "react-icons/io5";
import { MdOutlineAdd, MdOutlineAddShoppingCart } from "react-icons/md";
import {
  useGetOrderByIdQuery, useCreateAdditionalMaterialMutation
} from "../../../context/service/orderApi";
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
  let id = useParams().id;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [createAdditionalMaterial, { loading: isCreating }] = useCreateAdditionalMaterialMutation();
  const [orderId, setOrderID] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isForm, setIsForm] = useState(false);
  const { data: allStores = [] } = useGetAllStoresQuery();
  const { data: orderData } = useGetOrderByIdQuery(id);
  let order = orderData?.innerData;
  const Price = materials?.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || 0;
  const totalPrice = selectedMaterials?.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || 0;


  useEffect(() => {
    if (order?.orders) {
      setMaterials(order.orders.flatMap(orderItem => orderItem.materials || []));
    }
  }, [order]);

  useEffect(() => {
    localStorage.setItem("order", JSON.stringify(order));
  }, [order]);


  useEffect(() => {
    const storedOrder = localStorage.getItem("order");
    if (!storedOrder) return; // Agar "order" mavjud bo'lmasa, funksiyani tugatish

    try {
      const order = JSON.parse(storedOrder);
      const foundOrder = order?.orders?.find((o) => o._id === orderId);

      if (foundOrder?.materials) {
        setSelectedMaterials(foundOrder.materials);
      }

    } catch (error) {
      console.error("JSON parse error:", error);
    }
  }, [orderId]);
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
      orderId,
      name: formDataNew?.name,
      price: formDataNew?.price,
      quantity: formDataNew?.quantity,
      unit: formDataNew?.unit,
    };

    setSelectedMaterials((prevState) => [...prevState, newMaterial]);

    setFormDataNew({
      name: "",
      price: "",
      quantity: "",
      unit: "",
    });
  };
  const handleDelete = (id) => {
    setSelectedMaterials((prevState) => {
      return prevState.filter((material) => material.id !== id); // Remove the item with the matching id
    });
  };

  const filteredData = allStores?.innerData?.filter((store) =>
    store?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [inputValues, setInputValues] = useState({}); // Mahsulot ID va qiymatni saqlash

  // Mahsulot miqdorini o'zgartirish
  const handleInputChange = (matId, value) => {
    setInputValues((prevState) => ({
      ...prevState,
      [matId]: value, // Har bir mahsulot uchun alohida qiymatni saqlash
    }));
  };

  // Tanlangan materialni qo'shish
  const handleAddMaterial = async (mat) => {
    const quantity = inputValues[mat._id] || 1;

    // Use the mat object to get the material data directly
    const newAdditional = {
      materialID: mat._id,
      name: mat.name,
      quantity: quantity,
      unit: mat.unit,
      price: mat.pricePerUnit,
      orderId: id,
      orderCardId: orderId,
    };

    try {
      // Create the material via the API call
      const response = await createAdditionalMaterial(newAdditional).unwrap();
      message.success(response.message || "Material muvaffaqiyatli berildi!");

      // Now update the state after the successful creation of the material
      setSelectedMaterials((prevState) => {
        const existingMaterial = prevState.find((item) => item.id === mat._id);

        let updatedMaterials;
        if (existingMaterial) {
          updatedMaterials = prevState.map((item) =>
            item.id === mat._id ? { ...item, quantity: Number(quantity) } : item
          );
        } else {
          updatedMaterials = [
            ...prevState,
            {
              id: mat._id,
              name: mat.name,
              quantity: Number(quantity),
              orderId,
              unit: mat.unit,
              price: mat.pricePerUnit,
              materialID: mat._id,
            },
          ];
        }
        return updatedMaterials;
      });

      // Clear the input field after adding the material
      setInputValues((prevState) => ({
        ...prevState,
        [mat._id]: "", // Inputni tozalash
      }));

    } catch (error) {
      message.error(error.message || "Xatolik yuz berdi, qayta urinib ko'ring!");
    }
  };


  const closeAndSave = () => {
    let order = JSON.parse(localStorage.getItem("order"));
    order.orders = order.orders?.map((i) =>
      i._id === orderId
        ? { ...i, materials: selectedMaterials }
        : i
    );

    localStorage.setItem("order", JSON.stringify(order));
    setOrderID(null);
    setSelectedMaterials([]);
  };
  const createNewOrder = () => {
    closeAndSave();
    navigate("/main/orders");
    localStorage.removeItem("order");
  };

  const allMaterials = orderId ? selectedMaterials : materials;
  return (
    <>
      <Form layout="vertical" className="order-form-main">
        <div className="create_order_box">
          {!orderId ? (
            <div className="create_order_left">
              <h3 style={{ textAlign: "center" }}>Buyurtmalar</h3>
              <div className="create_order_left-box">
                {order?.orders?.map((item, index) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      width: "100%",
                      borderBottom: "1px solid #ddd",
                    }}
                    key={index}
                  >
                    <img
                      style={{ width: "50px", height: "50px" }}
                      src={item.image}
                      alt=""
                    />
                    <b style={{ width: "30%" }}>{item.name}</b>{" "}
                    <b style={{ width: "30%" }}>{item.quantity}-ta</b>{" "}
                    <b style={{ width: "30%" }}>{item.budget.toLocaleString()} so'm</b>{" "}
                    <button
                      style={{
                        background: "#0A3D3A",
                        color: "#fff",
                        padding: "5px 10px",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                        borderRadius: "5px",
                      }}
                      onClick={() => {
                        setOrderID(item._id)
                        setSelectedMaterials(item?.materials)
                      }}>
                      Materiallar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="create_order_right">
              <Input
                placeholder="Mahsulotlarni qidiring..."
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: "100%" }}
                className="warehouse-navbar_inp"
              />
              <div className="form-data-container">
                <h3>Ombor</h3>
                <Button
                  type="primary"
                  onClick={() => closeAndSave()}
                >
                  <TbArrowBackUpDouble />
                </Button>
              </div>
              <div className="create_order_right-box">
                {filteredData?.map((mat) => (
                  <div key={mat._id} className="material-item">
                    <div>
                      <p>{mat.name}</p> |{" "}
                      <p>
                        {mat.quantity} {mat.unit}
                      </p>{" "}
                      <p>
                        1-{mat.unit} narxi: {mat.pricePerUnit.toLocaleString()}
                      </p>
                    </div>
                    <Input
                      min={1}
                      style={{
                        width: "100px",
                        height: "32px",
                        marginRight: "5px",
                      }}
                      size="small"
                      value={inputValues[mat._id] || ""}
                      onChange={(e) =>
                        handleInputChange(mat._id, e.target.value)
                      }
                      className="full-width"
                      placeholder="Miqdori"
                    />
                    <Button loading={isCreating} onClick={() => handleAddMaterial(mat)}>
                      <IoCheckmarkSharp />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="create_order_main">
            <h3>Tanlangan mahsulotlar!</h3>
            <div className="inp_add_pro_myorder">
              {allMaterials?.map((mat, inx) => (
                <div key={inx} className="selected-material-item">
                  <p>
                    <strong style={{ color: "#333" }}>{inx + 1})</strong>{" "}
                    {mat.name}
                  </p>
                  <p>
                    {mat.quantity} {mat.unit}
                  </p>
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
              <Button
                onClick={() => setIsForm(!isForm)}
                className="inp_add_pro_btn"
              >
                {isForm ? <GiTakeMyMoney /> : <MdOutlineAddShoppingCart />}
              </Button>
              <p>
                {isForm
                  ? "Omborda mavjud bo‘lmagan mahsulotni qo‘shish!"
                  : "Mebel uchun sarflanadigan mahsulotlarning umumiy narxi!"}
              </p>
              {isForm ? (
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
                        onChange={(e) =>
                          setFormDataNew((prevData) => ({
                            ...prevData,
                            name: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setFormDataNew((prevData) => ({
                            ...prevData,
                            price: e.target.value,
                          }))
                        }
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
                        onChange={(e) =>
                          setFormDataNew((prevData) => ({
                            ...prevData,
                            quantity: e.target.value,
                          }))
                        }
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
                          !formDataNew?.name ||
                          !formDataNew?.price ||
                          !formDataNew?.quantity ||
                          !formDataNew?.unit
                        }
                      >
                        <MdOutlineAdd />
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ) : (
                <div className="inp_add_pro_box_right">
                  <Form.Item label=" " style={{ width: "200px" }}>
                    <p
                      style={{
                        fontSize: "17px",
                        fontWeight: "bold",
                        color: "#0A3D3A",
                      }}
                    >
                      {totalPrice === 0 ? Price.toLocaleString() : totalPrice.toLocaleString()} so'm
                    </p>
                  </Form.Item>

                  <Form.Item label=" ">
                    <Button
                      onClick={() => createNewOrder()}
                      style={{
                        width: "200px",
                        height: "40px",
                        background: "#0A3D3A",
                      }}
                      type="primary"
                      htmlType="button"
                    >
                      Buyurtmani yaratish
                    </Button>
                  </Form.Item>
                </div>
              )}
            </div>
          </div>
        </div>
      </Form>
    </>
  );
};

export default React.memo(OrderMengement);
