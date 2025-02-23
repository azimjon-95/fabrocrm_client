import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Input, Typography, Spin, Alert, DatePicker, message, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
    PercentageOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    BulbOutlined
} from "@ant-design/icons";
import { useGetMonthlyAttendanceQuery, useUpdateByAttendanceMutation } from "../../../context/service/attendance";
import dayjs from "dayjs";
import "./style.css";

const { Text } = Typography;

const EditAttendance = () => {
    const { workerName: workerId } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const year = selectedDate.year();
    const month = String(selectedDate.month() + 1).padStart(2, "0");
    const { data, isLoading, error, refetch: refetchAttendance } = useGetMonthlyAttendanceQuery({ year, month });
    const [translatedData, setTranslatedData] = useState([]);
    const [changedCards, setChangedCards] = useState({});
    const [updateAttendance] = useUpdateByAttendanceMutation();

    const worker = useMemo(() => data?.innerData?.filter(item => item.workerId === workerId), [data, workerId]);

    const inputFields = useMemo(() => [
        { label: "Foiz", field: "status.foiz", icon: <PercentageOutlined /> },
        { label: "Lokatsiya", field: "status.loc", icon: <EnvironmentOutlined /> },
        { label: "Kungi: Boshlanish vaqti", field: "inTime.start", icon: <ClockCircleOutlined /> },
        { label: "Kungi: Tugash vaqti", field: "inTime.end", icon: <ClockCircleOutlined /> },
        { label: "Tungi: Boshlanish vaqti", field: "inTime.nightStart", icon: <ClockCircleOutlined /> },
        { label: "Tungi: Tugash vaqti", field: "inTime.nightEnd", icon: <ClockCircleOutlined /> },
        { label: "Ish vaqti", field: "workingHours", icon: <BulbOutlined /> },
        { label: "Tun ish vaqti", field: "nightWorkingHours", icon: <BulbOutlined /> }
    ], []);

    useEffect(() => {
        if (worker) {
            setTranslatedData(worker);
        }
    }, [worker]);


    const handleChange = (index, field, value) => {
        setTranslatedData(prevData => {
            const newData = [...(prevData || [])];
            const keys = field.split('.'); // Fieldni bo'lib olish (masalan, status.foiz)
            const lastKey = keys.pop(); // So'nggi kalitni olish (foiz)

            // Obyektni chuqur nusxalash
            const updatedItem = { ...newData[index] };
            let target = updatedItem;

            // Ichki obyektlarni chuqur nusxalash
            keys.forEach(key => {
                target[key] = { ...target[key] };
                target = target[key];
            });

            target[lastKey] = value; // Qiymatni o'zgartirish

            newData[index] = updatedItem;
            return newData;
        });

        // O'zgarishni qayd etish
        setChangedCards(prev => ({
            ...prev,
            [index]: true
        }));
    };


    const handleSave = useCallback(async (index) => {
        try {
            const item = translatedData[index];

            const updatedData = {
                workerId: item.workerId,
                status: {
                    foiz: item.status?.foiz,
                    loc: item.status?.loc,
                },
                inTime: {
                    start: item.inTime?.start,
                    end: item.inTime?.end,
                    nightStart: item.inTime?.nightStart,
                    nightEnd: item.inTime?.nightEnd,
                },
                workingHours: item.workingHours,
                nightWorkingHours: item.nightWorkingHours,
            };

            await updateAttendance({ id: item?._id, updatedData }).unwrap();
            message.success("O'zgarishlar saqlandi!");
            refetchAttendance();

            setChangedCards(prev => {
                const updated = { ...prev };
                delete updated[index];
                return updated;
            });
        } catch (error) {
            console.error("Ma'lumotlarni saqlashda xatolik:", error);
            message.error("Xatolik yuz berdi, qayta urinib ko'ring.");
        }
    }, [translatedData, workerId, updateAttendance, refetchAttendance]);

    if (isLoading) return <Spin size="large" className="spinner" />;
    if (error) return <Alert message="Ma'lumotlarni yuklashda xatolik yuz berdi!" type="error" showIcon />;

    return (
        <div className="edit-attendance-container">
            <div className="edit-attendance-container-nav">
                <Button
                    type="primary"
                    onClick={() => navigate(-1)}
                    size="middle"
                >
                    Orqaga
                </Button>
                <h2>Davomatlarni tahrirlash</h2>
                <DatePicker
                    className="datePicker_nav-ed"
                    picker="month"
                    size="large"
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(dayjs(date))}
                />
            </div>
            <div className="card-grid">
                {translatedData?.map((item, index) => (
                    <Card
                        key={index}
                        title={
                            <div className="card-title-head">
                                <Text strong>{item.date}</Text>
                                {changedCards[index] && (
                                    <Button
                                        type="primary"
                                        onClick={() => handleSave(index)}
                                    >
                                        Saqlash
                                    </Button>
                                )}
                            </div>
                        }
                        className="attendance-card"
                    >
                        {inputFields.map(({ label, field, icon }) => (
                            <div className="form-group" key={field}>
                                <Text strong>{label}:</Text>
                                <Input
                                    size="small"
                                    suffix={icon}
                                    value={field.split('.').reduce((o, key) => o?.[key], item)}
                                    onChange={(e) => handleChange(index, field, e.target.value)}
                                />
                            </div>
                        ))}

                    </Card>
                ))}
            </div>
        </div>
    );
};

export default EditAttendance;
