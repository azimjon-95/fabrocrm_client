import { RiUserAddFill } from "react-icons/ri";
import { AiOutlineLineChart } from "react-icons/ai";
import {
  AppstoreAddOutlined,
  DashboardOutlined,
  MoneyCollectOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { MdChecklist, MdOutlineWarehouse } from "react-icons/md";
import { FaWarehouse, FaClipboardList } from "react-icons/fa"; // Bo‘lim ikonkalari uchun
import { VscChecklist } from "react-icons/vsc";
import { FaTruck } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { TbHeartRateMonitor } from "react-icons/tb";
import { TbReorder } from "react-icons/tb";
import { FiMinusCircle } from "react-icons/fi";

export const menuItems = {
  accountant: [
    {
      icon: <AiOutlineLineChart size={20} />,
      path: "/accountant",
      label: "Buxgalter",
    },
    {
      icon: <FiMinusCircle size={20} />,
      path: "/myDebts",
      label: "Qarzlar",
    },
    {
      icon: <RiUserAddFill size={20} />,
      path: "/persons",
      label: "Hodimlar"
    },
    {
      icon: <MdChecklist size={20} />,
      path: "/attendance",
      label: "Davomat"
    },
    {
      icon: <MoneyCollectOutlined size={20} />,
      path: "/salary",
      label: "Oylik ish maosh",
    },
    {
      icon: <TbReportSearch size={20} />,
      path: "/reportmonthly",
      label: "Oylik hisobot"
    },
    {
      icon: <AppstoreAddOutlined size={20} />,
      path: "/setting",
      label: "Sozlama",
    },
  ],
  manager: [
    {
      icon: <DashboardOutlined size={20} />,
      path: "/main/orders",
      label: "Buyurtmalar boshqaruvi",
    },
    {
      icon: <ShoppingCartOutlined size={23} />,
      path: "/manager",
      label: "Buyurtma qabul qilish",
    },
    {
      icon: <MdOutlineWarehouse size={20} />,
      path: "/manag/warehouse",
      label: "Omborxona",
    },
  ],
  director: [
    {
      icon: <TbHeartRateMonitor size={20} />,
      path: "/director",
      label: "Nazorat",
    },
    {
      icon: <TbReorder size={20} />,
      path: "/director-orders",
      label: "Buyurtmalar",
    },
    {
      icon: <VscChecklist size={20} />,
      path: "/all/attendance",
      label: "Davomat",
    },
    {
      icon: <RiUserAddFill size={20} />,
      path: "/ctrl-persons",
      label: "Hodimlar",
    },
    {
      icon: <MdOutlineWarehouse size={20} />,
      path: "/ctrl-warehouseman",
      label: "Omborxona",
    },
  ],

  deputy: [
    { icon: <RiUserAddFill size={20} />, path: "/deputy", label: "Hodimlar" },

    {
      icon: <AiOutlineLineChart size={20} />,
      label: "Buxgalteriya",
      children: [
        {
          icon: <AiOutlineLineChart size={20} />,
          path: "/accountant",
          label: "Buxgalter",
        },
        {
          icon: <FiMinusCircle size={20} />,
          path: "/myDebts",
          label: "Qarzlar",
        },

        // { icon: <RiUserAddFill size={20} />, path: "/persons", label: "Hodimlar" },
        {
          icon: <MdChecklist size={20} />,
          path: "/attendance",
          label: "Davomat",
        },
        {
          icon: <MoneyCollectOutlined size={20} />,
          path: "/salary",
          label: "Oylik ish maosh",
        },
        {
          icon: <TbReportSearch size={20} />,
          path: "/reportmonthly",
          label: "Oylik hisobot"
        },
        {
          icon: <AppstoreAddOutlined size={20} />,
          path: "/setting",
          label: "Sozlama",
        },
      ],
    },
    {
      icon: <FaClipboardList size={20} />,
      label: "Buyurtmalar boshqaruvi",
      children: [
        {
          icon: <DashboardOutlined size={20} />,
          path: "/main/orders",
          label: "Buyurtmalar boshqaruvi",
        },
        {
          icon: <ShoppingCartOutlined size={23} />,
          path: "/manager",
          label: "Buyurtma qabul qilish",
        },
        {
          icon: <MdOutlineWarehouse size={20} />,
          path: "/manag/warehouse",
          label: "Omborxona",
        },
      ],
    },
    {
      icon: <FaWarehouse size={20} />,
      label: "Omborxona",
      children: [
        {
          icon: <DashboardOutlined size={20} />,
          path: "/store/orders",
          label: "Boshqaruv",
        },
        {
          icon: <MdOutlineWarehouse size={20} />,
          path: "/warehouseman",
          label: "Omborxona",
        },
        {
          icon: <FileTextOutlined style={{ fontSize: 20 }} />,
          path: "/new/order/lists",
          label: "Buyurtmalar",
        },
      ],
    },
    {
      icon: <FaTruck size={20} />,
      label: "Yetkazib beruvchi",
      children: [
        {
          icon: <FaClipboardList size={20} />,
          path: "/distributor",
          label: "Buyurtmalar",
        },
      ],
    },
  ],

  warehouseman: [
    {
      icon: <DashboardOutlined size={20} />,
      path: "/store/orders",
      label: "Boshqaruv",
    },
    {
      icon: <MdOutlineWarehouse size={20} />,
      path: "/warehouseman",
      label: "Omborxona",
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 20 }} />,
      path: "/new/order/lists",
      label: "Buyurtmalar",
    },
  ],
  distributor: [
    {
      icon: <FaClipboardList size={20} />,
      path: "/distributor",
      label: "Buyurtmalar",
    },
  ],
};
