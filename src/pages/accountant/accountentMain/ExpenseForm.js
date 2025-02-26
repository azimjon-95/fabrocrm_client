import { useState } from "react";
import "./style.css";
import dayjs from "dayjs";
import "moment/locale/uz"; // O'zbek tilini qo'shish
import { message, Button, DatePicker, Input, Radio } from "antd";
import AsyncSelect from "react-select/async"; // Yangi import
import { useCreateExpenseMutation } from "../../../context/service/expensesApi";
import { useUpdateBalanceMutation } from "../../../context/service/balanceApi";
// workers
import { useGetWorkersQuery } from "../../../context/service/worker";
import { useGetDebtorsQuery, useUpdateOrderMutation } from "../../../context/service/orderApi";

const ExpenseForm = () => {
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [createExpense] = useCreateExpenseMutation();
  const [updateBalance] = useUpdateBalanceMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [expensePaymentType, setExpensePaymentType] = useState(null);
  const [expenseCategory, setExpenseCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("income");
  const { data: workers } = useGetWorkersQuery();
  const { data: debtors } = useGetDebtorsQuery();

  const [selectedDate, setSelectedDate] = useState(dayjs());


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
    label: `${worker.firstName} ${worker.lastName} [${worker.workerType || roleTranslations[worker.role]}]`,
  }));

  const debtorLists = debtors?.innerData.map((debtor) => ({
    value: debtor._id,
    label: debtor.name,
  }));

  const shoops = [];

  let options = [];
  if (selectedType !== "income" && (expenseCategory === "Ish haqi" || expenseCategory === "Avans")) {
    options = workersLists;
  } else if (selectedType === "income" && expenseCategory === "Mijoz to‘lovlari") {
    options = debtorLists;
  } else if (selectedType !== "income" && expenseCategory === "Xomashyo") {
    options = shoops;
  }

  const incomeCategories = [
    "Mijoz to‘lovlari",
    "Investor sarmoyasi",
    "Qaytgan mablag‘",
    "Davlat subsidiyasi",
    "Boshqa daromadlar",
  ];

  const expenseCategories = [
    "Ish haqi",
    "Avans",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newData =
      (expenseCategory === "Ish haqi" || expenseCategory === "Avans")
        ? {
          name: selectedCategory.label,
          amount: parseFloat(expenseAmount),
          type: "Chiqim",
          category: expenseCategory,
          description: expenseDescription,
          paymentType: expensePaymentType,
          relevantId: selectedCategory.value,
          date: selectedDate.toDate(),
        }
        : {
          name: selectedCategory.label,
          amount: parseFloat(expenseAmount),
          type: isIncome ? "Kirim" : "Chiqim",
          category: expenseCategory,
          description: expenseDescription,
          paymentType: expensePaymentType,
          relevantId: selectedCategory.value,
        };

    try {
      // `debtors?.innerData` ichidan `_id` `selectedCategory.value` ga teng bo'lgan elementni topamiz
      const selectedDebtor = debtors?.innerData?.find(item => item._id === selectedCategory.value);
      const currentPaid = selectedDebtor?.paid || 0;
      // Xarajat qo'shish
      const expenseResponse = await createExpense(newData).unwrap();

      // Balansni yangilash
      const balanceResponse = await updateBalance({
        amount: parseFloat(expenseAmount),
        type: expensePaymentType === "Kirim" ? "add" : "subtract",
        payType: expensePaymentType
      }).unwrap();

      // Faqat "Mijoz to‘lovlari" bo'lganda orderni yangilash
      let orderResponse = { state: true }; // Default qiymat
      if (expenseCategory === "Mijoz to‘lovlari") {
        orderResponse = await updateOrder({
          id: selectedCategory.value,
          updates: {
            paid: currentPaid + parseFloat(expenseAmount),
            paidAt: new Date().toISOString(), // Hozirgi vaqtni yuborish
          },
        }).unwrap();
      }

      // Barcha operatsiyalar muvaffaqiyatli bo'lsa
      if (expenseResponse?.state && balanceResponse?.state && orderResponse?.state) {
        message.success("Xarajat muvaffaqiyatli qo'shildi!");

        // Formani tozalash
        setExpenseAmount("");
        setExpenseDescription("");
        setIsIncome(false);
        setExpenseCategory("");
      }
    } catch (err) {
      message.error("Xarajatni qo'shishda xatolik yuz berdi.");
    } finally {
      setExpenseCategory("");
      setExpensePaymentType("");
      e.target.reset();
    }
  };

  // AsyncSelect loadOptions funksiyasi
  const loadCategoryOptions = (inputValue, callback) => {
    const options = (isIncome ? incomeCategories : expenseCategories)
      .filter((cat) => cat.toLowerCase().includes(inputValue.toLowerCase()))
      .map((cat) => ({ value: cat, label: cat }));
    setTimeout(() => {
      callback(options);
    }, 300);
  };

  // Default options uchun
  const defaultCategoryOptions = (
    selectedType === "income" ? incomeCategories : expenseCategories
  ).map((cat) => ({ value: cat, label: cat }));

  const paymentTypeControl = [
    { label: "Naqd", value: "cash" },
    { label: "Bank orqali", value: "bankTransfer" },
    { label: "$ Dollar", value: "dollarBalance" },
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

  // Handle input change and format value
  const handleChange = (e) => {
    const { value } = e.target;
    const formattedValue = formatNumber(value);
    setExpenseAmount(formattedValue);
  };


  return (
    <form style={{ padding: "0 10px" }} onSubmit={handleSubmit}>
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

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* QAYERGA | QAYERDAN */}
        <AsyncSelect
          cacheOptions
          defaultOptions={defaultCategoryOptions}
          loadOptions={loadCategoryOptions}
          value={
            expenseCategory
              ? { value: expenseCategory, label: expenseCategory }
              : null
          }
          onChange={(selectedOption) =>
            setExpenseCategory(selectedOption ? selectedOption.value : "")
          }
          placeholder={selectedType === "income" ? "Qayerdan" : "Qayerga"}
          // menuPlacement="top"
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
          defaultOptions={paymentTypeControl}
          loadOptions={loadPaymentTypeOptions}
          value={
            expensePaymentType
              ? { value: expensePaymentType, label: expensePaymentType }
              : null
          }
          onChange={(selectedOption) =>
            setExpensePaymentType(selectedOption ? selectedOption.value : null)
          }
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
      {
        options?.length ?
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
              loadOptions={loadCategoryOptions}
              value={
                selectedCategory?.value
                  ? { value: selectedCategory?.value, label: selectedCategory.label }
                  : null
              }
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setSelectedCategory({
                    value: selectedOption.value,
                    label: selectedOption.label,
                  });
                } else {
                  setSelectedCategory({ value: "", label: "" });
                }
              }}
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
          : ""
      }
      <Input
        placeholder="Pul miqdori"
        value={expenseAmount}
        onChange={handleChange}
      />


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
