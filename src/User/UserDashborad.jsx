import React, { useMemo, useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { CheckCircle, Clock, ClipboardList, LayoutDashboard, Search } from 'lucide-react'

// ── helpers ───────────────────────────────────────────────────────────────────

const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user'))
    return u?.user_id || u?.id || null
  } catch { return null }
}

// ── StatCard ──────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div
    className="ws-stat-card"
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 16px 40px rgba(59,130,246,0.13)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 4px 24px rgba(59,130,246,0.08)'
    }}
  >
    <div className="ws-stat-icon" style={{ background: `${color}18`, color }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#1e3a8a', lineHeight: 1.2 }}>{value}</div>
      {subtitle && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
    </div>
  </div>
)

// ── Custom Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(147,197,253,0.4)', borderRadius: 12,
      padding: '10px 16px', boxShadow: '0 8px 24px rgba(59,130,246,0.12)',
      fontFamily: "'Kanit', sans-serif", fontSize: 13, color: '#1e3a8a',
    }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div style={{ color: '#3b82f6', fontWeight: 700 }}>{payload[0].value} งาน</div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const UserDashboard = () => {
  const [tasks, setTasks]                   = useState([])
  const [materialHistory, setMaterialHistory] = useState([])
  const [loading, setLoading]               = useState(true)
  const [searchTerm, setSearchTerm]         = useState('')

  const fetchDashboardData = async () => {
    const userId = getUserId()
    if (!userId) { setLoading(false); return }
    try {
      const [taskRes, matRes] = await Promise.all([
        fetch(`/api/works/technician/${userId}`),
        fetch(`/api/materials/history/${userId}`),
      ])
      const taskData = await taskRes.json()
      const matData  = await matRes.json()
      setTasks(taskData.works || [])
      setMaterialHistory(matData.materials || matData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [])

  const stats = useMemo(() => {
    const total     = tasks.length
    const completed = tasks.filter(w =>
      ['approved', 'completed', 'เสร็จสิ้น'].includes((w.assign_status || w.status || '').toLowerCase())
    ).length
    const inProgress  = total - completed
    const successRate = total ? Math.round((completed / total) * 100) : 0
    return { total, completed, inProgress, successRate }
  }, [tasks])

  const monthlyData = useMemo(() => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    const data = months.map(m => ({ name: m, jobs: 0 }))
    tasks.forEach(task => {
      const d = new Date(task.start_date || task.datework)
      if (!isNaN(d)) data[d.getMonth()].jobs += 1
    })
    return data
  }, [tasks])

  const filteredMaterials = useMemo(() =>
    materialHistory.filter(m =>
      (m.material_name || m.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [materialHistory, searchTerm])

  const STATUS_MAT = {
    'อนุมัติ':       { color: '#14532d', bg: '#dcfce7', dot: '#22c55e' },
    'approved':      { color: '#14532d', bg: '#dcfce7', dot: '#22c55e' },
    'รอดำเนินการ':   { color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
    'pending':       { color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
    'ปฏิเสธ':        { color: '#7f1d1d', bg: '#fee2e2', dot: '#ef4444' },
    'rejected':      { color: '#7f1d1d', bg: '#fee2e2', dot: '#ef4444' },
  }
  const matStatusStyle = (s) => STATUS_MAT[(s || '').toLowerCase()] ||
    { color: '#374151', bg: '#f3f4f6', dot: '#9ca3af' }

  if (loading) return (
    <div style={{
      marginLeft: '15rem', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg,#e0f0ff 0%,#f0f8ff 40%,#e8f4fd 70%,#dbeefe 100%)',
      fontFamily: "'Kanit',sans-serif", flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #bfdbfe', borderTopColor: '#3b82f6',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: '#64748b', fontSize: 15 }}>กำลังโหลดข้อมูล...</span>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ud-wrap {
          width: 100%; min-height: 100vh;
          margin-left: 15rem; font-family: 'Kanit', sans-serif;
          padding: 32px 32px 60px; box-sizing: border-box;
          background:
            linear-gradient(160deg, #e0f0ff 0%, #f0f8ff 40%, #e8f4fd 70%, #dbeefe 100%);
          background-attachment: fixed;
          position: relative;
        }
        .ud-wrap::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, #93c5fd22 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none; z-index: 0;
        }
        .ud-content { position: relative; z-index: 1; animation: fadeUp 0.4s ease both; }

        /* glass card base */
        .ws-glass {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(147,197,253,0.35);
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(59,130,246,0.08), 0 1px 4px rgba(59,130,246,0.05),
                      inset 0 1px 0 rgba(255,255,255,0.9);
        }

        /* header card */
        .ud-header-card {
          padding: 22px 28px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
        }
        .ud-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px; margin-right: 18px;
          background: linear-gradient(135deg,#3b82f6,#1d4ed8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(59,130,246,0.35); flex-shrink: 0;
        }

        /* stat card */
        .ws-stat-card {
          display: flex; align-items: center; gap: 16px;
          padding: 20px 22px; border-radius: 18px;
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(147,197,253,0.35);
          box-shadow: 0 4px 24px rgba(59,130,246,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .ws-stat-icon {
          width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }

        /* chart / material card */
        .ud-card { padding: 24px; }

        .ud-card-title {
          font-size: 15px; font-weight: 600; color: '#334155';
          margin: 0 0 18px; display: flex; align-items: center; gap: 8px;
        }

        /* search */
        .ud-search-wrap { position: relative; margin-bottom: 16px; }
        .ud-search-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: #93c5fd; pointer-events: none;
        }
        .ud-search-input {
          width: 100%; box-sizing: border-box;
          padding: 9px 12px 9px 36px; border-radius: 12px;
          border: 1.5px solid rgba(147,197,253,0.5);
          background: rgba(248,250,252,0.9); font-family: 'Kanit', sans-serif;
          font-size: 13px; color: #1e3a8a; outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .ud-search-input::placeholder { color: #93c5fd; }
        .ud-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
          background: #fff;
        }

        /* material item */
        .ud-mat-item {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 12px 14px; border-radius: 13px; margin-bottom: 10px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(147,197,253,0.3);
          border-left: 4px solid #3b82f6;
          transition: background 0.15s, transform 0.15s;
        }
        .ud-mat-item:hover {
          background: rgba(239,246,255,0.95);
          transform: translateX(3px);
        }
        .ud-mat-item:last-child { margin-bottom: 0; }

        hr.ud-divider {
          border: none; border-top: 1.5px solid rgba(147,197,253,0.3);
          margin: 0 0 28px;
        }
      `}</style>

      <div className="ud-wrap">
        <div className="ud-content">

          {/* ── Header ── */}
          <div className="ws-glass ud-header-card">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="ud-icon-wrap">
                <LayoutDashboard size={26} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e3a8a', margin: 0, letterSpacing: '-0.5px' }}>
                  หน้าหลัก
                </h1>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>
                  ภาพรวมงานและการเบิกวัสดุของคุณ
                </p>
              </div>
            </div>
          </div>

          <hr className="ud-divider" />

          {/* ── Stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard title="งานทั้งหมด"    value={stats.total}
              icon={<ClipboardList size={22}/>} color="#3b82f6" />
            <StatCard title="งานสำเร็จ"     value={stats.completed}
              subtitle={`${stats.successRate}% success rate`}
              icon={<CheckCircle size={22}/>}  color="#22c55e" />
            <StatCard title="รอดำเนินการ"   value={stats.inProgress}
              icon={<Clock size={22}/>}        color="#f59e0b" />
          </div>

          {/* ── Chart + Material ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

            {/* Chart */}
            <div className="ws-glass ud-card">
              <div className="ud-card-title" style={{ color: '#334155' }}>
                <span style={{ fontSize: 18 }}>📊</span> สถิติงานรายเดือน
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(147,197,253,0.3)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontFamily: "'Kanit',sans-serif", fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false}
                    tick={{ fontFamily: "'Kanit',sans-serif", fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                  <Bar dataKey="jobs" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Material history */}
            <div className="ws-glass ud-card" style={{
              display: 'flex', flexDirection: 'column', maxHeight: 420,
            }}>
              <div className="ud-card-title" style={{ color: '#334155' }}>
                <span style={{ fontSize: 18 }}>📦</span> ประวัติการเบิกวัสดุ
              </div>

              <div className="ud-search-wrap">
                <Search size={14} className="ud-search-icon" />
                <input
                  className="ud-search-input"
                  type="text"
                  placeholder="ค้นหาชื่อวัสดุ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ overflowY: 'auto', flex: 1, paddingRight: 2 }}>
                {filteredMaterials.length > 0 ? filteredMaterials.map(m => {
                  const ms = matStatusStyle(m.status)
                  return (
                    <div key={m.request_id || m.id} className="ud-mat-item">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                          {m.material_name || m.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {m.request_at || m.created_at
                            ? new Date(m.request_at || m.created_at).toLocaleDateString('th-TH')
                            : '-'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 14 }}>
                          ×{m.quantity}
                        </div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          marginTop: 4, padding: '2px 9px', borderRadius: 999,
                          fontSize: 11, fontWeight: 600,
                          color: ms.color, backgroundColor: ms.bg,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: ms.dot }} />
                          {m.status || 'รอดำเนินการ'}
                        </span>
                      </div>
                    </div>
                  )
                }) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: 14 }}>
                    {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่พบประวัติการเบิก'}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default UserDashboard