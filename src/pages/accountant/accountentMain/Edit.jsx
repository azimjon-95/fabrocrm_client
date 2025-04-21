import React, { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { Input, Button, message, Select } from "antd";
import { useUpdateExpenseMutation } from "../../../context/service/expensesApi";
import "./edit.css";
import { useGetWorkersQuery } from "../../../context/service/worker";
import { useGetDebtorsQuery } from "../../../context/service/orderApi";
import { useGetAllShopsQuery } from "../../../context/service/newOredShops";
import { useGetIsPaidFalseQuery } from "../../../context/service/mydebtService";

function Edit({ data }) {
  const [form] = Form.useForm();
  const [updateExpense, { isLoading }] = useUpdateExpenseMutation();
  const { data: workers } = useGetWorkersQuery();
  const { data: debtors } = useGetDebtorsQuery();
  const { data: shopsData } = useGetAllShopsQuery();
  const { data: myDebtsData } = useGetIsPaidFalseQuery();

  const [expenseCategory, setExpenseCategory] = useState(data.category);

  useEffect(() => {
    form.setFieldsValue(data);
    setExpenseCategory(data.category);
  }, [data]);

  const onFinish = async (values) => {
    console.log(values);

    try {
      await updateExpense({
        id: data._id,
        expenseData: { ...data, ...values },
      });
      message.success("Muvaffaqiyatli yangilandi");
    } catch (error) {
      console.log(error);

      message.error("Xatolik sodir bo'ldi");
    }
  };

  // ISHCHILAR ROYHATI
  const roleTranslations = {
    manager: "Menejer",
    seller: "Sotuvchi",
    director: "Direktor",
    accountant: "Buxgalter",
    warehouseman: "Omborchi",
    deputy: "O'rinbosar",
  };

  const workersLists = workers?.innerData.map((worker) => ({
    value: worker._id,
    label: `${worker.firstName} ${worker.lastName} [${
      worker.workerType || roleTranslations[worker.role]
    }]`,
  }));

  // QARZDORLAR ROYHATI
  const debtorLists = debtors?.innerData.map((debtor) => ({
    value: debtor._id,
    label: debtor.customer.fullName,
  }));

  // chiqim DO'KONLAR RO'YHATI
  const shops = shopsData?.innerData
    ?.filter(
      (i) => i.isPaid === false && !i.shopName.toLowerCase().includes("soldo")
    )
    .map((i) => {
      return {
        value: i._id,
        label: i.shopName,
      };
    });

  // kirim do'konlar ro'yxati
  const kirimDokonlar = shopsData?.innerData
    ?.filter(
      (i) => i.isPaid === true && !i.shopName.toLowerCase().includes("soldo")
    )
    .map((d) => {
      return {
        value: d._id,
        label: d.shopName, // Pul formatida chiqarish
      };
    });

  const myDebtorLists = myDebtsData?.innerData?.map((debtor) => {
    return {
      value: debtor._id,
      label: debtor.name,
    };
  });

  let options = [];
  if (expenseCategory === "Ish haqi" || expenseCategory === "Avans") {
    options = workersLists;
  } else if (expenseCategory === "Mijoz to‘lovlari") {
    options = debtorLists;
  } else if (expenseCategory === "Do'kon qarzini to'lash") {
    options = shops;
  } else if (expenseCategory === "Do'kondan qaytarilgan mablag") {
    options = kirimDokonlar;
  } else if (expenseCategory === "Qarzni to'lash") {
    options = myDebtorLists;
  }

  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="category" label="Kategoriya">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="type" label="Turi">
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Bog'langan shaxs">
        <Input
          disabled
          value={
            options?.find((option) => option.value === data.relevantId)?.label
          }
        />
      </Form.Item>

      <Form.Item name="name" label="Nomi">
        <Input />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="amount" label="Miqdori">
            <Input type="number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="paymentType" label="To'lov turi">
            <Select>
              <Select.Option value="cash">Naqd</Select.Option>
              <Select.Option value="card">Karta</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Izoh">
        <Input.TextArea />
      </Form.Item>

      <Button type="primary" htmlType="submit" target="">
        {isLoading ? "Yuklanmoqda..." : "Yangilash"}
      </Button>
    </Form>
  );
}

export default Edit;
