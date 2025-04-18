// src/components/Salary.js
import React, { useState, useRef, useEffect } from 'react';
import { Table, Spin, DatePicker, Empty, Tooltip } from 'antd';
import {
  ClockCircleOutlined,
  DollarOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { TbClockPlus } from 'react-icons/tb';
import dayjs from 'dayjs';

import { useGetAllWorkingHoursQuery } from "../../../context/service/workingHours";
import { useGetWorkersQuery } from "../../../context/service/worker";
import { useGetMonthlyAttendanceQuery } from "../../../context/service/attendance";
import { useGetRelevantExpensesQuery } from "../../../context/service/expensesApi";
import { FaTrash } from 'react-icons/fa'; // Import trash icon from react-icons

import {
  useGetWorkingDaysQuery,
  useCreateWorkingDayMutation,
  useUpdateWorkingDayMutation,
  useDeleteWorkingDayMutation,
} from '../../../context/service/workingDays'; // Adjust path
import Exsel from './Exsel';
import './style.css';

const Salary = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeButton, setChangeButton] = useState(false);
  const modalRef = useRef(null);

  // RTK Query hooks
  const { data: dataSalary } = useGetAllWorkingHoursQuery();
  const { data: dataWorkers } = useGetWorkersQuery();
  const { data: workingDaysData, refetch: refetchWorkingDays } = useGetWorkingDaysQuery();
  const [createWorkingDay] = useCreateWorkingDayMutation();
  const [updateWorkingDay] = useUpdateWorkingDayMutation();
  const [deleteWorkingDay] = useDeleteWorkingDayMutation();

  const workingDays = workingDaysData?.innerData || []
  const year = selectedDate.year();
  const month = String(selectedDate.month() + 1).padStart(2, '0');
  const { data, isLoading, error } = useGetMonthlyAttendanceQuery({ year, month });

  const salaryDataObj = dataSalary?.innerData?.[0] || {};

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change and update server
  const handleInputSend = async () => {
    try {
      const numericValue = Number(inputValue);
      await createWorkingDay({ value: { minthlyWorkingDay: numericValue } }).unwrap();
      refetchWorkingDays();
    } catch (err) {
      console.error('Failed to update/create working day:', err);
    }
  };
  const handleChangeButton = (e) => {
    setChangeButton(!changeButton);
  }

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
  }

  // Set input to the latest value from server
  useEffect(() => {
    if (workingDays?.length) {
      const sortedDays = [...workingDays].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setInputValue(String(sortedDays[0].minthlyWorkingDay ?? ''));
    }
  }, [workingDays]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deleteWorkingDay(id).unwrap();
      refetchWorkingDays();
    } catch (err) {
      console.error('Failed to delete working day:', err);
    }
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = async (id) => {
    try {
      await updateWorkingDay({ id }).unwrap();
      refetchWorkingDays();
    } catch (err) {
      console.error('Failed to toggle checkbox:', err);
    }
  };

  // Group attendance data
  const groupedData = data?.innerData?.reduce((acc, curr) => {
    const { workerId, workerName, workingHours, nightWorkingHours, status } = curr;
    const hours = Number(workingHours) || 0;
    const nightHours = Number(nightWorkingHours) || 0;
    const location = status?.loc?.toLowerCase();

    acc[workerId] = acc[workerId] || {
      workerId,
      workerName,
      workingHours: 0,
      nightWorkingHours: 0,
      voxa: 0,
      toshkent: 0,
    };

    acc[workerId].nightWorkingHours += nightHours;
    if (location === 'voxa') {
      acc[workerId].voxa += hours;
    } else if (location === 'toshkent') {
      acc[workerId].toshkent += hours;
    } else {
      acc[workerId].workingHours += hours;
    }

    return acc;
  }, {});

  // Prepare table data
  const tableData = Object.values(groupedData || {}).map((worker) => {
    const { voxa, toshkent, workingHours, nightWorkingHours, workerId } = worker;
    const { voxa: voxaPercent = 0, toshkent: toshkentPercent = 0 } = salaryDataObj;

    const matchingWorker = dataWorkers?.innerData?.find((w) => w._id === workerId);
    const workerName = matchingWorker
      ? `${matchingWorker.firstName} ${matchingWorker.lastName}`
      : worker.workerName;

    const wages = Number(matchingWorker?.hourlySalary) || 0;
    const overtimeWages = wages * 2;
    const baseSalary = workingHours * wages;
    const extraSalary = nightWorkingHours * overtimeWages;
    const monthlySalary = Number(matchingWorker?.salary) || 0;
    const totalVoxa = voxa * (wages + (wages * voxaPercent) / 100);
    const totalToshkent = toshkent * (wages + (wages * toshkentPercent) / 100);

    return {
      ...worker,
      workerName,
      salary: baseSalary,
      extraSalary,
      monthlySalary,
      totalVoxa,
      totalToshkent,
      totalSalary: baseSalary + extraSalary + totalVoxa + totalToshkent,
    };
  });

  // Reusable Expenses Component
  const Expenses = ({ workerId, totalSalary }) => {
    const { data: expensesData } = useGetRelevantExpensesQuery({
      relevantId: [workerId],
      date: selectedDate.toISOString(),
    });

    const avansExpenses = expensesData?.innerData?.filter(
      (expense) => expense.category === 'Avans' && expense.relevantId === workerId
    ) || [];

    const ishHaqiExpenses = expensesData?.innerData?.filter(
      (expense) => expense.category === 'Ish haqi' && expense.relevantId === workerId
    ) || [];

    const totalAvans = avansExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalIshHaqi = ishHaqiExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const remainingSalary = totalSalary - totalIshHaqi - totalAvans;

    return (
      <div className="expenses-container">
        <div>
          <Tooltip title="Hodim jami olingan maosh va avanlarndan qolgan qoldiq summa">
            <strong className="tooltip-label">Qoldiq:</strong>
          </Tooltip>{' '}
          {remainingSalary.toLocaleString()} so‘m
        </div>
        <div>
          <strong>Avans:</strong> {totalAvans.toLocaleString()} so‘m
        </div>
        <div>
          <strong>Ish haqi:</strong> {totalIshHaqi.toLocaleString()} so‘m
        </div>
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      title: 'Ism Familya',
      dataIndex: 'workerName',
      key: 'workerName',
      fixed: 'left',
    },
    {
      title: 'Ish soat va Haqi',
      key: 'workAndSalary',
      render: (_, record) => (
        <div>
          <div>
            <ClockCircleOutlined /> <strong>{record.workingHours}</strong> soat
          </div>
          <div>
            <DollarOutlined /> <strong>{record.salary.toLocaleString()}</strong> so‘m
          </div>
        </div>
      ),
    },
    {
      title: '+ Ish soat va Haqi',
      key: 'extraWorkAndSalary',
      render: (_, record) => (
        <div>
          <div>
            <TbClockPlus /> <strong>{record.nightWorkingHours}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{' '}
            <strong>{record.extraSalary.toLocaleString()}</strong> so‘m
          </div>
        </div>
      ),
    },
    {
      title: `Toshkent ${salaryDataObj.toshkent || 0}%`,
      dataIndex: 'toshkent',
      key: 'toshkent',
      render: (_, record) => (
        <div>
          <div>
            <TbClockPlus /> <strong>{record.toshkent}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{' '}
            <strong>{record.totalToshkent.toLocaleString()}</strong> so‘m
          </div>
        </div>
      ),
    },
    {
      title: `Voxa ${salaryDataObj.voxa || 0}%`,
      dataIndex: 'voxa',
      key: 'voxa',
      render: (_, record) => (
        <div>
          <div>
            <TbClockPlus /> <strong>{record.voxa}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{' '}
            <strong>{record.totalVoxa.toLocaleString()}</strong> so‘m
          </div>
        </div>
      ),
    },
    {
      title: 'Jami maosh',
      dataIndex: 'totalSalary',
      key: 'totalSalary',
      render: (text) => `${text.toLocaleString()} so'm`,
    },
    {
      title: 'Maosh va Qoldiq',
      key: 'finalSalary',
      render: (_, record) => (
        <Expenses workerId={record.workerId} totalSalary={record.totalSalary} />
      ),
    },
  ];

  if (isLoading) {
    return <Spin size="large" className="spinner" />;
  }

  if (error) {
    return <Empty description="Ma'lumotlar topilmadi" />;
  }

  return (
    <div className="salary-container">
      <div className="salary-nav">
        <div className="salary-navworking-days">
          <DatePicker
            picker="month"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date ? dayjs(date) : dayjs())}
            className="date-picker"
          />
          <div className="working-days-container">
            <input
              type="string"
              value={inputValue}
              onChange={handleInputChange}
              onClick={handleChangeButton}
              onDoubleClick={() => setIsModalOpen(true)}
              placeholder="Ish kunini kiriting"
              className={isModalOpen && "working-days-inputActive"}
            />
            {
              changeButton &&
              <button className="send-buttonDay" onClick={handleInputSend}>Ok</button>
            }
            {isModalOpen && (
              <div className="modal-overlay">
                <div ref={modalRef} className="modalworking-days">
                  <h2>Ish kunlari</h2>
                  {workingDays?.length === 0 ? (
                    <p className="no-data">Ish kunlari topilmadi.</p>
                  ) : (
                    <ul className="working-days-list">
                      {[...workingDays]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((day, inx, arr) => {
                          const isLatest = day._id === arr[0]._id; // eng yangi (birinchi) elementni aniqlaymiz
                          return (
                            <li key={inx} className="working-day-item">
                              <div className="working-day-content">
                                <input
                                  type="checkbox"
                                  checked={isLatest} // faqat eng oxirgi qo‘shilgan data `checked`
                                  onChange={() => handleCheckboxToggle(day?._id, day?.minthlyWorkingDay)}
                                  className="checkboxDay"
                                />
                                <span>{day?.minthlyWorkingDay}-kun</span>
                                <span className="dateDay">
                                  {new Date(day.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                  })}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDelete(day?._id)}
                                className="delete-buttonDay"
                              >
                                <FaTrash className="delete-icon" />
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>



        <h2>Xodimlar Ish Haqqi</h2>
        <Exsel selectedDate={selectedDate} />
      </div>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="workerId"
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        className="salary-table"
      />
    </div>
  );
};

export default Salary;