import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Table,
    Button,
    InputNumber,
    Modal,
    List,
    message,
    Spin,
    Typography,
} from "antd";
import { DeleteOutlined, HistoryOutlined, ClockCircleOutlined, LeftOutlined } from "@ant-design/icons";
import {
    useGetWorkersQuery,
    useGetWorkerSalariesQuery,
    useCreateWorkerSalaryMutation,
    useDeleteWorkerSalaryMutation
} from "../../../../context/service/worker";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./WorkersPage.css";

const { Title } = Typography;

// Utility function to format salary
const formatSalary = (salary) => {
    if (!salary || isNaN(salary)) return "0";
    return new Intl.NumberFormat("uz-UZ", {
        style: "decimal",
        minimumFractionDigits: 0,
    }).format(Number(salary));
};

// Utility function to parse formatted salary
const parseSalary = (value) => {
    if (!value) return undefined;
    // Remove thousands separators (spaces based on uz-UZ locale)
    return Number(value.replace(/\s/g, ""));
};

const WorkersPage = () => {
    const navigate = useNavigate();
    const { data, isLoading: workersLoading, error: workersError } = useGetWorkersQuery();
    const hourlySalary = data?.innerData.map((i) => i.hourlySalary);

    // Barcha innerData obyektlariga hourlySalary ni qo‘shish
    const workers = data?.innerData.map((i, index) => ({
        ...i._doc,
        hourlySalary: hourlySalary[index]
    }));


    const [createSalary] = useCreateWorkerSalaryMutation();
    const [deleteSalary] = useDeleteWorkerSalaryMutation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [hourlyModalVisible, setHourlyModalVisible] = useState(false);
    const [selectedHourlyWorker, setSelectedHourlyWorker] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState({});
    const [loadingSalary, setLoadingSalary] = useState({});

    const { control, handleSubmit, resetField, trigger } = useForm({
        defaultValues: { salary: "" },
    });

    const { data: salaries, isLoading: salariesLoading } = useGetWorkerSalariesQuery(
        selectedWorker?._id,
        { skip: !selectedWorker }
    );

    // Sort salaries by createdAt in descending order (newest first)
    const sortedSalaries = [...(salaries || [])].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Sort hourly salaries by createdAt in descending order
    const sortedHourlySalaries = selectedHourlyWorker?.hourlySalary?.length > 0
        ? [...selectedHourlyWorker.hourlySalary].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

    const handleDeleteSalary = async (workerId, salaryId) => {
        try {
            await deleteSalary({ workerId, salaryId }).unwrap();
            message.success("Oylik o'chirildi");
        } catch (error) {
            message.error(error?.data?.message || "Xatolik yuz berdi");
        }
    };

    const showSalaryHistory = async (worker) => {
        setLoadingHistory((prev) => ({ ...prev, [worker._id]: true }));
        setSelectedWorker(worker);
        setModalVisible(true);
        setLoadingHistory((prev) => ({ ...prev, [worker._id]: false }));
    };

    const showHourlySalaryHistory = async (worker) => {
        setSelectedHourlyWorker(worker);
        setHourlyModalVisible(true);
    };

    const onSubmit = async (workerId, latestSalary) => {
        const isValid = await trigger(`salary-${workerId}`);
        if (!isValid) {
            message.error('Oylik summasi kiritilishi shart');
            return;
        }

        try {
            setLoadingSalary((prev) => ({ ...prev, [workerId]: true }));
            const salary = control._formValues[`salary-${workerId}`];
            if (salary == null || salary === "" || isNaN(salary)) {
                message.error('Oylik summasi kiritilishi shart');
                return;
            }
            const salaryValue = Number(salary);
            if (salaryValue < 0) {
                message.error('Oylik summasi 0 dan kichik bo‘lmasligi kerak');
                return;
            }
            if (String(salaryValue) === String(latestSalary)) {
                message.info('Oylik summasi o‘zgarmadi');
                return;
            }
            const salaryString = String(salaryValue);
            await createSalary({ workerId, salary: salaryString }).unwrap();
            message.success('Oylik muvaffaqiyatli saqlandi');
            resetField(`salary-${workerId}`);
        } catch (err) {
            console.error('Failed to save salary:', err);
            message.error(err?.data?.message || 'Oylik saqlashda xato yuz berdi');
        } finally {
            setLoadingSalary((prev) => ({ ...prev, [workerId]: false }));
        }
    };

    // Export table data to Excel
    const exportToExcel = () => {
        const exportData = workers?.map((record) => {
            const latestSalary = record.salary?.[record.salary.length - 1]?.salary || '';
            const latestHourlySalary = record.hourlySalary?.length > 0
                ? [...record.hourlySalary].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.hourlySalary
                : '';
            return {
                FIO: `${record.lastName} ${record.firstName} ${record.middleName}`,
                Kasbi: record.workerType || record.role,
                "Soatlik To‘lov": `${formatSalary(latestHourlySalary)} so'm`,
                "Oxirgi oylik": `${formatSalary(latestSalary)} UZS`,
            };
        }) || [];

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Calculate column widths based on content
        const colWidths = exportData.reduce((acc, row) => {
            Object.keys(row).forEach((key, idx) => {
                const value = String(row[key] || "");
                const len = value.length + 2; // Add padding
                acc[idx] = Math.max(acc[idx] || 10, len);
            });
            return acc;
        }, []);

        // Set column widths
        ws['!cols'] = colWidths.map((width) => ({ wch: width }));

        // Create workbook and append worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Workers");

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, "Workers_Salary_List.xlsx");
    };

    const columns = [
        {
            title: 'FIO',
            key: 'firstName',
            render: (_, record) => `${record.lastName} ${record.firstName} ${record.middleName}`,
        },
        {
            title: 'Kasbi',
            key: 'job',
            render: (_, record) => record.workerType || record.role,
        },
        {
            title: 'Soatlik To‘lov',
            key: 'hourlySalary',
            render: (_, record) => {
                const latestHourlySalary = record.hourlySalary?.length > 0
                    ? [...record.hourlySalary].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.hourlySalary
                    : '';
                return (
                    <Button
                        icon={<ClockCircleOutlined />}
                        onClick={() => showHourlySalaryHistory(record)}
                        className="wp-hourly-history-button"

                    >
                        {`${formatSalary(latestHourlySalary)} so'm`}
                    </Button>
                );
            },
        },
        {
            title: 'Oxirgi oylik',
            key: 'latestSalary',
            render: (_, record) => {
                const latestSalary = record.salary?.[record.salary.length - 1]?.salary || '';
                return (
                    <div className="wp-salary-input-container">
                        <Controller
                            name={`salary-${record._id}`}
                            control={control}
                            defaultValue={latestSalary}
                            rules={{
                                required: 'Oylik kiritilishi shart',
                                validate: (value) =>
                                    (value != null && !isNaN(value) && value !== "") ||
                                    'Oylik summasi kiritilishi shart',
                            }}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    placeholder="Oylik summasi"
                                    min={0}
                                    style={{ width: '100px', marginRight: '8px' }}
                                    formatter={formatSalary}
                                    parser={parseSalary}
                                    onChange={(value) => field.onChange(value)}
                                />
                            )}
                        />
                        <Controller
                            name={`salary-${record._id}`}
                            control={control}
                            render={({ field }) => (
                                <Button
                                    type="primary"
                                    onClick={() => onSubmit(record._id, latestSalary)}
                                    loading={loadingSalary[record._id] || false}
                                    className="wp-add-salary-button"
                                    disabled={
                                        !(
                                            field.value != null &&
                                            !isNaN(field.value) &&
                                            field.value !== "" &&
                                            field.value >= 0 &&
                                            String(field.value) !== String(latestSalary)
                                        )
                                    }
                                >
                                    Qo'shish
                                </Button>
                            )}
                        />
                    </div>
                );
            },
        },
        {
            title: 'Oylik tarixi',
            key: 'history',
            render: (_, record) => (
                <Button
                    icon={<HistoryOutlined />}
                    onClick={() => showSalaryHistory(record)}
                    loading={loadingHistory[record._id] || false}
                    className="wp-add-salary-button"
                >
                    Tarix
                </Button>
            ),
        },
    ];

    if (workersError) {
        message.error("Ishchilarni yuklashda xatolik yuz berdi");
    }

    return (
        <div className="wp-container">
            <div className="wp-container-header">
                <Button
                    icon={<LeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="wp-back-button"
                >
                    Orqaga
                </Button>
                <Title level={4} className="wp-heading">
                    Ishchilar oylik ish maoshlar ro'yxati
                </Title>
                <Button
                    type="primary"
                    onClick={exportToExcel}
                    className="wp-add-salary-button"
                >
                    Excel
                </Button>
            </div>
            <form onSubmit={handleSubmit(() => { })} className="wp-table-form">
                <Table
                    columns={columns}
                    dataSource={workers}
                    loading={workersLoading}
                    rowKey="_id"
                    className="wp-workers-table"
                    pagination={false}
                    size="small"
                    bordered={true}
                />
            </form>
            <Modal
                title={`${selectedWorker?.firstName} ${selectedWorker?.lastName} - Oylik tarixi`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                className="wp-salary-history-modal"
            >
                {salariesLoading ? (
                    <Spin />
                ) : (
                    <List
                        dataSource={sortedSalaries}
                        renderItem={(item) => (
                            <List.Item
                                className="wp-salary-list-item"
                                actions={[
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        onClick={() => handleDeleteSalary(selectedWorker?._id, item._id)}
                                        className="wp-delete-salary-button"
                                    >
                                        O'chirish
                                    </Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={`Summa: ${formatSalary(item.salary)} UZS`}
                                    className="wp-salary-list-item-title"
                                    description={<span className="wp-salary-list-item-description">{`Sana: ${new Date(item.createdAt).toLocaleDateString()}`}</span>}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Modal>
            <Modal
                title={`${selectedHourlyWorker?.firstName} ${selectedHourlyWorker?.lastName} - Soatlik to‘lov tarixi`}
                open={hourlyModalVisible}
                onCancel={() => setHourlyModalVisible(false)}
                footer={null}
                className="wp-salary-history-modal"
            >
                {sortedHourlySalaries.length > 0 ? (
                    <List
                        dataSource={sortedHourlySalaries}
                        renderItem={(item) => (
                            <List.Item className="wp-salary-list-item">
                                <List.Item.Meta
                                    title={`Summa: ${formatSalary(item.hourlySalary)} so'm`}
                                    className="wp-salary-list-item-title"
                                    description={<span className="wp-salary-list-item-description">{`Sana: ${new Date(item.createdAt).toLocaleDateString()}`}</span>}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Typography.Text>No hourly salary history available.</Typography.Text>
                )}
            </Modal>
        </div>
    );
};

export default WorkersPage;







