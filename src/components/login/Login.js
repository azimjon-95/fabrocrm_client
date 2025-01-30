import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "../../api";
import BG from './images/BG.png';
import "./style.css";

const Login = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [focused, setFocused] = useState({ userId: false, password: false });
    const { register, handleSubmit, reset, setError, clearErrors, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    // **Input qiymatini tekshirib, focused obyektini yangilash**
    useEffect(() => {
        setFocused({
            userId: userId.trim() !== "",
            password: password.trim() !== ""
        });
    }, [userId, password]);

    const onSubmit = async (data) => {
        if (!data.phone || !data.password) {
            if (!data.phone) {
                setError("phone", { type: "manual", message: "Iltimos foydalanuvchi nomini kiriting" });
            }
            if (!data.password) {
                setError("password", { type: "manual", message: "Iltimos parolni kiriting" });
            }
            setTimeout(() => {
                clearErrors();
            }, 2000);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/signin", data);
            if (res.data.token) {
                const { user, token } = res.data;
                localStorage.setItem("token", token);
                localStorage.setItem("Id", user._id);
                localStorage.setItem('role', user.role);

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
            <div className="img">
                <img src={BG} alt="BG" />
            </div>

            <div className="login-content">
                <form onSubmit={handleSubmit(onSubmit)} >
                    <div className="title-container">
                        <h1>Kirish</h1>
                        <h2>Mebel biznesingizni raqamli boshqarishning yangi bosqichi!</h2>
                        <p>Mebel ishlab chiqarish jarayonini yanada tezroq va tartibli boshqaring! Buyurtmalar, ombor, mijozlar va hisobotlar bir joyda!</p>
                    </div>

                    <div className="login-inner-content">
                        <div id={`${errors.phone ? 'error' : ''}`} className={`input-div ${focused.userId ? "focus" : ""}`}>
                            <div className="i">
                                <i className="far fa-user-circle"></i>
                            </div>
                            <div className="div">
                                <h5>Login</h5>
                                <input
                                    type="text"
                                    className="input"
                                    {...register("phone")}
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}

                                />
                            </div>
                        </div>

                        <div id={`${errors.phone ? 'error' : ''}`} className={`input-div pass ${focused.password ? "focus" : ""}`}>
                            <div className="i">
                                <i
                                    className={`fas ${isPasswordVisible ? "fa-eye-slash" : "fa-eye"}`}
                                    onClick={togglePasswordVisibility}
                                ></i>
                            </div>
                            <div className="div">
                                <h5>Parol</h5>
                                <input
                                    type={isPasswordVisible ? "text" : "password"}
                                    className="input"
                                    {...register("password")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <a href="#">Parol / Foydalanuvchi nomini unutdingizmi?</a>
                    </div>

                    <button className="btn" disabled={loading}>
                        {loading ? "Yuklanmoqda..." : "Kirish"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
