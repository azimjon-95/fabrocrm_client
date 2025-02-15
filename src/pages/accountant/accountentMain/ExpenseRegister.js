import { useEffect, useState, useRef } from "react";
import "./style.css";
import { RiFileList3Line } from "react-icons/ri";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { BellOutlined } from "@ant-design/icons";
import moment from "moment"; // For handling date formatting
import { Badge, Checkbox, Table, message, Button, Input } from "antd";
import AsyncSelect from "react-select/async"; // Yangi import
import { useGetExpensesByPeriodQuery, useCreateExpenseMutation } from "../../../context/service/expensesApi";
import { useGetOrderListsQuery } from "../../../context/service/listApi";
import NewOrderList from "../../store/NewOrderLists";
import soundFile from "../../../assets/sound.mp3";
import { BsArrowLeftRight } from "react-icons/bs";
import { MdHistory } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

// { selectedDates, setSelectedDates, expenses }

const ExpenseRegister = () => {
    const navigate = useNavigate();
    const modalRef = useRef(null);
    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseDescription, setExpenseDescription] = useState("");
    const [isIncome, setIsIncome] = useState(false);
    const [open, setOpen] = useState(false);
    const [isExpense, setIsExpense] = useState(true);
    const [activeBox, setActiveBox] = useState("expenses");
    const [createExpense] = useCreateExpenseMutation();
    const { data: orderLists } = useGetOrderListsQuery();
    const filteredLists =
        orderLists?.innerData?.filter((i) => i.sentToAccountant && !i.isPaid) || [];

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [selectedDates, setSelectedDates] = useState([startOfMonth, endOfMonth]);
    const { data: expenses } = useGetExpensesByPeriodQuery(
        {
            startDate: selectedDates.length
                ? moment(selectedDates[0]).format("YYYYMMDD")
                : undefined,
            endDate: selectedDates.length
                ? moment(selectedDates[1]).format("YYYYMMDD")
                : undefined,
        },
        { skip: !selectedDates.length }
    );

    const handleDateChange = (e, index) => {
        const newDates = [...selectedDates];
        newDates[index] = new Date(e.target.value);
        setSelectedDates(newDates);
    };

    const [prevIds, setPrevIds] = useState(() => {
        const storedIds = localStorage.getItem("prevIds");
        return storedIds ? JSON.parse(storedIds) : [];
    });
    const [expensePaymentType, setExpensePaymentType] = useState("");
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        if (filteredLists.length > 0) {
            const newIds = filteredLists.map((item) => item._id);
            const newNotifications = newIds.filter((id) => !prevIds.includes(id));

            if (newNotifications.length > 0) {
                newNotifications.forEach((id) => {
                    playNotificationSound();
                    setTimeout(playNotificationSound, 500); // 500ms kechikish bilan 2-marta chalish
                });

                setNotificationCount(newNotifications.length);
                setPrevIds(newIds);
                localStorage.setItem("prevIds", JSON.stringify(newIds));
            }
        }
    }, [filteredLists]);

    const playNotificationSound = () => {
        const audio = new Audio(soundFile);
        audio.play().catch((err) => console.error("Audio playback error:", err));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    // Expense category state (string)
    const [expenseCategory, setExpenseCategory] = useState("");

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
            paymentType: expensePaymentType
        };

        try {
            await createExpense(formData).unwrap();
            message.success("Xarajat muvaffaqiyatli qo'shildi!");
            setExpenseName("");
            setExpenseAmount("");
            setExpenseDescription("");
            setIsIncome(false);
            setIsExpense(true);
            setExpenseCategory("");
        } catch (err) {
            message.error("Xarajatni qo'shishda xatolik yuz berdi.");
        }
    };

    // Type (Kirim/Chiqim) o'zgarganda kategoriya tanlovini tozalash
    const handleTypeChange = (checked, type) => {
        if (type === "income") {
            setIsIncome(checked);
            setIsExpense(!checked);
        } else {
            setIsExpense(checked);
            setIsIncome(!checked);
        }
        setExpenseCategory("");
    };

    // AsyncSelect loadOptions funksiyasi
    const loadCategoryOptions = (inputValue, callback) => {
        const options = (isIncome ? incomeCategories : expenseCategories)
            .filter((cat) =>
                cat.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((cat) => ({ value: cat, label: cat }));
        setTimeout(() => {
            callback(options);
        }, 300);
    };

    // Default options uchun
    const defaultCategoryOptions = (isIncome ? incomeCategories : expenseCategories).map(
        (cat) => ({ value: cat, label: cat })
    );

    const paymentTypeControl = [
        { label: "Naqd", value: "Naqd" },
        { label: "Karta orqali", value: "Karta orqali" },
        { label: "Bank orqali", value: "Bank orqali" },
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
        <div className="box_expense-register">
            {activeBox === "info" && (
                <div className="rangePicker" ref={modalRef}>
                    <button onClick={() => setOpen(!open)} className="toggle-btn">
                        {formatDate(selectedDates[0])} <BsArrowLeftRight />{" "}
                        {formatDate(selectedDates[1])}
                    </button>
                    {open && (
                        <div className="dropdown-modal">
                            <input
                                type="date"
                                value={formatDate(selectedDates[0])}
                                onChange={(e) => handleDateChange(e, 0)}
                            />
                            <span>
                                {" "}
                                <BsArrowLeftRight />{" "}
                            </span>
                            <input
                                type="date"
                                value={formatDate(selectedDates[1])}
                                onChange={(e) => handleDateChange(e, 1)}
                            />
                        </div>
                    )}
                </div>
            )}
            {activeBox === "notifications" && (
                <button
                    onClick={() => navigate("/order/history/lists")}
                    className="notifications-story"
                >
                    <MdHistory size={20} />
                </button>
            )}
            <div className="box_expense-register_menu">
                <button
                    onClick={() => setActiveBox("notifications")}
                    className={`box_expense-register_btn ${activeBox === "notifications" ? "active" : ""
                        }`}
                >
                    <BellOutlined />
                    <Badge
                        className="box_expense-register_svg"
                        count={notificationCount}
                        size="small"
                        offset={[4, -4]}
                    />
                </button>

                <button
                    onClick={() => setActiveBox("info")}
                    className={`box_expense-register_btn ${activeBox === "info" ? "active" : ""
                        }`}
                >
                    <RiFileList3Line size={20} />
                </button>

                <button
                    onClick={() => setActiveBox("expenses")}
                    className={`box_expense-register_btn ${activeBox === "expenses" ? "active" : ""
                        }`}
                >
                    <HiOutlinePencilSquare size={20} />
                </button>
            </div>

            <h3>
                {activeBox === "notifications"
                    ? "Bildirishnomalar"
                    : activeBox === "info"
                        ? "Xarajatlar Ro'yxati"
                        : "Xarajatlar Qo'shish"}
            </h3>

            <div className="box_expense-content">
                {activeBox === "notifications" && (
                    <NewOrderList list={true} filteredLists={filteredLists} />
                )}

                {activeBox === "expenses" && (
                    <form onSubmit={handleSubmit}>
                        <Input
                            type="text"
                            placeholder="Xarajat nomi"
                            value={expenseName}
                            onChange={(e) => setExpenseName(e.target.value)}
                        />

                        <Input
                            type="number"
                            placeholder="Miqdori"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                        />

                        <Checkbox
                            className="custom-checkbox"
                            checked={isIncome}
                            onChange={(e) => handleTypeChange(e.target.checked, "income")}
                        >
                            Kirim
                        </Checkbox>

                        <Checkbox
                            className="custom-checkbox"
                            checked={isExpense}
                            onChange={(e) => handleTypeChange(e.target.checked, "expense")}
                        >
                            Chiqim
                        </Checkbox>

                        {/* React-select asinxron dropdown */}
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
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
                                placeholder="Kategoriya tanlang"
                                menuPlacement="top"
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
                                menuPlacement="top"
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
                            {isIncome ? "Kirim Qo'shish" : "Chiqim Qo'shish"}
                        </Button>
                    </form>
                )}

                {activeBox === "info" && expenses?.innerData?.length > 0 && (
                    <div className="additional-box">
                        <Table
                            dataSource={expenses?.innerData}
                            columns={[
                                { title: "Xarajat Nomi", dataIndex: "name", key: "name" },
                                {
                                    title: "Miqdor",
                                    dataIndex: "amount",
                                    key: "amount",
                                    render: (text) =>
                                        `${new Intl.NumberFormat("uz-UZ").format(text)} so'm`,
                                },
                                { title: "Tavsif", dataIndex: "description", key: "description" },
                            ]}
                            rowKey="_id"
                            pagination={false}
                            size="small"
                            bordered
                            scroll={{ x: "max-content" }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseRegister;
