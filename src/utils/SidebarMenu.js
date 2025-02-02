import { RiUserAddFill } from "react-icons/ri";
import { MdDomain } from "react-icons/md";
import { MdChecklist } from "react-icons/md";

export const menuItems = {
    accountant: [
        { path: "/accountant", label: "Buxgalter" },
        { icon: <RiUserAddFill />, path: "/persons", label: "Hodimlar" },
        { icon: <MdChecklist />, path: "/attendance", label: "Davomat" },
    ],
    manager: [
        { icon: <MdDomain />, path: "/manager", label: "Boshqaruv" },
    ],
    director: [{ path: "/director", label: "Direktor" }],
};