import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User, Shield, Camera, Check, X } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const SERVER_URL = 'http://192.168.1.106:3000';
  const API_BASE_URL = `${SERVER_URL}/api/manager`;

  useEffect(() => {
    const sessionString = localStorage.getItem('session');
    if (!sessionString) return;

    const sessionData = JSON.parse(sessionString);
    const loggedInUser = sessionData.user;
    const userId = loggedInUser?.id || loggedInUser?.user_id;

    if (userId) {
      setProfile(prev => ({ ...prev, name: loggedInUser.name || '', email: loggedInUser.email || '' }));

      axios.get(`${API_BASE_URL}/profile/${userId}`)
        .then(response => {
          const userData = response.data;
          setProfile({
            name: userData.name || loggedInUser.name || '',
            email: userData.email || loggedInUser.email || '',
            phone: userData.phone || '',
            avatar: userData.avatar || null
          });
        })
        .catch(error => console.error("🚨 Error fetching profile:", error));
    }
  }, []);

  const handleProfileChange = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const sessionString = localStorage.getItem('session');
    if (!sessionString) return alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');

    const sessionData = JSON.parse(sessionString);
    const userId = sessionData.user?.id || sessionData.user?.user_id;

    if (userId) {
      try {
        const response = await axios.put(`${API_BASE_URL}/update-profile/${userId}`, {
          name: profile.name,
          email: profile.email,
          phone: profile.phone
        });

        if (response.status === 200) {
          alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
          sessionData.user = { ...sessionData.user, name: profile.name, email: profile.email, phone: profile.phone, avatar: profile.avatar };
          localStorage.setItem('session', JSON.stringify(sessionData));
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    }
  };

  const handleChangePassword = async () => {
    const sessionString = localStorage.getItem('session');
    if (!sessionString) return;
    const userId = JSON.parse(sessionString).user?.id || JSON.parse(sessionString).user?.user_id;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/update-password/${userId}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      if (response.status === 200) {
        alert('เปลี่ยนรหัสผ่านสำเร็จ');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const sessionString = localStorage.getItem('session');
    const userId = JSON.parse(sessionString).user?.id || JSON.parse(sessionString).user?.user_id;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-avatar/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        setProfile(prev => ({ ...prev, avatar: response.data.avatar }));

        // อัปเดตรูปใน session ทันที
        const sessionData = JSON.parse(sessionString);
        sessionData.user.avatar = response.data.avatar;
        localStorage.setItem('session', JSON.stringify(sessionData));

        alert('เปลี่ยนรูปโปรไฟล์สำเร็จ');
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert('อัปโหลดรูปภาพล้มเหลว');
    }
  };

  return (
    <div style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }} className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">ตั้งค่าระบบ (Settings)</h1>
        <p className="text-slate-500 mt-1 text-sm">จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชี</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-1">
          <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <User size={18} /> ข้อมูลส่วนตัว
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium ${activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <Shield size={18} /> ความปลอดภัย
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <h5 className="font-bold text-slate-700 mb-6 text-xl border-b border-gray-100 pb-4">ข้อมูลส่วนตัว</h5>

              <div className="flex flex-col md:flex-row gap-8 mb-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm bg-slate-100 flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={`${SERVER_URL}/uploads/${profile.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-slate-300" />
                    )}
                  </div>
                  <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Camera size={16} /> เปลี่ยนรูปโปรไฟล์
                  </button>
                </div>

                {/* Form Fields Section */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 focus:bg-white transition-colors text-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">อีเมล</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 focus:bg-white transition-colors text-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 focus:bg-white transition-colors text-slate-700 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button className="px-6 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2">
                  <X size={18} /> ยกเลิก
                </button>
                <button onClick={handleSave} className="px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2">
                  <Check size={18} /> บันทึกข้อมูล
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <h5 className="font-bold text-slate-700 mb-6 text-xl border-b border-gray-100 pb-4">เปลี่ยนรหัสผ่าน</h5>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">รหัสผ่านปัจจุบัน</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 focus:bg-white transition-colors text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 focus:bg-white transition-colors text-slate-700"
                  />
                </div>
                <div className="pb-4">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 focus:bg-white transition-colors text-slate-700"
                  />
                </div>

                <button onClick={handleChangePassword} className="w-full py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-colors">
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;