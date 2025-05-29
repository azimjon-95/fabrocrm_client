import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Tabs } from "antd";
import { useGetmyDebtsQuery } from "../../../context/service/mydebtService";
import socket from "../../../socket";
import moment from "moment";
import "./MyDebts.css";
import TabPane from "antd/es/tabs/TabPane";
import ShopsDebts from "./ShopsDebts";

const MyDebts = () => {
  const { data, isLoading, refetch } = useGetmyDebtsQuery();
  const [debtModal, setDebtModal] = useState({ visible: false, data: [] });
  const [paymentModal, setPaymentModal] = useState({
    visible: false,
    data: [],
  });

  useEffect(() => {
    const handleUpdateOrder = () => refetch();
    socket.on("updateMyDebt", handleUpdateOrder);
    return () => socket.off("updateMyDebt", handleUpdateOrder);
  }, [refetch]);

  const showDebtModal = (debts) => {
    setDebtModal({ visible: true, data: debts });
  };

  const showPaymentModal = (payments) => {
    setPaymentModal({ visible: true, data: payments });
  };

  const handleCloseModal = () => {
    setDebtModal({ visible: false, data: [] });
    setPaymentModal({ visible: false, data: [] });
  };

  const columnsList = [
    {
      title: "Kimdan",
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    {
      title: "Qarz Summasi",
      key: "debtAmount",
      width: "15%",
      render: (_, record) => {
        const totalDebt = record.debts?.reduce(
          (acc, curr) => acc + curr.amount,
          0
        );
        return `${totalDebt?.toLocaleString()} so'm`;
      },
    },

    {
      title: "Qarzlar",
      key: "debts",
      align: "center",
      width: "10%",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          className="my-debts-tableBtn"
          onClick={() => showDebtModal(record.debts)}
        >
          Ko'rish
        </Button>
      ),
    },
    {
      title: "To'lovlar",
      key: "payments",
      align: "center",
      width: "10%",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          className="my-debts-tableBtn"
          onClick={() => showPaymentModal(record.payments)}
        >
          Ko'rish
        </Button>
      ),
    },
    {
      title: "Sana",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: "15%",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm"),
    },
  ];

  return (
    <div className="my-debts">
      <Tabs>
        <TabPane tab="Tashqi Qarzlar" key="1">
          <Table
            className="my-debts-table"
            columns={columnsList}
            dataSource={data?.innerData || []}
            rowKey="_id"
            pagination={false}
            loading={isLoading}
            scroll={{ x: 1000 }}
            size="small"
          />

          <Modal
            title="Qarzlar Ro'yxati"
            open={debtModal.visible}
            onCancel={handleCloseModal}
            footer={null}
            width={600}
          >
            <div className="modal-content">
              {debtModal.data?.length ? (
                debtModal.data.map((debt, index) => (
                  <div className="data-item" key={index}>
                    <span>{moment(debt.date).format("YYYY-MM-DD HH:mm")}</span>
                    <span className="data-type">{debt.type}</span>
                    <span className="data-description">{debt.description}</span>
                    <span>{debt.amount.toLocaleString()} so'm</span>
                  </div>
                ))
              ) : (
                <p>Ma'lumot yo'q</p>
              )}
            </div>
          </Modal>

          <Modal
            title="To'lovlar Ro'yxati"
            open={paymentModal.visible}
            onCancel={handleCloseModal}
            footer={null}
            width={600}
          >
            <div className="modal-content">
              {paymentModal.data?.length ? (
                paymentModal.data.map((payment, index) => (
                  <div className="data-item" key={index}>
                    <span>
                      {moment(payment.date).format("YYYY-MM-DD HH:mm")}
                    </span>
                    <span className="data-type">{payment.type}</span>
                    <span className="data-description">{payment.description}</span>
                    <span>{payment.amount.toLocaleString()} so'm</span>
                  </div>
                ))
              ) : (
                <p>Ma'lumot yo'q</p>
              )}
            </div>
          </Modal>
        </TabPane>
        <TabPane tab="Dokondagi Qarzlar" key="2">
          <ShopsDebts />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MyDebts;
