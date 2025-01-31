import { RiUserAddFill } from "react-icons/ri";
import { MdDomain } from "react-icons/md";

export const menuItems = {
    accountant: [{ path: "/accountant", label: "Buxgalter" }],
    manager: [
        { icon: <MdDomain />, path: "/manager", label: "Meneger" },
        { icon: <RiUserAddFill />, path: "/persons", label: "Persons" }
    ],
    director: [{ path: "/director", label: "Direktor" }],
};