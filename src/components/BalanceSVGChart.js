import React from "react";

const BalanceSVGChart = (
    {
        lineOutgoingIncome = "red",
        lineFill = "#ff000022",
        lineColorIncome = "green",
        data,
        chartWidth = 400,
        chartHeight = 100,
        size = "8",
        textColor = "#fff"
    }
) => {
    if (!data || data?.length === 0) return <p>Ma'lumot yo'q</p>;

    const textPadding = 15; // Pastdan ajratiladigan joy
    const height = chartHeight + textPadding;

    const maxIncome = Math.max(...data?.map(d => d.income), 0);
    const maxOutgoing = Math.max(...data?.map(d => d.outgoing), 0);
    const maxY = Math.max(maxIncome, maxOutgoing) * 1.2;

    const xScale = chartWidth / (data?.length - 1); // Dinamik X o‘qi bo‘ylab masofa
    const yScale = chartHeight / maxY; // Grafik uchun o‘lchov

    const generatePath = (values) => {
        return values?.map((d, i) =>
            `${i === 0 ? "M" : "L"} ${i * xScale} ${chartHeight - d * yScale}`
        ).join(" ");
    };

    const incomePath = generatePath(data?.map(d => d.income));
    const outgoingPath = generatePath(data?.map(d => d.outgoing));

    const outgoingAreaPath = `
        ${generatePath(data?.map(d => d.outgoing))}
        L ${(data?.length - 1) * xScale} ${chartHeight}
        L 0 ${chartHeight} Z
    `;

    const extractNumber = (dateString) => {
        return dateString.match(/\d+/)?.[0] || "";
    };

    return (
        <svg width={chartWidth} height={height} style={{ display: "block", overflow: "hidden" }}>
            {/* Outgoing chizig‘i ostidagi fon */}
            <path d={outgoingAreaPath} fill={lineFill} stroke="none" />

            {/* Chiqim (outgoing) chizig‘i */}
            <path d={outgoingPath} fill="none" stroke={lineOutgoingIncome} strokeWidth="1.2" />

            {/* Daromad (income) chizig‘i */}
            <path d={incomePath} fill="none" stroke={lineColorIncome} strokeWidth="1.2" />

            {/* X o‘qi bo‘ylab sanalar */}
            {data?.map((d, i) => {
                let anchor = "middle";
                if (i === 0) anchor = "start"; // Birinchi element
                if (i === data?.length - 1) anchor = "end"; // Oxirgi element

                return (
                    <g key={i} transform={`translate(${i * xScale}, ${chartHeight + 10})`}>
                        <text fontSize={size} textAnchor={anchor} fill={textColor} fontWeight="normal">
                            {extractNumber(d.date)}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

export default BalanceSVGChart;
