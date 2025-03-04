import React, { useEffect, useState } from "react";
import { Avatar, Tabs } from "antd";
import {
  UserOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useGetWorkersQuery } from "../../../context/service/worker";
import "./style/CtrlWorkers.css";
import socket from "../../../socket";

// Common worker info component for both mobile and desktop

const CtrlWorkers = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [visibleId, setVisibleId] = useState(null);
  const { data: workersData, refetch } = useGetWorkersQuery();

  useEffect(() => {
    socket.on("new_worker", () => refetch());
    return () => socket.off("new_worker");
  }, [refetch]);

  const workers = workersData?.innerData || [];
  const adminRoles = [
    "manager",
    "seller",
    "director",
    "accountant",
    "warehouseman",
    "deputy_director",
    "distributor",
  ];

  // Hodimlar (faqat admin roli borlar)
  const filteredAdmins = workers.filter((worker) =>
    adminRoles.includes(worker.role)
  );

  // Ishchilar (admin roli yo‘qlar)
  const filteredWorkers = workers.filter(
    (worker) => !adminRoles.includes(worker.role)
  );

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const formattedPhone = phone.replace(/[^\d]/g, "");
    return formattedPhone.length === 9
      ? `+998 ${formattedPhone.slice(0, 2)} ${formattedPhone.slice(
        2,
        5
      )} ${formattedPhone.slice(5, 7)} ${formattedPhone.slice(7, 9)}`
      : phone;
  };

  const formatBirthDate = (dayOfBirth) => {
    if (!dayOfBirth) return "";
    const birthDate = new Date(dayOfBirth);
    const today = new Date();
    const formattedDate = `${birthDate.getFullYear()}.${(
      birthDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${birthDate.getDate().toString().padStart(2, "0")}`;
    const age = today.getFullYear() - birthDate.getFullYear();
    const birthdayThisYear = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    const adjustedAge = today < birthdayThisYear ? age - 1 : age;
    const isToday = today.toDateString() === birthdayThisYear.toDateString();
    const isTomorrow =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      ).toDateString() === birthdayThisYear.toDateString();

    let birthdayMessage = "";
    if (isToday) birthdayMessage = "Bugun tug‘ilgan kuni!";
    if (isTomorrow) birthdayMessage = "Ertaga tug‘ilgan kuni!";

    return { formattedDate, adjustedAge, birthdayMessage };
  };

  const toggleVisibleId = (workerId) => {
    setVisibleId((prevId) => (prevId === workerId ? null : workerId));
  };
  const roleMapping = {
    manager: "Menejer",
    seller: "Sotuvchi",
    director: "Direktor",
    accountant: "Buxgalter",
    warehouseman: "Omborchi",
    deputy: "Direktor o‘rinbosari",
    distributor: "Yetkazib beruvchi",
  };
  return (
    <div className="ctrl-workers">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Ishchilar" key="all">
          <div className="worker-list">
            {filteredWorkers.map((worker) => {
              const { formattedDate, adjustedAge, birthdayMessage } =
                formatBirthDate(worker.dayOfBirth);
              return (
                <div className="worker-card" key={worker._id}>
                  {worker.img ? (
                    <Avatar
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "10px",
                      }}
                      src={worker.img || <UserOutlined />}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "35px",
                        width: "80px",
                        height: "80px",
                        borderRadius: "10px",
                      }}
                    >
                      <UserOutlined />
                    </div>
                  )}
                  <div className="worker-card-main">
                    <div className="worker-card-header">
                      <div
                        style={{ marginTop: "15px" }}
                        className="worker-details"
                      >
                        <p>{worker.workerType || "Noma’lum rol"}</p>
                        <span className="worker-name">
                          {worker.firstName} {worker.lastName}
                        </span>
                        <span className="worker-phone">
                          {formatPhoneNumber(worker.phone)}
                        </span>
                        <span className="worker-address">{worker.address}</span>
                        <div className="worker-birthdate">
                          {formattedDate} ({adjustedAge} yosh)
                        </div>
                        {birthdayMessage && (
                          <div className="birthday-message">
                            {birthdayMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="worker-id-header">
                      <button
                        onClick={() => toggleVisibleId(worker._id)}
                        className="toggle-id-btn"
                      >
                        {visibleId === worker._id ? (
                          <EyeInvisibleOutlined />
                        ) : (
                          <EyeOutlined />
                        )}
                      </button>
                      <span>
                        {visibleId === worker._id
                          ? worker.idNumber
                          : "*********"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Hodimlar" key="active">
          <div className="worker-list">
            {filteredAdmins.map((worker) => {
              const { formattedDate, adjustedAge, birthdayMessage } =
                formatBirthDate(worker.dayOfBirth);
              return (
                <div className="worker-card" key={worker._id}>
                  {worker.img ? (
                    <Avatar
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "10px",
                      }}
                      src={worker.img || <UserOutlined />}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "35px",
                        width: "80px",
                        height: "80px",
                        borderRadius: "10px",
                      }}
                    >
                      <UserOutlined />
                    </div>
                  )}
                  <div className="worker-card-main">
                    <div className="worker-card-header">
                      <div className="worker-details">
                        <p>{roleMapping[worker.role] || "Noma’lum rol"}</p>
                        <span className="worker-name">
                          {worker.lastName} {worker.firstName}{" "}
                          {worker.middleName}
                        </span>
                        <span className="worker-phone">
                          {formatPhoneNumber(worker.phone)}
                        </span>
                        <span className="worker-address">{worker.address}</span>
                        <div className="worker-birthdate">
                          {formattedDate} ({adjustedAge} yosh)
                        </div>
                        {birthdayMessage && (
                          <div className="birthday-message">
                            {birthdayMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="worker-id-header">
                      <button
                        onClick={() => toggleVisibleId(worker._id)}
                        className="toggle-id-btn"
                      >
                        {visibleId === worker._id ? (
                          <EyeInvisibleOutlined />
                        ) : (
                          <EyeOutlined />
                        )}
                      </button>
                      <span>
                        {visibleId === worker._id
                          ? worker.idNumber
                          : "*********"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default CtrlWorkers;
