import { RiUserAddFill } from "react-icons/ri";
import { MdDomain } from "react-icons/md";
export const menuItems = {
    accountant: [{ path: "/accountant", label: "Buxgalter" }],
    manager: [
        { icon: <MdDomain />, path: "/manager", label: "Boshqaruv" },
        { icon: <RiUserAddFill />, path: "/persons", label: "Hodimlar" }
    ],
    director: [{ path: "/director", label: "Direktor" }],
};