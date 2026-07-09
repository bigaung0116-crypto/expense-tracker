import React, { useState, useEffect } from "react";
import { auth, provider, signInWithPopup, signOut } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [isRegistering, setIsRegistering] = useState(false); 

  // User Auth State စောင့်ကြည့်ခြင်း
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Google ဖြင့် အကောင့်ဝင်ခြင်း
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Login Error:", error.message);
      alert("Google Sign-In အဆင်မပြေပါဘူး။");
    }
  };

  // Email/Password ဖြင့် အကောင့်ဝင်ခြင်း သို့မဟုတ် အကောင့်ဖွင့်ခြင်း
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      if (password !== confirmPassword) {
        alert("Password များ တူညီမှု မရှိပါဘူး။ ပြန်လည်စစ်ဆေးပေးပါ။");
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။");
      } catch (error) {
        console.error("Register Error:", error.message);
        alert(error.message);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error("Login Error:", error.message);
        alert("အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။");
      }
    }
  };

  // Sign Out လုပ်ခြင်း
  const handleLogout = () => signOut(auth);

  // User Login ဝင်ပြီးသားဆိုရင် ပြသမည့် UI (Dashboard)
  if (user) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>SpendSmart Dashboard 📊</h2>
        <p>Welcome back, <strong>{user.displayName || user.email}</strong>!</p>
        
        {/* 🛠️ NOTE: ကိုအောင့်ရဲ့ မူရင်း Expense Component သို့မဟုတ် Tracker Layout ကုဒ်ဟောင်းများကို ဒီအောက်မှာ ထည့်သွင်းပေးပါရန် */}
        <div style={{ margin: "20px auto", maxWidth: "600px", padding: "20px", border: "1px dashed #ccc", borderRadius: "8px" }}>
          <p style={{ color: "#666" }}>[ အသုံးစရိတ်ဇယားနှင့် စာရင်းသွင်းစနစ် ကုဒ်များကို ဤနေရာတွင် ပြန်လည်ထည့်သွင်းနိုင်ပါသည် ]</p>
        </div>

        <button onClick={handleLogout} style={{ padding: "10px 20px", cursor: "pointer", marginTop: "10px", background: "#EF4444", color: "white", border: "none", borderRadius: "5px" }}>
          Log Out
        </button>
      </div>
    );
  }

  // User Login မဝင်ရသေးရင် ပြသမည့် UI (Auth Form)
  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", textAlign: "center", border: "1px solid #ccc", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
      <h2>SpendSmart</h2>
      <p style={{ color: "#666", fontSize: "14px" }}>နိုင်ငံစုံက သူငယ်ချင်းများအတွက် အသုံးစရိတ်မှတ်တမ်း App</p>

      <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
        <input 
          type="email" 
          placeholder="အီးမေးလ် (Email)" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input 
          type="password" 
          placeholder="လျှို့ဝှက်နံပါတ် (Password)" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />

        {isRegistering && (
          <input 
            type="password" 
            placeholder="လျှို့ဝှက်နံပါတ်ကို ထပ်မံရိုက်ထည့်ပါ (Confirm Password)" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        )}

        <button type="submit" style={{ padding: "10px", background: "#4F46E5", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          {isRegistering ? "အကောင့်သစ်ဆောက်မည်" : "အကောင့်ဝင်မည်"}
        </button>
      </form>

      <div style={{ margin: "20px 0", color: "#aaa" }}>သို့မဟုတ်</div>

      <button onClick={handleGoogleLogin} style={{ width: "100%", padding: "10px", background: "white", border: "1px solid #ccc", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: "16px" }} />
        Continue with Google
      </button>

      <p style={{ marginTop: "20px", fontSize: "14px" }}>
        {isRegistering ? "အကောင့်ရှိပြီးသားလား? " : "အကောင့်မရှိသေးဘူးလား? "}
        <span 
          onClick={() => { setIsRegistering(!isRegistering); setConfirmPassword(""); }} 
          style={{ color: "#4F46E5", cursor: "pointer", textDecoration: "underline" }}
        >
          {isRegistering ? "ဒီမှာ အကောင့်ပြန်ဝင်ပါ" : "ဒီမှာ အကောင့်သစ်ဆောက်ပါ"}
        </span>
      </p>
    </div>
  );
}

export default App;