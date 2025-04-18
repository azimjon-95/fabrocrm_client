import { useEffect, useRef, useState } from "react";
import "./style.css";
import dayjs from "dayjs";
import "moment/locale/uz";
import { message, Button, DatePicker, Input, Radio } from "antd";
import AsyncSelect from "react-select/async";
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
import {
  usePostMyDebtMutation,
  useUpdateMyDebtMutation,
  useGetmyDebtsQuery,
} from "../../../context/service/mydebtService";
import socket from "../../../socket";
import { useGetBalanceQuery } from "../../../context/service/balanceApi";

const ExpenseForm = () => {
  const dispatch = useDispatch();

  // Default state values
  const [expensePaymentType, setExpensePaymentType] = useState("Naqd");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [returnMony, setReturnMony] = useState(0);
  const [selectedType, setSelectedType] = useState("income");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [soldoFrom, setSoldoFrom] = useState(dayjs());
  const [soldoTo, setSoldoTo] = useState(dayjs());
  const [usdRate, setUsdRate] = useState("");
  const [amountDollar, setAmountDollar] = useState(0);

  // API hooks
  const [createExpense] = useCreateExpenseMutation();
  const [updateBalance] = useUpdateBalanceMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [updateShop] = useUpdateShopMutation();
  const [postMyDebt] = usePostMyDebtMutation();
  const [updateMyDebt] = useUpdateMyDebtMutation();
  const { data: workers } = useGetWorkersQuery();
  const { data: debtors } = useGetDebtorsQuery();
  const { data: shopsData } = useGetAllShopsQuery();
  const { data: myDebtsAll, refetch } = useGetmyDebtsQuery();
  const { data: balance } = useGetBalanceQuery();

  const balancValues = balance?.innerData || {};

  // Modal and refs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Handle outside clicks to close modal
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.input?.contains(event.target)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isModalOpen]);

  // Socket for myDebts
  useEffect(() => {
    socket.on("updateMyDebt", refetch);
    return () => socket.off("updateMyDebt");
  }, [refetch]);

  // Role translations
  const roleTranslations = {
    manager: "Menejer",
    seller: "Sotuvchi",
    director: "Direktor",
    accountant: "Buxgalter",
    warehouseman: "Omborchi",
    deputy: "O'rinbosar",
  };

  // Lists for selects
  const workersLists = workers?.innerData?.map((worker) => ({
    value: worker._id,
    label: `${worker.firstName} ${worker.lastName} [${worker.workerType || roleTranslations[worker.role]
      }]`,
  })) || [];

  const debtorLists = debtors?.innerData?.map((debtor) => ({
    value: debtor._id,
    label: debtor.customer.fullName,
  })) || [];

  const shops = shopsData?.innerData
    ?.filter(
      (i) => !i.isPaid && !i.shopName.toLowerCase().includes("soldo")
    )
    ?.map((i) => {
      const totalAmount = i.materials.reduce(
        (sum, item) => sum + item.pricePerUnit * item.quantity,
        0
      );
      const summ = totalAmount - (i.paid || 0);
      return {
        value: i._id,
        label: `${i.shopName} - ${summ.toLocaleString()} so'm`,
      };
    }) || [];

  const kirimDokonlar = shopsData?.innerData
    ?.filter(
      (i) => i.isPaid && !i.shopName.toLowerCase().includes("soldo")
    )
    ?.map((d) => ({
      value: d._id,
      label: `${d.shopName} - ${d.returnedMoney?.toLocaleString()} so'm`,
      name: d.shopName,
    })) || [];

  const myDebtorLists = myDebtsAll?.innerData?.map((debtor) => ({
    value: debtor._id,
    label: `${debtor.name} ${debtor.remainingAmount?.toLocaleString()} so'm`,
  })) || [];

  // Options based on category
  const options =
    selectedType === "expense" && ["Ish haqi", "Avans"].includes(expenseCategory)
      ? workersLists
      : selectedType === "income" && expenseCategory === "Mijoz to‘lovlari"
        ? debtorLists
        : selectedType === "expense" && expenseCategory === "Do'kon qarzini to'lash"
          ? shops
          : selectedType === "income" &&
            expenseCategory === "Do'kondan qaytarilgan mablag"
            ? kirimDokonlar
            : selectedType === "expense" && expenseCategory === "Qarzni to'lash"
              ? myDebtorLists
              : [];

  // Income and expense categories
  const kirim_royhati = [
    "Mijoz to‘lovlari",
    "Do'kondan qaytarilgan mablag",
    "Qarz olish",
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
    "Qarzni to'lash",
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

  const kirim_chiqim_royhati = (
    selectedType === "income" ? kirim_royhati : chiqim_royhati
  ).map((i) => ({ value: i, label: i }));

  const paymentTypeControl = [
    { label: "Naqd", value: "Naqd" },
    { label: "Bank orqali", value: "Bank orqali" },
    { label: "$ Dollar", value: "dollar" },
  ];

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(expenseAmount?.split(" ")?.join("") || 0);
    if (!amount) {
      message.error("Pul miqdori kiritilmadi!");
      return;
    }

    const newData =
      ["Ish haqi", "Avans"].includes(expenseCategory)
        ? {
          name: selectedCategory?.label || expenseCategory,
          amount,
          type: "Chiqim",
          category: expenseCategory,
          description: expenseDescription,
          paymentType: expensePaymentType,
          relevantId: selectedCategory?.value,
          date: selectedDate.toDate(),
        }
        : {
          name: selectedCategory?.label || expenseCategory,
          amount,
          type: selectedType === "income" ? "Kirim" : "Chiqim",
          category: expenseCategory,
          description: expenseDescription,
          paymentType: expensePaymentType,
          relevantId: selectedCategory?.value,
        };

    if (expenseCategory === "Qarz olish") {
      const { relevantId, ...newData1 } = newData;
      newData = newData1;
    }

    try {
      // Balance checks
      if (newData.paymentType === "dollar" && newData.type === "Chiqim") {
        if (balancValues.dollarBalance < newData.amount) {
          return message.warning("Dollar balansingiz yetarli emas");
        }
      } else if (
        newData.paymentType === "Bank orqali" &&
        newData.type === "Chiqim"
      ) {
        if (balancValues.bankTransferBalance < newData.amount) {
          return message.warning("Hisob raqamda yetarli mablag' mavjud emas");
        }
      } else if (newData.paymentType === "Naqd" && newData.type === "Chiqim") {
        if (balancValues.cashBalance < newData.amount) {
          return message.warning("Hisob raqamda yetarli mablag' mavjud emas");
        }
      }

      const expenseResponse = await createExpense(newData).unwrap();
      const balanceResponse = await updateBalance({
        amount,
        type: selectedType === "income" ? "add" : "subtract",
        payType: expensePaymentType,
      }).unwrap();

      // Handle debt creation or update
      if (expenseCategory === "Qarz olish") {
        const checkDebt = myDebtsAll?.innerData?.find(
          (i) => i.name?.toLowerCase() === selectedCategory?.label?.toLowerCase()
        );
        const debtData = {
          amount,
          description: expenseDescription,
          name: selectedCategory?.label || "",
          type: expensePaymentType,
          isPaid: false,
        };

        if (checkDebt) {
          await updateMyDebt({ id: checkDebt._id, body: debtData }).unwrap();
          message.success("Qarz muvaffaqiyatli yangilandi");
        } else {
          await postMyDebt({ body: debtData }).unwrap();
          message.success("Qarz muvaffaqiyatli yaratildi");
        }
      }

      // Handle debt payment
      if (expenseCategory === "Qarzni to'lash") {
        const debt = myDebtsAll?.innerData?.find(
          (i) => i._id === selectedCategory?.value
        );
        if (!debt) {
          message.error("Qarzdor topilmadi");
          return;
        }

        const debtData = {
          amount,
          description: expenseDescription,
          name: debt.name,
          type: expensePaymentType,
          isPaid: true,
        };

        await updateMyDebt({ id: debt._id, body: debtData }).unwrap();
        message.success("Qarz muvaffaqiyatli to'landi");
      }

      // Handle customer payments
      if (expenseCategory === "Mijoz to‘lovlari") {
        const selectedDebtor = debtors?.innerData?.find(
          (item) => item._id === selectedCategory?.value
        );
        const currentPaid = selectedDebtor?.paid || 0;
        await updateOrder({
          id: selectedCategory?.value,
          updates: {
            paid:
              currentPaid + (amountDollar > 0 ? amountDollar : returnMony),
            paidAt: new Date().toISOString(),
          },
        }).unwrap();
      }

      // Handle shop debt payment
      if (expenseCategory === "Do'kon qarzini to'lash") {
        const shop = shopsData?.innerData?.find(
          (i) => i._id === selectedCategory?.value
        );
        const totalAmount = shop?.materials.reduce(
          (sum, item) => sum + item.pricePerUnit * item.quantity,
          0
        );

        let paid = totalAmount;
        let returnedMoney = 0;
        let isPaid = false;

        if (returnMony > totalAmount) {
          returnedMoney = returnMony - totalAmount;
          paid = totalAmount;
        } else {
          paid = returnMony;
        }

        if (returnMony >= totalAmount) {
          isPaid = true;
        }

        await updateShop({
          id: shop._id,
          body: { paid, returnedMoney, isPaid },
        }).unwrap();
      }

      // Handle returned money from shop
      if (expenseCategory === "Do'kondan qaytarilgan mablag") {
        const shop = shopsData?.innerData?.find(
          (i) => i._id === selectedCategory?.value
        );
        if (shop) {
          const newDatas = {
            name: shop.shopName,
            amount,
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
            updatedPaid -= amount - shop.returnedMoney;
          } else {
            updatedReturnedMoney -= amount;
          }

          await updateShop({
            id: shop._id,
            body: {
              returnedMoney: updatedReturnedMoney,
              paid: updatedPaid,
              isPaid: amount > shop.returnedMoney ? false : true,
            },
          }).unwrap();
        }
      }

      if (expenseResponse?.state && balanceResponse?.state) {
        message.success("Xarajat muvaffaqiyatli qo'shildi!");
        resetForm(e);
      }
    } catch (err) {
      console.error(err);
      message.error(err.message || "Xarajatni qo'shishda xatolik yuz berdi.");
    }
  };

  // Reset form
  const resetForm = (e) => {
    e.target.reset();
    setExpenseAmount("");
    setExpenseDescription("");
    setExpenseCategory("");
    setExpensePaymentType("Naqd");
    setSelectedCategory(null);
    setSelectedType("income");
    setSelectedDate(dayjs());
    setSoldoFrom(dayjs());
    setSoldoTo(dayjs());
    setUsdRate("");
    setReturnMony(0);
    setAmountDollar(0);
  };

  // Search handlers
  const kirim_chiqim_qidiruv = (inputValue, callback) => {
    const filtered = kirim_chiqim_royhati.filter((cat) =>
      cat.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setTimeout(() => callback(filtered), 300);
  };

  const kimga_nimaga_qidiruv = (inputValue, callback) => {
    const filtered = options.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setTimeout(() => callback(filtered), 300);
  };

  const loadPaymentTypeOptions = (inputValue, callback) => {
    const filtered = paymentTypeControl.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setTimeout(() => callback(filtered), 300);
  };

  // Input handlers
  const formatNumber = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
  };

  const handleAmountChange = (value) => {
    const cleanedValue = value.replace(/\s/g, "");
    const numericValue = Number(cleanedValue);
    setAmountDollar(usdRate ? usdRate * numericValue : 0);
  };

  const handleChange = (e) => {
    const { value } = e.target;
    const cleanedValue = value.replace(/\s/g, "");
    setReturnMony(cleanedValue);
    handleAmountChange(value);
    setExpenseAmount(formatNumber(value));
  };

  const handlePaymentTypeChange = (value) => {
    dispatch(setBoolean(value?.value === "dollar"));
    setExpensePaymentType(value?.value || "Naqd");
  };

  // Select styles
  const selectStyles = {
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
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      {/* Income/Expense Type */}
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

      {/* Category and Payment Type */}
      <div className="expense-form_select1">
        <AsyncSelect
          cacheOptions
          defaultOptions={kirim_chiqim_royhati}
          loadOptions={kirim_chiqim_qidiruv}
          value={
            expenseCategory
              ? { value: expenseCategory, label: expenseCategory }
              : null
          }
          onChange={(e) => setExpenseCategory(e?.value || "")}
          placeholder={"Kategoriyani tanlang"}
          classNamePrefix="custom-select"
          styles={selectStyles}
        />
        <AsyncSelect
          cacheOptions
          defaultOptions={paymentTypeControl}
          loadOptions={loadPaymentTypeOptions}
          value={
            expensePaymentType
              ? { value: expensePaymentType, label: expensePaymentType }
              : { value: "Naqd", label: "Naqd" }
          }
          onChange={handlePaymentTypeChange}
          placeholder="To'lov turi tanlang"
          classNamePrefix="custom-select"
          styles={selectStyles}
        />
      </div>

      {/* Relevant Entity */}
      {options.length > 0 && (
        <div className="ish-haqi-avans">
          {["Ish haqi", "Avans"].includes(expenseCategory) && (
            <DatePicker
              picker="month"
              value={selectedDate}
              onChange={(date) => setSelectedDate(date ? dayjs(date) : dayjs())}
            />
          )}
          <AsyncSelect
            cacheOptions
            defaultOptions={options}
            loadOptions={kimga_nimaga_qidiruv}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e || null)}
            placeholder={selectedType === "income" ? "Mijoz to‘lovlari" : "Ish haqi"}
            classNamePrefix="custom-select"
            styles={selectStyles}
          />
        </div>
      )}

      {/* Debt Source */}
      {expenseCategory === "Qarz olish" && (
        <div className="kimdandebt">
          <Input
            ref={inputRef}
            className="debt-input"
            placeholder="Kimdan"
            value={selectedCategory?.label || ""}
            onChange={(e) =>
              setSelectedCategory({
                value: e.target.value,
                label: e.target.value,
              })
            }
            onClick={() => setIsModalOpen(true)}
          />
          <div
            className={`kimdandebt_modal ${isModalOpen ? "open" : ""}`}
            ref={modalRef}
          >
            <ul>
              {myDebtsAll?.innerData?.map((value) => (
                <li
                  key={value._id}
                  onClick={() => {
                    setSelectedCategory({
                      value: value._id,
                      label: value.name,
                    });
                    setIsModalOpen(false);
                  }}
                >
                  {value.name}
                  <span className="amount">
                    {value.remainingAmount?.toLocaleString("uz-UZ")} so‘m
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Soldo Date Range */}
      {expenseCategory === "Soldo" && (
        <div style={{ display: "flex", gap: "10px" }}>
          <DatePicker
            value={soldoFrom}
            onChange={(date) => setSoldoFrom(date ? dayjs(date) : dayjs())}
            format="YYYY-MM-DD"
            placeholder="Dan"
          />
          <DatePicker
            value={soldoTo}
            onChange={(date) => setSoldoTo(date ? dayjs(date) : dayjs())}
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

      {/* Amount Input */}
      {expenseCategory !== "Soldo" &&
        (expensePaymentType === "dollar" && expenseAmount ? (
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
                style={{ height: "38px", width: "100%" }}
                placeholder="1 dollar kurs narxi"
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
              />
            </div>
            {usdRate && (
              <Input
                style={{ height: "38px" }}
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

      {/* Description */}
      <Input.TextArea
        placeholder="Qo‘shimcha Ma'lumot"
        value={expenseDescription}
        onChange={(e) => setExpenseDescription(e.target.value)}
        rows={6}
        autoSize={{ minRows: 6, maxRows: 10 }}
        style={{
          width: "100%",
          borderRadius: "8px",
          padding: "10px",
          fontSize: "14px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      />

      <Button style={{ background: "#0A3D3A" }} type="primary" htmlType="submit">
        Saqlash
      </Button>
    </form>
  );
};

export default ExpenseForm;







// import { useEffect, useRef, useState } from "react";
// import "./style.css";
// import dayjs from "dayjs";
// import "moment/locale/uz"; // O'zbek tilini qo'shish
// import { message, Button, DatePicker, Input, Radio } from "antd";
// import AsyncSelect from "react-select/async"; // Yangi import
// import { useCreateExpenseMutation } from "../../../context/service/expensesApi";
// import { useUpdateBalanceMutation } from "../../../context/service/balanceApi";
// import { useDispatch } from "react-redux";
// import { useGetWorkersQuery } from "../../../context/service/worker";
// import { setBoolean } from "../../../context/booleanSlice";
// import {
//   useGetDebtorsQuery,
//   useUpdateOrderMutation,
// } from "../../../context/service/orderApi";
// import {
//   useGetAllShopsQuery,
//   useUpdateShopMutation,
// } from "../../../context/service/newOredShops";

// import {
//   usePostMyDebtMutation,
//   usePaymentForDebtMutation,
//   useUpdateMyDebtMutation,
//   useGetmyDebtsQuery,
// } from "../../../context/service/mydebtService";

// import socket from "../../../socket";
// import { useGetBalanceQuery } from "../../../context/service/balanceApi";

// const ExpenseForm = () => {
//   const dispatch = useDispatch();
//   const [expensePaymentType, setExpensePaymentType] = useState(null); // to'lov turi
//   const [expenseAmount, setExpenseAmount] = useState(""); // pul miqdori
//   const [expenseDescription, setExpenseDescription] = useState(""); // tavsif
//   const [expenseCategory, setExpenseCategory] = useState(""); // xarajat turi
//   const [selectedCategory, setSelectedCategory] = useState(""); // tanlangan xarajat turi
//   const [returnMony, setReturnMony] = useState(0); // tanlangan xarajat turi
//   const [selectedType, setSelectedType] = useState("income"); // tanlangan xarajat turi
//   const [selectedDate, setSelectedDate] = useState(dayjs()); // tanlangan xarajat turi
//   const [soldoFrom, setSoldoFrom] = useState(dayjs());
//   const [soldoTo, setSoldoTo] = useState(dayjs());
//   const [usdRate, setUsdRate] = useState("");
//   const [amountDollar, setAmount] = useState(0);
//   const [updateShop] = useUpdateShopMutation();



//   const [createExpense] = useCreateExpenseMutation();
//   const [updateBalance] = useUpdateBalanceMutation();
//   const [updateOrder] = useUpdateOrderMutation();
//   const { data: workers } = useGetWorkersQuery();
//   const { data: debtors } = useGetDebtorsQuery();
//   const { data: shopsData } = useGetAllShopsQuery();

//   const { data: myDebtsAll, refetch } = useGetmyDebtsQuery();
//   const [postMyDebt] = usePostMyDebtMutation();
//   const [updateMyDebt] = useUpdateMyDebtMutation();
//   const [paymentForDebt] = usePaymentForDebtMutation();

//   const { data: balance } = useGetBalanceQuery();
//   let balancValues = balance?.innerData || {};

//   //======================================================
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const modalRef = useRef(null);
//   const inputRef = useRef(null); // Ref for the input element

//   // Handle clicks outside the modal to close it
//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       // Check if modalRef and inputRef exist and if click is outside both
//       if (
//         modalRef.current &&
//         !modalRef.current.contains(event.target) &&
//         inputRef.current &&
//         inputRef.current.input &&
//         !inputRef.current.input.contains(event.target)
//       ) {
//         setIsModalOpen(false);
//       }
//     };

//     if (isModalOpen) {
//       document.addEventListener("mousedown", handleOutsideClick);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     };
//   }, [isModalOpen]);
//   //======================================================
//   const myDebtorLists = myDebtsAll?.innerData?.map((debtor) => {
//     return {
//       value: debtor._id,
//       label: debtor.name + "  " + debtor?.remainingAmount?.toLocaleString() + " so'm",
//     };
//   });

//   useEffect(() => {
//     socket.on("updateMyDebt", () => {
//       refetch();
//     });
//     return () => socket.off("updateMyDebt");
//   }, [refetch]);

//   const roleTranslations = {
//     manager: "Menejer",
//     seller: "Sotuvchi",
//     director: "Direktor",
//     accountant: "Buxgalter",
//     warehouseman: "Omborchi",
//     deputy: "O'rinbosar",
//   };

//   // ISHCHILAR ROYHATI
//   const workersLists = workers?.innerData.map((worker) => ({
//     value: worker._id,
//     label: `${worker.firstName} ${worker.lastName} [${worker.workerType || roleTranslations[worker.role]
//       }]`,
//   }));

//   // QARZDORLAR ROYHATI
//   const debtorLists = debtors?.innerData.map((debtor) => ({
//     value: debtor._id,
//     label: debtor.customer.fullName,
//   }));

//   // chiqim DO'KONLAR RO'YHATI
//   const shops = shopsData?.innerData
//     ?.filter(
//       (i) => i.isPaid === false && !i.shopName.toLowerCase().includes("soldo")
//     )
//     .map((i) => {
//       // Har bir material uchun umumiy narxni hisoblash
//       const totalAmount = i.materials.reduce(
//         (sum, item) => sum + item.pricePerUnit * item.quantity,
//         0
//       );
//       let summ = totalAmount - (i.paid || 0);
//       return {
//         value: i._id,
//         label: `${i.shopName} - ${summ?.toLocaleString()} so'm`,
//         // 4454
//       };
//     });

//   // kirim do'konlar ro'yxati
//   const kirimDokonlar = shopsData?.innerData
//     ?.filter(
//       (i) => i.isPaid === true && !i.shopName.toLowerCase().includes("soldo")
//     )
//     .map((d) => {
//       return {
//         value: d._id,
//         label: `${d.shopName} - ${d.returnedMoney?.toLocaleString()} so'm`, // Pul formatida chiqarish
//         name: d.shopName // Pul formatida chiqarish
//         // 4454
//       };
//     });

//   let options = [];
//   if (
//     selectedType === "expense" &&
//     (expenseCategory === "Ish haqi" || expenseCategory === "Avans")
//   ) {
//     options = workersLists;
//   } else if (
//     selectedType === "income" &&
//     expenseCategory === "Mijoz to‘lovlari"
//   ) {
//     options = debtorLists;
//   } else if (
//     selectedType === "expense" &&
//     expenseCategory === "Do'kon qarzini to'lash"
//   ) {
//     options = shops;
//   } else if (
//     selectedType === "income" &&
//     expenseCategory === "Do'kondan qaytarilgan mablag"
//   ) {
//     options = kirimDokonlar;
//   } else if (
//     selectedType === "expense" &&
//     expenseCategory === "Qarzni to'lash"
//   ) {
//     options = myDebtorLists;
//   }

//   const kirim_royhati = [
//     "Mijoz to‘lovlari",
//     "Do'kondan qaytarilgan mablag",
//     "Qarz olish",
//     "Investor sarmoyasi",
//     "Qaytgan mablag‘",
//     "Davlat subsidiyasi",
//     "Boshqa daromadlar",
//     "Soldo",
//   ];

//   const chiqim_royhati = [
//     "Ish haqi",
//     "Avans",
//     "Do'kon qarzini to'lash",
//     "Qarzni to'lash",
//     "Ijara",
//     "Mebel",
//     "Kantselyariya",
//     "Xomashyo",
//     "Transport",
//     "Kommunal to‘lovlar",
//     "Reklama va marketing",
//     "Texnika ta’miri",
//     "Solqlar",
//     "Boshqa chiqimlar",
//   ];

//   // KIRIM CHIQIM turlari
//   const kirim_chiqim_royhati = (
//     selectedType === "income" ? kirim_royhati : chiqim_royhati
//   ).map((i) => ({ value: i, label: i }));

//   // malumotlarni yuborish
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     let amount = parseFloat(expenseAmount?.split(" ")?.join(""));

//     let newData =
//       expenseCategory === "Ish haqi" || expenseCategory === "Avans"
//         ? {
//           name: selectedCategory.label,
//           amount: amount,
//           type: "Chiqim",
//           category: expenseCategory,
//           description: expenseDescription,
//           paymentType: expensePaymentType,
//           relevantId: selectedCategory.value,
//           date: selectedDate.toDate(),
//         }
//         : {
//           name: selectedCategory.label || expenseCategory,
//           amount: amount,
//           type: selectedType === "income" ? "Kirim" : "Chiqim",
//           category: expenseCategory,
//           description: expenseDescription,
//           paymentType: expensePaymentType,
//           relevantId: selectedCategory.value,
//         };

//     if (expenseCategory === "Qarz olish") {
//       let { relevantId, ...newData1 } = newData;
//       newData = newData1;
//     }

//     try {
//       const selectedDebtor = debtors?.innerData?.find(
//         (item) => item._id === selectedCategory.value
//       );
//       const currentPaid = selectedDebtor?.paid || 0;

//       if (newData.paymentType === "dollar" && newData.type === "Chiqim") {
//         if (
//           balancValues.dollarBalance < newData.amount &&
//           newData.type === "Chiqim"
//         ) {
//           return message.warning("Dollar balansingiz yetarli emas");
//         }
//       }

//       if (newData.paymentType === "Bank orqali" && newData.type === "Chiqim") {
//         if (balancValues.bankTransferBalance < newData.amount) {
//           return message.warning("Hisob raqamda yetarli mablag' mavjud emas");
//         }
//       }

//       if (newData.paymentType === "Naqd" && newData.type === "Chiqim") {
//         if (balancValues.cashBalance < newData.amount) {
//           return message.warning("Hisob raqamda yetarli mablag' mavjud emas");
//         }
//       }

//       const expenseResponse = await createExpense(newData).unwrap();

//       // Balansni yangilash
//       const balanceResponse = await updateBalance({
//         amount: amount,
//         type: selectedType === "income" ? "add" : "subtract",
//         payType: expensePaymentType,
//       }).unwrap();



//       if (expenseCategory === "Qarz olish") {
//         const checkDebt = myDebtsAll?.innerData?.find(
//           (i) => i.name?.toLowerCase() === selectedCategory.label?.toLowerCase()
//         );
//         let data = {
//           amount, // The new debt amount
//           description: expenseDescription,
//           name: selectedCategory.label,
//           type: expensePaymentType,
//           isPaid: false
//         };

//         try {
//           if (checkDebt) {
//             const response = await updateMyDebt({
//               id: checkDebt._id,
//               body: data,
//             });
//             message.success(
//               response.message || "Qarz muvaffaqiyatli yangilandi"
//             ); // Muvaffaqiyat xabari
//           } else {
//             const response = await postMyDebt({ body: data });
//             message.success(
//               response.message || "Qarz muvaffaqiyatli yaratildi"
//             ); // Muvaffaqiyat xabari
//           }
//         } catch (error) {
//           message.error(error.message || "Xatolik yuz berdi"); // Xato xabari
//         }
//       }

//       if (expenseCategory === "Qarzni to'lash") {
//         const debt = myDebtsAll?.innerData?.find(i => i?._id === selectedCategory.value);

//         if (!debt) {
//           message.error("Qarzdor topilmadi");
//           return;
//         }

//         const debtData = {
//           amount,
//           description: expenseDescription,
//           name: debt.name,
//           type: expensePaymentType,
//           isPaid: true,
//         };

//         try {
//           const { message: responseMessage } = await updateMyDebt({
//             id: debt._id,
//             body: debtData,
//           });
//           message.success(responseMessage || "Qarz muvaffaqiyatli To'landi");
//         } catch (error) {
//           message.error(error.message || "Qarzni yangilashda xatolik");
//         }
//       }

//       // Faqat "Mijoz to‘lovlari" bo'lganda orderni yangilash
//       let orderResponse = { state: true }; // Default qiymat
//       if (expenseCategory === "Mijoz to‘lovlari") {
//         orderResponse = await updateOrder({
//           id: selectedCategory.value,
//           updates: {
//             paid:
//               currentPaid + (+amountDollar > 0 ? +amountDollar : +returnMony),
//             paidAt: new Date().toISOString(), // Hozirgi vaqtni yuborish
//           },
//         }).unwrap();
//       }

//       let res = null;

//       if (expenseCategory === "Do'kon qarzini to'lash") {
//         const shop = shopsData.innerData?.find(
//           (i) => i._id === selectedCategory.value
//         );
//         const totalAmount = shop.materials.reduce(
//           (sum, item) => sum + item.pricePerUnit * item.quantity,
//           0
//         );

//         // Calculate paid and returnedMoney based on returnMony and totalAmount
//         let paid = totalAmount;
//         let returnedMoney = 0;
//         let isPaid = false;

//         if (returnMony > totalAmount) {
//           returnedMoney = returnMony - totalAmount;
//           paid = totalAmount;
//         } else {
//           paid = returnMony;
//         }
//         // returnMony, setReturnMony
//         if (returnMony >= totalAmount) {
//           isPaid = true;
//         }

//         res = await updateShop({
//           id: shop._id,
//           body: {
//             paid: paid,
//             returnedMoney: returnedMoney,
//             isPaid: isPaid,
//           },
//         });
//       }

//       if (expenseCategory === "Do'kondan qaytarilgan mablag") {
//         const shop = shopsData.innerData?.find(
//           (i) => i._id === selectedCategory.value
//         );

//         if (shop) {
//           const newDatas = {
//             name: shop.shopName,
//             amount: amount,
//             type: "Kirim",
//             category: "Do‘kondan qaytarilgan mablag",
//             description: expenseDescription,
//             paymentType: expensePaymentType,
//             relevantId: shop._id,
//           };

//           await createExpense(newDatas).unwrap();

//           let updatedReturnedMoney = shop.returnedMoney;
//           let updatedPaid = shop.paid;

//           if (amount > shop.returnedMoney) {
//             updatedReturnedMoney = 0;
//             updatedPaid -= amount - shop.returnedMoney; // yetmaganini paid dan ayiramiz
//           } else {
//             updatedReturnedMoney -= amount;
//           }

//           const updatedShop = {
//             ...shop,
//             returnedMoney: updatedReturnedMoney,
//             paid: updatedPaid,
//             isPaid: amount > shop.returnedMoney ? false : true,
//           };

//           await updateShop({
//             id: shop._id,
//             body: updatedShop,
//           });
//         }
//       }

//       if (expenseResponse?.state && balanceResponse?.state) {
//         message.success("Xarajat muvaffaqiyatli qo'shildi!");

//         // Formani tozalash
//         setExpenseAmount("");
//         setExpenseDescription("");
//         setExpenseCategory("");
//       }
//     } catch (err) {
//       console.log(err);
//       message.error(err.message || "Xarajatni qo'shishda xatolik yuz berdi.");
//     } finally {
//       setExpenseCategory("");
//       setExpensePaymentType("");
//       e.target.reset();
//       setSelectedCategory("");
//       setSelectedType("income");
//       setSelectedDate(dayjs());
//       setSoldoFrom(dayjs());
//       setSoldoTo(dayjs());
//       setUsdRate("");
//       setReturnMony("");
//     }
//   };

//   // kirim chiqim royhatidan qidirish
//   const kirim_chiqim_qidiruv = (inputValue, callback) => {
//     const options = kirim_chiqim_royhati
//       .filter((cat) => cat.toLowerCase().includes(inputValue.toLowerCase()))
//       .map((cat) => ({ value: cat, label: cat }));
//     setTimeout(() => {
//       callback(options);
//     }, 300);
//   };

//   const kimga_nimaga_qidiruv = (inputValue, callback) => {
//     const options = kirim_chiqim_royhati
//       .filter((i) => i.label?.toLowerCase().includes(inputValue.toLowerCase()))
//       .map((i) => ({ value: i.value, label: i.label }));
//     setTimeout(() => {
//       callback(options);
//     }, 300);
//   };

//   const paymentTypeControl = [
//     { label: "Naqd", value: "Naqd" },
//     { label: "Bank orqali", value: "Bank orqali" },
//     { label: "$ Dollar", value: "dollar" },
//   ];

//   const loadPaymentTypeOptions = (inputValue, callback) => {
//     const options = paymentTypeControl.filter((option) =>
//       option.label.toLowerCase().includes(inputValue.toLowerCase())
//     );
//     setTimeout(() => {
//       callback(options);
//     }, 300);
//   };

//   // Function to format number with commas
//   const formatNumber = (value) => {
//     if (!value) return "";
//     value = value.replace(/[^0-9.]/g, "");
//     const parts = value.split(".");
//     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
//     return parts.join(".");
//   };

//   const handlePaymentTypeChange = (value) => {
//     dispatch(setBoolean(value.value === "dollar")); // Redux-ga qiymatni uzatish
//   };

//   const handleAmountChange = (value) => {
//     const cleanedValue = value.replace(/\s/g, ""); // Bo'sh joylarni olib tashlash
//     const numericValue = Number(cleanedValue); // Stringni numberga o'zgartirish
//     setAmount(+usdRate * numericValue);
//   };

//   const handleChange = (e) => {
//     const { value } = e.target;
//     const cleanedValue = value.replace(/\s/g, "");
//     setReturnMony(cleanedValue);
//     handleAmountChange(value);
//     const formattedValue = formatNumber(value);
//     setExpenseAmount(formattedValue);
//   };


//   return (
//     <form className="expense-form" onSubmit={handleSubmit}>
//       {/* Xarajat turi */}
//       <Radio.Group
//         optionType="button"
//         buttonStyle="solid"
//         size="large"
//         value={selectedType}
//         onChange={(e) => setSelectedType(e.target.value)}
//       >
//         <Radio value="income">Kirim</Radio>
//         <Radio value="expense">Chiqim</Radio>
//       </Radio.Group>

//       {/* QAYERGA | QAYERDAN */}
//       <div className="expense-form_select1">
//         <AsyncSelect
//           cacheOptions
//           defaultOptions={kirim_chiqim_royhati}
//           loadOptions={kirim_chiqim_qidiruv}
//           value={{ value: expenseCategory, label: expenseCategory } || null}
//           onChange={(e) => setExpenseCategory(e.value || "")}
//           placeholder={selectedType === "income" ? "Qayerdan" : "Qayerga"}
//           classNamePrefix="custom-select"
//           styles={{
//             container: (provided) => ({
//               ...provided,
//               width: "100%",
//               marginBottom: "1rem",
//             }),
//             // Ochilgan menyu konteyneri uchun uslublar
//             menu: (provided) => ({
//               ...provided,
//               height: "0px", // Menyu balandligini belgilash
//               backgroundColor: "#fff",
//               borderRadius: "5px",
//               marginTop: "0",
//               boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)",
//             }),
//             // Har bir option uchun uslublar
//             option: (provided, state) => ({
//               ...provided,
//               backgroundColor: state.isFocused ? "#f0f0f0" : "#fff",
//               color: state.isFocused ? "#000" : "#333",
//               cursor: "pointer",
//               padding: "5px 12px",
//             }),
//             // Menyu ro'yxati uchun qo'shimcha uslub (paddingni olib tashlash)
//             menuList: (provided) => ({
//               ...provided,
//               padding: "0",
//             }),
//           }}
//         />

//         {/* TO'LOV TURI */}
//         <AsyncSelect
//           cacheOptions
//           defaultOptions={paymentTypeControl || "Tulov turi tanlang"}
//           loadOptions={loadPaymentTypeOptions}
//           value={
//             { value: expensePaymentType, label: expensePaymentType } || null
//           }
//           onChange={(selectedOption) => {
//             setExpensePaymentType(selectedOption ? selectedOption.value : null);
//             handlePaymentTypeChange(selectedOption);
//           }}
//           placeholder="Tulov turi tanlang"
//           classNamePrefix="custom-select"
//           styles={{
//             container: (provided) => ({
//               ...provided,
//               width: "100%",
//               marginBottom: "1rem",
//             }),
//             menu: (provided) => ({
//               ...provided,
//               maxHeight: "150px",
//               backgroundColor: "#fff",
//               borderRadius: "5px",
//               marginTop: "0",
//               boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)",
//             }),
//             option: (provided, state) => ({
//               ...provided,
//               backgroundColor: state.isFocused ? "#f0f0f0" : "#fff",
//               color: state.isFocused ? "#000" : "#333",
//               cursor: "pointer",
//               padding: "5px 12px",
//             }),
//             menuList: (provided) => ({
//               ...provided,
//               padding: "0",
//             }),
//           }}
//         />
//       </div>

//       {/* KIMGA | NIMAGA */}
//       {options?.length ? (
//         <div className="ish-haqi-avans">
//           {["Ish haqi", "Avans"].includes(expenseCategory) && (
//             <DatePicker
//               picker="month"
//               value={selectedDate}
//               onChange={(date) => setSelectedDate(dayjs(date))}
//             />
//           )}

//           <AsyncSelect
//             cacheOptions
//             defaultOptions={options}
//             loadOptions={kimga_nimaga_qidiruv}
//             value={
//               {
//                 value: selectedCategory?.value,
//                 label: selectedCategory.label,
//               } || null
//             }
//             onChange={(e) => setSelectedCategory(e)}
//             placeholder={selectedType === "income" ? "Qayerdan" : "Qayerga"}
//             classNamePrefix="custom-select"
//             styles={{
//               container: (provided) => ({
//                 ...provided,
//                 width: "100%",
//                 marginBottom: "1rem",
//               }),
//               menu: (provided) => ({
//                 ...provided,
//                 maxHeight: "150px",
//                 backgroundColor: "#fff",
//                 borderRadius: "5px",
//                 marginTop: "0",
//                 boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)",
//               }),
//               option: (provided, state) => ({
//                 ...provided,
//                 backgroundColor: state.isFocused ? "#f0f0f0" : "#fff",
//                 color: state.isFocused ? "#000" : "#333",
//                 cursor: "pointer",
//                 padding: "5px 12px",
//               }),
//               menuList: (provided) => ({
//                 ...provided,
//                 padding: "0",
//               }),
//             }}
//           />
//         </div>
//       ) : (
//         ""
//       )}

//       {/* KIMDAN */}
//       {expenseCategory === "Qarz olish" ? (
//         <div className="kimdandebt">
//           <Input
//             ref={inputRef}
//             className="debt-input"
//             placeholder="Kimdan"
//             value={selectedCategory.label}
//             onChange={(e) => {
//               setSelectedCategory({
//                 value: e.target.value,
//                 label: e.target.value,
//               });
//             }}
//             onClick={() => setIsModalOpen(true)}
//           />
//           <div
//             className={`kimdandebt_modal ${isModalOpen ? "open" : ""}`}
//             ref={modalRef}
//           >
//             <ul>
//               {myDebtsAll?.innerData?.map((value, inx) => {
//                 // Har bir value uchun debts massividagi amount'larni yig'ish
//                 const totalDebt = value.debts.reduce(
//                   (sum, debt) => sum + debt.amount,
//                   0
//                 );

//                 return (
//                   <li
//                     key={inx}
//                     onClick={() => {
//                       // setSelectedCategory(value.name);
//                       setSelectedCategory({
//                         value: value._id,
//                         label: value.name,
//                       });
//                       setIsModalOpen(false);
//                     }}
//                   >
//                     {value.name}
//                     <span className="amount">
//                       {value.remainingAmount?.toLocaleString("uz-UZ")} so‘m
//                     </span>
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         </div>
//       ) : (
//         ""
//       )}
//       {["Soldo"]?.includes(expenseCategory) && (
//         <div style={{ display: "flex", gap: "10px" }}>
//           <DatePicker
//             // picker="date"
//             value={soldoFrom}
//             onChange={(date) => {
//               if (date) {
//                 setSoldoFrom(dayjs(date));
//               }
//             }}
//             format="YYYY-MM-DD"
//             placeholder="Dan"
//           />
//           <DatePicker
//             // picker="date"
//             value={soldoTo}
//             onChange={(date) => {
//               if (date) {
//                 setSoldoTo(dayjs(date));
//               }
//             }}
//             format="YYYY-MM-DD"
//             placeholder="Gacha"
//           />

//           <Input
//             placeholder="Pul miqdori"
//             value={expenseAmount}
//             onChange={handleChange}
//           />
//         </div>
//       )}
//       {!["Soldo"].includes(expenseCategory) &&
//         (expensePaymentType === "dollar" && expenseAmount !== 0 ? (
//           <div
//             className="ish-haqi-avans"
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               gap: "10px",
//             }}
//           >
//             <div className="ish-haqi-kurs">
//               <p>{amountDollar.toLocaleString()} so'm</p>
//             // 4454
//               <Input
//                 style={{
//                   height: "38px",
//                   width: "100%",
//                 }}
//                 placeholder="1 dollar kurs narxi"
//                 value={usdRate}
//                 onChange={(e) => setUsdRate(e.target.value)}
//               />
//             </div>
//             {+usdRate > 0 && (
//               <Input
//                 style={{
//                   height: "38px",
//                 }}
//                 placeholder="Dollar miqdori..."
//                 value={expenseAmount}
//                 onChange={handleChange}
//               />
//             )}
//           </div>
//         ) : (
//           <Input
//             placeholder="Pul miqdori"
//             value={expenseAmount}
//             onChange={handleChange}
//           />
//         ))}

//       <Input.TextArea
//         placeholder="Qo‘shimcha Ma'lumot"
//         value={expenseDescription}
//         onChange={(e) => setExpenseDescription(e.target.value)}
//         rows={6}
//         autoSize={{ minRows: 6, maxRows: 10 }} // Avtomatik kengayishi uchun
//         style={{
//           width: "100%",
//           borderRadius: "8px",
//           padding: "10px",
//           fontSize: "14px",
//           boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
//         }}
//       />

//       <Button
//         style={{ background: "#0A3D3A" }}
//         type="primary"
//         htmlType="submit"
//       >
//         saqlash
//       </Button>
//     </form>
//   );
// };

// export default ExpenseForm;









