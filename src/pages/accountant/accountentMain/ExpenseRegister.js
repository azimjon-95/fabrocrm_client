import { useEffect, useState, useCallback, useRef } from "react";
import "./style.css";
import { RiFileList3Line } from "react-icons/ri";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { BellOutlined } from "@ant-design/icons";
import {
  BsCaretUpFill,
  BsCaretDownFill,
  BsArrowLeftRight,
} from "react-icons/bs";
import { Badge, Table, Tooltip } from "antd";
import * as XLSX from "xlsx";
import { IoMdRadioButtonOn } from "react-icons/io";
import { useGetOrderListsQuery } from "../../../context/service/listApi";
import NewOrderList from "../../store/NewOrderLists";
import soundFile from "../../../assets/sound.mp3";
import { MdHistory } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ExpenseForm from "./ExpenseForm";
import { LiaFileDownloadSolid } from "react-icons/lia";

const formatDate = (date) => date.toISOString().split("T")[0];
const oylar = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

const ExpenseRegister = ({ selectedDates, setSelectedDates, expenses }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeBox, setActiveBox] = useState("expenses");
  const [activeDataset, setActiveDataset] = useState("allExpenses");
  const { data: orderLists } = useGetOrderListsQuery();
  const filteredLists =
    orderLists?.innerData?.filter((i) => i.sentToAccountant && !i.isPaid) || [];
  const [prevIds, setPrevIds] = useState(
    () => JSON.parse(localStorage.getItem("prevIds")) || []
  );
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const newIds = filteredLists.map((i) => i._id);
    const newNotifications = newIds.filter((id) => !prevIds.includes(id));
    if (newNotifications.length > 0) {
      newNotifications.forEach(() => {
        const audio = new Audio(soundFile);
        audio.play().catch(console.error);
        setTimeout(() => audio.play().catch(console.error), 500);
      });
      setNotificationCount(newNotifications.length);
      setPrevIds(newIds);
      localStorage.setItem("prevIds", JSON.stringify(newIds));
    }
  }, [filteredLists]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleData = useCallback(() => {
    setActiveDataset((prev) =>
      prev === "allExpenses"
        ? "outgoingExpenses"
        : prev === "outgoingExpenses"
        ? "incomeExpenses"
        : "allExpenses"
    );
  }, []);

  const activeData = expenses?.innerData?.[activeDataset] || [];

  const columns = [
    {
      title: (
        <button className="toggle-btn" onClick={toggleData}>
          <IoMdRadioButtonOn />
        </button>
      ),
      dataIndex: "type",
      render: (text) =>
        text === "Kirim" ? (
          <BsCaretDownFill style={{ color: "green" }} />
        ) : (
          <BsCaretUpFill style={{ color: "red" }} />
        ),
    },
    { title: "Xarajat Nomi", dataIndex: "name", key: "name" },
    {
      title: "Miqdor",
      dataIndex: "amount",
      key: "amount",
      render: (text) => `${new Intl.NumberFormat("uz-UZ").format(text)} so'm`,
    },
    {
      title: "Tavsif",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Tooltip title={text}>
          <span>{text.split(" ").slice(0, 2).join(" ")}...</span>
        </Tooltip>
      ),
    },
    {
      title: "Sana/Soat",
      dataIndex: "date",
      key: "date",
      render: (date) =>
        `${new Date(date).getDate()}-${
          oylar[new Date(date).getMonth()]
        }/${new Date(date).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
    },
  ];

  const exportToExcel = () => {
    if (activeData.length === 0) {
      alert("Ma'lumotlar yo'q!");
      return;
    }

    const isKirim = activeData.every((item) => item.type === "Kirim");

    // activeData dan eng eski va eng yangi sanani topish
    const sortedDates = activeData
      .map((item) => new Date(item.date))
      .sort((a, b) => a - b);

    const firstDate = sortedDates.length > 0 ? sortedDates[0] : new Date();
    const lastDate =
      sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : new Date();

    // YYYY-MM-DD formatida olish
    const firstDateStr = `${firstDate.getFullYear()}-${String(
      firstDate.getMonth() + 1
    ).padStart(2, "0")}-${String(firstDate.getDate()).padStart(2, "0")}`;
    const lastDateStr = `${lastDate.getFullYear()}-${String(
      lastDate.getMonth() + 1
    ).padStart(2, "0")}-${String(lastDate.getDate()).padStart(2, "0")}`;

    // Fayl nomini yaratish
    const fileName = isKirim
      ? `kirimlar_${firstDateStr}_dan_${lastDateStr}.xlsx`
      : `xarajatlar_${firstDateStr}_dan_${lastDateStr}.xlsx`;

    // Jami summalarni hisoblash
    const totalIncome = activeData
      .filter((item) => item.type === "Kirim")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = activeData
      .filter((item) => item.type !== "Kirim")
      .reduce((sum, item) => sum + item.amount, 0);

    // Excel jadvaliga qo‘shiladigan ma'lumotlar
    const wsData = activeData.map((item) => {
      const itemDate = new Date(item.date);
      return {
        Turi:
          item.type === "Kirim"
            ? "Kirim (Mijozlardan tushgan pullar)"
            : "Chiqim (Xarajatlar)",
        "Xarajat Nomi": item.name,
        Miqdor: `${new Intl.NumberFormat("uz-UZ").format(item.amount)} so'm`,
        Tavsif: item.description,
        "Tulov turi": item.paymentType,
        "Sana/Soat": `${itemDate.getFullYear()}-${String(
          itemDate.getMonth() + 1
        ).padStart(2, "0")}-${String(itemDate.getDate()).padStart(
          2,
          "0"
        )} ${itemDate.toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      };
    });

    // Jami summani qo‘shish
    wsData.push({
      Turi: "Jami",
      "Xarajat Nomi": "",
      Miqdor: `Kirim: ${new Intl.NumberFormat("uz-UZ").format(
        totalIncome
      )} so'm | Chiqim: ${new Intl.NumberFormat("uz-UZ").format(
        totalExpense
      )} so'm`,
      Tavsif: "",
      "Tulov turi": "",
      "Sana/Soat": "",
    });

    const ws = XLSX.utils.json_to_sheet(wsData);

    // Ustun kengliklarini moslashtirish
    const colWidths = Object.keys(wsData[0]).map((key, i) => ({
      wch: Math.max(
        key.length,
        ...wsData.map((row) => (row[key] ? row[key].toString().length : 10))
      ),
    }));

    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Xarajatlar");

    XLSX.writeFile(wb, fileName);
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
                onChange={(e) =>
                  setSelectedDates([new Date(e.target.value), selectedDates[1]])
                }
              />
              <BsArrowLeftRight />
              <input
                type="date"
                value={formatDate(selectedDates[1])}
                onChange={(e) =>
                  setSelectedDates([selectedDates[0], new Date(e.target.value)])
                }
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
          className={`box_expense-register_btn ${
            activeBox === "notifications" ? "active" : ""
          }`}
        >
          <BellOutlined />
          <Badge count={notificationCount} size="small" offset={[4, -4]} />
        </button>
        <button
          onClick={() => setActiveBox("info")}
          className={`box_expense-register_btn ${
            activeBox === "info" ? "active" : ""
          }`}
        >
          <RiFileList3Line size={20} />
        </button>
        <button
          onClick={() => setActiveBox("expenses")}
          className={`box_expense-register_btn ${
            activeBox === "expenses" ? "active" : ""
          }`}
        >
          <HiOutlinePencilSquare size={20} />
        </button>
        {activeBox === "info" && (
          <button
            onClick={exportToExcel}
            className={`box_expense-register_btn ${
              activeBox === "expenses" ? "active" : ""
            }`}
          >
            <LiaFileDownloadSolid />
          </button>
        )}
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
          <NewOrderList list filteredLists={filteredLists} />
        )}
        {activeBox === "expenses" && <ExpenseForm />}
        {activeBox === "info" &&
          expenses?.innerData?.allExpenses?.length > 0 && (
            <Table
              dataSource={activeData}
              columns={columns}
              rowKey="_id"
              pagination={false}
              size="small"
              bordered
              scroll={{ x: "max-content" }}
            />
          )}
      </div>
    </div>
  );
};

export default ExpenseRegister;
