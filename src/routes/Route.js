import React from "react";
import Accountant from "../pages/accountant/accountentMain/AccountentMain";
import Director from "../pages/director/Main/Main";
import RegisterWorker from "../pages/accountant/persons/Persons";
import ViewPersons from "../pages/accountant/persons/ViewPersons";
import Persons from "../pages/director/persons/ViewPersons";
import AddPersons from "../pages/director/persons/Persons";
import Attendance from "../pages/accountant/attendance/Attendance";
import SettingsPage from "../pages/accountant/settingsPage/SettingsPage";
import Story from "../pages/accountant/attendance/Story";
import Order from "../pages/manager/main/Order";
import OrderList from "../pages/manager/main/List/OrderList";
import OrderStory from "../pages/manager/main/List/OrderStory";
import MaterialPage from "../pages/manager/main/List/MaterialPage";
import UpdateOrderForm from "../pages/manager/main/List/UpdateOrderForm";
import Salary from "../pages/accountant/salary/Salary";
import OrderDetails from "../pages/accountant/accountentMain/OrderDetails";
import WarehouseForm from "../pages/store/WarehouseForm";
import OrderMengement from "../pages/manager/main/OrderMengement";
import MainOrder from "../pages/store/List/Main";
import Material from "../pages/store/List/Material";
import GivnMaterial from "../pages/store/List/GivnMaterial";
import NewOrderLists from "../pages/store/NewOrderLists";

export const routes = [

  // Manager
  { path: "/manager", element: <Order />, private: true, role: "manager" },
  { path: "/main/orders", element: <OrderList />, private: true, role: "manager" },
  { path: "/orders/story", element: <OrderStory />, private: true, role: "manager" },
  { path: "/orders/materials/:id", element: <MaterialPage />, private: true, role: "manager" },
  { path: "/orders/update/:id", element: <UpdateOrderForm />, private: true, role: "manager" },
  { path: "/manag/warehouse", element: <WarehouseForm />, private: true, role: "manager" },
  { path: "/order/mengement", element: <OrderMengement />, private: true, role: "manager" },
  { path: "/order/givn/material/:id", element: <GivnMaterial />, private: true, role: "manager" },


  // Store
  { path: "/warehouseman", element: <WarehouseForm />, private: true, role: "warehouseman" },
  { path: "/new/order/lists", element: <NewOrderLists />, private: true, role: "warehouseman" },
  { path: "/store/orders", element: <MainOrder />, private: true, role: "warehouseman" },
  { path: "/store/materials/:id", element: <Material />, private: true, role: "warehouseman" },
  { path: "/store/givn/material/:id", element: <GivnMaterial />, private: true, role: "warehouseman" },

  // Accountant
  { path: "/persons/add", element: <RegisterWorker />, private: true, role: "accountant" },
  { path: "/persons", element: <ViewPersons />, private: true, role: "accountant" },
  { path: "/attendance", element: <Attendance />, private: true, role: "accountant" },
  { path: "/attendance/story", element: <Story />, private: true, role: "accountant" },
  { path: "/setting", element: <SettingsPage />, private: true, role: "accountant" },
  { path: "/salary", element: <Salary />, private: true, role: "accountant" },
  { path: "/order/:id", element: <OrderDetails />, private: true, role: "accountant" },
  {
    path: "/accountant",
    element: <Accountant />,
    private: true,
    role: "accountant",
  },

  // director
  { path: "/director", element: <Director />, private: true, role: "director" },

  // deputy_directorr
  { path: "/deputy/warehouse", element: <WarehouseForm />, private: true, role: "deputy_directorr" },
  { path: "/worker/add", element: <RegisterWorker />, private: true, role: "deputy_directorr" },
  { path: "/director/all/worker", element: <Persons />, private: true, role: "deputy_directorr" },
  { path: "/director/add/worker", element: <AddPersons />, private: true, role: "deputy_directorr" },
];
