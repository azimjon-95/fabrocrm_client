import { RiUserAddFill } from "react-icons/ri";
import { AppstoreAddOutlined } from '@ant-design/icons';
import { MdChecklist } from "react-icons/md";
import { MoneyCollectOutlined } from '@ant-design/icons';
import { AiOutlineLineChart } from "react-icons/ai";
import { MdOutlineWarehouse } from "react-icons/md";
import { DashboardOutlined, ShoppingCartOutlined } from "@ant-design/icons";


export const menuItems = {
    accountant: [
        { icon: <AiOutlineLineChart size={20} />, path: "/accountant", label: "Buxgalter" },
        { icon: <RiUserAddFill size={20} />, path: "/persons", label: "Hodimlar" },
        { icon: <MdChecklist size={20} />, path: "/attendance", label: "Davomat" },
        { icon: <MoneyCollectOutlined size={20} />, path: "/salary", label: "Oylik ish maosh" },
        { icon: <AppstoreAddOutlined size={20} />, path: "/setting", label: "Sozlama" },
    ],
    manager: [
        { icon: <DashboardOutlined size={20} />, path: "/main/orders", label: "Buyurtmalar boshqaruvi" },
        { icon: <ShoppingCartOutlined size={23} />, path: "/manager", label: "Buyurtma qabul qilish" },
        { icon: <MdOutlineWarehouse size={20} />, path: "/manag/warehouse", label: "Omborxona" },
    ],
    director: [
        { path: "/director", label: "Direktor" },
    ],

    deputy_director: [
        { icon: <RiUserAddFill size={20} />, path: "/director/all/worker", label: "Hodimlar" },

    ],

    warehouseman: [
        { icon: <DashboardOutlined size={20} />, path: "/store/orders", label: "Buyurtmalar" },
        { icon: <MdOutlineWarehouse size={20} />, path: "/warehouseman", label: "Omborxona" },
    ]
};