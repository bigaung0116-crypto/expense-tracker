// src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { 
  auth, 
  signInWithGoogle, 
  registerWithEmail, 
  loginWithEmail, 
  logoutUser 
} from "./firebase";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Expense tracker State များ
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // 🔥 ငွေကြေးအမျိုးအစား ရွေးချယ်ရန် State (Default အနေနဲ့ MYR ထားပေးပါတယ် ကိုအောင်)
  const [currency, setCurrency] = useState("MYR");

  const API_URL = "https://expense-tracker-backend-bfe9.onrender.com/api/expenses";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchExpenses(currentUser.uid, selectedMonth);
      } else {
        setExpenses([]);
      }
    });
    return () => unsubscribe();
  }, [selectedMonth]);

  const fetchExpenses = async (uid, month) => {
    try {
      const res = await axios.get(`${API_URL}/${uid}?month=${month}`);
      setExpenses(res.data);
    } catch (err) {
      console.error("Fetch data error:", err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError("");
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!email || !password) {
      setAuthError("Email နှင့် Password ကို ဖြည့်စွက်ပေးပါရန်။");
      return;
    }
    try {
      if (isRegisterMode) {
        await registerWithEmail(email, password);
        alert("အကောင့်သစ် အောင်မြင်စွာ ဆောက်ပြီးပါပြီ။");
      } else {
        await loginWithEmail(email, password);
      }
      setEmail("");
      setPassword("");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setAuthError("ဤ Email မှာ အကောင့်ဖွင့်ပြီးသား ဖြစ်နေသည်။");
      else if (err.code === "auth/wrong-password") setAuthError("Password မှားယွင်းနေပါသည်။");
      else if (err.code === "auth/user-not-found") setAuthError("ဤ Email ဖြင့် အကောင့်မရှိသေးပါ။");
      else setAuthError(err.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    try {
      // 🔥 ဒေတာလှမ်းပို့တဲ့အခါ ကိုယ်ရွေးလိုက်တဲ့ ငွေကြေးအမျိုးအစား (ဥပမာ MYR, SGD) ပါ ပို့ပေးပါတယ်
      await axios.post(API_URL, {
        uid: user.uid,
        title: `${title} (${currency})`, // နာမည်ဘေးမှာ ပြပေးဖို့တွဲလိုက်ပါတယ်
        amount: parseFloat(amount),
        category,
        date
      });
      setTitle("");
      setAmount("");
      fetchExpenses(user.uid, selectedMonth);
    } catch (err) {
      console.error("Add expense failed:", err);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchExpenses(user.uid, selectedMonth);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const totalAmount = expenses.reduce((sum, item) => sum +(Number(item.amount)), 0);

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>SpendSmart</h1>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: "20px", fontSize: "0.9rem" }}>
            {isRegisterMode ? "ကျေးဇူးပြု၍ အောက်ပါအချက်အလက်များ ဖြည့်ပေးပါ" : "နိုင်ငံစုံက သူငယ်ချင်းများအတွက် အသုံးစရိတ်မှတ်တမ်း"}
          </p>

          {authError && <div style={{ color: "#ef4444", background: "#fee2e2", padding: "10px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "15px", textAlign: "center" }}>{authError}</div>}

          <form onSubmit={handleEmailAuth}>
            <div className="form-group">
              <label>အီးမေးလ် (Email)</label>
              <input type="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>လျှို့ဝှက်နံပါတ် (Password)</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-submit">
              {isRegisterMode ? "အကောင့်အသစ်ဆောက်မည်" : "အကောင့်သို့ ဝင်မည်"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "#94a3b8" }}>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
            <span style={{ padding: "0 10px", fontSize: "0.8rem" }}>သို့မဟုတ်</span>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#fff", color: "#1e293b", border: "1px solid #cbd5e1", padding: "12px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "600", cursor: "pointer" }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
            Continue with Google
          </button>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.85rem", color: "#64748b" }}>
            {isRegisterMode ? "အကောင့်ရှိပြီးသားလား? " : "အကောင့်မရှိသေးဘူးလား? "}
            <span 
              onClick={() => { setIsRegisterMode(!isRegisterMode); setAuthError(""); }} 
              style={{ color: "#4f46e5", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}
            >
              {isRegisterMode ? "ဒီမှာ Login ဝင်ပါ" : "ဒီမှာ အကောင့်သစ်ဆောက်ပါ"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="user-header">
        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: "0.8rem" }}>မင်္ဂလာပါ 👋</span>
          <span style={{ fontWeight: "600" }}>{user.displayName || user.email}</span>
        </div>
        <button className="btn-logout" onClick={logoutUser}>ထွက်မည်</button>
      </div>

      <h1 style={{ textTransform: "uppercase", letterSpacing: "1px" }}>SpendSmart 📊</h1>

      <div className="month-filter-card">
        <label>မှတ်တမ်းကြည့်မည့်လ</label>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
      </div>

      <div className="total-card">
        <h3>ယခုလ စုစုပေါင်းအသုံးစရိတ်</h3>
        <div className="total-amount">{totalAmount.toLocaleString()} {currency}</div>
      </div>

      <div className="form-card">
        <h2>အသုံးစရိတ်အသစ် ထည့်ရန်</h2>
        <form onSubmit={handleAddExpense}>
          
          {/* 🔥 ငွေကြေးအမျိုးအစား ရွေးချယ်ရန် Dropdown (ကိုအောင့် သူငယ်ချင်းတွေရှိတဲ့ နိုင်ငံစုံ) */}
          <div className="form-group">
            <label>ငွေကြေးအမျိုးအစား (Currency)</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ fontWeight: "bold", color: "#4f46e5" }}>
              <option value="MYR">MYR (RM) - မလေးရှား ရင်းဂစ် 🇲🇾</option>
              <option value="SGD">SGD ($) - စင်ကာပူ ဒေါ်လာ 🇸🇬</option>
              <option value="THB">THB (฿) - ထိုင်း ဘတ် 🇹🇭</option>
              <option value="JPY">JPY (¥) - ဂျပန် ယန်း 🇯🇵</option>
              <option value="MMK">MMK (K) - မြန်မာ ကျပ် 🇲🇲</option>
            </select>
          </div>

          <div className="form-group">
            <label>အကြောင်းအရာ</label>
            <input type="text" placeholder="ဥပမာ - ညစာစားခြင်း" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label>ပမာဏ ({currency})</label>
            <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>အမျိုးအစား</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Food">အစားအသောက် 🍔</option>
              <option value="Travel">ခရီးစရိတ် 🚗</option>
              <option value="Bills">ဘေလ်ဆောင်ခြင်း ⚡</option>
              <option value="Shopping">စျေးဝယ်ခြင်း 🛍️</option>
              <option value="Others">အထွေထွေ 📦</option>
            </select>
          </div>
          <div className="form-group">
            <label>ရက်စွဲ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <button type="submit" className="btn-submit">စာရင်းသွင်းမည်</button>
        </form>
      </div>

      <div className="table-card">
        <h2>အသုံးစရိတ် မှတ်တမ်းများ</h2>
        {expenses.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "20px 0" }}>ယခုလအတွက် မှတ်တမ်းမရှိသေးပါ။</p>
        ) : (
          <table className="expense-table">
            <tbody>
              {expenses.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.title}
                    <span className={`badge ${item.category.toLowerCase()}`}>{item.category}</span>
                  </td>
                  <td className="amount-text">-{item.amount.toLocaleString()}</td>
                  <td>{new Date(item.expense_date || item.date).toLocaleDateString('my-MM', { day: 'numeric', month: 'short' })}</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDeleteExpense(item.id)}>ဖျက်မည်</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;