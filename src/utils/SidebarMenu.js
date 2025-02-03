import { RiUserAddFill } from "react-icons/ri";
import { MdDomain } from "react-icons/md";
import { AppstoreAddOutlined } from '@ant-design/icons';
import { MdChecklist } from "react-icons/md";
import { MoneyCollectOutlined } from '@ant-design/icons';

export const menuItems = {
    accountant: [
        { path: "/accountant", label: "Buxgalter" },
        { icon: <RiUserAddFill />, path: "/persons", label: "Hodimlar" },
        { icon: <MdChecklist />, path: "/attendance", label: "Davomat" },
        { icon: <MoneyCollectOutlined />, path: "/salary", label: "Oylik ish maosh" },
        { icon: <AppstoreAddOutlined />, path: "/setting", label: "Sozlama" },
    ],
    manager: [
        { icon: <MdDomain />, path: "/manager", label: "Boshqaruv" },
    ],
    director: [{ path: "/director", label: "Direktor" }],
};