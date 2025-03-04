import React from "react";
import Accountant from "../pages/accountant/accountentMain/AccountentMain";
import Director from "../pages/director/Main/Main";
import RegisterWorker from "../pages/accountant/persons/Persons";
import ViewPersons from "../pages/accountant/persons/ViewPersons";
import Persons from "../pages/director/persons/ViewPersons";
import SettingsPage from "../pages/accountant/settingsPage/SettingsPage";
import Attendance from "../pages/accountant/attendance/Attendance";
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
import HistoryOrderLists from "../pages/store/HistoryOrderLists";
import WarehouseView from "../pages/director/Main/WarehouseView";
import CtrlWorkers from "../pages/director/Main/CtrlWorkers";
import ViewOrder from "../pages/director/Main/ViewOrder";
import Distributor from "../pages/distributor/Distributor";
import PdfList from "../components/pdf/PdfList";

export const routes = [
  {
    path: "/manager",
    element: <Order />,
    private: true,
    role: ["manager", "deputy"],
  },
  {
    path: "/main/orders",
    element: <OrderList />,
    private: true,
    role: ["manager", "deputy"],
  },
  {
    path: "/orders/story",
    element: <OrderStory />,
    private: true,
    role: ["manager", "deputy"],
  },
  {
    path: "/orders/materials/:id",
    element: <MaterialPage />,
    private: true,
    role: ["manager", "deputy"],
  },
  {
    path: "/orders/update/:id",
    element: <UpdateOrderForm />,
    private: true,
    role: ["manager", "deputy"],
  },
  {
    path: "/manag/warehouse",
    element: <WarehouseForm />,
    private: true,
    role: ["manager", "deputy"],
  },
  {
    path: "/order/mengement/:id",
    element: <OrderMengement />,
    private: true,
    role: ["manager", "deputy"],
  },
  {
    path: "/order/givn/material/:id",
    element: <GivnMaterial />,
    private: true,
    role: ["manager", "deputy"],
  },
  {
    path: "/order-list/:id",
    element: <PdfList />,
    private: true,
    role: ["manager", "deputy"],
  },
  // ==========================================================================================
  {
    path: "/warehouseman",
    element: <WarehouseForm />,
    private: true,
    role: ["warehouseman", "deputy"],
  },
  {
    path: "/new/order/lists",
    element: <NewOrderLists />,
    private: true,
    role: ["warehouseman", "deputy"],
  },
  {
    path: "/store/orders",
    element: <MainOrder />,
    private: true,
    role: ["warehouseman", "deputy"],
  },
  {
    path: "/store/materials/:id",
    element: <Material />,
    private: true,
    role: ["warehouseman", "deputy"],
  },
  {
    path: "/store/givn/material/:id",
    element: <GivnMaterial />,
    private: true,
    role: ["warehouseman", "deputy"],
  },
  // ==========================================================================================
  {
    path: "/persons/add",
    element: <RegisterWorker />,
    private: true,
    role: ["accountant", "deputy"],
  },
  {
    path: "/persons",
    element: <ViewPersons />,
    private: true,
    role: ["accountant", "deputy"],
  },
  {
    path: "/attendance",
    element: <Attendance />,
    private: true,
    role: ["accountant", "deputy"],
  },
  {
    path: "/setting",
    element: <SettingsPage />,
    private: true,
    role: ["accountant", "deputy"],
  },
  {
    path: "/order/history/lists",
    element: <HistoryOrderLists />,
    private: true,
    role: ["warehouseman", "accountant", "deputy"],
  },
  {
    path: "/salary",
    element: <Salary />,
    private: true,
    role: ["accountant", "deputy"],
  },
  {
    path: "/order/:id",
    element: <OrderDetails />,
    private: true,
    role: ["accountant", "deputy"],
  },
  {
    path: "/accountant",
    element: <Accountant />,
    private: true,
    role: ["accountant", "deputy"],
  },
  // {
  //   path: "/salary/history/:date",
  //   element: <History />,
  //   private: true,
  //   role: ["accountant", "deputy"],
  // },
  // ==========================================================================================
  { path: "/deputy", element: <Persons />, private: true, role: "deputy" },
  {
    path: "/worker/add",
    element: <RegisterWorker />,
    private: true,
    role: ["deputy", "director"],
  },
  {
    path: "/deputy/warehouse",
    element: <WarehouseForm />,
    private: true,
    role: ["deputy", "director"],
  },
  {
    path: "/director/add/worker",
    element: <RegisterWorker />,
    private: true,
    role: ["deputy", "director"],
  },
  {
    path: "/deput/warehouse",
    element: <WarehouseForm />,
    private: true,
    role: "deputy",
  },
  // ==========================================================================================

  { path: "/distributor", element: <Distributor />, private: true, role: ["distributor", "deputy"] },
  // ==========================================================================================


  {
    path: "/director",
    element: <Director />,
    private: true,
    role: ["director"],
  },
  {
    path: "/director",
    element: <Director />,
    private: true,
    role: ["director"],
  },
  {
    path: "/director-add",
    element: <Persons />,
    private: true,
    role: ["director"],
  },
  {
    path: "/ctrl-warehouseman",
    element: <WarehouseView />,
    private: true,
    role: ["director"],
  },
  {
    path: "/ctrl-persons",
    element: <CtrlWorkers />,
    private: true,
    role: ["director"],
  },
  {
    path: "/all/attendance",
    element: <Attendance />,
    private: true,
    role: ["director"],
  },
  {
    path: "/director-orders",
    element: <ViewOrder />,
    private: true,
    role: ["director"],
  },
  {
    path: "/orders-materials/:id",
    element: <MaterialPage />,
    private: true,
    role: ["director"],
  },
];
