import React from 'react';
import './style.css'; // Stil faylini import qilamiz

const AccountentMain = () => {
    return (
        <div className="accountent-container">
            {/* Yuqori qismdagi kartalar */}
            <div className="cards-container">
                <div className="card income">
                    <h3>Daromad</h3>
                    <p>10,000,000 so'm</p>
                </div>
                <div className="card expense">
                    <h3>Xarajatlar</h3>
                    <p>4,000,000 so'm</p>
                </div>
                <div className="card balance">
                    <h3>Balans</h3>
                    <p>6,000,000 so'm</p>
                </div>
                <div className="card debt">
                    <h3>Qarz</h3>
                    <p>2,000,000 so'm</p>
                </div>
            </div>

            {/* Pastki qismdagi qutilar */}
            <div className="boxes-container">
                <div className="box expense-register">
                    <h3>Xarajatlar Ro'yxati</h3>
                    <form>
                        <input type="text" placeholder="Xarajat nomi" />
                        <input type="number" placeholder="Miqdori" />
                        <button type="submit">Xarajat Qo'shish</button>
                    </form>
                </div>
                <div className="box new-orders">
                    <h3>Yangi Buyurtmalar</h3>
                    <ul>
                        <li>Buyurtma #1 - 200,000 so'm</li>
                        <li>Buyurtma #2 - 150,000 so'm</li>
                        <li>Buyurtma #3 - 300,000 so'm</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AccountentMain;