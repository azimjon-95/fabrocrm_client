import React, { useState } from "react";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import { LuNewspaper } from "react-icons/lu";
import { Select, Form, Input, Tooltip, Button, message } from "antd";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import {
  useCreateMaterialMutation,
  useGetOrderListsQuery,
} from "../../../context/service/listApi";
import "./style.css";
const { Option } = Select;

const AddItems = ({
  openOrderList,
  setOpenOrderList,
  sentAccountant,
  addedToData,
}) => {
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isCategory, setIsCategory] = useState("");
  const [isUnit, setIsUnit] = useState("");
  const [createMaterial, { isLoading: isCreating }] =
    useCreateMaterialMutation();
  const { data: lists = [] } = useGetOrderListsQuery();
  const newLists =
    lists?.innerData?.find((order) => order.isNew === true) || null;

  const categoryOptions = [
    "Yog‘och va Plitalar",
    "Metal Profillar va Konstruktsiyalar",
    "Mexanizmlar va Slayderlar",
    "Mix va Qotirish Materiallari",
    "Qoplamali Materiallar",
    "Qoplamalar va Bezaklar",
    "Kraska va Yelim Mahsulotlari",
  ].map((label) => ({ label, value: label }));

  const onFinish = async (values) => {
    const uniqueId = `67dl${Math.random().toString(36).substr(2, 9)}new${items?.length + 1
      }`;
    const myNewOrder = {
      productId: uniqueId,
      name: values.name,
      category: isCategory,
      pricePerUnit: values.pricePerUnit,
      quantity: values.quantity,
      unit: isUnit,
      supplier: values.supplier,
    };
    setItems((prevItems) => [...prevItems, myNewOrder]);
    await createMaterial({
      orderId: newLists?._id,
      material: myNewOrder,
    }).unwrap();
    setIsCategory("");
    setIsUnit("");
    message.success("Material qo‘shildi!");
    form.resetFields();
    setIsDisabled(true);
  };

  const handleValuesChange = (_, allValues) => {
    const allFieldsFilled = Object.values(allValues).every(
      (value) => value !== undefined && value !== ""
    );
    setIsDisabled(!allFieldsFilled);
  };

  return (
    <Form
      form={form}
      className="input-container"
      onFinish={onFinish}
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <div className="VscGitPullRequestGoToChanges">
        <Form.Item
          name="name"
          rules={[{ required: true, message: "Tovar nomini kiriting!" }]}
        >
          <Input placeholder="Tovar nomi" />
        </Form.Item>

        <Form.Item
          name="quantity"
          rules={[{ required: true, message: "Miqdorini kiriting!" }]}
        >
          <Input placeholder="Miqdori" type="number" />
        </Form.Item>

        <Form.Item
          name="pricePerUnit"
          rules={[{ required: true, message: "Narxni kiriting!" }]}
        >
          <Input placeholder="Narxi" type="number" />
        </Form.Item>
      </div>

      <div className="VscGitPullRequestGoToChanges">

        <Select
          onChange={(value) => setIsCategory(value)}
          placeholder="Kategoriya tanlang"
          allowClear
          size="large"
          className="additems-sel"
        >
          {categoryOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Select onChange={(value) => setIsUnit(value)} className="additems-sel" placeholder="O‘lchov birligi">
          <Option value="Dona">Dona</Option>
          <Option value="Metr">Metr</Option>
          <Option value="Kg">Kg</Option>
          <Option value="Litr">Litr</Option>
          <Option value="Kvadrat metr">Kvadrat metr</Option>
        </Select>
        <div className="VscGitPullRequestGoToChanges-btns">
          {sentAccountant || addedToData ? (
            <Tooltip title="Yangi mahsulot qo‘shib bo‘lmaydi (Ro‘yxat omborga yoki buxgalteriyaga yuborilgan)">
              <Button
                size="large"
                type="primary"
                disabled={sentAccountant || addedToData}
              >
                <IoMdCheckmarkCircleOutline
                  style={{ fontSize: "20px", marginTop: "2px" }}
                />
              </Button>
            </Tooltip>
          ) : (
            <Button
              size="large"
              style={{
                background: !isDisabled && "#0A3D3A",
                color: !isDisabled && "#fff",
              }}
              type="primary"
              htmlType="submit"
              disabled={isDisabled}
              loading={isCreating}
            >
              <IoMdCheckmarkCircleOutline
                style={{ fontSize: "20px", marginTop: "2px" }}
              />
            </Button>
          )}

          <Button
            onClick={() => setOpenOrderList(!openOrderList)}
            size="large"
            style={{ background: "#0A3D3A", color: "#fff" }}
            type="primary"
          >
            {openOrderList ? <VscGitPullRequestGoToChanges /> : <LuNewspaper />}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default AddItems;
