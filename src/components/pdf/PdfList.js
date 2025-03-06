import React, { useState } from "react";
import { Table, Image, Typography, Card, Button, DatePicker } from "antd";
import { useGetAllWorkingHoursQuery } from "../../context/service/workingHours";
import { useGetOrderByIdQuery } from "../../context/service/orderApi";
// import Banner from "./banner.png";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { AiOutlineDoubleLeft } from "react-icons/ai";
import { AiOutlineFileImage } from "react-icons/ai";
// import { Box } from "@ant-design/icons";
import html2canvas from "html2canvas"; // Import html2canvas
import "./pdf.css";
const { Text } = Typography;

const ShohMebelTable = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: info } = useGetAllWorkingHoursQuery();
  const dataSource = info?.innerData?.find((i) => i) || {};
  const currentDate = dayjs().format("DD.MM.YYYY");
  const { data: order } = useGetOrderByIdQuery(id);
  const orderList = order?.innerData || {};
  const [loading, setLoading] = useState(false); // Loading state

  // Default sana
  const [currentDateToday, setCurrentDate] = useState(
    dayjs().format("DD.MM.YYYY")
  );

  // Kalendarni o'zgartirish uchun handler
  const onDateChange = (date, dateString) => {
    setCurrentDate(dateString);
  };

  const columns = [
    {
      title: (
        <i style={{ fontFamily: "Arial, sans-serif", fontSize: "17px" }}>
          Коммерческое предложение
        </i>
      ),
      children: [
        {
          title: (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              №
            </i>
          ),
          dataIndex: "key",
          key: "key",
          align: "center",
          render: (text) => (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              {text}
            </i>
          ),
        },
        {
          title: (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              {" "}
              Наименование товара{" "}
            </i>
          ),
          render: (text) => {
            const { name, dimensions } = text || {};
            return (
              <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
                {name}
                {" - "}
                {dimensions && (
                  <>
                    <i style={{ fontSize: "11px" }}>Д: {dimensions.length}</i>
                    {"  "}
                    <i style={{ fontSize: "11px" }}>Ш: {dimensions.width}</i>
                    {"  "}
                    <i style={{ fontSize: "11px" }}> В: {dimensions.height}</i>
                  </>
                )}
              </i>
            );
          },
        },
        {
          title: (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              Ед.изм
            </i>
          ),
          align: "center",
          dataIndex: "unit",
          key: "unit",
          render: () => (
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              шт
            </p>
          ),
        },
        {
          title: (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              Кол-во
            </i>
          ),
          dataIndex: "quantity",
          key: "quantity",
          align: "center",
          render: (text) => (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              {text}
            </i>
          ),
        },
        {
          title: (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              Цена
            </i>
          ),
          dataIndex: "price",
          key: "price",
          align: "center",
          render: (text) => (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              {text.toLocaleString("uz-UZ")}
            </i>
          ),
        },
        {
          title: (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              Сумма
            </i>
          ),
          dataIndex: "budget",
          key: "budget",
          align: "right",
          render: (text) => (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              {text}
            </i>
          ),
        },
        {
          title: (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              НДС
            </i>
          ),
          children: [
            {
              title: (
                <i
                  style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}
                >
                  Ставка
                </i>
              ),
              dataIndex: "discount",
              key: "discount",
              align: "center",
              render: (text) => (
                <i
                  style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}
                >
                  {text}
                </i>
              ),
            },
            {
              title: (
                <i
                  style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}
                >
                  Сумма
                </i>
              ),
              dataIndex: "vatAmount",
              key: "vatAmount",
              align: "right",
              render: (text) => (
                <i
                  style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}
                >
                  {text}
                </i>
              ),
            },
          ],
        },
        {
          title: (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              Стоимость с НДС
            </i>
          ),
          dataIndex: "totalPriceWithVAT",
          key: "totalPriceWithVAT",
          align: "right",
          render: (text) => (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              {text}
            </i>
          ),
        },
        {
          title: (
            <i style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
              Фото
            </i>
          ),
          dataIndex: "image",
          key: "image",
          render: (src) => <Image width={70} src={src} />,
        },
      ],
    },
  ];

  const data = orderList.orders?.map((i, inx) => ({
    key: String(inx + 1), // Har bir element uchun unikal `key`
    name: i.name,
    quantity: i.quantity, // Agar quantity dinamik bo‘lsa, `i.quantity` qo‘ying
    price: i.budget, // Agar narx dinamik bo‘lsa, `i.price` qo‘ying
    image: i.image,
    dimensions: {
      length: i.dimensions?.length,
      width: i.dimensions?.width,
      height: i.dimensions?.height,
    },
  }));

  const updatedData = data?.map((item) => {
    const vatRate = 12;
    const budget = +item.price * +item.quantity;
    const vatAmount = budget * (vatRate / 100);
    const totalPriceWithVAT = budget + vatAmount;
    return {
      ...item,
      discount: vatRate + " %",
      budget: budget.toLocaleString("uz-UZ"),
      vatAmount: vatAmount.toLocaleString("uz-UZ"),
      totalPriceWithVAT: totalPriceWithVAT.toLocaleString("uz-UZ"),
    };
  });

  const handleDownloadPDF = () => {
    setLoading(true); // Start loading
    const element = document.querySelector(".container-pdf"); // Select the div to capture
    html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      scale: 2, // Increase scale for higher resolution (to avoid blurry image)
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "shoh_mebel_table.png"; // Name of the downloaded image
        link.click();
        setLoading(false); // Stop loading
      })
      .catch(() => {
        setLoading(false); // Stop loading in case of error
      });
  };

  return (
    <div className="containerMainList">
      <div className="containerMainList-nav">
        <Button
          type="primary"
          style={{ background: "#0A3D3A" }}
          onClick={() => navigate(-1)}
        >
          <AiOutlineDoubleLeft style={{ fontSize: "20px" }} />
        </Button>

        <div className="DatePicker-btn">
          <DatePicker
            defaultValue={dayjs(currentDateToday, "DD.MM.YYYY")} // Default sana
            format="DD.MM.YYYY" // Formatni belgilash
            onChange={onDateChange} // Sana o'zgarganda state-ni yangilaydi
          />

          <Button
            style={{ background: "#0A3D3A" }}
            type="primary"
            onClick={handleDownloadPDF}
            loading={loading} // Show loading spinner
          >
            <AiOutlineFileImage style={{ fontSize: "20px" }} />
          </Button>
        </div>
      </div>
      <div className="container-pdf">
        <Card>
          <div className="header-pdf">
            {/* <img src={Banner} alt="Shoh Mebel" className="header-image" /> */}
          </div>
          <div className="header-pdf-info">
            <i className="header-pdf-box">
              {orderList.customer?.type === "Yuridik shaxs" && (
                <div>{orderList.customer?.companyName}</div>
              )}
              <div>Ответственный: {orderList.customer?.fullName}</div>
              <div>
                Адрес: {orderList?.address?.region}{" "}
                {orderList?.address?.district} {orderList?.address?.street}
              </div>
              {orderList.customer?.type === "Yuridik shaxs" && (
                <>
                  <div>Директор: {orderList.customer?.director}</div>
                  <div>ИНН: {orderList.customer?.inn}</div>
                </>
              )}
              <div>Телефон: +998 {orderList.customer?.phone}</div>
            </i>
            <i className="header-pdf-box">
              <div>{dataSource?.companyName}</div>
              <div>Адрес: {dataSource?.address}</div>
              <div>ИНН: {dataSource?.INN}</div>
              <div>МФО: {dataSource?.MFO}</div>
              <div>P/C: {dataSource?.accountNumber}</div>
              <div>Телефон: {dataSource?.phoneNumber}</div>
            </i>
          </div>

          <Table
            size="small"
            columns={columns}
            dataSource={updatedData}
            pagination={false}
            bordered
            summary={(pageData) => {
              const formatNumber = (num) =>
                isNaN(num) ? "0" : Number(num).toLocaleString("uz-UZ");
              const transformedPageData = pageData.map((item) => {
                const vatRate = 12; // 12% VAT as an integer
                const budget = +item.price * +item.quantity; // Calculate total price based on quantity
                const vatAmount = budget * (vatRate / 100); // Calculate VAT amount
                const totalPriceWithVAT = budget + vatAmount; // Total price with VAT
                return {
                  ...item,
                  discount: vatRate,
                  budget: budget,
                  vatAmount: vatAmount, // Format VAT amount for display
                  totalPriceWithVAT: totalPriceWithVAT, // Format total price with VAT for display
                };
              });

              // Calculate totals
              const totalPrice = transformedPageData.reduce(
                (sum, item) => sum + Number(item.price),
                0
              );
              const totalBudget = transformedPageData.reduce(
                (sum, item) => sum + Number(item.budget),
                0
              );
              const totalVatAmount = transformedPageData.reduce(
                (sum, item) => sum + Number(item.vatAmount),
                0
              );
              const totalPriceWithVAT = transformedPageData.reduce(
                (sum, item) => sum + Number(item.totalPriceWithVAT),
                0
              );

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <i
                      style={{
                        fontFamily: "Arial, sans-serif",
                        fontSize: "11px",
                      }}
                    >
                      Итого
                    </i>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <i
                      style={{
                        fontFamily: "Arial, sans-serif",
                        fontSize: "11px",
                      }}
                    >
                      {formatNumber(totalPrice)}
                    </i>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <i
                      style={{
                        fontFamily: "Arial, sans-serif",
                        fontSize: "11px",
                      }}
                    >
                      {formatNumber(totalBudget)}
                    </i>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}></Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <i
                      style={{
                        fontFamily: "Arial, sans-serif",
                        fontSize: "11px",
                      }}
                    >
                      {formatNumber(totalVatAmount)}
                    </i>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <i
                      style={{
                        fontFamily: "Arial, sans-serif",
                        fontSize: "11px",
                      }}
                    >
                      {formatNumber(totalPriceWithVAT)}
                    </i>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}></Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />

          <Text style={{ display: "block", fontSize: "12px", marginTop: 20 }}>
            * Цены указаны с НДС
          </Text>
          <Text style={{ display: "block", fontSize: "12px" }}>
            **Данное коммерческое предложение действительно до (
            {currentDateToday})
          </Text>
          <Text style={{ display: "block", fontSize: "12px" }}>
            *** Условия предоплаты 50%. Цены указаны с НДС
          </Text>
        </Card>
      </div>
    </div>
  );
};

export default ShohMebelTable;
