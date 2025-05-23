import React, { useState } from 'react';
import { Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import './style.css';

const Exsel = ({ selectedDate, dataMonthly, salaryDataObj, columns }) => {
  const [isLoading] = useState(false); // Keep for UI purposes if needed

  const handleExport = () => {
    // Prepare the data for Excel based on columns
    const wsData = dataMonthly?.map((worker) => {
      const rowData = {};

      columns.forEach((column) => {
        const { title, key, render, dataIndex } = column;

        // Handle simple dataIndex cases
        if (dataIndex) {
          rowData[title] = worker[dataIndex] || '';
        }

        // Handle rendered columns
        if (render) {
          // Simulate rendering to extract text content
          switch (key) {
            case 'workAndSalary':
              rowData[title] = `${worker?.regular?.hours || 0} soat / ${(worker?.regular?.salary || 0).toLocaleString()} so‘m`;
              break;
            case 'extraWorkAndSalary':
              rowData[title] = `${worker?.night?.hours || 0} soat / ${(worker?.night?.salary || 0).toLocaleString()} so‘m`;
              break;
            case 'toshkent':
              rowData[title] = `${worker?.toshkent?.hours || 0} soat / ${(worker?.toshkent?.salary || 0).toLocaleString()} so‘m`;
              break;
            case 'voxa':
              rowData[title] = `${worker?.voxa?.hours || 0} soat / ${(worker?.worker?.voxa?.salary || 0).toLocaleString()} so‘m`;
              break;
            case 'total':
              rowData[title] = `${worker?.totalHours || 0} soat / ${(worker?.totalSalary || 0).toLocaleString()} so‘m`;
              break;
            case 'finalSalary':
              rowData[title] = `Qoldiq: ${(worker?.remainingSalary || 0).toLocaleString()} so‘m, Avans: ${(worker?.avans || 0).toLocaleString()} so‘m, Ish haqi: ${(worker?.paidSalary || 0).toLocaleString()} so‘m`;
              break;
            case 'totalRemainingSalary':
              rowData[title] = `${(worker?.totalRemainingSalary || 0).toLocaleString()} so‘m`;
              break;
            default:
              rowData[title] = '';
          }
        }
      });

      return rowData;
    }) || [];

    // Create worksheet from the data
    const ws = XLSX.utils.json_to_sheet(wsData);

    // Calculate column widths
    const colWidths = columns.map((column) => {
      const title = column.title;
      // Get the maximum length of the content in this column
      const maxLength = Math.max(
        title.length, // Length of the header
        ...wsData.map((row) => String(row[title] || '').length) // Length of each cell in the column
      );
      // Convert character length to approximate width (adjust multiplier as needed)
      return { wch: Math.min(maxLength * 1.2, 50) }; // Limit max width to 50 for readability
    });

    // Apply column widths to the worksheet
    ws['!cols'] = colWidths;

    // Apply autofilter to headers
    ws['!autofilter'] = { ref: ws['!ref'] };

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salary Data');

    // Trigger file download
    XLSX.writeFile(wb, 'salary_data.xlsx');
  };

  return (
    <Button
      size="large"
      loading={isLoading}
      onClick={handleExport}
      icon={<FileExcelOutlined />}
    >
      Excel
    </Button>
  );
};

export default Exsel;