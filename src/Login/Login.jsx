import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });

  // [แก้ไขจุดนี้] ให้ตรงกับ app.js ของ Backend (app.use('/api/auth', ...))
  const API_URL = "http://192.168.1.93:3000/api/auth";

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'manager': return '/manager';
      case 'leader': return '/leader';
      case 'user': return '/user';
      default: return '/login';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!usernameOrEmail || !password) return setError("กรุณากรอกข้อมูลให้ครบถ้วน");

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: usernameOrEmail, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // 3. แก้ไขตัวแปร email เป็น usernameOrEmail เพื่อป้องกัน Error
        showSuccess(`ยินดีต้อนรับ ${data.user?.name || usernameOrEmail}`);
        if (onLogin) onLogin(data.user);

        // 4. ให้ Navigate ไปตาม Role แทนการไป /home
        navigate(getDashboardPath(data.user.role));
      } else {
        setError(data.message || "การเข้าสู่ระบบล้มเหลว");
      }
    } catch (err) {
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
      // 2. แก้ไข Endpoint จาก /reset-password เป็น /forgot-password ให้ตรงกับ loginRoutes.js
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("รีเซ็ตรหัสผ่านสำเร็จ!");
        setMode("login");
        setPassword("");
        setNewPassword("");
      } else {
        setError(data.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const LogoSection = () => (
    <div className="flex items-center m-10 lg:m-20">
      <div className="text-6xl font-normal text-gray-800">Tech</div>
      <div className="text-6xl text-white text-center bg-blue-400 rounded-full h-32 w-32 flex items-center justify-center ml-2 shadow-lg">Job</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col lg:flex-row items-center justify-center p-4 relative font-sans">
      {successPopup.show && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center">
          <span className="font-semibold">{successPopup.message}</span>
        </div>
      )}
      <LogoSection />
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-10 border-t-8 border-blue-400">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          {mode === "login" ? "เข้าสู่ระบบ TechJob" : "ตั้งรหัสผ่านใหม่"}
        </h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        {mode === "login" ? (
          <div className="space-y-6">
            {/* แก้ไขบรรทัดนี้: เปลี่ยน email เป็น usernameOrEmail และเพิ่ม placeholder ให้ชัดเจนขึ้น */}
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg"
              placeholder="Username หรือ Email"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg"
              placeholder="Password"
            />

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full text-white py-3 rounded-lg font-bold bg-blue-400 hover:bg-blue-500 transition disabled:opacity-50"
            >
              {isLoading ? "กำลังตรวจสอบ..." : "Login"}
            </button>

            <div className="text-center mt-4">
              <button className="text-blue-600 text-sm" onClick={() => setMode("forgot")}>
                ลืมรหัสผ่าน?
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 text-center">กรอกอีเมลของคุณและรหัสผ่านใหม่ที่ต้องการตั้ง</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email ของคุณ" className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="รหัสผ่านใหม่" className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg" />
            <button onClick={handleForgotPassword} disabled={isLoading} className="w-full text-white py-3 rounded-lg font-bold bg-yellow-500 hover:bg-yellow-600 transition">
              {isLoading ? "กำลังรีเซ็ต..." : "ตั้งรหัสผ่านใหม่"}
            </button>
            <div className="text-center mt-4"><button className="text-gray-500 text-sm" onClick={() => setMode("login")}>ย้อนกลับไปหน้าเข้าสู่ระบบ</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;