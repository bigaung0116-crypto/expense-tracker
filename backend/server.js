// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 🌐 Frontend (Port 5173) နှင့် ချောမွေ့စွာ ဒေတာချိတ်ဆက်နိုင်ရန် CORS ခွင့်ပြုခြင်း
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json()); // JSON data များ လက်ခံနိုင်ရန် Middleware

// 🗄️ MySQL Database Connection တည်ဆောက်ခြင်း
// (ဒေတာတွေကို ကိုအောင့်ရဲ့ .env ဖိုင်ထဲကအတိုင်း ဖတ်သွားပါလိမ့်မယ်)
// 📱 MySQL Database Connection Pool တည်ဆောက်ခြင်း
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD, // ကိုအောင့်ရဲ့ .env ဖိုင်ထဲက အတိုင်းဖတ်ပါမယ်
    database: process.env.DB_NAME || "expense_tracker",
    port: process.env.DB_PORT || 3306, // Cloud Port 20699 ကိုပါ ဖတ်နိုင်အောင်ပါ
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Pool ချိတ်ဆက်မှုကို စမ်းသပ်ခြင်း
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database ချိတ်ဆက်မှု မအောင်မြင်ပါ - ", err.message);
        return;
    }
    console.log("✅ MySQL Database နှင့် အောင်မြင်စွာ ချိတ်ဆက်ပြီးပါပြီ။");
    connection.release(); // စမ်းသပ်ပြီးရင် connection ကို ပြန်လွှတ်ပေးပါမယ်
});

// ==========================================
// 📥 ၁။ အသုံးစရိတ်အသစ် သိမ်းဆည်းရန် API (POST)
// ==========================================
// ==========================================
// 📥 ၁။ အသုံးစရိတ်အသစ် သိမ်းဆည်းရန် API (POST) - ပြင်ပြီး
// ==========================================
app.post("/api/expenses", (reactReq, res) => {
    const { uid, title, amount, category, date } = reactReq.body;

    if (!uid || !title || !amount) {
        return res.status(400).json({ error: "လိုအပ်သော အချက်အလက်များ ပြည့်စုံစွာ ဖြည့်ပေးပါ။" });
    }

    // 🏆 ကိုအောင့်ရဲ့ Database Column နာမည်အမှန်များဖြစ်တဲ့ expense_date နဲ့ user_id သို့ ပြောင်းလဲထားပါသည်
    const query = "INSERT INTO expenses (title, amount, category, expense_date, user_id) VALUES (?, ?, ?, ?, ?)";
    
    db.query(query, [title, amount, category, date, uid], (err, result) => {
        if (err) {
            console.error("❌ Database INSERT Error:", err);
            return res.status(500).json({ error: "ဒေတာသိမ်းဆည်းမှု စနစ်ချို့ယွင်းနေပါသည်။" });
        }
        res.status(201).json({ message: "အသုံးစရိတ်ကို အောင်မြင်စွာ မှတ်သားပြီးပါပြီ။", id: result.insertId });
    });
});

// ==========================================
// 📤 ၂။ User တစ်ဦးချင်းစီ၏ လအလိုက် အသုံးစရိတ် ဆွဲထုတ်ရန် API (GET) - ပြင်ပြီး
// ==========================================
app.get("/api/expenses/:uid", (reactReq, res) => {
    const { uid } = reactReq.params;
    const { month } = reactReq.query; // ဥပမာ - 2026-07

    if (!uid) {
        return res.status(400).json({ error: "User ID (UID) လိုအပ်ပါသည်။" });
    }

    // 🏆 ဒီမှာလည်း user_id နဲ့ expense_date ဆိုပြီး Database အတိုင်း ကွက်တိ ပြောင်းပေးထားပါတယ်
    let query = "SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC";
    let queryParams = [uid];

    if (month) {
        query = "SELECT * FROM expenses WHERE user_id = ? AND expense_date LIKE ? ORDER BY expense_date DESC";
        queryParams = [uid, `${month}%`];
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("❌ Database SELECT Error:", err);
            return res.status(500).json({ error: "ဒေတာဆွဲယူမှု စနစ်ချို့ယွင်းနေပါသည်။" });
        }
        res.json(results);
    });
});
// ==========================================
// ❌ ၃။ အသုံးစရိတ် မှတ်တမ်း ဖျက်ရန် API (DELETE)
// ==========================================
app.delete("/api/expenses/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM expenses WHERE id = ?";
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("❌ Database DELETE Error:", err);
            return res.status(500).json({ error: "ဒေတာဖျက်သိမ်းမှု စနစ်ချို့ယွင်းနေပါသည်။" });
        }
        res.json({ message: "မှတ်တမ်းကို အောင်မြင်စွာ ဖျက်ပြီးပါပြီ။" });
    });
});

// 🚀 Server စတင်မောင်းနှင်မည့် Port (Port 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend Server Is Running On: http://localhost:${PORT}`);
});