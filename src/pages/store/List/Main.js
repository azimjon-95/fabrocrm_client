import React, { useState, useEffect } from "react";
import { Button, List, message } from "antd";
import { FiSend } from "react-icons/fi"; import { FaPlus } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { DeleteOutlined } from "@ant-design/icons";
import ActiveOrders from "./ActiveOrders";
import {
  useCreateMaterialMutation,
  useCreateOrderListMutation,
  useDeleteMaterialByIdMutation,
  useUpdateOrderListMutation,
  useDeleteOrderListMutation,
  useGetNewOrderListsQuery,
} from "../../../context/service/listApi";
import "./style.css";
import SelectWarehouse from "../SelectWarehouse";
import AddItems from "./AddItems";
import socket from "../../../socket";

const Main = () => {
  const [openOrderList, setOpenOrderList] = useState(false);
  // const [setItems] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [createMaterial, { isLoading: isCreating }] =
    useCreateMaterialMutation();
  const [createOrderList] =
    useCreateOrderListMutation();
  const [deleteMaterialById] = useDeleteMaterialByIdMutation();
  const [deleteOrderList] = useDeleteOrderListMutation();
  const [updateOrderList] = useUpdateOrderListMutation();

  const { data: data = [], refetch } = useGetNewOrderListsQuery();

  const newLists = data?.innerData || null;
  console.log(newLists);

  useEffect(() => {
    socket.on("newMaterial", refetch);
    return () => {
      socket.off("newMaterial");
    };
  }, [refetch]);

  const handleInputChange = (record, value) => {
    setInputValues((prev) => ({ ...prev, [record?._id]: value }));
  };

  const [items, setItems] = useState([]);

  const handleAdd = async (record) => {
    if (!record?._id) {
      return message.warning("Maxsulotlar ro‘yxatini yarating!");
    }

    const quantityToAdd = inputValues[record._id] || 0;
    const existingItemIndex = items.findIndex((item) => item.name === record.name);

    if (existingItemIndex !== -1) {
      // Mahsulot mavjud bo‘lsa, faqat quantity ni yangilaymiz
      setItems((prevItems) =>
        prevItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: quantityToAdd } : item
        )
      );
    } else {
      // Yangi mahsulot qo‘shamiz
      const newItem = {
        productId: record._id,
        name: record.name,
        category: record.category,
        pricePerUnit: record.pricePerUnit,
        quantity: quantityToAdd,
        unit: record.unit,
        supplier: record.supplier,
      };

      await createMaterial({ orderId: newLists?._id, material: newItem }).unwrap();
      message.success("Material qo‘shildi!");

      setItems((prevItems) => [...prevItems, newItem]);
    }

    setInputValues({});
  };



  const handleDelete = (id) => {
    deleteMaterialById({ orderId: newLists?._id, materialId: id }).unwrap();
    message.success("Material o‘chirildi!");
  };

  const handleDeleteList = async (id) => {
    try {
      await deleteOrderList(id).unwrap();
      message.success("Buyurtma muvaffaqiyatli o‘chirildi!");
    } catch (error) {
      message.error(error.message || "O‘chirishda xatolik yuz berdi.");
    }
  };


  const handleCloseOrder = async () => {
    try {
      // 
      try {
        const mewLists = {
          isNew: true,
          materials: [],
          sentToAccountant: false,
          approvedByAccountant: false,
          addedToData: false,
          isPaid: false,
        };
        await createOrderList(mewLists).unwrap();
        if (newLists?._id) {
          await updateOrderList({ id: newLists?._id, updateData: { isNew: false } }).unwrap();
        }

        message.success("Yangi buyurtma yaratildi!");
      } catch (error) {
        console.log(error);
        message.warning(
          error.message || "Buyurtma yaratishda xatolik yuz berdi."
        );
      }
      message.success("Buyurtma muvaffaqiyatli o‘chirildi!");
    } catch (error) {
      message.error(error.message || "O‘chirishda xatolik yuz berdi.");
    }
  };

  const handleUpdateAccountantList = async (id) => {
    try {
      let res = await updateOrderList({
        id,
        updateData: { sentToAccountant: true },
      }).unwrap();
      handleCloseOrder();
      refetch()
      message.success(res.data.message);
    } catch (error) {
      message.error(error?.data?.message);
    }
  };
  return (
    <div className="stor_container">
      <div className="stor_todolist-one">
        <div className="list-container-nav">

          <Button
            disabled={!newLists?._id || newLists?.sentToAccountant}
            onClick={() => handleUpdateAccountantList(newLists?._id)}
          >
            <FiSend style={{ fontSize: "15px", marginTop: "1px" }} />{" "}
            {newLists?.sentToAccountant
              ? "Buhgalterga yuborilgan"
              : "Buhgalterga yuborish"}
          </Button>
          {
            !newLists?._id &&
            <Button
              disabled={newLists?.addedToData}
              onClick={() => handleCloseOrder(newLists?._id)}
            >
              <FaPlus style={{ fontSize: "17px" }} />{" "}
              Yangi List
            </Button>
          }

          <Button
            disabled={!newLists?._id || newLists?.addedToData && newLists?.sentToAccountant}
            onClick={() => handleDeleteList(newLists?._id)}
            danger
          >
            <AiOutlineDelete style={{ fontSize: "17px" }} /> O‘chirish
          </Button>
        </div>
        <List
          bordered
          className="list-container"
          dataSource={newLists?.materials}
          renderItem={(item) => (
            <List.Item key={item.productId} className="list-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">
                  {item.quantity} {item.unit}
                </span>
                <span className="item-category">
                  {item.category.length > 7
                    ? item.category.slice(0, 7) + "..."
                    : item.category}
                </span>

                <span className="item-price">
                  {item.pricePerUnit.toLocaleString("uz-UZ")} so‘m
                </span>
                <span className="item-price">
                  {(item.pricePerUnit * item.quantity).toLocaleString("uz-UZ")}{" "}
                  so‘m
                </span>
              </div>
              <Button
                type="text"
                danger
                className="delete-btn"
                disabled={newLists?.sentToAccountant}
                onClick={() => handleDelete(item.productId)}
              >
                <DeleteOutlined />
              </Button>
            </List.Item>
          )}
        />
        <AddItems
          sentAccountant={newLists?.sentToAccountant}
          addedToData={newLists?.addedToData}
          openOrderList={openOrderList}
          setOpenOrderList={setOpenOrderList}
        />
      </div>
      {
        openOrderList ? (
          <div className="stor_todolist">
            <SelectWarehouse
              sentAccountant={newLists?.sentToAccountant}
              addedToData={newLists?.addedToData}
              isCreating={isCreating}
              inputValues={inputValues}
              handleAdd={handleAdd}
              handleInputChange={handleInputChange}
            />
          </div>
        ) : (
          <ActiveOrders />
        )
      }
    </div >
  );
};

export default Main;




