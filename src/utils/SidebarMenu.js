import { RiUserAddFill } from "react-icons/ri";
import { AiOutlineLineChart } from "react-icons/ai";
import { AppstoreAddOutlined, DashboardOutlined, MoneyCollectOutlined, ShoppingCartOutlined, FileTextOutlined } from "@ant-design/icons";
import { MdChecklist, MdOutlineWarehouse } from "react-icons/md";
import { FaWarehouse, FaClipboardList } from "react-icons/fa"; // Bo‘lim ikonkalari uchun


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

    deputy: [
        { icon: <RiUserAddFill size={20} />, path: "/deputy", label: "Hodimlar" },

        {
            icon: <AiOutlineLineChart size={20} />,
            label: "Buxgalteriya",
            children: [
                { icon: <AiOutlineLineChart size={20} />, path: "/accountant", label: "Buxgalter" },
                // { icon: <RiUserAddFill size={20} />, path: "/persons", label: "Hodimlar" },
                { icon: <MdChecklist size={20} />, path: "/attendance", label: "Davomat" },
                { icon: <MoneyCollectOutlined size={20} />, path: "/salary", label: "Oylik ish maosh" },
                { icon: <AppstoreAddOutlined size={20} />, path: "/setting", label: "Sozlama" },
            ]
        },
        {
            icon: <FaClipboardList size={20} />,
            label: "Buyurtmalar boshqaruvi",
            children: [
                { icon: <DashboardOutlined size={20} />, path: "/main/orders", label: "Buyurtmalar boshqaruvi" },
                { icon: <ShoppingCartOutlined size={23} />, path: "/manager", label: "Buyurtma qabul qilish" },
                { icon: <MdOutlineWarehouse size={20} />, path: "/manag/warehouse", label: "Omborxona" },
            ]
        },
        {
            icon: <FaWarehouse size={20} />,
            label: "Omborxona",
            children: [
                { icon: <DashboardOutlined size={20} />, path: "/store/orders", label: "Boshqaruv" },
                { icon: <MdOutlineWarehouse size={20} />, path: "/warehouseman", label: "Omborxona" },
                { icon: <FileTextOutlined style={{ fontSize: 20 }} />, path: "/new/order/lists", label: "Buyurtmalar" },
            ]
        },

    ],

    warehouseman: [
        { icon: <DashboardOutlined size={20} />, path: "/store/orders", label: "Boshqaruv" },
        { icon: <MdOutlineWarehouse size={20} />, path: "/warehouseman", label: "Omborxona" },
        {
            icon: <FileTextOutlined style={{ fontSize: 20 }} />,
            path: "/new/order/lists",
            label: "Buyurtmalar",
        },
    ]
};


