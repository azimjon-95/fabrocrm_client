import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "../../api";
import "./Login.css";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/signin", data);
      if (res.data.token) {
        const { user, token } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("Id", user._id);
        localStorage.setItem("role", user.role);

        navigate(`/${user.role}`);
        message.success("Tizimga kirish muvaffaqiyatli yakunlandi!");
      } else {
        message.error("Kirishda xatolik yuz berdi");
      }
    } catch (error) {
      message.error("Kirishda xatolik yuz berdi");
      console.error(error);
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
          <input
            type="text"
            className="input"
            {...register("phone")}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="input-div">
          <div className="i">
            <i
              className={`fas ${isPasswordVisible ? "fa-eye-slash" : "fa-eye"}`}
              onClick={togglePasswordVisibility}
            ></i>
          </div>
          <p>Parol</p>
          <input
            type={isPasswordVisible ? "text" : "password"}
            className="input"
            {...register("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
