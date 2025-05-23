
import { useEffect, useRef, useState, useMemo } from "react";
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
  useUpdateOrderMutation
} from "../../../context/service/orderApi";
import {
  useGetAggregatedOrdersQuery,
  useProcessPaymentMutation,
  useGetReturnedOrdersQuery,
  useProcessReturnedPayMutation,
  useCreateShopSoldoMutation
} from "../../../context/service/newOredShops";

import {
  useGetDriversQuery,
  useDecrementBalanceMutation
} from "../../../context/service/driverApi";
import {
  usePostMyDebtMutation,
  useUpdateMyDebtMutation,
  useGetmyDebtsQuery,
} from "../../../context/service/mydebtService";
import socket from "../../../socket";
import { useGetBalanceQuery } from "../../../context/service/balanceApi";

const ExpenseForm = () => {
  const dispatch = useDispatch();

  // State
  const [expensePaymentType, setExpensePaymentType] = useState("Naqd");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [returnMony, setReturnMony] = useState(0);
  const [selectedType, setSelectedType] = useState("income");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [usdRate, setUsdRate] = useState("");
  const [amountDollar, setAmountDollar] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [soldiformModal, setSoldiformModal] = useState(false);

  // API Hooks
  const [createShopSoldo] = useCreateShopSoldoMutation();
  const [createExpense] = useCreateExpenseMutation();
  const [updateBalance] = useUpdateBalanceMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [processReturnedPay] = useProcessReturnedPayMutation();
  const [processPayment] = useProcessPaymentMutation();
  const [postMyDebt] = usePostMyDebtMutation();
  const [updateMyDebt] = useUpdateMyDebtMutation();
  const { data: workers } = useGetWorkersQuery();
  const { data: debtors } = useGetDebtorsQuery();
  const { data: shopsData } = useGetAggregatedOrdersQuery();
  const { data: myDebtsAll, refetch } = useGetmyDebtsQuery();
  const { data: GetReturned } = useGetReturnedOrdersQuery();
  const { data: balance } = useGetBalanceQuery();
  const balancValues = balance?.innerData || {};
  const { data: driversData } = useGetDriversQuery();
  const [decrementBalance] = useDecrementBalanceMutation();
  const drivers = driversData?.innerData || [];
  const [newShop, setNewShop] = useState("");
  // Refs
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Handle outside click for modal
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
    if (isModalOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isModalOpen]);

  // Socket for myDebts
  useEffect(() => {
    socket.on("updateMyDebt", refetch);
    return () => socket.off("updateMyDebt");
  }, [refetch]);

  // Data mappings
  const roleTranslations = {
    manager: "Menejer",
    seller: "Sotuvchi",
    director: "Direktor",
    accountant: "Buxgalter",
    warehouseman: "Omborchi",
    deputy: "O'rinbosar",
  };

  // Process workers data
  const workersLists = useMemo(() => {
    return (
      workers?.innerData?.map((worker) => ({
        value: worker._id,
        label: `${worker._doc.firstName} ${worker._doc.lastName} [${worker._doc.workerType || roleTranslations[worker._doc.role] || worker._doc.role
          }]`,
      })) || []
    );
  }, [workers]);

  const debtorLists = debtors?.innerData?.map((debtor) => ({
    value: debtor._id,
    label: debtor.customer.fullName,
  })) || [];

  const shops = shopsData?.innerData
    ?.filter((i) => !i.isPaid && !i.shopName.toLowerCase().includes("soldo"))
    ?.map((i) => ({
      value: i.shopName,
      label: `${i.shopName} - ${i.totalPrice.toLocaleString()} so'm`,
    })) || [];



  const kirimDokonlar = shopsData?.innerData
    ?.filter((i) => i.isPaid && !i.shopName.toLowerCase().includes("soldo"))
    ?.map((d) => ({
      value: d._id,
      label: `${d.shopName} - ${d.returnedMoney?.toLocaleString()} so'm`,
      name: d.shopName,
    })) || [];

  const myDebtorLists = myDebtsAll?.innerData?.map((debtor) => ({
    value: debtor._id,
    label: `${debtor.name} ${debtor.remainingAmount?.toLocaleString()} so'm`,
  })) || [];


  const options = (() => {
    if (selectedType === "expense") {
      if (["Ish haqi", "Avans"].includes(expenseCategory)) return workersLists;
      if (expenseCategory === "Do'kon qarzini to'lash") return shops;
      if (expenseCategory === "Qarzni to'lash") return myDebtorLists;
    } else if (selectedType === "income") {
      if (expenseCategory === "Mijoz to‘lovlari") return debtorLists;
      if (expenseCategory === "Do'kondan qaytarilgan mablag") return kirimDokonlar;
    }
    return [];
  })();


  // Categories
  const kirim_royhati = [
    "Mijoz to‘lovlari",
    "Do'kondan qaytarilgan mablag",
    "Qaytarilgan mablag'",
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
    "Qarz Berish",
    "Yetkazib beruvchilar",
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
    "Soldo",
  ];

  const kirim_chiqim_royhati = (selectedType === "income" ? kirim_royhati : chiqim_royhati).map((i) => ({
    value: i,
    label: i,
  }));

  const paymentTypeControl = [
    { label: "Naqd", value: "Naqd" },
    { label: "Bank orqali", value: "Bank orqali" },
    { label: "$ Dollar", value: "dollar" },
  ];


  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(expenseAmount?.split(" ")?.join("") || 0);
    if (!amount) return message.error("Pul miqdori kiritilmadi!");

    try {
      // Base data for expense
      const baseData = {
        name: selectedCategory?.label || expenseCategory,
        amount,
        type: selectedType === "income" ? "Kirim" : "Chiqim",
        category: expenseCategory,
        description: expenseDescription,
        paymentType: expensePaymentType,
        relevantId: selectedCategory?.value,
      };

      // Conditional data adjustments
      const newData = {
        ...baseData,
        ...(["Ish haqi", "Avans"].includes(expenseCategory) && {
          type: "Chiqim",
          date: selectedDate.toDate(),
        }),
        ...((expenseCategory === "Qarz olish" || expenseCategory === "Do'kondan qaytarilgan mablag" || expenseCategory === "Qarz Berish" || expenseCategory === "Do'kon qarzini to'lash") && {
          relevantId: undefined,
        }),
      };

      // Balance validation

      if (newData.type === "Chiqim") {
        const balanceChecks = {
          dollar: balancValues.dollarBalance,
          "Bank orqali": balancValues.bankTransferBalance,
          Naqd: balancValues.cashBalance,
        };
        if (balanceChecks[newData.paymentType] < amount) {
          return message.warning(`${newData.paymentType} balansingiz yetarli emas`);
        }
      }

      // Core expense and balance update
      let expenseResponse, balanceResponse;

      if (expenseCategory !== "Soldo") {
        [expenseResponse, balanceResponse] = await Promise.all([
          createExpense(newData).unwrap(),
          updateBalance({
            amount,
            type: selectedType === "income" ? "add" : "subtract",
            payType: expensePaymentType,
          }).unwrap(),
        ]);
      }

      // Debt-related operations
      const debtOperations = {
        "Qarz olish": async () => {
          const debtData = {
            amount,
            description: expenseDescription,
            name: selectedCategory?.label || "",
            type: expensePaymentType,
            isPaid: false,
            debtsType: "Qarz olish",
          };
          const existingDebt = myDebtsAll?.innerData?.find(
            (i) => i.name?.toLowerCase() === selectedCategory?.label?.toLowerCase()
          );
          await (existingDebt
            ? updateMyDebt({ id: existingDebt._id, body: debtData })
            : postMyDebt({ body: debtData })
          ).unwrap();
          message.success(`Qarz ${existingDebt ? "yangilandi" : "yaratildi"}`);
        },
        "Qaytarilgan mablag'": async () => {
          const debt = myDebtsAll?.innerData?.find((i) => i._id === selectedCategory?.value);
          if (!debt) throw new Error("Qarzdor topilmadi");
          await updateMyDebt({
            id: debt._id,
            body: { amount, description: expenseDescription, name: debt.name, type: expensePaymentType, isPaid: false },
          }).unwrap();
          message.success("Qarz muvaffaqiyatli to'landi");
        },
        "Qarzni to'lash": async () => {
          const debt = myDebtsAll?.innerData?.find((i) => i._id === selectedCategory?.value);
          if (!debt) throw new Error("Qarzdor topilmadi");
          await updateMyDebt({
            id: debt._id,
            body: { amount, description: expenseDescription, name: debt.name, type: expensePaymentType, isPaid: true },
          }).unwrap();
          message.success("Qarz muvaffaqiyatli to'landi");
        },
        "Qarz Berish": async () => {
          const debt = myDebtsAll?.innerData?.find((i) => i._id === selectedCategory?.value);
          const debtData = {
            amount,
            description: expenseDescription,
            name: debt?.name || selectedCategory?.label || "",
            type: expensePaymentType,
            isPaid: !!debt,
            debtsType: "Qarz Berish"
          };

          await (debt
            ? updateMyDebt({ id: debt._id, body: debtData })
            : postMyDebt({ body: debtData })
          ).unwrap();

          message.success("Qarz muvaffaqiyatli berildi");
        },
      };

      // Customer payments
      const customerPayments = async () => {
        if (expenseCategory === "Mijoz to‘lovlari") {
          const selectedDebtor = debtors?.innerData?.find((item) => item._id === selectedCategory?.value);
          await updateOrder({
            id: selectedCategory?.value,
            updates: {
              paid: (selectedDebtor?.paid || 0) + (amountDollar > 0 ? amountDollar : returnMony),
              paidAt: new Date().toISOString(),
            },
          }).unwrap();
        }
      };

      const customerSoldo = async () => {
        if (expenseCategory === "Soldo") {
          try {
            const newOrder = {
              shopName: newShop,
              totalPrice: amount
            };

            await createShopSoldo(newOrder).unwrap();

            inputRef.current?.focus();
            message.success("Qarz muvaffaqiyatli berildi");
          } catch (error) {
            console.error("Qarz berishda xatolik:", error);
            message.error("Qarz berishda xato yuz berdi");
          }
        }
      };

      const customerDiliver = async () => {
        if (expenseCategory === "Yetkazib beruvchilar") {
          // url: `/driver/decrement/${id}`,
          await decrementBalance(
            {
              id: selectedCategory?.value,
              amount: amount
            }
          ).unwrap();
        }
      };

      // Shop debt payment
      const shopDebtPayment = async () => {
        if (expenseCategory === "Do'kon qarzini to'lash") {
          const shop = shopsData?.innerData?.find((i) => i.shopName === selectedCategory?.value);
          await processPayment({
            shopName: shop.shopName,
            paymentAmount: expenseAmount
          }).unwrap();
        }

      };

      // Returned money from shop
      const shopReturnedMoney = async () => {
        if (expenseCategory === "Do'kondan qaytarilgan mablag") {
          const res = await processReturnedPay({
            shopIds: selectedCategory.value,
            paymentAmount: amount
          }).unwrap();
          message.success("Do'kondan qaytarilgan mablag' muvaffaqiyatli qo'shildi!");

        }
      };

      // Execute category-specific operations
      await debtOperations[expenseCategory]?.();
      await customerPayments();
      await customerDiliver();
      await shopDebtPayment();
      await shopReturnedMoney();
      await customerSoldo();

      // Final success handling
      if (expenseResponse?.state && balanceResponse?.state) {
        message.success("Xarajat muvaffaqiyatli qo'shildi!");
        resetForm(e);
      }
    } catch (err) {
      message.error(err.message || "Xarajatni qo'shishda xatolik yuz berdi.");
      console.error("Submission error:", err);
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
    setUsdRate("");
    setReturnMony(0);
    setAmountDollar(0);
  };

  // Search handlers
  const kirim_chiqim_qidiruv = (inputValue, callback) =>
    setTimeout(() => callback(kirim_chiqim_royhati.filter((cat) =>
      cat.label.toLowerCase().includes(inputValue.toLowerCase())
    )), 300);

  const kimga_nimaga_qidiruv = (inputValue, callback) =>
    setTimeout(() => callback(options.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    )), 300);

  const loadPaymentTypeOptions = (inputValue, callback) =>
    setTimeout(() => callback(paymentTypeControl.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    )), 300);

  // Input handlers
  const formatNumber = (value) => value ? value.replace(/[^0-9.]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "";

  const handleAmountChange = (value) => {
    const cleanedValue = value.replace(/\s/g, "");
    setAmountDollar(usdRate ? usdRate * Number(cleanedValue) : 0);
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
    container: (provided) => ({ ...provided, width: "100%", marginBottom: "1rem" }),
    menu: (provided) => ({ ...provided, maxHeight: "150px", backgroundColor: "#fff", borderRadius: "5px", marginTop: "0", boxShadow: "0 0 8px rgba(0, 0, 0, 0.1)" }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isFocused ? "#f0f0f0" : "#fff", color: state.isFocused ? "#000" : "#333", cursor: "pointer", padding: "5px 12px" }),
    menuList: (provided) => ({ ...provided, padding: "0" }),
  };

  // Valyuta ma'lumotlarini ko'rsatish uchun yordamchi komponent
  const CurrencyInfo = ({ type, data }) => {
    if (!data?.amount || data.amount <= 0) return null; // Agar miqdor 0 yoki yo'q bo'lsa, hech narsa ko'rsatilmaydi

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span className="amount">{data.amount.toLocaleString("uz-UZ")} {type === "dollar" ? "$" : "so‘m"}</span>
        <p style={{ color: "grey", fontSize: "13px" }}>{data.status}</p>
      </div>
    );
  };
  return (
    <form className="expense-form" onSubmit={handleSubmit}>
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

      <div className="expense-form_select1">
        <AsyncSelect
          cacheOptions
          defaultOptions={kirim_chiqim_royhati}
          loadOptions={kirim_chiqim_qidiruv}
          value={expenseCategory ? { value: expenseCategory, label: expenseCategory } : null}
          onChange={(e) => setExpenseCategory(e?.value || "")}
          placeholder="Kategoriyani tanlang"
          classNamePrefix="custom-select"
          styles={selectStyles}
        />
        <AsyncSelect
          cacheOptions
          defaultOptions={paymentTypeControl}
          loadOptions={loadPaymentTypeOptions}
          value={expensePaymentType ? { value: expensePaymentType, label: expensePaymentType } : { value: "Naqd", label: "Naqd" }}
          onChange={handlePaymentTypeChange}
          placeholder="To'lov turi tanlang"
          classNamePrefix="custom-select"
          styles={selectStyles}
        />
      </div>

      {options.length > 0 && !["Qarz olish", "Qarzni to'lash"].includes(expenseCategory) && (
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
            placeholder={"Tanlang..."}
            classNamePrefix="custom-select"
            styles={selectStyles}
          />
        </div>
      )}


      {expenseCategory === "Qarz olish" && (
        <div className="kimdandebt">
          <Input
            ref={inputRef}
            className="debt-input"
            placeholder="Kimdan"
            value={selectedCategory?.label || ""}
            onChange={(e) => setSelectedCategory({ value: e.target.value, label: e.target.value })}
            onClick={() => setIsModalOpen(true)}
          />
          <div className={`kimdandebt_modal ${isModalOpen ? "open" : ""}`} ref={modalRef}>
            <ul>
              {myDebtsAll?.innerData?.map((value) => (
                <li
                  key={value._id}
                  onClick={() => {
                    setSelectedCategory({ value: value._id, label: value.name });
                    setIsModalOpen(false);
                  }}
                >
                  <span>{value.name}</span>
                  {/* Naqd va dollar valyutalari uchun ma'lumotlarni ko'rsatish */}
                  {["Naqd", "dollar"].map((type) => (
                    <CurrencyInfo
                      key={type}
                      type={type}
                      data={value?.remainingByType?.[type]}
                    />
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {expenseCategory === "Do'kondan qaytarilgan mablag" && (
        <div className="kimdandebt">
          <Input
            ref={inputRef}
            className="debt-input"
            placeholder="Kimdan"
            value={selectedCategory?.label || ""}
            onChange={(e) => setSelectedCategory({ value: e.target.value, label: e.target.value })}
            onClick={() => setIsModalOpen(true)}
          />
          <div className={`kimdandebt_modal ${isModalOpen ? "open" : ""}`} ref={modalRef}>
            <ul>
              {GetReturned?.innerData?.map((value, inx) => (
                <li
                  key={inx}
                  onClick={() => {
                    const ids = value.orders.map(order => order._id); // _id larni yig'ish
                    setSelectedCategory({
                      value: JSON.stringify(ids), // id larni stringga o'girib berish
                      label: value.shopName,
                    });
                    setIsModalOpen(false);
                  }}
                >
                  <span>{value.shopName}</span>
                  <span className="amount">{value.totalReturnedMoney.toLocaleString("uz-UZ")} so‘m</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {expenseCategory === "Qaytarilgan mablag'" && (
        <div className="kimdandebt">
          <Input
            ref={inputRef}
            className="debt-input"
            placeholder="Kimdan"
            value={selectedCategory?.label || ""}
            onChange={(e) => setSelectedCategory({ value: e.target.value, label: e.target.value })}
            onClick={() => setIsModalOpen(true)}
          />
          <div className={`kimdandebt_modal ${isModalOpen ? "open" : ""}`} ref={modalRef}>
            <ul>
              {myDebtsAll?.innerData?.map((value) => (
                <li
                  key={value._id}
                  onClick={() => {
                    setSelectedCategory({ value: value._id, label: value.name });
                    setIsModalOpen(false);
                  }}
                >
                  <span>{value.name}</span>
                  {/* Naqd va dollar valyutalari uchun ma'lumotlarni ko'rsatish */}
                  {["Naqd", "dollar"].map((type) => (
                    <CurrencyInfo
                      key={type}
                      type={type}
                      data={value?.remainingByType?.[type]}
                    />
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {expenseCategory === "Qarz Berish" && (
        <div className="kimdandebt">
          <Input
            ref={inputRef}
            className="debt-input"
            placeholder="Kimdan"
            value={selectedCategory?.label || ""}
            onChange={(e) => setSelectedCategory({ value: e.target.value, label: e.target.value })}
            onClick={() => setIsModalOpen(true)}
          />
          <div className={`kimdandebt_modal ${isModalOpen ? "open" : ""}`} ref={modalRef}>
            <ul>
              {myDebtsAll?.innerData?.map((value) => (
                <li
                  key={value._id}
                  onClick={() => {
                    setSelectedCategory({ value: value._id, label: value.name });
                    setIsModalOpen(false);
                  }}
                >
                  <span>{value.name}</span>
                  {/* Naqd va dollar valyutalari uchun ma'lumotlarni ko'rsatish */}
                  {["Naqd", "dollar"].map((type) => (
                    <CurrencyInfo
                      key={type}
                      type={type}
                      data={value?.remainingByType?.[type]}
                    />
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {expenseCategory === "Qarzni to'lash" && (
        <div className="kimdandebt">
          <Input
            ref={inputRef}
            className="debt-input"
            placeholder="Kimdan"
            value={selectedCategory?.label || ""}
            onChange={(e) => setSelectedCategory({ value: e.target.value, label: e.target.value })}
            onClick={() => setIsModalOpen(true)}
          />
          <div className={`kimdandebt_modal ${isModalOpen ? "open" : ""}`} ref={modalRef}>
            <ul>
              {myDebtsAll?.innerData?.map((value) => (
                <li
                  key={value._id}
                  onClick={() => {
                    setSelectedCategory({ value: value._id, label: value.name });
                    setIsModalOpen(false);
                  }}
                >
                  <span>{value.name}</span>
                  {/* Naqd va dollar valyutalari uchun ma'lumotlarni ko'rsatish */}
                  {["Naqd", "dollar"].map((type) => (
                    <CurrencyInfo
                      key={type}
                      type={type}
                      data={value?.remainingByType?.[type]}
                    />
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {expenseCategory === "Yetkazib beruvchilar" && (
        <div className="kimdandebt">
          <Input
            ref={inputRef}
            className="debt-input"
            placeholder="Kimga"
            value={selectedCategory?.label || ""}
            onChange={(e) => setSelectedCategory({ value: e.target.value, label: e.target.value })}
            onClick={() => setIsModalOpen(true)}
          />
          <div className={`kimdandebt_modal ${isModalOpen ? "open" : ""}`} ref={modalRef}>
            <ul>
              {drivers?.map((value) => (
                <li
                  key={value._id}
                  onClick={() => {
                    setSelectedCategory({ value: value._id, label: value.name });
                    setIsModalOpen(false);
                  }}
                >
                  <span>{value.name}</span>
                  <span>{new Intl.NumberFormat('uz-UZ',).format(value.balance)} so'm</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}



      {expenseCategory === "Soldo" && (
        <>
          <div className="soldiform">
            <Input
              placeholder="Do'konlar"
              value={newShop}
              onChange={(e) => setNewShop(e.target.value)}
              onClick={() => setSoldiformModal(!soldiformModal)}
            />
            {soldiformModal &&
              <div className="soldiformModal">
                {shops.map((shop, index) => (
                  <p
                    key={index}
                    onClick={() => {
                      setNewShop(shop.value);
                      setSoldiformModal(false);
                    }}
                  >
                    {shop.value}
                  </p>
                ))}
              </div>
            }
          </div>

          <div style={{ display: "flex", gap: "10px" }}>


            <Input
              placeholder="Pul miqdori"
              value={expenseAmount}
              onChange={handleChange}
            />

          </div>
        </>
      )}

      {expenseCategory !== "Soldo" && (
        expensePaymentType === "dollar" && expenseAmount ? (
          <div className="ish-haqi-avans" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
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
        )
      )}

      <Input.TextArea
        placeholder="Qo‘shimcha Ma'lumot"
        value={expenseDescription}
        onChange={(e) => setExpenseDescription(e.target.value)}
        rows={6}
        autoSize={{ minRows: 6, maxRows: 10 }}
        style={{ width: "100%", borderRadius: "8px", padding: "10px", fontSize: "14px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
      />

      <Button style={{ background: "#0A3D3A" }} type="primary" htmlType="submit">
        Saqlash
      </Button>
    </form>
  );
};

export default ExpenseForm;
