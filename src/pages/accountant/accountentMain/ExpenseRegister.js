import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import "./style.css";
import { RiFileList3Line } from "react-icons/ri";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { BellOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  BsCaretUpFill,
  BsCaretDownFill,
  BsArrowLeftRight,
} from "react-icons/bs";
import {
  Table,
  Tooltip, Modal,
  Input,
  Select, Form,
  Button, Switch,
  Popconfirm,
  message, InputNumber, DatePicker
} from "antd";
import * as XLSX from "xlsx";
import { IoMdRadioButtonOn } from "react-icons/io";
import { FaTruck } from "react-icons/fa6";
import { MdHistory } from "react-icons/md";
import { FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoMdCreate } from "react-icons/io";
import ExpenseForm from "./ExpenseForm";
import { LiaFileDownloadSolid } from "react-icons/lia";
import ShopsNotification from "../../store/ShopsNotification";
import { useGetDebtorsQuery } from "../../../context/service/orderApi";
import {
  useGetDriversQuery,
  useCreateDriverMutation,
  useDeleteDriverMutation
} from "../../../context/service/driverApi";
import {
  useDeleteExpenseMutation,
} from "../../../context/service/expensesApi";

const { TextArea } = Input;


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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalSwitch, setIsModalSwitch] = useState(false);
  const [form] = Form.useForm();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const { data: debtorsData } = useGetDebtorsQuery();
  const [deleteExpense] = useDeleteExpenseMutation();
  const [deleteDriver] = useDeleteDriverMutation();
  const { data: driversData } = useGetDriversQuery();
  const [createDriver] = useCreateDriverMutation();
  const drivers = driversData?.innerData || [];
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [isSoldo, setIsSoldo] = useState(false);

  const handleOpenHistoryModal = (stroy) => {
    setHistoryData(stroy || []);
    setHistoryVisible(true);
  };
  const activeData = useMemo(
    () => expenses?.innerData?.[activeDataset] || [],
    [expenses, activeDataset]
  );

  // Compute filteredData with useMemo instead of useEffect
  const filteredData = useMemo(() => {
    let filtered = activeData;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by searchText (name or category)
    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.category.toLowerCase().includes(searchText.toLowerCase()) ||
          item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchText, activeData]);

  // Extract unique categories from activeData
  const categories = ["all", ...new Set(activeData.map((item) => item.category))];

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

  const deleteExpenseHandler = async (id) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      message.error("Xatolik yuz berdi");
      console.log(error);
    }
  };

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
    {
      title: "Kategoriya",
      dataIndex: "category",
      key: "category",
    },
    { title: "Xarajat Nomi", dataIndex: "name", key: "name" },
    {
      title: "Miqdor",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => {
        let currency = "so'm";
        if (record.paymentType === "dollar") currency = "$";
        else if (record.paymentType === "Naqd") currency = "so'm";
        else if (record.paymentType === "Bank orqali") currency = "so'm";
        return `${new Intl.NumberFormat("uz-UZ").format(text)} ${currency}`;
      },
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
        `${new Date(date).getDate()}-${oylar[new Date(date).getMonth()]
        }/${new Date(date).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, item) => (
        <div>
          <Popconfirm
            title="Xarajatni o'chirishni tasdiqlaysizmi?"
            onConfirm={() => deleteExpenseHandler(item._id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </div>
      ),
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
  let title = "";

  if (activeBox === "notifications") {
    title = "Buyurtmalar Ro'yxati";
  } else if (activeBox === "info") {
    title = "Xarajatlar Ro'yxati";
  } else if (activeBox === "dilivery") {
    title = "Yetkazib berish Ro'yxati";
  } else {
    title = "Xarajatlar Qo'shish";
  }

  const handleDelete = (record) => {

    try {
      deleteDriver(record).unwrap();
      message.success("Yetkazib beruvchi o'chirildi");
    } catch (error) {
      message.error(error.message || "O'chirishda xatolik yuz berdi.");
    }
  };



  const openModal = (driver = null) => {
    setIsModalOpen(true);

    // Formga qiymatlarni yuklash
    if (driver) {
      form.setFieldsValue({
        driver: {
          name: driver.name || "",
          phone: driver.phone || "",
        },
        fare: driver.fare || 0,
        state: driver.state || "olib keldi",
        description: driver.description || "",
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        fare: 0,
        state: "olib keldi",
      });
    }
  };

  const handleCreateDriver = async (values) => {
    try {
      const payload = {
        ...values,
        name: values?.driver?.name || values.name,
        phone: values?.driver?.phone || values.phone,
        selectedOrders: selectedOrders || [],
      };

      await createDriver(payload).unwrap();
      message.success("Yetkazib beruvchi muvaffaqiyatli qo'shildi");
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      message.error(error?.data?.message || "Qo'shishda xatolik yuz berdi.");
    }
  };

  const driverColumns = [
    {
      title: "Yetkazib beruvchi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Telefon raqami",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => `+998 ${phone}`,
    },
    {
      title: "Balans",
      dataIndex: "balance",
      key: "balance",
      render: (_, record) => `${record.balance.toLocaleString()} so'm`,
    },
    {
      title: "Yuklash",
      key: "upload",
      render: (_, record) => (
        <Button
          danger
          type="dashed"
          onClick={() => { openModal(record); setIsModalSwitch(false) }}
          style={{ "padding": "3px 8px", "height": "25px", "display": "flex", "alignItems": "center", "justifyContent": "center" }}
        ><FaTruck size={20} style={{ "margin": 0 }} />
        </Button>
      ),
    },
    {
      title: "Tarix",
      key: "history",
      render: (_, record) => (
        <Button
          danger
          type="dashed"
          title="Tarixni ko'rish"
          onClick={() => handleOpenHistoryModal(record.stroy)}
          style={{
            padding: "3px 8px",
            height: "25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <FaHistory />
        </Button>
      )
    },
    {
      title: "O'chirish",
      key: "delete",
      render: (_, record) => {
        if (record.balance > 0) {
          return (
            <Button
              icon={<DeleteOutlined />}
              danger
              disabled
              title="Avval qarzni to‘lang"
            >
            </Button>
          );
        }

        return (
          <Popconfirm
            title="O'chirishni tasdiqlaysizmi?"
            onConfirm={() => handleDelete(record._id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button icon={<DeleteOutlined />} danger>
            </Button>
          </Popconfirm>
        );
      },
    },
  ];


  return (
    <div className="box_expense-register">
      {activeBox === "info" && (
        <div className="rangePicker" ref={modalRef}>
          <button onClick={() => setOpen(!open)} className="toggle-btn">
            {formatDate(selectedDates[0])} <BsArrowLeftRight />{" "}
            {formatDate(selectedDates[1])}
          </button>

          <Select
            defaultValue="all"
            onChange={(value) => setSelectedCategory(value)}
            style={{
              width: 170,
              height: 33,
              marginTop: "-2px",
              borderRadius: "0 0 5px 5px",
            }}
            allowClear
            onClear={() => setSelectedCategory("all")}
          >
            {categories.map((category) => (
              <Select.Option key={category} value={category}>
                {category === "all" ? "Barcha Kategoriyalar" : category}
              </Select.Option>
            ))}
          </Select>
          <Input
            placeholder="Qidirish..."
            size="small"
            onClear={() => setSearchText("")}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: 170,
              height: 31,
              marginTop: "-2px",
              borderRadius: "0 0 5px 5px",
            }}
          />

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

      {activeBox === "dilivery" && (
        <button
          onClick={() => { openModal(); setIsModalSwitch(true); }}
          className="notifications-story"
        >

          <IoMdCreate size={20} />
        </button>
      )}
      <div className="box_expense-register_menu">
        <button
          onClick={() => setActiveBox("dilivery")}
          className={`box_expense-register_btn ${activeBox === "dilivery" ? "active" : ""
            }`}
        >
          <FaTruck size={20} />
        </button>
        <button
          onClick={() => setActiveBox("notifications")}
          className={`box_expense-register_btn ${activeBox === "notifications" ? "active" : ""
            }`}
        >
          <BellOutlined />
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
        {activeBox === "info" && (
          <button
            onClick={exportToExcel}
            className={`box_expense-register_btn ${activeBox === "info" ? "active" : ""
              }`}
          >
            <LiaFileDownloadSolid />
          </button>
        )}
      </div>
      <h3 className={activeBox === "info" ? "infoActive" : ""}>{title}</h3>
      <div className="box_expense-content">
        {activeBox === "notifications" && <ShopsNotification />}
        {activeBox === "expenses" && <ExpenseForm />}
        {activeBox === "info" &&
          expenses?.innerData?.allExpenses?.length > 0 && (
            <Table
              dataSource={[...filteredData].reverse()}
              columns={columns}
              rowKey="_id"
              pagination={false}
              size="small"
              bordered
              scroll={{ x: "max-content" }}
            />
          )}
        {activeBox === "dilivery" &&
          <Table
            dataSource={drivers}
            columns={driverColumns}
            rowKey="_id"
            pagination={false}
            size="small"
            bordered
            scroll={{ x: "max-content" }}
          />}
      </div>

      <Modal
        title="Yetkazib beruvchi qo'shish"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <Form layout="vertical" form={form} onFinish={handleCreateDriver}>
          <div className="modal-titleSoldo">
            {
              isModalSwitch && (
                <Form.Item
                  label="Soldo"
                  name={["driver", "soldo"]}
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Ha" unCheckedChildren="Yo'q" onChange={(checked) => setIsSoldo(checked)} />
                </Form.Item>
              )
            }

            {isSoldo && isModalSwitch && (
              <Form.Item
                label="Qaysi oy uchun?"
                name={["driver", "month"]} style={{ width: "100%" }}
                rules={[{ required: isSoldo ? true : false, message: "Iltimos, oyni tanlang" }]}
              >
                <DatePicker picker="month"
                  style={{ width: "100%" }}
                  format="YYYY-MM"
                  placeholder="Oy tanlang" />
              </Form.Item>
            )}

          </div>
          <Form.Item
            label="Aktiv buyurtmalar "
          >
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Buyurtmalarni tanlang"
              options={debtorsData?.innerData?.map(order => ({
                label: order.customer.fullName,
                value: order._id,
              }))}
              onChange={setSelectedOrders}
            />
          </Form.Item>
          <Form.Item
            label="Ismi"
            name={["driver", "name"]}
            rules={[{ required: true, message: "Iltimos, ismini kiriting" }]}
          >
            <Input placeholder="Masalan: Ali" />
          </Form.Item>

          <Form.Item
            label="Telefon"
            name={["driver", "phone"]}
            rules={[{ pattern: /^\d{9,12}$/, message: "To‘g‘ri telefon raqami kiriting" }]}
          >
            <Input addonBefore="+998" placeholder="901234567" />
          </Form.Item>

          <Form.Item
            label="Narxi (so‘m)"
            name="fare"
            rules={[{ required: true, message: "Narxni kiriting" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={1000}
              placeholder="Masalan: 150000"
            />
          </Form.Item>

          <Form.Item
            label="Holati"
            name="state"
            rules={[{ required: true, message: "Holatni tanlang" }]}
          >
            <Select>
              <Select.Option value="olib keldi">Olib keldi</Select.Option>
              <Select.Option value="olib ketdi">Olib ketdi</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Izoh" name="description">
            <TextArea rows={3} placeholder="Izoh kiriting (ixtiyoriy)" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ backgroundColor: "#0a3d3a", fontWeight: 600 }}
            >
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
        title="Tarix"
        width={600}
      >
        <Table
          dataSource={historyData}
          rowKey="_id"
          pagination={false}
          bordered
          size="small"
          columns={[
            {
              title: "Sana",
              dataIndex: "date",
              key: "date",
              render: (date) => new Date(date).toLocaleString("uz-UZ")
            },

            {
              title: "Izoh",
              dataIndex: "description",
              key: "description"
            },
            {
              title: "Narx",
              dataIndex: "price",
              key: "price",
              render: (price) => `${price.toLocaleString()} so'm`
            },
            {
              title: "Holat",
              dataIndex: "state",
              key: "state"
            }
          ]}
        />
      </Modal>

    </div>
  );
};

export default ExpenseRegister;