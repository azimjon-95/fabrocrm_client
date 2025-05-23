import React, { useState, useMemo } from "react";
import { Button, Card, Typography, Table, Spin, Alert, Tag } from "antd";
import moment from "moment";
import YearPicker from "./YearPicker";
import { RiFileExcel2Fill } from "react-icons/ri";
import { CalendarOutlined } from "@ant-design/icons";
import {
    useGetStoresMonthlyReportQuery,
} from "../../../context/service/storeApi";
import {
    useGenerateMonthlyReportQuery,
} from "../../../context/service/newOredShops";
import { useGetDriverMonthlyDataQuery } from "../../../context/service/driverApi";
import {
    useGetWorkerMonthlyDataQuery,
    useGetWorkersQuery, useGetTotalRemainingSalaryQuery
} from '../../../context/service/worker';
import {
    useGetMyDebtsMonthlyDataQuery
} from "../../../context/service/mydebtService";
import {
    ClockCircleOutlined,
    DollarCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import * as XLSX from "xlsx";
import "./style.css";
import MainPage from "./MainPage";

const { Title } = Typography;

const monthsUz = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

// Utility to format numbers in Uzbek locale
const formatCurrency = (value) =>
    Number(value)?.toLocaleString("uz-UZ") + " so'm";

// Worker Row Component
const WorkerRow = React.memo(({ worker, year, month }) => {
    const { data: workerData, isLoading } = useGetWorkerMonthlyDataQuery({
        userId: worker._id,
        year,
        month: month + 1,
    });

    const monthlyData = workerData?.innerData?.[0]?.monthlyData?.[0] || {};

    return (
        <tr>
            <td>{`${worker.firstName} ${worker.lastName}`}</td>
            <td>
                {workerData?.innerData?.[0]?.hourlySalary
                    ? formatCurrency(workerData.innerData[0].hourlySalary)
                    : isLoading
                        ? "Yuklanmoqda..."
                        : "N/A"}
            </td>
            <td>
                {isLoading ? (
                    "Yuklanmoqda..."
                ) : monthlyData.totalHours ? (
                    <div className="monthly-data-container">
                        <div className="monthly-data-item">
                            <span className="data-label">Jami soat:</span>
                            <span className="data-value">{monthlyData.totalHours}</span>
                        </div>
                        <div className="monthly-data-item">
                            <span className="data-label">Oylik hisoblangan:</span>
                            <span className="data-value">
                                {formatCurrency(monthlyData.calculatedSalary)}
                            </span>
                        </div>
                        <div className="monthly-data-item">
                            <span className="data-label">To'langan:</span>
                            <span className="data-value">
                                {formatCurrency(monthlyData.paidSalary)}
                            </span>
                        </div>
                        <div className="monthly-data-item">
                            <span className="data-label">Qolgan:</span>
                            <span className="data-value">
                                {formatCurrency(monthlyData.remainingSalary)}
                            </span>
                        </div>
                    </div>
                ) : (
                    "Ma'lumot yo'q"
                )}
            </td>
            <td>
                {workerData?.innerData?.[0]?.totalRemainingSalary
                    ? formatCurrency(workerData.innerData[0].totalRemainingSalary)
                    : isLoading
                        ? "Yuklanmoqda..."
                        : "N/A"}
            </td>
        </tr>
    );
});

// Driver Row Component
const DriverRow = React.memo(({ driver }) => (
    <tr>
        <td>{driver.name}</td>
        <td>{driver.deliveryCount}</td>
        <td>{formatCurrency(driver.totalPrice)}</td>
        <td>{formatCurrency(driver.balance)}</td>
    </tr>
));

// Order Report Table Component
const OrderReportTable = ({ year, month }) => {
    const { data: orderReport, isLoading, error } = useGenerateMonthlyReportQuery({
        year,
        month,
    });

    const columns = [
        { title: "Do'kon Nomi", dataIndex: "shopName", key: "shopName" },
        { title: "Jami Buyurtmalar", dataIndex: "orderCount", key: "orderCount" },
        { title: "Jami To'langan", dataIndex: "paidAmount", key: "paidAmount", render: (text) => formatCurrency(text) || 0 },
        { title: "Qolgan Qarzdorlik", dataIndex: "debt", key: "debt", render: (text) => formatCurrency(text) || 0 },
        { title: "Qaytarilgan Pul", dataIndex: "shouldReturn", key: "shouldReturn", render: (text) => formatCurrency(text) || 0 },
        { title: "Qaytarilgan To'lov", dataIndex: "totalActuallyReturned", key: "totalActuallyReturned", render: (text) => formatCurrency(+text) || 0 },
    ];

    if (isLoading) {
        return (
            <div style={{ textAlign: "center", margin: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert message="Xatolik yuz berdi" type="error" showIcon />
        );
    }

    if (!orderReport?.innerData?.shopDetails?.length) {
        return (
            <Alert
                message="Buyurtma ma'lumotlari topilmadi"
                type="warning"
                showIcon
            />
        );
    }

    const { shopDetails, summary } = orderReport.innerData;

    return (
        <Card style={{ borderRadius: 12, }}>
            <Title level={4} style={{ textAlign: "center", marginBottom: 20 }}>
                Buyurtmalar Oylik Hisoboti ({summary?.totalShopsOrdered} Do'konlar)
            </Title>
            <Table
                columns={columns}
                dataSource={shopDetails}
                pagination={false}
                bordered
                size="small"
                rowKey="shopName"
            />
        </Card>
    );
};

// Main Report Table Component
const ReportTable = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(moment());

    const year = selectedDate.year();
    const month = selectedDate.month();

    // Fetch data
    const { data: workersData, isLoading: workersLoading } = useGetWorkersQuery();
    const { data: driverData, isLoading: driverLoading } = useGetDriverMonthlyDataQuery({ year, month: month + 1 });
    const { data: storeData, isLoading: storeLoading } = useGetStoresMonthlyReportQuery({ month: month + 1, year });
    const { data: orderReport, isLoading: orderLoading } = useGenerateMonthlyReportQuery({ year, month: month + 1 });
    const { data: dataMonthly, refetch, isLoading: setLoading, setError } = useGetTotalRemainingSalaryQuery(
        { month: month + 1, year },
        { skip: !year || !month } // Skip query if year/month are invalid
    );

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    const [searchText, setSearchText] = useState("");



    // Fetch data using RTK Query
    const { data, isLoading, isError, error } = useGetMyDebtsMonthlyDataQuery({
        year,
        month: month + 1,
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
    });

    // Prepare store table data
    const storeTableData = useMemo(
        () =>
            storeData?.innerData
                ? [
                    { key: "1", label: "Kirgan mahsulotlar qiymati", value: storeData.innerData.totalIncoming },
                    { key: "2", label: "Sarflangan mahsulotlar qiymati", value: storeData.innerData.totalOutgoing },
                    { key: "4", label: "Omborda qolgan mahsulotlar soni", value: storeData.innerData.totalRemaining },
                ]
                : [],
        [storeData]
    );

    // Prepare driver table data
    const driverTableData = useMemo(
        () =>
            driverData?.innerData?.report?.map((driver) => ({
                key: driver.driverId,
                ...driver,
            })) || [],
        [driverData]
    );

    // Prepare worker table data
    const workerTableData = useMemo(() => {
        if (!workersData?.innerData) return [];
        return workersData.innerData.map((worker) => {
            // Note: WorkerRow fetches its own data via useGetWorkerMonthlyDataQuery
            // For Excel, we'll need to fetch this data synchronously or use the same logic
            return {
                workerName: `${worker.firstName} ${worker.lastName}`,
                hourlySalary: "N/A", // Placeholder, as actual data is fetched in WorkerRow
                monthlyData: "N/A", // Placeholder
                totalRemainingSalary: "N/A", // Placeholder
            };
        });
    }, [workersData]);

    // Prepare order table data
    const orderTableData = useMemo(
        () => orderReport?.innerData?.shopDetails || [],
        [orderReport]
    );

    // Function to export all tables to Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Store Table
        const storeWsData = [
            ["Oylik Ombor Hisoboti"],
            ["Ko‘rsatkich", "Qiymati (so'm)"],
            ...storeTableData.map((row) => [row.label, formatCurrency(row.value)]),
        ];
        const storeWs = XLSX.utils.aoa_to_sheet(storeWsData);
        XLSX.utils.book_append_sheet(wb, storeWs, "Ombor Hisoboti");

        // Worker Table
        const workerWsData = [
            ["Ishchilar Oylik Hisoboti"],
            ["Ism", "Soatlik Maosh", "Oylik Ma'lumotlar", "Qolgan Maosh"],
            ...workerTableData.map((row) => {
                const monthlyInfo = `Jami soat: ${row.totalHours}\nOylik hisoblangan: ${formatCurrency(row.totalCalculated)}\nTo'langan: ${formatCurrency(row.totalPaid)}\nQolgan: ${formatCurrency(row.totalRemaining)}`;
                return [
                    row.workerName,
                    row.hourlySalary ? formatCurrency(row.hourlySalary) : "N/A",
                    monthlyInfo,
                    formatCurrency(row.totalRemainingSalary),
                ];
            }),
        ];
        const workerWs = XLSX.utils.aoa_to_sheet(workerWsData);
        XLSX.utils.book_append_sheet(wb, workerWs, "Ishchilar Hisoboti");

        // Driver Table
        const driverWsData = [
            ["Haydovchilar Oylik Hisoboti"],
            ["Haydovchi Ismi", "Yetkazib Berish Soni", "Jami Narx", "Qoldiq Balans"],
            ...driverTableData.map((row) => [
                row.name,
                row.deliveryCount,
                formatCurrency(row.totalPrice),
                formatCurrency(row.balance),
            ]),
        ];
        const driverWs = XLSX.utils.aoa_to_sheet(driverWsData);
        XLSX.utils.book_append_sheet(wb, driverWs, "Haydovchilar Hisoboti");

        // Order Table
        const orderWsData = [
            [`Buyurtmalar Oylik Hisoboti (${orderReport?.innerData?.summary?.totalShopsOrdered} Do'konlar)`],
            ["Do'kon Nomi", "Jami Buyurtmalar", "Jami To'langan", "Qolgan Qarzdorlik", "Qaytarilgan Pul", "Qaytarilgan To'lov"],
            ...orderTableData.map((row) => [
                row.shopName,
                row.orderCount,
                formatCurrency(row.paidAmount),
                formatCurrency(row.debt),
                formatCurrency(row.shouldReturn),
                formatCurrency(row.totalActuallyReturned),
            ]),
        ];
        const orderWs = XLSX.utils.aoa_to_sheet(orderWsData);
        XLSX.utils.book_append_sheet(wb, orderWs, "Buyurtmalar Hisoboti");

        // Auto-size columns for all sheets
        [storeWs, workerWs, driverWs, orderWs].forEach((ws) => {
            const colWidths = [];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            data.forEach((row) => {
                row.forEach((cell, i) => {
                    const cellLength = cell ? String(cell).length : 10;
                    colWidths[i] = Math.max(colWidths[i] || 10, cellLength);
                });
            });
            ws["!cols"] = colWidths.map((w) => ({ wch: w }));
        });

        // Download the Excel file
        XLSX.writeFile(wb, `Monthly_Report_${year}_${monthsUz[month]}.xlsx`);
    };

    // Table columns
    const storeColumns = [
        { title: "Ko‘rsatkich", dataIndex: "label", key: "label" },
        { title: "Qiymati (so'm)", dataIndex: "value", key: "value", render: formatCurrency },
    ];
    // 4454

    const workerColumns = [
        {
            title: "👤 Ism",
            dataIndex: "fullName",
            key: "fullName",
            render: (name) => (
                <span style={{ fontWeight: 600, color: '#1f1f1f' }}>{name}</span>
            ),
        },
        {
            title: "💰 Soatlik Maosh",
            dataIndex: "regularHours",
            key: "regularHours",
            render: (regularHours) => (
                <span style={{ fontWeight: 500, color: '#3f8600' }}>
                    {regularHours?.toLocaleString()} so'm
                </span>
            ),
        },
        {
            title: "📊 Oylik Ma'lumotlar",
            render: (_, item) => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClockCircleOutlined style={{ color: '#1677ff' }} />
                        <span style={{ fontWeight: 500 }}>Jami soat:</span>
                        <span style={{ fontWeight: 600, color: '#1677ff' }}>{item.totalHours}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarCircleOutlined style={{ color: '#13c2c2' }} />
                        <span style={{ fontWeight: 500 }}>Oylik hisoblangan:</span>
                        <span style={{ fontWeight: 600, color: '#13c2c2' }}>{formatCurrency(item.totalSalary)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span style={{ fontWeight: 500 }}>To'langan:</span>
                        <span style={{ fontWeight: 600, color: '#52c41a' }}>
                            {formatCurrency(item.paidSalary + item.avans)}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
                        <span style={{ fontWeight: 500 }}>Qolgan:</span>
                        <span style={{ fontWeight: 600, color: '#f5222d' }}>
                            {formatCurrency(item.remainingSalary)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: "🧾 Qolgan Maosh",
            dataIndex: "totalRemainingSalary",
            key: "totalRemainingSalary",
            render: (salary) => (
                <span style={{ fontWeight: 500, color: '#fa541c' }}>
                    {salary?.toLocaleString()} so'm
                </span>
            ),
        },
    ];

    const driverColumns = [
        { title: "Haydovchi Ismi", dataIndex: "name", key: "name" },
        { title: "Yetkazib Berish Soni", dataIndex: "deliveryCount", key: "deliveryCount" },
        { title: "Jami Narx", dataIndex: "totalPrice", key: "totalPrice", render: formatCurrency },
        { title: "Qoldiq Balans", dataIndex: "balance", key: "balance", render: formatCurrency },
    ];

    const handleMonthSelect = (index) => {
        setSelectedDate(moment().year(year).month(index));
        setModalVisible(false);
    };


    // Table columns
    const columns = [
        {
            title: "Kompaniya",
            dataIndex: "company",
        },
        {
            title: "Turi",
            render: (amount, record) => {
                return (
                    <span>
                        {record.balance < 0 ? "Kompaniyaga qarzdor" : "Kompaniya qarzdor"}
                    </span>
                );
            }

        },
        {
            title: "Qarzdorlik",
            dataIndex: "balance",
            render: (amount, record) => (
                <span>
                    {amount?.toLocaleString()} so'm
                </span>
            ),
            width: "25%",
        },
        {
            title: "Holat",
            dataIndex: "isPaid",
            render: (isPaid) => (
                <Tag color={isPaid ? "green" : "red"}>
                    {isPaid ? "To'langan" : "To'lanmagan"}
                </Tag>
            ),
            width: "15%",
        },
    ];


    return (
        <>
            {/* Date Selector */}
            <div className="select_monthrep">
                <div className="select_monthrepBtn">
                    <Button
                        type="primary"
                        onClick={() => setModalVisible(true)}
                        icon={<CalendarOutlined />}
                    >
                        {monthsUz[month]} {year}
                    </Button>
                    {modalVisible && (
                        <>
                            <div
                                className="modal-overlay"
                                onClick={() => setModalVisible(false)}
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: "rgba(0,0,0,0.5)",
                                    zIndex: 1000,
                                }}
                            />
                            <div
                                className="modal-content"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: "fixed",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    background: "#fff",
                                    padding: 24,
                                    borderRadius: 8,
                                    zIndex: 1001,
                                    width: "90%",
                                    maxWidth: 400,
                                }}
                            >
                                <h3 style={{ marginBottom: 16 }}>Oy tanlang</h3>
                                <div className="modal-contentbox">
                                    <YearPicker
                                        selectedYear={year}
                                        onSelect={(val) =>
                                            setSelectedDate(moment().year(val).month(month))
                                        }
                                    />
                                    <div
                                        className="year-line"
                                        style={{ height: 1, background: "#e8e8e8", margin: "16px 0" }}
                                    />
                                    <div
                                        className="month-grid"
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3, 1fr)",
                                            gap: 8,
                                        }}
                                    >
                                        {monthsUz.map((monthName, index) => (
                                            <Button
                                                key={index}
                                                block
                                                type={index === month ? "primary" : "default"}
                                                onClick={() => handleMonthSelect(index)}
                                            >
                                                {monthName}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <h2
                    className="reportTitle"
                    aria-label={`Kompaniya Oylik Hisoboti ${monthsUz[month]} ${year}`}
                >
                    Kompaniya Oylik Hisoboti - {monthsUz[month]} {year}
                </h2>
                <Button
                    type="primary"
                    onClick={exportToExcel}
                    style={{
                        background: "#0A3D3A",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                    }}
                >
                    <RiFileExcel2Fill /> Yuklab Olish
                </Button>

            </div>
            <div className="do-not-box">
                <MainPage month={month + 1} year={year} />
            </div>
            <div className="do-not-override" >
                {/* Store Report Table */}
                <Card style={{ borderRadius: 12, }}>
                    <Title level={4} style={{ textAlign: "center", marginBottom: 20 }}>
                        Oylik Ombor Hisoboti
                    </Title>
                    {storeLoading ? (
                        <div style={{ textAlign: "center", margin: 50 }}>
                            <Spin size="large" />
                        </div>
                    ) : storeData?.innerData ? (
                        <Table
                            columns={storeColumns}
                            dataSource={storeTableData}
                            pagination={false}
                            bordered
                            size="small"
                            rowKey="key"
                        />
                    ) : (
                        <Alert
                            message="Ombor ma'lumotlari topilmadi"
                            type="warning"
                            showIcon
                        />
                    )}
                </Card>

                {/* Worker Data Table */}
                <Card style={{ borderRadius: 12, }}>
                    <Title level={4} style={{ textAlign: "center", marginBottom: 20 }}>
                        Ishchilar Oylik Hisoboti
                    </Title>
                    {workersLoading ? (
                        <div style={{ textAlign: "center", margin: 50 }}>
                            <Spin size="large" />
                        </div>
                    ) : !workersData?.innerData?.length ? (
                        <Alert
                            message="Ishchilar ma'lumotlari topilmadi"
                            type="warning"
                            showIcon
                        />
                    ) : (
                        <Table
                            columns={workerColumns}
                            dataSource={dataMonthly?.innerData}
                            pagination={false}
                            bordered
                            size="small"
                            rowKey="_id"
                            components={{
                                body: {
                                    row: ({ children, ...rest }) => {
                                        const worker = workersData.innerData.find(
                                            (w) => w._id === rest["data-row-key"]
                                        );
                                        return worker ? (
                                            <WorkerRow worker={worker} year={year} month={month} />
                                        ) : (
                                            <tr {...rest}>{children}</tr>
                                        );
                                    },
                                },
                            }}
                        />
                    )}
                </Card>

                {/* Driver Data Table */}
                <Card style={{ borderRadius: 12, }}>
                    <Title level={4} style={{ textAlign: "center", marginBottom: 20 }}>
                        Haydovchilar Oylik Hisoboti
                    </Title>
                    {driverLoading ? (
                        <div style={{ textAlign: "center", margin: 50 }}>
                            <Spin size="large" />
                        </div>
                    ) : !driverTableData?.length ? (
                        <Alert
                            message="Haydovchilar ma'lumotlari topilmadi"
                            type="warning"
                            showIcon
                        />
                    ) : (
                        <Table
                            columns={driverColumns}
                            dataSource={driverTableData}
                            pagination={false}
                            bordered
                            size="small"
                            rowKey="driverId"
                            components={{
                                body: {
                                    row: ({ children, ...rest }) => {
                                        const driver = driverTableData.find(
                                            (d) => d.driverId === rest["data-row-key"]
                                        );
                                        return driver ? (
                                            <DriverRow driver={driver} />
                                        ) : (
                                            <tr {...rest}>{children}</tr>
                                        );
                                    },
                                },
                            }}
                        />
                    )}
                </Card>

                {/* Order Report Table */}
                <OrderReportTable year={year} month={month + 1} />


                {/* My debs data table */}
                <Card style={{ borderRadius: 12, }}>
                    <Title level={4} style={{ textAlign: "center", marginBottom: 20 }}>
                        Tashqi Qarz Hisoboti
                    </Title>

                    {isError ? (
                        <Alert
                            message={error?.data?.message || "Ma'lumotlarni yuklashda xatolik"}
                            type="error"
                            showIcon
                        />
                    ) : isLoading ? (
                        <div style={{ textAlign: "center", margin: 50 }}>
                            <Spin size="large" />
                        </div>
                    ) : !data?.innerData?.length ? (
                        <Alert
                            message="Qarz ma'lumotlari topilmadi"
                            type="warning"
                            showIcon
                        />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={data?.innerData}
                            rowKey="_id"
                            size="small"
                            loading={isLoading}
                            bordered
                            pagination={false}
                        />
                    )}
                </Card>
            </div>
        </>
    );
};

export default ReportTable;


