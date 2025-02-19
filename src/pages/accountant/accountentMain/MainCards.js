import React, { useEffect, useRef, useState } from "react";
import "./style.css"; // Stil faylini import qilamiz
import { Spin } from "antd";
import { useGetBalanceQuery } from "../../../context/service/balanceApi";
import { FaCalendarAlt } from "react-icons/fa";
import { FaMoneyBillWave, FaBalanceScale, FaHandHoldingUsd } from "react-icons/fa";
import { MdMoneyOff } from "react-icons/md";
import { useGetDebtQuery } from "../../../context/service/orderApi";
import { BsArrowLeftRight } from "react-icons/bs";

const MainCards = ({ isState, expenses, balanceReport, selectedReportDates, setSelectedReportDates }) => {
    const modalRef = useRef(null);
    const { data: debtData } = useGetDebtQuery();
    const { data: balance, isFetching } = useGetBalanceQuery();
    const [open, setOpen] = useState(false);



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
        <div style={{ marginBottom: isState ? 10 : 20 }} className="cards-container">
            <div className="card income">
                {
                    !isState && (
                        <button onClick={() => setOpen(true)} className="formattedPeriod-btn">{balanceReport?.innerData?.formattedPeriod} <FaCalendarAlt /></button>
                    )
                }
                <FaMoneyBillWave className="icon" />
                <div className="balanceValue">
                    <h3>Daromad</h3>
                    <p> {Number(balanceReport?.innerData?.balance)
                        .toLocaleString("en-US")
                        .replace(/,/g, " ")}{" "} so'm</p>
                </div>
            </div>

            {open && (
                <div className="dropdown-reportDates" ref={modalRef}>
                    <input
                        type="date"
                        value={selectedReportDates[0] ? selectedReportDates[0].toISOString().split('T')[0] : ''}
                        onChange={(e) => setSelectedReportDates([new Date(e.target.value), selectedReportDates[1]])}
                    />
                    <BsArrowLeftRight />
                    <input
                        type="date"
                        value={selectedReportDates[1] ? selectedReportDates[1].toISOString().split('T')[0] : ''}
                        onChange={(e) => setSelectedReportDates([selectedReportDates[0], new Date(e.target.value)])}
                    />
                </div>
            )}

            <div className="card expense">
                {
                    !isState && (
                        <span>{expenses?.innerData?.period}</span>
                    )
                }
                <MdMoneyOff className="icon" />
                <div>
                    <h3>Xarajatlar</h3>
                    <p>
                        {Number(expenses?.innerData?.totalOutgoing)
                            .toLocaleString("en-US")
                            .replace(/,/g, " ")}{" "}
                        so'm
                    </p>
                </div>
            </div>
            <div className="card balance">
                <FaBalanceScale className="icon" />
                <div>
                    <h3>Balans</h3>
                    {isFetching ? (
                        <Spin size="small" />
                    ) : (
                        <p>{formatNumber(balance?.innerData?.balance || 0)} so'm</p>
                    )}
                </div>
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
