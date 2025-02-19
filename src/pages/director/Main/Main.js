import React, { useEffect, useRef, useState, useCallback } from "react";
import moment from "moment";
import { BsCaretUpFill, BsCaretDownFill, BsArrowLeftRight } from "react-icons/bs";
import MainCards from "../../accountant/accountentMain/MainCards";
import { Table, Tooltip } from "antd";
import { useGetExpensesByPeriodQuery, useGetBalanceReportQuery } from "../../../context/service/expensesApi";
import BalanceSVGChart from "../../../components/BalanceSVGChart";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdRadioButtonOn } from "react-icons/io";
import './main.css';
const oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

const Main = () => {
    const cardRef = useRef(null);
    const modalRef = useRef(null);
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonthToday = today; // Bugungi sana
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [open, setOpen] = useState(false);
    const [activeDataset, setActiveDataset] = useState('allExpenses');
    const [selectedDates, setSelectedDates] = useState([startOfMonth, endOfMonthToday]);
    const { data: expenses } = useGetExpensesByPeriodQuery(
        {
            startDate: selectedDates.length
                ? moment(selectedDates[0]).format("YYYYMMDD")
                : undefined,
            endDate: selectedDates.length
                ? moment(selectedDates[1]).format("YYYYMMDD")
                : undefined,
        },
        { skip: !selectedDates.length }
    );

    const activeData = expenses?.innerData?.[activeDataset] || [];
    const toggleData = useCallback(() => {
        setActiveDataset((prev) => prev === 'allExpenses' ? 'outgoingExpenses' : prev === 'outgoingExpenses' ? 'incomeExpenses' : 'allExpenses');
    }, []);

    const { data: balanceReport } = useGetBalanceReportQuery(
        {
            startDate: selectedDates.length
                ? moment(selectedDates[0]).format("YYYYMMDD")
                : undefined,
            endDate: selectedDates.length
                ? moment(selectedDates[1]).format("YYYYMMDD")
                : undefined,
        },
        { skip: !selectedDates.length }
    );

    const [selectedReportDates, setSelectedReportDates] = useState([startOfMonth, endOfMonthToday]);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const updateDimensions = () => {
            const { width, height } = card.getBoundingClientRect(); // Element hajmini olish
            setDimensions({ width, height });
        };

        // ResizeObserver bilan element hajmini kuzatish
        const resizeObserver = new ResizeObserver(() => updateDimensions());
        resizeObserver.observe(card);

        updateDimensions(); // Dastlab hajmini olish

        return () => resizeObserver.disconnect(); // Tozalash
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const columns = [
        {
            title: <button className="toggle-btn" onClick={toggleData}><IoMdRadioButtonOn /></button>,
            dataIndex: 'type',
            render: (text) => text === "Kirim" ? <BsCaretDownFill style={{ color: 'green' }} /> : <BsCaretUpFill style={{ color: 'red' }} />
        },
        { title: 'Xarajat Nomi', dataIndex: 'name', key: 'name' },
        { title: 'Miqdor', dataIndex: 'amount', key: 'amount', render: (text) => `${new Intl.NumberFormat('uz-UZ').format(text)} so'm` },
        { title: 'Tulov turi', dataIndex: 'paymentType', key: 'paymentType' },
        { title: 'Tavsif', dataIndex: 'description', key: 'description', render: (text) => <Tooltip title={text}><span>{text.split(' ').slice(0, 4).join(' ')}...</span></Tooltip> },
        { title: 'Sana/Soat', dataIndex: 'date', key: 'date', render: (date) => `${new Date(date).getDate()}-${oylar[new Date(date).getMonth()]}/${new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}` }
    ];

    return (
        <div>
            <MainCards isState={true} expenses={expenses} balanceReport={balanceReport} selectedReportDates={selectedReportDates} setSelectedReportDates={setSelectedReportDates} />
            <div className="lineCart-box" ref={cardRef}>
                <button style={
                    {
                        padding: "5px 10px",
                        fontSize: "15px",
                        borderColor: "#0A3D3A",
                        background: "#0A3D3A",
                        color: "white",
                    }
                } onClick={() => setOpen(true)} className="formattedPeriod-btn">{balanceReport?.innerData?.formattedPeriod} <FaCalendarAlt /></button>
                {open && (
                    <div className="dropdown-reportDates" ref={modalRef}>
                        <input
                            type="date"
                            value={selectedReportDates[0] ? selectedReportDates[0].toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                                setSelectedDates([new Date(e.target.value), selectedReportDates[1]]);
                                setSelectedReportDates([new Date(e.target.value), selectedReportDates[1]]);
                            }}
                        />
                        <BsArrowLeftRight />
                        <input
                            type="date"
                            value={selectedReportDates[1] ? selectedReportDates[1].toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                                setSelectedDates([selectedReportDates[0], new Date(e.target.value)]);
                                setSelectedReportDates([selectedReportDates[0], new Date(e.target.value)]);
                            }}
                        />
                    </div>
                )}
                <BalanceSVGChart
                    data={balanceReport?.innerData?.chartData}
                    chartWidth={dimensions.width}
                    chartHeight={window.innerWidth < 500 ? 130 : 190}
                    size="12"
                />
            </div>
            <Table
                dataSource={activeData}
                columns={columns}
                rowKey="_id"
                pagination={false}
                size="small"
                bordered
                // scroll={{ x: 'max-content' }}
                className="custom-table"
            />

        </div>
    );
};

export default Main;
