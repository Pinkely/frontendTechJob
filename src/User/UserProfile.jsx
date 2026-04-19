import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, Tag, Hash,UserRound } from 'lucide-react';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

const fetchUserData = async () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    // ดึง userId และทำให้แน่ใจว่าเป็นแค่ตัวเลข/ข้อความที่ไม่มีเครื่องหมาย : ปน
    let rawId = storedUser?.user_id || storedUser?.id;
    const userId = rawId?.toString().split(':')[0]; // ป้องกันกรณีมี :1 ต่อท้าย

    if (!userId) {
      setError("ไม่พบรหัสผู้ใช้งาน");
      setLoading(false);
      return;
    }

    // แก้ไข URL ให้มี /api นำหน้า (ตามที่ระบุในไฟล์ Route)
    const response = await axios.get(`http://localhost:3000/api/users/${userId}`);

    if (response.data) {
      // ตรวจสอบโครงสร้างข้อมูลที่ UserController ส่งกลับมา
      // ถ้าส่งมาเป็น { user: {...} } ให้ใช้ response.data.user
      // ถ้าส่งมาเป็นก้อนข้อมูลเลย ให้ใช้ response.data
      const userData = response.data.user || response.data;
      setUserProfile(userData);
    }
  } catch (error) {
    console.error("API Error:", error.response?.status, error.message);
    setError("โหลดข้อมูลไม่สำเร็จ (404 หรือ Network Error)");
  } finally {
    setLoading(false);
  }
};

    fetchUserData();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) return (
    <div style={styles.loadingWrap}>
      <span style={{ color: '#64748b', fontSize: 14 }}>กำลังโหลดข้อมูลโปรไฟล์...</span>
    </div>
  );

  if (!userProfile) return (
    <div style={styles.loadingWrap}>
      <span style={{ color: '#94a3b8', fontSize: 14 }}>ไม่พบข้อมูล (กรุณาเข้าสู่ระบบใหม่อีกครั้ง)</span>
    </div>
  );

  const statusColor = userProfile.status === 'ว่าง'
    ? { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' }
    : { bg: '#fefce8', color: '#854d0e', dot: '#eab308' };

  return (
    <div style={styles.page}>
      {/* Hero Card */}
      <div style={styles.heroCard}>
        <div style={styles.heroBanner} />
        <div style={styles.heroBody}>
          <div style={styles.avatarRing}>
            {/* ✨ แก้จุดที่ 2: ใช้ userProfile.avatar หรือแสดงตัวอักษรย่อถ้าไม่มีรูป */}
            {userProfile.avatar && userProfile.avatar !== "" 
              ? <img src={userProfile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={styles.avatarInitials}>{getInitials(userProfile.name || userProfile.username)}</span>
            }
          </div>

          <div style={styles.heroInfo}>
            <h1 style={styles.heroName}>{userProfile.name || userProfile?.username|| "กำลังโหลดชื่อ..."}</h1>
            <p style={styles.heroSub}>@{userProfile.username} · {userProfile.department || 'แผนกทั่วไป'}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              <span style={styles.badgeBlue}><ShieldCheck size={11} /> {userProfile.role}</span>
              <span style={{ ...styles.badge, background: statusColor.bg, color: statusColor.color }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor.dot, display: 'inline-block', marginRight: 5 }} />
                {userProfile.status || 'ว่าง'}
              </span>
            </div>
          </div>

          <div style={styles.joinBadge}>
            <Calendar size={12} style={{ marginRight: 4 }} />
            เริ่มงานเมื่อ {formatDate(userProfile.created_at)}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <p style={styles.cardTitle}>ข้อมูลส่วนตัว</p>
          {[
            { icon: <Mail size={15} />, label: 'อีเมล', value: userProfile.email },
            { icon: <Phone size={15} />, label: 'เบอร์โทร', value: userProfile.phone || 'ไม่ได้ระบุ' },
            { icon: <UserRound size={15} />, label: 'ชื่อเล่น', value: userProfile.nickname || 'ไม่ได้ระบุ' },
            { icon: <Tag size={15} />, label: 'ประเภทพนักงาน', value: userProfile.type || 'พนักงานประจำ' },
            { icon: <Hash size={15} />, label: 'รหัสพนักงาน', value: `#USR-${String(userProfile.user_id).padStart(3, '0')}` },
          ].map((row, i) => (
            <div key={i} style={styles.infoRow}>
              <div style={styles.iconDot}>{row.icon}</div>
              <div>
                <p style={styles.infoLabel}>{row.label}</p>
                <p style={styles.infoValue}>{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <p style={styles.cardTitle}>รายละเอียดงานและสังกัด</p>
          <div style={styles.statGrid}>
            <div style={styles.statBox}>
              <div style={styles.statLabelRow}><Briefcase size={14} color="#3b82f6" /> <span style={styles.statLabel}>สังกัดแผนก</span></div>
              <p style={styles.statValue}>{userProfile.type || '-'}</p>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabelRow}><MapPin size={14} color="#3b82f6" /> <span style={styles.statLabel}>เงินเดือน</span></div>
              <p style={styles.statValue}>{userProfile.salary || 'ไม่ได้ระบุ'}</p>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabelRow}><ShieldCheck size={14} color="#3b82f6" /> <span style={styles.statLabel}>ระดับสิทธิ์</span></div>
              <p style={styles.statValue}>{userProfile.role}</p>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabelRow}><Calendar size={14} color="#3b82f6" /> <span style={styles.statLabel}>วันที่เริ่มงาน</span></div>
              <p style={styles.statValue}>{formatDate(userProfile.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '24px' ,width: '100%', minHeight: '100vh', overflowX: 'hidden', background: '#F0F8FF', marginLeft: '14rem' },
  loadingWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', marginLeft: '14rem' },
  heroCard: { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  heroBanner: { height: 100, background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 60%, #06b6d4 100%)' },
  heroBody: { padding: '0 24px 24px', display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -44 },
  avatarRing: { width: 88, height: 88, borderRadius: '50%', border: '3px solid #fff', background: '#dbeafe', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarInitials: { fontSize: 28, fontWeight: 600, color: '#1d4ed8' },
  heroInfo: { paddingTop: 52, flex: 1 },
  heroName: { fontSize: 22, fontWeight: 600, color: '#0f172a', margin: 0 },
  heroSub: { fontSize: 13, color: '#64748b', margin: '3px 0 0' },
  joinBadge: { fontSize: 11, color: '#854d0e', background: '#fefce8', padding: '4px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', height: 'fit-content', marginBottom: 2 },
  badge: { display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99 },
  badgeBlue: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99, background: '#eff6ff', color: '#1d4ed8' },
  grid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 14 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid #f1f5f9' },
  iconDot: { width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, color: '#94a3b8', margin: 0 },
  infoValue: { fontSize: 14, color: '#0f172a', margin: 0 },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  statBox: { background: '#f8fafc', borderRadius: 10, padding: 14, border: '0.5px solid #f1f5f9' },
  statLabelRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 },
  statLabel: { fontSize: 11, color: '#94a3b8' },
  statValue: { fontSize: 15, fontWeight: 500, color: '#0f172a', margin: 0 },
};

export default UserProfile;