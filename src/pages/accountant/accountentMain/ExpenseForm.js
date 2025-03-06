import { useState } from "react";
import "./style.css";
import dayjs from "dayjs";
import "moment/locale/uz"; // O'zbek tilini qo'shish
import { message, Button, DatePicker, Input, Radio } from "antd";
import AsyncSelect from "react-select/async"; // Yangi import
import { useCreateExpenseMutation } from "../../../context/service/expensesApi";
import { useUpdateBalanceMutation } from "../../../context/service/balanceApi";
import { useDispatch } from "react-redux";
import { useGetWorkersQuery } from "../../../context/service/worker";
import { setBoolean } from "../../../context/booleanSlice";
import {
  useGetDebtorsQuery,
  useUpdateOrderMutation,
} from "../../../context/service/orderApi";
import {
  useGetAllShopsQuery,
  useUpdateShopMutation,
} from "../../../context/service/newOredShops";

const ExpenseForm = () => {
  const dispatch = useDispatch();
  const [expensePaymentType, setExpensePaymentType] = useState(null); // to'lov turi
  const [expenseAmount, setExpenseAmount] = useState(""); // pul miqdori
  const [expenseDescription, setExpenseDescription] = useState(""); // tavsif
  const [expenseCategory, setExpenseCategory] = useState(""); // xarajat turi
  const [selectedCategory, setSelectedCategory] = useState(""); // tanlangan xarajat turi
  const [returnMony, setReturnMony] = useState(0); // tanlangan xarajat turi
  const [selectedType, setSelectedType] = useState("income"); // tanlangan xarajat turi
  const [selectedDate, setSelectedDate] = useState(dayjs()); // tanlangan xarajat turi
  const [soldoFrom, setSoldoFrom] = useState(dayjs());
  const [soldoTo, setSoldoTo] = useState(dayjs());
  const [usdRate, setUsdRate] = useState("");
  const [amountDollar, setAmount] = useState(0);
  const [updateShop] = useUpdateShopMutation();

  const [createExpense] = useCreateExpenseMutation();
  const [updateBalance] = useUpdateBalanceMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const { data: workers } = useGetWorkersQuery();
  const { data: debtors } = useGetDebtorsQuery();
  const { data: shopsData } = useGetAllShopsQuery();

  const roleTranslations = {
    manager: "Menejer",
    seller: "Sotuvchi",
    director: "Direktor",
    accountant: "Buxgalter",
    warehouseman: "Omborchi",
    deputy: "O'rinbosar",
  };

  // ISHCHILAR ROYHATI
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
      // Har bir material uchun umumiy narxni hisoblash
      const totalAmount = i.materials.reduce(
        (sum, item) => sum + item.pricePerUnit * item.quantity,
        0
      );
      let summ = totalAmount - (i.paid || 0);
      return {
        value: i._id,
        label: `${i.shopName} - ${summ?.toLocaleString()} so'm`,
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
        label: `${d.shopName} - ${d.returnedMoney?.toLocaleString()} so'm`, // Pul formatida chiqarish
      };
    });

  let options = [];
  if (
    selectedType === "expense" &&
    (expenseCategory === "Ish haqi" || expenseCategory === "Avans")
  ) {
    options = workersLists;
  } else if (
    selectedType === "income" &&
    expenseCategory === "Mijoz to‘lovlari"
  ) {
    options = debtorLists;
  } else if (
    selectedType === "expense" &&
    expenseCategory === "Do'kon qarzini to'lash"
  ) {
    options = shops;
  } else if (
    selectedType === "income" &&
    expenseCategory === "Do'kondan qaytarilgan mablag"
  ) {
    options = kirimDokonlar;
  }

  const kirim_royhati = [
    "Mijoz to‘lovlari",
    "Do'kondan qaytarilgan mablag",
    "Investor sarmoyasi",
    "Qaytgan mablag‘",
    "Davlat subsidiyasi",
    "Boshqa daromadlar",
    "Soldo",
  ];

  const chiqim_royhati = [
    "Ish haqi",
    "Avans",
    "Do'kon qarzini to'lash",
    "Ijara",
    "Mebel",
    "Kantselyariya",
    "Xomashyo",
    "Transport",
    "Kommunal to‘lovlar",
    "Reklama va marketing",
    "Texnika ta’miri",
    "Solqlar",
    "Boshqa chiqimlar",
  ];

  // KIRIM CHIQIM turlari
  const kirim_chiqim_royhati = (
    selectedType === "income" ? kirim_royhati : chiqim_royhati
  ).map((i) => ({ value: i, label: i }));

  // malumotlarni yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();

    let amount = parseFloat(expenseAmount?.split(" ")?.join(""));

    const newData =
      expenseCategory === "Ish haqi" || expenseCategory === "Avans"
        ? {
            name: selectedCategory.label,
            amount: amount,
            type: "Chiqim",
            category: expenseCategory,
            description: expenseDescription,
            paymentType: expensePaymentType,
            relevantId: selectedCategory.value,
            date: selectedDate.toDate(),
          }
        : {
            name: selectedCategory.label || expenseCategory,
            amount: amount,
            type: selectedType === "income" ? "Kirim" : "Chiqim",
            category: expenseCategory,
            description: expenseDescription,
            paymentType: expensePaymentType,
            relevantId: selectedCategory.value,
          };

    try {
      const selectedDebtor = debtors?.innerData?.find(
        (item) => item._id === selectedCategory.value
      );
      const currentPaid = selectedDebtor?.paid || 0;
      const expenseResponse = await createExpense(newData).unwrap();

      // Balansni yangilash
      const balanceResponse = await updateBalance({
        amount: amount,
        type: selectedType === "income" ? "add" : "subtract",
        payType: expensePaymentType,
      }).unwrap();

      // Faqat "Mijoz to‘lovlari" bo'lganda orderni yangilash
      let orderResponse = { state: true }; // Default qiymat
      if (expenseCategory === "Mijoz to‘lovlari") {
        orderResponse = await updateOrder({
          id: selectedCategory.value,
          updates: {
            paid: currentPaid + amountDollar || returnMony,
            paidAt: new Date().toISOString(), // Hozirgi vaqtni yuborish
          },
        }).unwrap();
      }

      let res = null;

      if (expenseCategory === "Do'kon qarzini to'lash") {
        const shop = shopsData.innerData?.find(
          (i) => i._id === selectedCategory.value
        );
        const totalAmount = shop.materials.reduce(
          (sum, item) => sum + item.pricePerUnit * item.quantity,
          0
        );

        // Calculate paid and returnedMoney based on returnMony and totalAmount
        let paid = totalAmount;
        let returnedMoney = 0;
        let isPaid = false;

        if (returnMony > totalAmount) {
          returnedMoney = returnMony - totalAmount;
          paid = totalAmount;
        } else {
          paid = returnMony;
        }
        // returnMony, setReturnMony
        if (returnMony >= totalAmount) {
          isPaid = true;
        }

        res = await updateShop({
          id: shop._id,
          body: {
            paid: paid,
            returnedMoney: returnedMoney,
            isPaid: isPaid,
          },
        });
      }

      if (expenseCategory === "Do'kondan qaytarilgan mablag") {
        const shop = shopsData.innerData?.find(
          (i) => i._id === selectedCategory.value
        );

        if (shop) {
          const newDatas = {
            name: shop.shopName,
            amount: amount,
            type: "Kirim",
            category: "Do‘kondan qaytarilgan mablag",
            description: expenseDescription,
            paymentType: expensePaymentType,
            relevantId: shop._id,
          };

          await createExpense(newDatas).unwrap();

          let updatedReturnedMoney = shop.returnedMoney;
          let updatedPaid = shop.paid;

          if (amount > shop.returnedMoney) {
            updatedReturnedMoney = 0;
            updatedPaid -= amount - shop.returnedMoney; // yetmaganini paid dan ayiramiz
          } else {
            updatedReturnedMoney -= amount;
          }

          const updatedShop = {
            ...shop,
            returnedMoney: updatedReturnedMoney,
            paid: updatedPaid,
            isPaid: amount > shop.returnedMoney ? false : true,
          };

          await updateShop({
            id: shop._id,
            body: updatedShop,
          });
        }
      }

      if (expenseResponse?.state && balanceResponse?.state) {
        message.success("Xarajat muvaffaqiyatli qo'shildi!");

        // Formani tozalash
        setExpenseAmount("");
        setExpenseDescription("");
        setExpenseCategory("");
      }
    } catch (err) {
      console.log(err);

      message.error(
        err.data.message || "Xarajatni qo'shishda xatolik yuz berdi."
      );
    } finally {
      setExpenseCategory("");
      setExpensePaymentType("");
      e.target.reset();
      setSelectedCategory("");
      setSelectedType("income");
      setSelectedDate(dayjs());
      setSoldoFrom(dayjs());
      setSoldoTo(dayjs());
      setUsdRate("");
      setReturnMony("");
    }
  };

  // kirim chiqim royhatidan qidirish
  const kirim_chiqim_qidiruv = (inputValue, callback) => {
    const options = kirim_chiqim_royhati
      .filter((cat) => cat.toLowerCase().includes(inputValue.toLowerCase()))
      .map((cat) => ({ value: cat, label: cat }));
    setTimeout(() => {
      callback(options);
    }, 300);
  };

  const kimga_nimaga_qidiruv = (inputValue, callback) => {
    const options = kirim_chiqim_royhati
      .filter((i) => i.label?.toLowerCase().includes(inputValue.toLowerCase()))
      .map((i) => ({ value: i.value, label: i.label }));
    setTimeout(() => {
      callback(options);
    }, 300);
  };

  const paymentTypeControl = [
    { label: "Naqd", value: "Naqd" },
    { label: "Bank orqali", value: "Bank orqali" },
    { label: "$ Dollar", value: "dollar" },
  ];

  const loadPaymentTypeOptions = (inputValue, callback) => {
    const options = paymentTypeControl.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setTimeout(() => {
      callback(options);
    }, 300);
  };

  // Function to format number with commas
  const formatNumber = (value) => {
    if (!value) return "";
    value = value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
  };

  const handlePaymentTypeChange = (value) => {
    dispatch(setBoolean(value.value === "dollar")); // Redux-ga qiymatni uzatish
  };

  const handleAmountChange = (value) => {
    const cleanedValue = value.replace(/\s/g, ""); // Bo'sh joylarni olib tashlash
    const numericValue = Number(cleanedValue); // Stringni numberga o'zgartirish
    setAmount(+usdRate * numericValue);
  };

  const handleChange = (e) => {
    const { value } = e.target;
    const cleanedValue = value.replace(/\s/g, "");
    setReturnMony(cleanedValue);
    handleAmountChange(value);
    const formattedValue = formatNumber(value);
    setExpenseAmount(formattedValue);
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      {/* Xarajat turi */}
      <Radio.Group
        optionType="button"
        buttonStyle="solid"
        size="large"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
      >
        <Radio value="income">Kirim</Radio>
        <Radio value="expense">Chiqim</Radio>
      </Radio.Group>

      {/* QAYERGA | QAYERDAN */}
      <div className="expense-form_select1">
        <AsyncSelect
          cacheOptions
          defaultOptions={kirim_chiqim_royhati}
          loadOptions={kirim_chiqim_qidiruv}
          value={{ value: expenseCategory, label: expenseCategory } || null}
          onChange={(e) => setExpenseCategory(e.value || "")}
          placeholder={selectedType === "income" ? "Qayerdan" : "Qayerga"}
          classNamePrefix="custom-select"
          styles={{
            container: (provided) => ({
              ...provided,
              width: "100%",
              marginBottom: "1rem",
            }),
            // Ochilgan menyu konteyneri uchun uslublar
            menu: (provided) => ({
              ...provided,
              height: "0px", // Menyu balandligini belgilash
              backgroundColor: "#fff",
              borderRadius: "5px",
              marginTop: "0",
              boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)",
            }),
            // Har bir option uchun uslublar
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? "#f0f0f0" : "#fff",
              color: state.isFocused ? "#000" : "#333",
              cursor: "pointer",
              padding: "5px 12px",
            }),
            // Menyu ro'yxati uchun qo'shimcha uslub (paddingni olib tashlash)
            menuList: (provided) => ({
              ...provided,
              padding: "0",
            }),
          }}
        />

        {/* TO'LOV TURI */}
        <AsyncSelect
          cacheOptions
          defaultOptions={paymentTypeControl || "Tulov turi tanlang"}
          loadOptions={loadPaymentTypeOptions}
          value={
            { value: expensePaymentType, label: expensePaymentType } || null
          }
          onChange={(selectedOption) => {
            setExpensePaymentType(selectedOption ? selectedOption.value : null);
            handlePaymentTypeChange(selectedOption);
          }}
          placeholder="Tulov turi tanlang"
          classNamePrefix="custom-select"
          styles={{
            container: (provided) => ({
              ...provided,
              width: "100%",
              marginBottom: "1rem",
            }),
            menu: (provided) => ({
              ...provided,
              maxHeight: "150px",
              backgroundColor: "#fff",
              borderRadius: "5px",
              marginTop: "0",
              boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)",
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? "#f0f0f0" : "#fff",
              color: state.isFocused ? "#000" : "#333",
              cursor: "pointer",
              padding: "5px 12px",
            }),
            menuList: (provided) => ({
              ...provided,
              padding: "0",
            }),
          }}
        />
      </div>

      {/* KIMGA | NIMAGA */}
      {options?.length ? (
        <div className="ish-haqi-avans">
          {["Ish haqi", "Avans"].includes(expenseCategory) && (
            <DatePicker
              picker="month"
              value={selectedDate}
              onChange={(date) => setSelectedDate(dayjs(date))}
            />
          )}

          <AsyncSelect
            cacheOptions
            defaultOptions={options}
            loadOptions={kimga_nimaga_qidiruv}
            value={
              {
                value: selectedCategory?.value,
                label: selectedCategory.label,
              } || null
            }
            onChange={(e) => setSelectedCategory(e)}
            placeholder={selectedType === "income" ? "Qayerdan" : "Qayerga"}
            classNamePrefix="custom-select"
            styles={{
              container: (provided) => ({
                ...provided,
                width: "100%",
                marginBottom: "1rem",
              }),
              menu: (provided) => ({
                ...provided,
                maxHeight: "150px",
                backgroundColor: "#fff",
                borderRadius: "5px",
                marginTop: "0",
                boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#f0f0f0" : "#fff",
                color: state.isFocused ? "#000" : "#333",
                cursor: "pointer",
                padding: "5px 12px",
              }),
              menuList: (provided) => ({
                ...provided,
                padding: "0",
              }),
            }}
          />
        </div>
      ) : (
        ""
      )}
      {["Soldo"]?.includes(expenseCategory) && (
        <div style={{ display: "flex", gap: "10px" }}>
          <DatePicker
            // picker="date"
            value={soldoFrom}
            onChange={(date) => {
              if (date) {
                setSoldoFrom(dayjs(date));
              }
            }}
            format="YYYY-MM-DD"
            placeholder="Dan"
          />
          <DatePicker
            // picker="date"
            value={soldoTo}
            onChange={(date) => {
              if (date) {
                setSoldoTo(dayjs(date));
              }
            }}
            format="YYYY-MM-DD"
            placeholder="Gacha"
          />

          <Input
            placeholder="Pul miqdori"
            value={expenseAmount}
            onChange={handleChange}
          />
        </div>
      )}
      {!["Soldo"].includes(expenseCategory) &&
        (expensePaymentType === "dollar" && expenseAmount !== 0 ? (
          <div
            className="ish-haqi-avans"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div className="ish-haqi-kurs">
              <p>{amountDollar.toLocaleString()} so'm</p>
              <Input
                style={{
                  height: "38px",
                  width: "100%",
                }}
                placeholder="1 dollar kurs narxi"
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
              />
            </div>
            {+usdRate > 0 && (
              <Input
                style={{
                  height: "38px",
                }}
                placeholder="Dollar miqdori..."
                value={expenseAmount}
                onChange={handleChange}
              />
            )}
          </div>
        ) : (
          <Input
            placeholder="Pul miqdori"
            value={expenseAmount}
            onChange={handleChange}
          />
        ))}

      <Input.TextArea
        placeholder="Qo‘shimcha Ma'lumot"
        value={expenseDescription}
        onChange={(e) => setExpenseDescription(e.target.value)}
        rows={6}
        autoSize={{ minRows: 6, maxRows: 10 }} // Avtomatik kengayishi uchun
        style={{
          width: "100%",
          borderRadius: "8px",
          padding: "10px",
          fontSize: "14px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      />

      <Button
        style={{ background: "#0A3D3A" }}
        type="primary"
        htmlType="submit"
      >
        saqlash
      </Button>
    </form>
  );
};

export default ExpenseForm;
