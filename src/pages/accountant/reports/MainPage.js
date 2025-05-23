import React, { memo } from "react";
import { useGetExpensesMonthlyReportQuery } from "../../../context/service/expensesApi";
import "./style.css";


// Card Component
const SummaryCard = ({ title, value, dollarValue, icon, colorClass }) => (
    <div className={`summary-card ${colorClass}`}>
        <div className="card-icon">{icon}</div>
        <div>
            <h3 className="card-title">{title}</h3>
            <p className="card-value">
                {value != null ? `${value.toLocaleString()} so'm` : "Ma'lumot yo'q"}
            </p>
            <p className="card-dollar-value">
                {dollarValue != null ? `$${dollarValue.toLocaleString()}` : "Ma'lumot yo'q"}
            </p>
        </div>
    </div>
);

// Loading Card Component
const LoadingCard = ({ title, icon, colorClass }) => (
    <div className={`summary-card ${colorClass} loading`}>
        <div className="card-icon">{icon}</div>
        <div>
            <h3 className="card-title">{title}</h3>
            <p className="card-value loading-text">Yuklanmoqda...</p>
            <p className="card-dollar-value loading-text">Yuklanmoqda...</p>
        </div>
    </div>
);

// Main Page Component
const MainPage = ({ month, year }) => {
    const { data, isLoading } = useGetExpensesMonthlyReportQuery({ month, year });

    return (
        <div className="primaryLayoutWrapper">
            <div className="cardGridContainer_Z5M">
                {isLoading ? (
                    <>
                        <LoadingCard
                            title="Umumiy Kirim"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon incomeIconVisual_J6N"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            }
                            colorClass="incomeCardStyle_R3V"
                        />
                        <LoadingCard
                            title="Umumiy Chiqim"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon expenseIconVisual_M7Q"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            }
                            colorClass="expenseCardStyle_F9W"
                        />
                        <LoadingCard
                            title="Foyda"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon profitIconVisual_P2Y"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                </svg>
                            }
                            colorClass="profitCardStyle_D8T"
                        />
                    </>
                ) : (
                    <>
                        <SummaryCard
                            title="Umumiy Kirim"
                            value={data?.innerData?.summary?.totalIncome}
                            dollarValue={data?.innerData?.summary?.totalIncomeDollar}
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon incomeIconVisual_J6N"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            }
                            colorClass="incomeCardStyle_R3V"
                        />
                        <SummaryCard
                            title="Umumiy Chiqim"
                            value={data?.innerData?.summary?.totalExpense}
                            dollarValue={data?.innerData?.summary?.totalExpenseDollar}
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon expenseIconVisual_M7Q"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            }
                            colorClass="expenseCardStyle_F9W"
                        />
                        <SummaryCard
                            title="Foyda"
                            value={data?.innerData?.summary?.profit}
                            dollarValue={data?.innerData?.summary?.profitDollar}
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon profitIconVisual_P2Y"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                </svg>
                            }
                            colorClass="profitCardStyle_D8T"
                        />
                    </>
                )}

            </div>
        </div>
    );
};



export default memo(MainPage);