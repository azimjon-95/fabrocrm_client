import React, { useState, useRef, useEffect } from 'react';
import { Table, Spin, DatePicker, Empty, Tooltip, Button } from 'antd';
import {
  ClockCircleOutlined,
  DollarOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { TbClockPlus } from 'react-icons/tb';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useGetAllWorkingHoursQuery } from '../../../context/service/workingHours';
import { useGetTotalRemainingSalaryQuery } from '../../../context/service/worker';
import { FaTrash } from 'react-icons/fa';
import { CgFileDocument } from 'react-icons/cg';
import {
  useGetWorkingDaysQuery,
  useCreateWorkingDayMutation,
  useUpdateWorkingDayMutation,
  useDeleteWorkingDayMutation,
} from '../../../context/service/workingDays';
import Exsel from './Exsel';
import './style.css';

const Salary = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeButton, setChangeButton] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Queries and mutations
  const { data: dataSalary } = useGetAllWorkingHoursQuery();
  const { data: workingDaysData, refetch: refetchWorkingDays } = useGetWorkingDaysQuery();
  const [createWorkingDay] = useCreateWorkingDayMutation();
  const [updateWorkingDay] = useUpdateWorkingDayMutation();
  const [deleteWorkingDay] = useDeleteWorkingDayMutation();

  const workingDays = workingDaysData?.innerData || [];
  const year = selectedDate.year();
  const month = String(selectedDate.month() + 1).padStart(2, '0');
  const { data: dataMonthly, refetch, isLoading, isError } = useGetTotalRemainingSalaryQuery(
    { year, month },
    { skip: !year || !month } // Skip query if year/month are invalid
  );
  const salaryDataObj = dataSalary?.innerData?.[0] || {};

  // Refetch salary data when selectedDate changes
  useEffect(() => {
    if (year && month) {
      refetch();
    }
  }, [selectedDate, refetch]);

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

  // Set input to the latest value from server
  useEffect(() => {
    if (workingDays?.length) {
      const sortedDays = [...workingDays].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setInputValue(String(sortedDays[0].minthlyWorkingDay ?? ''));
    } else {
      setInputValue('');
    }
  }, [workingDays]);

  // Handle input change and update server
  const handleInputSend = async () => {
    try {
      const numericValue = Number(inputValue);
      if (isNaN(numericValue) || numericValue <= 0) {
        console.error('Invalid input: Must be a positive number');
        return;
      }
      await createWorkingDay({ value: { minthlyWorkingDay: numericValue } }).unwrap();
      refetchWorkingDays();
      setChangeButton(false);
    } catch (err) {
      console.error('Failed to update/create working day:', err);
    }
  };

  const handleChangeButton = () => {
    setChangeButton(!changeButton);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

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

  // Table columns
  const columns = [
    {
      title: 'Ism Familya',
      dataIndex: 'fullName',
      key: 'fullName',
      fixed: 'left',
    },
    {
      title: 'Ish soat va Ha is Haqi',
      key: 'workAndSalary',
      render: (_, record) => (
        <div>
          <div>
            <ClockCircleOutlined /> <strong>{record?.regular?.hours || 0}</strong> soat
          </div>
          <div>
            <DollarOutlined /> <strong>{(record?.regular?.salary || 0).toLocaleString()}</strong> so‘m
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
            <TbClockPlus /> <strong>{record?.night?.hours || 0}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{' '}
            <strong>{(record?.night?.salary || 0).toLocaleString()}</strong> so‘m
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
            <TbClockPlus /> <strong>{record?.toshkent?.hours || 0}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{' '}
            <strong>{(record?.toshkent?.salary || 0).toLocaleString()}</strong> so‘m
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
            <TbClockPlus /> <strong>{record?.voxa?.hours || 0}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{' '}
            <strong>{(record?.voxa?.salary || 0).toLocaleString()}</strong> so‘m
          </div>
        </div>
      ),
    },
    {
      title: 'Jami',
      key: 'total',
      render: (_, record) => (
        <div>
          <div>
            <TbClockPlus /> <strong>{record?.totalHours || 0}</strong> soat
          </div>
          <div>
            <DollarCircleOutlined />{' '}
            <strong>{(record?.totalSalary || 0).toLocaleString()}</strong> so‘m
          </div>
        </div>
      ),
    },
    {
      title: 'Maosh va Qoldiq',
      key: 'finalSalary',
      render: (_, record) => (
        <div className="expenses-container">
          <div>
            <Tooltip title="Hodim jami olingan maosh va avanlarndan qolgan qoldiq summa">
              <strong className="tooltip-label">Qoldiq:</strong>
            </Tooltip>{' '}
            {(record?.remainingSalary || 0).toLocaleString()} so‘m
          </div>
          <div>
            <strong>Avans:</strong> {(record?.avans || 0).toLocaleString()} so‘m
          </div>
          <div>
            <strong>Ish haqi:</strong> {(record?.paidSalary || 0).toLocaleString()} so‘m
          </div>
        </div>
      ),
    },
    {
      title: 'Jami qoldiq maoshi (Barcha oylar)',
      key: 'totalRemainingSalary',
      render: (_, record) => (
        <div className="expenses-container">
          <div>
            <Tooltip title="Hodimning barcha oylardagi jami qoldiq maosh summasi">
              <strong>{(record?.totalRemainingSalary || 0).toLocaleString()}</strong> so‘m
            </Tooltip>
          </div>
        </div>
      ),
    },
  ];

  // Custom empty state
  const locale = {
    emptyText: (
      <>
        {isLoading ? (
          <Spin tip="Yuklanmoqda..." />
        ) : isError ? (
          <Empty description="Xatolik yuz berdi, ma'lumotlar yuklanmadi" />
        ) : (
          <Empty description="Ma'lumotlar topilmadi" />
        )}
      </>
    ),
  };

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
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onClick={handleChangeButton}
              onDoubleClick={() => setIsModalOpen(true)}
              placeholder="Ish kunini kiriting"
              className={isModalOpen ? 'working-days-inputActive' : ''}
            />
            {changeButton && (
              <button className="send-buttonDay" onClick={handleInputSend}>
                Ok
              </button>
            )}
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
                          const isLatest = day._id === arr[0]._id;
                          return (
                            <li key={inx} className="working-day-item">
                              <div className="working-day-content">
                                <input
                                  type="checkbox"
                                  checked={isLatest}
                                  onChange={() => handleCheckboxToggle(day?._id)}
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
        <div className="salary-navworking-days">
          <Button
            size="large"
            style={{
              backgroundColor: '#0A3D3A',
              color: '#fff',
              fontSize: 20,
            }}
            onClick={() => navigate('/salaryCtrl')}
          >
            <CgFileDocument />
          </Button>
          <Exsel
            selectedDate={selectedDate}
            dataMonthly={dataMonthly?.innerData}
            salaryDataObj={salaryDataObj}
            columns={columns}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={isLoading || isError ? [] : dataMonthly?.innerData}
        rowKey="workerId"
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        className="salary-table"
        locale={locale}
      />
    </div>
  );
};

export default Salary;