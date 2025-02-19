import React from "react";

const BalanceSVGChart = ({
    lineOutgoingIncome = "red",
    lineFill = "#ff000022",
    lineColorIncome = "green",
    data,
    chartWidth = 400,
    chartHeight = 100,
    size = "12",
    textColor = "#595959",
    borderColor = "#ccc",
    borderWidth = .4,
    lineStrokeWidth = 1,
    gridColor = "#cacaca", // Grid chiziqlari rangi
}) => {
    if (!data || data?.length === 0) return <p>Ma'lumot yo'q</p>;

    const textPadding = 20;
    const rightPadding = 50;
    const height = chartHeight + textPadding;
    const width = chartWidth + rightPadding;

    const maxIncome = Math.max(...data?.map(d => d.income), 0);
    const maxOutgoing = Math.max(...data?.map(d => d.outgoing), 0);
    const maxY = Math.max(maxIncome, maxOutgoing) * 1.2;

    const xScale = chartWidth / (data?.length - 1);
    const yScale = chartHeight / maxY;

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

    return (
        <svg width={width} height={height} style={{ display: "block", overflow: "hidden" }}>
            {/* Grafik atrofida chegara */}
            <rect x="0" y="0" width={chartWidth} height={chartHeight}
                stroke={borderColor} strokeWidth={borderWidth} fill="none" />

            {/* Gorizontal grid chiziqlar */}
            {[...Array(5)].map((_, i) => {
                const y = chartHeight - (i * (chartHeight / 5));
                return (
                    <line
                        key={`grid-horizontal-${i}`}
                        x1={0}
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke={gridColor}
                        strokeWidth="1"
                        strokeDasharray="4 2"
                    />
                );
            })}

            {/* Outgoing chizig‘i ostidagi fon */}
            <path d={outgoingAreaPath} fill={lineFill} stroke="none" />

            {/* Chiqim (outgoing) chizig‘i */}
            <path d={outgoingPath} fill="none" stroke={lineOutgoingIncome} strokeWidth={lineStrokeWidth}
                strokeLinejoin="round" strokeLinecap="round" />

            {/* Daromad (income) chizig‘i */}
            <path d={incomePath} fill="none" stroke={lineColorIncome} strokeWidth={lineStrokeWidth}
                strokeLinejoin="round" strokeLinecap="round" />

            {/* X o‘qi bo‘ylab sanalar */}
            {data?.map((d, i) => {
                let anchor = "middle";
                if (i === 0) anchor = "start";
                if (i === data?.length - 1) anchor = "end";

                return (
                    <g key={i} transform={`translate(${i * xScale}, ${chartHeight + 12})`}>
                        <text fontSize={size} textAnchor={anchor} fill={textColor} fontWeight="normal">
                            {d.date}
                        </text>
                    </g>
                );
            })}

            {/* Grafikning chap tomoniga summalarni chiqarish */}
            <g transform="translate(-5, 0)">
                {data?.map((d, i) => (
                    <text
                        key={i}
                        x="0"
                        y={chartHeight - d.income * yScale}
                        fill={lineColorIncome}
                        fontSize={size}
                        fontWeight="bold"
                        textAnchor="end"
                    >
                        {d.income}
                    </text>
                ))}
                {data?.map((d, i) => (
                    <text
                        key={`outgoing-${i}`}
                        x="0"
                        y={chartHeight - d.outgoing * yScale}
                        fill={lineOutgoingIncome}
                        fontSize={size}
                        fontWeight="bold"
                        textAnchor="end"
                    >
                        {d.outgoing}
                    </text>
                ))}
            </g>

        </svg>
    );
};

export default BalanceSVGChart;