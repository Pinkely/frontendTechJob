import { useState } from "react"

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: "" });
    }, 3000);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsLoading(true);
    try {
      // แก้ไข URL ให้ตรงกับ Backend และเปลี่ยน username เป็น identifier
      const response = await fetch(`http://localhost:3000/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await response.json();
      console.log("Check data from API:", data);

      if (response.ok) {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          showSuccess(`ยินดีต้อนรับ ${data.user.name || ''}`);
          if (onLogin) onLogin(data.user);
        } else {
          setError("เข้าสู่ระบบสำเร็จแต่ไม่พบข้อมูลผู้ใช้");
        }
      } else {
        setError(data.message || "การเข้าสู่ระบบล้มเหลว");
      }
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !newPassword) {
      setError("กรุณากรอกอีเมลและรหัสผ่านใหม่");
      return;
    }
    setIsLoading(true);
    try {
      // แก้ไข URL ให้ตรงกับ Backend
      const response = await fetch(`http://localhost:3000/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess("รีเซ็ตรหัสผ่านสำเร็จ!");
        setMode("login");
        setPassword("");
      } else {
        setError(data.message || "รีเซ็ตไม่สำเร็จ");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const LogoSection = () => (
    <div className="flex items-center m-10 lg:m-20">
      <div className="text-6xl font-normal text-gray-800">Tech</div>
      <div className="text-6xl text-white text-center bg-blue-400 rounded-full h-32 w-32 flex items-center justify-center ml-2 shadow-lg">
        Job
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col lg:flex-row items-center justify-center p-4 relative">
      {successPopup.show && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="font-semibold">{successPopup.message}</span>
        </div>
      )}

      <LogoSection />

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-10 border-t-8 border-blue-400">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "login" ? "เข้าสู่ระบบ TechJob" : "ตั้งรหัสผ่านใหม่"}
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {mode === "login" && (
          <div className="space-y-6">
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-blue-400" placeholder="Username หรือ Email" disabled={isLoading} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)} className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-blue-400" placeholder="Password" disabled={isLoading} />
            <button onClick={handleLogin} disabled={isLoading} className="w-full text-white py-3 rounded-lg font-bold shadow-md bg-blue-400 hover:bg-blue-500 disabled:opacity-50">
              {isLoading ? "กำลังตรวจสอบ..." : "Login"}
            </button>
            <div className="flex justify-end mt-4 text-sm">
              <button className="text-blue-600 font-medium" onClick={() => { setMode("forgot"); setError(""); }}>ลืมรหัสผ่าน?</button>
            </div>
          </div>
        )}

        {mode === "forgot" && (
          <div className="space-y-6">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email ที่ลงทะเบียนไว้" className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg" disabled={isLoading} />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="รหัสผ่านใหม่" className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg" disabled={isLoading} />
            <button onClick={handleForgotPassword} disabled={isLoading} className="w-full text-white py-3 rounded-lg font-bold bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50">
              {isLoading ? "กำลังรีเซ็ต..." : "ตั้งรหัสผ่านใหม่"}
            </button>
            <div className="text-center mt-4 text-sm">
              <button className="text-gray-500" onClick={() => { setMode("login"); setError(""); }}>ย้อนกลับไปหน้าเข้าสู่ระบบ</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;