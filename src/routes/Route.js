import React from "react";
import Accountant from "../pages/accountant/accountentMain/AccountentMain";
import Director from "../pages/director/Main/Main";
import Persons from "../pages/accountant/persons/Persons";
import ViewPersons from "../pages/accountant/persons/ViewPersons";
import Attendance from "../pages/accountant/attendance/Attendance";
import SettingsPage from "../pages/accountant/settingsPage/SettingsPage";
import Story from "../pages/accountant/attendance/Story";
import Mengement from "../pages/manager/main/Mengement";
import Salary from "../pages/accountant/salary/Salary";
import OrderDetails from "../pages/accountant/accountentMain/OrderDetails";
import WarehouseForm from "../pages/store/WarehouseForm";
import OrderMengement from "../pages/manager/main/OrderMengement";

export const routes = [


  // Manager
  { path: "/manager", element: <Mengement />, private: true, role: "manager" },

  // Accountant
  { path: "/persons/add", element: <Persons />, private: true, role: "accountant" },
  { path: "/persons", element: <ViewPersons />, private: true, role: "accountant" },
  { path: "/attendance", element: <Attendance />, private: true, role: "accountant" },
  { path: "/attendance/story", element: <Story />, private: true, role: "accountant" },
  { path: "/setting", element: <SettingsPage />, private: true, role: "accountant" },
  { path: "/salary", element: <Salary />, private: true, role: "accountant" },
  { path: "/order/:id", element: <OrderDetails />, private: true, role: "accountant" },
  { path: "/warehouse", element: <WarehouseForm />, private: true, role: "manager" },
  { path: "/order/mengement", element: <OrderMengement />, private: true, role: "manager" },
  {
    path: "/accountant",
    element: <Accountant />,
    private: true,
    role: "accountant",
  },

  // Director
  { path: "/director", element: <Director />, private: true, role: "director" },
];
