import { RiUserAddFill } from "react-icons/ri";
import { MdDomain } from "react-icons/md";
import { AppstoreAddOutlined } from '@ant-design/icons';
import { MdChecklist } from "react-icons/md";
import { MoneyCollectOutlined } from '@ant-design/icons';
import { AiOutlineLineChart } from "react-icons/ai";

export const menuItems = {
    accountant: [
        { icon: <AiOutlineLineChart size={20} />, path: "/accountant", label: "Buxgalter" },
        { icon: <RiUserAddFill size={20} />, path: "/persons", label: "Hodimlar" },
        { icon: <MdChecklist size={20} />, path: "/attendance", label: "Davomat" },
        { icon: <MoneyCollectOutlined size={20} />, path: "/salary", label: "Oylik ish maosh" },
        { icon: <AppstoreAddOutlined size={20} />, path: "/setting", label: "Sozlama" },
    ],
    manager: [
        { icon: <MdDomain />, path: "/manager", label: "Boshqaruv" },
    ],
    director: [{ path: "/director", label: "Direktor" }],
};