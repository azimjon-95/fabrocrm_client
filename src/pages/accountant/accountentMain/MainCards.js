import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { useGetBalanceQuery } from "../../../context/service/balanceApi";
import { FaCalendarAlt } from "react-icons/fa";
import { FaHandHoldingUsd } from "react-icons/fa";
import { MdMoneyOff } from "react-icons/md";
import { useGetDebtQuery } from "../../../context/service/orderApi";
import { BsArrowLeftRight } from "react-icons/bs";
import socket from "../../../socket";
import { Spin, Tooltip } from "antd";
import { FaMoneyBillWave, FaUniversity, FaDollarSign } from "react-icons/fa";

const MainCards = ({
  isState,
  expenses,
  balanceReport,
  selectedReportDates,
  setSelectedReportDates,
}) => {
  const modalRef = useRef(null);
  const { data: debtData, refetch: refetchDebt } = useGetDebtQuery();

  const {
    data: balance,
    isFetching,
    refetch: refetchBalanceReport,
  } = useGetBalanceQuery();
  const [open, setOpen] = useState(false);
  let balancValues = balance?.innerData || {};

  useEffect(() => {
    socket.on("balance", () => refetchBalanceReport());
    socket.on("updateOrder", () => {
      refetchDebt();
    });
    socket.on("deleteExpense", () => refetchBalanceReport());

    return () => {
      socket.off("balance");
      socket.off("updateOrder");
      socket.off("deleteExpense");
    };
  }, [refetchBalanceReport, refetchDebt]);

  const formatNumber = (num) => {
    return num.toLocaleString("uz-UZ").replace(/,/g, " ");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      style={{ marginBottom: isState ? 10 : 20 }}
      className="cards-container"
    >
      <div className="card income">
        {!isState && (
          <button onClick={() => setOpen(true)} className="formattedPeriod-btn">
            {balanceReport?.innerData?.formattedPeriod} <FaCalendarAlt />
          </button>
        )}
        <FaMoneyBillWave className="icon" />
        <div className="balanceValue">
          <h3>Daromad</h3>
          <p>
            {" "}
            {Number(balanceReport?.innerData?.balance || 0)
              .toLocaleString("en-US")
              .replace(/,/g, " ")}{" "}
            so'm
          </p>
        </div>
      </div>

      {open && (
        <div className="dropdown-reportDates" ref={modalRef}>
          <input
            type="date"
            value={
              selectedReportDates[0]
                ? selectedReportDates[0].toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setSelectedReportDates([
                new Date(e.target.value),
                selectedReportDates[1],
              ])
            }
          />
          <BsArrowLeftRight />
          <input
            type="date"
            value={
              selectedReportDates[1]
                ? selectedReportDates[1].toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setSelectedReportDates([
                selectedReportDates[0],
                new Date(e.target.value),
              ])
            }
          />
        </div>
      )}

      <div className="card expense">
        {!isState && <span>{expenses?.innerData?.period}</span>}
        <MdMoneyOff className="icon" />
        <div>
          <h3>Xarajatlar</h3>
          <p>
            {Number(expenses?.innerData?.totalOutgoing || 0)
              .toLocaleString("en-US")
              .replace(/,/g, " ")}{" "}
            so'm
          </p>
        </div>
      </div>
      <div className="card-balance">
        {isFetching ? (
          <Spin size="small" />
        ) : (
          <div className="balance-container">
            <h3>Balans</h3>
            <div>
              <Tooltip title="Naqd pul balansi">
                <p className="balance-item">
                  <FaMoneyBillWave className="balance-icon" />
                  {formatNumber(balancValues?.cashBalance || 0)} so'm
                </p>
              </Tooltip>

              <Tooltip title="Bank o'tkazmasi balansi">
                <p className="balance-item">
                  <FaUniversity className="balance-icon" />
                  {formatNumber(balancValues?.bankTransferBalance || 0)} so'm
                </p>
              </Tooltip>

              <Tooltip title="Dollar balansi">
                <p className="balance-item">
                  <FaDollarSign className="balance-icon" />
                  {formatNumber(balancValues?.dollarBalance || 0)}
                </p>
              </Tooltip>
              {/* <Tooltip title="Jami balansi">
                <p className="balance-item total-balance">
                  <FaCalculator className="balance-icon" />
                  {formatNumber(
                    (balancValues?.cashBalance || 0) +
                      (balancValues?.bankTransferBalance || 0) +
                      (balancValues?.dollarBalance || 0)
                  )}{" "}
                  so'm
                </p>
              </Tooltip> */}
            </div>
          </div>
        )}
      </div>
      <div className="card debt">
        <FaHandHoldingUsd className="icon" />
        <div>
          <h3>Qarz</h3>
          <p>{debtData?.innerData}</p>
        </div>
      </div>
    </div>
  );
};

export default MainCards;
