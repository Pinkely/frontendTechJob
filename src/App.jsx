import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./Login/Login.jsx";
import UserDashboard from "./User/UserDashborad.jsx";
import UserLayout from "./layouts/UserLayout.jsx";
import UserCalendar from "./User/UserCalendar.jsx";
import UserNotification from "./User/UserNotification.jsx";
import UserWorkSheet from "./User/UserWorkSheet.jsx";
import UserProfile from "./User/UserProfile.jsx";
import UserSheetV2 from "./User/UserSheetV2.jsx";

import AdminDashboard from "./Admin/AdminDashboard.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminRecord from "./Admin/AdminRecord.jsx";
import AdminSetting from "./Admin/AdminSetting.jsx";
import AdminWork from "./Admin/AdminWork.jsx";
import AdminAccount from "./Admin/AdminAccount.jsx";

import ManagerDashboard from "./Manager/ManagerDashboard.jsx";
import ManagerLayout from "./layouts/ManagerLayout.jsx";
import ManagerRecord from "./Manager/ManagerRecord.jsx";
import ManagerAccount from "./Manager/ManagerAccount.jsx";
import ManagerInventory from './components/ManagerInventory'
import ManagerSetting from "./Manager/ManagerSetting.jsx";

import LeaderDashboard from "./Leader/LeaderDashboard.jsx";
import LeaderLayout from "./layouts/LeaderLayout.jsx";
import LeaderWork from "./Leader/LeaderWork.jsx";
import LeaderSetting from "./Leader/LeaderSetting.jsx";
import LeaderList from "./Leader/LeaderList.jsx";
import LeaderReport from "./Leader/LeaderReport.jsx";

import "./App.css";

const getDashboardPath = (userType) => {
  switch (userType) {
    case 'admin': return '/admin';
    case 'manager': return '/manager';
    case 'leader': return '/leader';
    case 'user': return '/user';
    // ถ้า Role ไม่ตรงกับอะไรเลย ให้เด้งกลับไปหน้า login เพื่อตัด Loop
    default: return '/login';
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // [แก้ไข 2] รับค่า user เป็น Object และ Mapping Role ให้ตรงกัน
  const handleLogin = (user) => {
    setIsAuthenticated(true);

    // ดึง role มาจากฐานข้อมูล
    let currentRole = user.role;

    // แปลงชื่อ Role จาก Database ให้ตรงกับ Route ของ Frontend
    if (currentRole === 'supervisor') {
      currentRole = 'manager';
    } else if (currentRole === 'technician') {
      currentRole = 'user';
    }

    setUserType(currentRole);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType(null);
  };

  const getDashboardElement = (Component, expectedUserType, props = {}) => {
    return isAuthenticated && userType === expectedUserType ?
      <Component {...props} /> : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardPath(userType)} replace /> : <LoginPage onLogin={handleLogin} />} />

        {/* User Routes */}
        <Route element={<UserLayout onLogout={handleLogout} />}>
          {/* ... code เดิม ... */}
          <Route path="/user" element={isAuthenticated && userType === 'user' ? <UserDashboard tasks={tasks} /> : <Navigate to="/login" replace />} />
          <Route path="calendar" element={<UserCalendar tasks={tasks} />} />
          <Route path="notification" element={<UserNotification />} />
          <Route path="worksheet" element={<UserWorkSheet tasks={tasks} />} />
          <Route path="sheetv2" element={<UserSheetV2 tasks={tasks} setTasks={setTasks} />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout onLogout={handleLogout} />}>
          {/* --- แก้ไขจุดนี้: ส่ง { tasks: tasks } เข้าไปให้ AdminDashboard --- */}
          <Route path="/admin" element={
            getDashboardElement(AdminDashboard, 'admin', { tasks: tasks })
          } />

          <Route path="work" element={<AdminWork />} />

          {/* AdminRecord มีการอัปเดต tasks อยู่แล้ว Code ส่วนนี้ถูกต้องแล้ว */}
          <Route path="record" element={
            <AdminRecord
              works={tasks}
              setWorks={setTasks}
              tasks={tasks}
              setTasks={setTasks}
            />
          } />

          <Route path="setting" element={<AdminSetting />} />
          <Route path="account" element={<AdminAccount />} />
        </Route>

        {/* ... Manager Routes และ Leader Routes คงเดิม ... */}
        <Route element={<ManagerLayout onLogout={handleLogout} />}>
          <Route path="/manager" element={getDashboardElement(ManagerDashboard, 'manager', { tasks: tasks })} />
          <Route path="manager-record" element={<ManagerRecord tasks={tasks} />} />
          <Route path="manager-account" element={<ManagerAccount tasks={tasks} />} />
          <Route path="manager-setting" element={<ManagerSetting />} />
          <Route path="/manager/inventory" element={<ManagerInventory />} />
        </Route>

        <Route element={<LeaderLayout onLogout={handleLogout} />}>
          <Route path="/leader" element={<LeaderDashboard tasks={tasks} setTasks={setTasks} />} />
          <Route path="leader-work" element={<LeaderWork tasks={tasks} setTasks={setTasks} />} />
          <Route path="leader-report" element={<LeaderReport />} />
          <Route path="leader-list" element={<LeaderList />} />
          <Route path="leader-setting" element={<LeaderSetting />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}