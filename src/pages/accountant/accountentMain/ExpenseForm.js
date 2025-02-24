import { useState } from "react";
import "./style.css";
import "moment/locale/uz"; // O'zbek tilini qo'shish
import { message, Button, Input, Radio } from "antd";
import AsyncSelect from "react-select/async"; // Yangi import
import { useCreateExpenseMutation } from "../../../context/service/expensesApi";
import { useUpdateBalanceMutation } from "../../../context/service/balanceApi";
// workers
import { useGetWorkersQuery } from "../../../context/service/worker";
import { useGetDebtorsQuery } from "../../../context/service/orderApi";

const ExpenseForm = () => {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [isExpense, setIsExpense] = useState(true);
  const [createExpense] = useCreateExpenseMutation();
  const [updateBalance] = useUpdateBalanceMutation();
  const [expensePaymentType, setExpensePaymentType] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [selectedType, setSelectedType] = useState("income");

  const { data: workers } = useGetWorkersQuery();
  const { data: debtors } = useGetDebtorsQuery();

  const workersLists = workers?.innerData.map((worker) => ({
    value: worker._id,
    label: `${worker.firstName} ${worker.lastName} [${
      worker.workerType || worker.role
    }]`,
  }));

  const debtorLists = debtors?.innerData.map((debtor) => ({
    value: debtor._id,
    label: debtor.name,
  }));

  let options = selectedType === "income" ? workersLists : debtorLists;

  // Daromad va xarajat kategoriyalari (expenseSchema dagi enum ga mos)
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
    const formData = {
      name: expenseName,
      amount: parseFloat(expenseAmount),
      type: isIncome ? "Kirim" : "Chiqim",
      category: expenseCategory,
      description: expenseDescription,
      paymentType: expensePaymentType,
    };

    try {
      await createExpense(formData).unwrap();

      // Balansni yangilash
      await updateBalance({
        amount: formData.amount,
        type: formData.type === "Kirim" ? "add" : "subtract",
      }).unwrap();

      message.success("Xarajat muvaffaqiyatli qo'shildi!");
      setExpenseName("");
      setExpenseAmount("");
      setExpenseDescription("");
      setIsIncome(false);
      setIsExpense(true);
      setExpenseCategory("");
    } catch (err) {
      console.log(err);

      message.error("Xarajatni qo'shishda xatolik yuz berdi.");
    } finally {
      setExpenseCategory("");
      setExpensePaymentType("");
      e.target.reset();
    }
  };

  // Type (Kirim/Chiqim) o'zgarganda kategoriya tanlovini tozalash

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
    { label: "Naqd", value: "Naqd" },
    { label: "Karta orqali", value: "Karta orqali" },
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

      {/* <Input
        type="text"
        placeholder="Xarajat nomi"
        value={expenseName}
        onChange={(e) => setExpenseName(e.target.value)}
      /> */}

      {/* <Input
        type="number"
        placeholder="Miqdori"
        value={expenseAmount}
        onChange={(e) => setExpenseAmount(e.target.value)}
      /> */}

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
            setExpensePaymentType(selectedOption ? selectedOption.value : "")
          }
          placeholder="Tulov turi tanlang"
          // menuPlacement="top"
          classNamePrefix="custom-select"
          styles={{
            container: (provided) => ({
              ...provided,
              width: "100%",
              marginBottom: "1rem",
            }),
            menu: (provided) => ({
              ...provided,
              maxHeight: "150px", // Menyu maksimal balandligi, scroll qo'llanadi
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
      <AsyncSelect
        cacheOptions
        defaultOptions={options}
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
      <Input.TextArea
        placeholder="Qo‘shimcha Ma'lumot"
        value={expenseDescription}
        onChange={(e) => setExpenseDescription(e.target.value)}
        rows={4}
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
