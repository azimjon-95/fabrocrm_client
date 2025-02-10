import { useEffect, useState } from "react";
import "./style.css";
import { RiFileList3Line } from "react-icons/ri";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { BellOutlined } from "@ant-design/icons";
import moment from 'moment'; // For handling date formatting
import { DatePicker, Badge, Checkbox, Table, message, Button, Input } from "antd";
import { useGetExpensesByPeriodQuery, useCreateExpenseMutation } from '../../../context/service/expensesApi';
const { RangePicker } = DatePicker;
const ExpenseRegister = () => {
    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseDescription, setExpenseDescription] = useState("");
    const [isIncome, setIsIncome] = useState(false);
    const [isExpense, setIsExpense] = useState(true);
    const [activeBox, setActiveBox] = useState("expenses");
    const [notificationCount, setNotificationCount] = useState(5);
    const [createExpense] = useCreateExpenseMutation();
    // Default state
    const startOfMonth = moment().startOf("month");
    const endOfMonth = moment().endOf("month");
    const [selectedDates, setSelectedDates] = useState([startOfMonth, endOfMonth]);



    const { data: expenses, refetch } = useGetExpensesByPeriodQuery(
        {
            startDate: moment(selectedDates[0]).format("YYYY-MM-DD"),
            endDate: moment(selectedDates[1]).format("YYYY-MM-DD"),
        },
        { skip: !selectedDates.length } // Agar sanalar yo'q bo'lsa, so‘rov yuborilmaydi
    );

    const handleChange = (values) => {
        if (values) {
            setSelectedDates(values);
        }
    };


    useEffect(() => {
        if (selectedDates.length === 2) {
            refetch();
        }
    }, [selectedDates, refetch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            name: expenseName,
            amount: expenseAmount,
            amountType: isIncome ? "Kirim" : (isExpense ? "Chiqim" : ""),
            description: expenseDescription,
        };

        try {
            await createExpense(formData).unwrap();

            // Show success message
            message.success("Xarajat muvaffaqiyatli qo'shildi!");

            // Clear input fields after successful submission
            setExpenseName("");
            setExpenseAmount("");
            setExpenseDescription("");
            setIsIncome(false);
            setIsExpense(true);
        } catch (err) {
            // Show error message
            message.error("Xarajatni qo'shishda xatolik yuz berdi.");
        }
    };

    const handleIncomeChange = (e) => {
        setIsIncome(e.target.checked);
        if (e.target.checked) {
            setIsExpense(false);
        }
    };

    const handleExpenseChange = (e) => {
        setIsExpense(e.target.checked);
        if (e.target.checked) {
            setIsIncome(false);
        }
    };

    const toggleBox = (box) => {
        setActiveBox(box);
    };

    const getBoxTitle = () => {
        switch (activeBox) {
            case "notifications":
                return "Bildirishnomalar";
            case "info":
                return "Xarajatlar Ro'yxati";
            default:
                return "Xarajatlar Qo'shish";
        }
    };



    const columns = [
        {
            title: 'Xarajat Nomi',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Miqdor',
            dataIndex: 'amount',
            key: 'amount',
            render: (text) => {
                return `${new Intl.NumberFormat('uz-UZ').format(text)} so'm`;
            },
        },
        {
            title: 'Tavsif',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Sanasi',
            dataIndex: 'date',
            key: 'date',
            render: (text) => {
                const date = new Date(text);
                const day = date.getDate();

                // Month names in Uzbek
                const months = [
                    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
                    'Iyul', 'Avgust', 'Sentabr', 'Oktyabr', 'Noyabr', 'Dekabr'
                ];
                const month = months[date.getMonth()]; // Get the month in Uzbek

                const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of the year
                const hours = date.getHours();
                const minutes = date.getMinutes();

                // Time in Uzbek format: "PM" -> "Kechqurun", "AM" -> "Tong"
                const time = (hours >= 12)
                    ? `${hours - 12}:${minutes < 10 ? '0' + minutes : minutes}`
                    : `${hours === 0 ? 12 : hours}:${minutes < 10 ? '0' + minutes : minutes}`;

                return `${day}-${month}/${year} | ${time}`;
            }
        }


    ];
    // Calculate total amount for the footer
    const totalAmount = expenses?.innerData?.reduce((acc, expense) => acc + expense.amount, 0);


    return (
        <div className="box_expense-register">
            <div className="box_expense-register_menu">
                <button
                    onClick={() => toggleBox("notifications")}
                    className={`box_expense-register_btn ${activeBox === "notifications" ? "active" : ""}`}
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
                    onClick={() => toggleBox("info")}
                    className={`box_expense-register_btn ${activeBox === "info" ? "active" : ""}`}
                >
                    <RiFileList3Line size={20} />
                </button>

                <button
                    onClick={() => toggleBox("expenses")}
                    className={`box_expense-register_btn ${activeBox === "expenses" ? "active" : ""}`}
                >
                    <HiOutlinePencilSquare size={20} />
                </button>
            </div>
            {
                activeBox === "info" && (
                    <br />
                )
            }

            <h3>{getBoxTitle()}</h3>

            <div className="box_expense-content">
                {activeBox === "notifications" && (
                    <div className="additional-box">
                        <h4>Bildirishnomalar</h4>
                        <p>Bu yerda bildirishnomalar bo'lishi mumkin.</p>
                    </div>
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

                        <Checkbox checked={isIncome} onChange={handleIncomeChange}>
                            Kirm
                        </Checkbox>

                        <Checkbox checked={isExpense} onChange={handleExpenseChange}>
                            Chiqim
                        </Checkbox>

                        <Input.TextArea
                            placeholder="Qo‘shimcha Ma'lumot"
                            value={expenseDescription}
                            onChange={(e) => setExpenseDescription(e.target.value)}
                            rows={4}
                        />

                        <Button type="primary" htmlType="submit">
                            Xarajat Qo'shish
                        </Button>
                    </form>
                )}

                {activeBox === "info" && (
                    <div className="additional-box">

                        <RangePicker
                            open={false}
                            onChange={handleChange}
                            defaultValue={[startOfMonth, endOfMonth]}
                            allowClear

                            className="rangePicker"
                        />
                        {activeBox === "info" && expenses?.innerData?.length > 0 && (


                            <Table
                                dataSource={expenses?.innerData}
                                columns={columns}
                                rowKey="_id"
                                pagination={false} // You can turn this on if you need pagination
                                size="small" // Set table size to small
                                bordered // Add border around the table
                                scroll={{ x: 'max-content' }}
                                footer={() => (
                                    <div className="table-footer">
                                        <strong>Jami Xarajatlar: </strong>
                                        <span>{new Intl.NumberFormat('uz-UZ').format(totalAmount)}  So'm</span>
                                    </div>
                                )}
                            />

                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseRegister;



