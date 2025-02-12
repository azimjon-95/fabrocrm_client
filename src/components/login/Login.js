import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "../../api";
import "./Login.css";


const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await axios.post("/admin/login", data);
      message.success(res.data.message);

      const { firstName = "", lastName = "" } = res.data?.innerData?.admin || {};
      localStorage.setItem("admin_fullname", `${firstName} ${lastName}`.trim());
      localStorage.setItem("token", res.data?.innerData?.token);
      localStorage.setItem("role", res.data?.innerData?.admin?.role);
      navigate(`/${res.data?.innerData?.admin?.role}`);
    } catch (error) {
      message.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
    reset();
  };

  return (
    <div className="container_login">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Kirish</h1>
        <div className="input-div">
          <p>Login</p>
          <input type="text" className="input" {...register("login")} />
        </div>

        <div className="input-div">
          <div className="i">
            <i
              className={`fas ${isPasswordVisible ? "fa-eye-slash" : "fa-eye"}`}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            ></i>
          </div>
          <p>Parol</p>
          <input
            type={isPasswordVisible ? "text" : "password"}
            className="input"
            {...register("password")}
          />
        </div>

        <button className="btn" disabled={loading}>
          {loading ? "Loading..." : "Kirish"}
        </button>
      </form>
    </div>
  );
};

export default Login;
