import React, { useState, useEffect } from "react";
import { Popover, Switch, Button, List, message } from "antd";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdOutlineMenu } from "react-icons/md";
import { FiSend } from "react-icons/fi";
import { AiOutlinePlusSquare, AiOutlineDelete } from "react-icons/ai";
import { DeleteOutlined } from "@ant-design/icons";
import { TbClipboardList } from "react-icons/tb";
import ActiveOrders from './ActiveOrders';
import { useUpdateManyStoresMutation } from "../../../context/service/storeApi";
import {
  useCreateMaterialMutation,
  useCreateOrderListMutation,
  useGetOrderListsQuery,
  useDeleteMaterialByIdMutation,
  useUpdateOrderListMutation,
  useDeleteOrderListMutation
} from "../../../context/service/listApi";
import "./style.css";
import SelectWarehouse from "../SelectWarehouse";
import AddItems from "./AddItems";

const Main = () => {
  const [openOrderList, setOpenOrderList] = useState(false);
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState(true);
  const [inputValues, setInputValues] = useState({});
  const [createMaterial, { isLoading: isCreating }] = useCreateMaterialMutation();
  const [createOrderList, { isLoading: isCreatingOrder }] = useCreateOrderListMutation();
  const [deleteMaterialById] = useDeleteMaterialByIdMutation();
  const { data: lists = [] } = useGetOrderListsQuery();
  const [deleteOrderList] = useDeleteOrderListMutation();
  const [updateOrderList] = useUpdateOrderListMutation();
  const newLists = lists?.innerData?.find(order => order.isNew === true) || null;
  const [updateManyStores] = useUpdateManyStoresMutation();

  const handleInputChange = (record, value) => {
    setInputValues(prev => ({ ...prev, [record?._id]: value }));
  };

  const handleAdd = async (record) => {
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
        const newItem = {
          productId: record._id,
          name: record.name,
          category: record.category,
          pricePerUnit: record.pricePerUnit,
          quantity: quantityToAdd,
          unit: record.unit,
          supplier: record.supplier,
        };
        createMaterial({ orderId: newLists?._id, material: newItem }).unwrap();
        message.success("Material qo‘shildi!");
        return [...prevItems, newItem];
      }
    });
    setInputValues({})
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
  }

  const handleUpdateAccountantList = async (id) => {
    try {
      await updateOrderList({ id, updateData: { sentToAccountant: true } }).unwrap();
      message.success("Buyurtma muvaffaqiyatli yuborildi!");
    } catch (error) {
      message.error(error.message || "O‘chirishda xatolik yuz berdi.");
    }
  }

  const handleUpdateAddedToDataList = async (id) => {
    if (!newLists?.materials || newLists.materials.length === 0) {
      message.warning("Yangilash uchun mahsulotlar yo‘q!");
      return;
    }

    try {
      await updateOrderList({ id, updateData: { addedToData: true } }).unwrap();
      await updateManyStores(newLists.materials).unwrap();
      message.success("Mahsulotlar omborga kirib qo‘shildi!");
    } catch (error) {
      message.error(error.message || "Yangilashda xatolik yuz berdi.");
    }
  };

  const handleCloseOrder = async (id) => {
    try {
      await updateOrderList({ id, updateData: { isNew: false } }).unwrap();
      try {
        const mewLists = {
          isNew: true,
          materials: [],
          sentToAccountant: false,
          approvedByAccountant: false,
          addedToData: false,
          isPaid: false
        }
        await createOrderList(mewLists).unwrap();
        message.success("Yangi buyurtma yaratildi!");
      } catch (error) {
        message.warning(error.message || "Buyurtma yaratishda xatolik yuz berdi.");
      }
      message.success("Buyurtma muvaffaqiyatli o‘chirildi!");
    } catch (error) {
      message.error(error.message || "O‘chirishda xatolik yuz berdi.");
    }
  }
  useEffect(() => {
    if (newLists?.isPaid !== undefined) {
      setChecked(newLists.isPaid);
    }
  }, [newLists?.isPaid]);

  const handleUpdateIsPaid = async (id, checked) => {
    setChecked(checked);
    console.log(id, { $set: { isPaid: checked } });
    try {
      await updateOrderList({ id, updateData: { isPaid: checked } }).unwrap();
      message.success(checked ? "Qarzdorlik olindi" : "Qarzdorlik olinmadi");
    } catch (error) {
      message.error(error.message || "O‘zgartirishda xatolik yuz berdi.");
      setChecked(!checked); // Xatolik bo‘lsa, eski holatga qaytarish
    }
  };

  const popoverContent = (
    <div className="popoverContent" >
      <Button disabled={newLists?.sentToAccountant} onClick={() => handleUpdateAccountantList(newLists?._id)} className="list-container-btn-add">
        <FiSend style={{ fontSize: "15px", marginTop: "1px" }} /> {newLists?.sentToAccountant ? "Buhgalterga yuborilgan" : "Buhgalterga yuborish"}
      </Button>

      <Button disabled={newLists?.addedToData} onClick={() => handleUpdateAddedToDataList(newLists?._id)} className="list-container-btn-add">
        <AiOutlinePlusSquare style={{ fontSize: "17px" }} />  {newLists?.addedToData ? "Omborga qo‘shilgan" : "Omborga qo‘shish"}
      </Button>
      <Button onClick={() => handleDeleteList(newLists?._id)} className="list-container-btn-add" danger >
        <AiOutlineDelete style={{ fontSize: "17px" }} /> O‘chirish
      </Button>
    </div>
  );

  return (
    <div className="stor_container">
      <div className="stor_todolist-one">
        <div className="list-container-nav">
          <Button
            className="list-container-btn-list"
            onClick={() => handleCloseOrder(newLists?._id)}
            loading={isCreatingOrder}
            disabled={newLists?.materials?.length <= 1} // Agar newLists null bo‘lsa, materials tekshirilmaydi
          >
            <TbClipboardList /> Yangi list
          </Button>
          {
            newLists?.totalPrice > 0 ?
              <div className="list-outlineMenu-box" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <GiTakeMyMoney size={20} color="#28a745" />
                <span>{newLists?.totalPrice?.toLocaleString("uz-UZ")} so‘m</span>
              </div> : ""
          }

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Switch style={{
              backgroundColor: checked ? "#0A3D3A" : "#ff4d4f", // Yashil yoki qizil rang
            }}
              defaultChecked
              checked={checked}
              onChange={(ch) => handleUpdateIsPaid(newLists?._id, ch)}
            />
            <Popover content={popoverContent} title={<div style={{ textAlign: "center", width: "100%" }}>Harakatlar</div>} trigger="click">
              <Button className="list-outlineMenu" type="primary"><MdOutlineMenu /></Button>
            </Popover>
          </div>
        </div>
        <List
          bordered
          className="list-container"
          dataSource={newLists?.materials}
          renderItem={(item) => (
            <List.Item key={item.productId} className="list-item">
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
              <Button type="text" danger className="delete-btn" onClick={() => handleDelete(item.productId)}>
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
        openOrderList ?
          <div className="stor_todolist">
            <SelectWarehouse sentAccountant={newLists?.sentToAccountant}
              addedToData={newLists?.addedToData} isCreating={isCreating} inputValues={inputValues} handleAdd={handleAdd} handleInputChange={handleInputChange} />
          </div>
          :
          <ActiveOrders />
      }
    </div >
  );
};

export default Main;