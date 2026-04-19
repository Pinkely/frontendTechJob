import React, { useState, useEffect, useCallback } from 'react'
import { Calendar } from 'primereact/calendar'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, CalendarDays, Clock, MapPin, ClipboardList, CheckCircle, Hourglass, Eye } from 'lucide-react'

// ── helpers ───────────────────────────────────────────────────────────────────

const getUserId = () => {
    try {
        const u = JSON.parse(localStorage.getItem('user'))
        return u?.user_id || u?.id || null
    } catch { return null }
}

const normalizeStatus = (s) => (s || '').toLowerCase().replace(/[\s_]/g, '')

const STATUS_CFG = {
    completed:         { label: 'เสร็จสิ้น',        color: '#14532d', bg: '#dcfce7', dot: '#22c55e', border: '#22c55e' },
    เสร็จสิ้น:         { label: 'เสร็จสิ้น',        color: '#14532d', bg: '#dcfce7', dot: '#22c55e', border: '#22c55e' },
    approved:          { label: 'อนุมัติแล้ว',      color: '#14532d', bg: '#dcfce7', dot: '#22c55e', border: '#22c55e' },
    pendinginspection: { label: 'รอตรวจสอบ',       color: '#92400e', bg: '#fef3c7', dot: '#f59e0b', border: '#f59e0b' },
    revision:          { label: 'แก้ไขงาน',         color: '#7f1d1d', bg: '#fee2e2', dot: '#ef4444', border: '#ef4444' },
    rejected:          { label: 'ถูกปฏิเสธ',        color: '#7f1d1d', bg: '#fee2e2', dot: '#ef4444', border: '#ef4444' },
    assigned:          { label: 'ได้รับมอบหมาย',   color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6', border: '#3b82f6' },
    pending:           { label: 'รอรับงาน',         color: '#065f46', bg: '#d1fae5', dot: '#10b981', border: '#10b981' },
}
const getStatusCfg = (work) => {
    const key = normalizeStatus(work.assign_status || work.status)
    return STATUS_CFG[key] || { label: work.status || 'Draft', color: '#374151', bg: '#f3f4f6', dot: '#9ca3af', border: '#9ca3af' }
}

const StatusBadge = ({ work }) => {
    const cfg = getStatusCfg(work)
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 11px', borderRadius: 999,
            fontSize: 12, fontWeight: 600,
            color: cfg.color, backgroundColor: cfg.bg,
            whiteSpace: 'nowrap', flexShrink: 0,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cfg.dot, boxShadow: `0 0 0 2px ${cfg.dot}33` }} />
            {cfg.label}
        </span>
    )
}

const SummaryCard = ({ count, title, color, icon: Icon }) => (
    <div style={{
        background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(147,197,253,0.35)', borderRadius: 16,
        padding: '16px 14px', textAlign: 'center',
        boxShadow: '0 4px 16px rgba(59,130,246,0.07)',
    }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <div style={{ background: `${color}18`, borderRadius: 12, padding: 8, color }}>
                <Icon size={20} />
            </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1e3a8a', lineHeight: 1 }}>{count}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{title}</div>
    </div>
)

// ── Main ──────────────────────────────────────────────────────────────────────

export default function UserCalendar() {
    const [selectedDate, setSelectedDate] = useState(null)
    const [workData, setWorkData]         = useState([])
    const [loading, setLoading]           = useState(true)
    const [spinning, setSpinning]         = useState(false)
    const navigate = useNavigate()

    const fetchWorks = useCallback(async () => {
        const userId = getUserId()
        if (!userId) { setLoading(false); return }
        setLoading(true); setSpinning(true)
        try {
            const res  = await fetch(`/api/works/technician/${userId}`)
            const data = await res.json()
            setWorkData(data.works || [])
        } catch (err) {
            console.error('fetchWorks error:', err)
        } finally {
            setLoading(false)
            setTimeout(() => setSpinning(false), 500)
        }
    }, [])

    useEffect(() => { fetchWorks() }, [fetchWorks])

    const getTasksForDate = (date) => {
        if (!date || !workData.length) return []
        const sel = new Date(date).toLocaleDateString('en-CA')
        return workData.filter(w => w.start_date &&
            new Date(w.start_date).toLocaleDateString('en-CA') === sel)
    }

    const dateTemplate = (date) => {
        const hasWork = getTasksForDate(new Date(date.year, date.month, date.day)).length > 0
        return (
            <div style={{
                width: 30, height: 30, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: hasWork ? '#dbeafe' : 'transparent',
                border: hasWork ? '1.5px solid #3b82f6' : 'none',
                color: hasWork ? '#1d4ed8' : 'inherit',
                fontWeight: hasWork ? 700 : 400,
                fontSize: 13,
            }}>
                {date.day}
                {hasWork && (
                    <span style={{
                        position: 'absolute', bottom: 2, left: '50%',
                        transform: 'translateX(-50%)',
                        width: 4, height: 4, borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                    }} />
                )}
            </div>
        )
    }

    const selectedTasks = getTasksForDate(selectedDate)

    const stats = {
        total:      workData.length,
        done:       workData.filter(w => ['completed','เสร็จสิ้น','approved'].includes(normalizeStatus(w.assign_status || w.status))).length,
        pending:    workData.filter(w => ['assigned','pending',''].includes(normalizeStatus(w.assign_status || w.status))).length,
        inspection: workData.filter(w => normalizeStatus(w.assign_status || w.status) === 'pendinginspection').length,
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

                .uc-wrap {
                    width: 100%; min-height: 100vh;
                    margin-left: 15rem; font-family: 'Kanit', sans-serif;
                    padding: 32px 32px 60px; box-sizing: border-box;
                    background: linear-gradient(160deg,#e0f0ff 0%,#f0f8ff 40%,#e8f4fd 70%,#dbeefe 100%);
                    background-attachment: fixed; position: relative;
                }
                .uc-wrap::before {
                    content: ''; position: fixed; inset: 0;
                    background-image: radial-gradient(circle,#93c5fd22 1px,transparent 1px);
                    background-size: 28px 28px; pointer-events: none; z-index: 0;
                }
                .uc-content { position: relative; z-index: 1; animation: fadeUp 0.4s ease both; }

                .ws-glass {
                    background: rgba(255,255,255,0.78);
                    backdrop-filter: blur(14px);
                    border: 1px solid rgba(147,197,253,0.35);
                    border-radius: 20px;
                    box-shadow: 0 4px 24px rgba(59,130,246,0.08), 0 1px 4px rgba(59,130,246,0.05),
                                inset 0 1px 0 rgba(255,255,255,0.9);
                }

                .uc-header-card {
                    padding: 22px 28px;
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 28px;
                }
                .uc-icon-wrap {
                    width: 52px; height: 52px; border-radius: 14px; margin-right: 18px; flex-shrink: 0;
                    background: linear-gradient(135deg,#3b82f6,#1d4ed8);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 6px 18px rgba(59,130,246,0.35);
                }

                .uc-refresh-btn {
                    display: flex; align-items: center; gap: 7px;
                    padding: 9px 18px; border-radius: 12px;
                    border: 1.5px solid #bfdbfe;
                    background: rgba(255,255,255,0.9); color: #2563eb;
                    font-family: 'Kanit', sans-serif; font-size: 14px;
                    font-weight: 500; cursor: pointer;
                    transition: all 0.2s; box-shadow: 0 2px 8px rgba(59,130,246,0.1);
                }
                .uc-refresh-btn:hover { background:#eff6ff; border-color:#93c5fd; transform:translateY(-1px); box-shadow: 0 4px 14px rgba(59,130,246,0.18); }
                .uc-refresh-btn:active { transform:scale(0.97); }
                .uc-spin { animation: spin 0.6s linear infinite; }

                hr.uc-divider { border:none; border-top:1.5px solid rgba(147,197,253,0.3); margin:0 0 28px; }

                /* PrimeReact calendar overrides */
                .uc-cal-card { padding: 20px; }
                .p-calendar .p-datepicker { background: transparent !important; border: none !important; box-shadow: none !important; font-family: 'Kanit', sans-serif !important; }
                .p-datepicker table td > span { border-radius: 50% !important; }
                .p-datepicker table td.p-datepicker-today > span { background: #dbeafe !important; color: #1d4ed8 !important; font-weight: 700; }
                .p-datepicker table td > span.p-highlight { background: #3b82f6 !important; color: #fff !important; }
                .p-datepicker .p-datepicker-header { background: transparent !important; border-bottom: 1px solid rgba(147,197,253,0.3) !important; font-family: 'Kanit', sans-serif !important; color: #1e3a8a !important; padding-bottom: 10px !important; margin-bottom: 6px !important; }
                .p-datepicker .p-datepicker-header button { color: #3b82f6 !important; }
                .p-datepicker table th { color: #64748b !important; font-size: 12px; font-weight: 600; }
                .p-datepicker table td { padding: 2px !important; }
                .p-datepicker table td > span { font-size: 13px !important; width: 34px !important; height: 34px !important; }

                /* detail panel */
                .uc-detail-panel { padding: 24px; display: flex; flex-direction: column; max-height: 580px; }
                .uc-detail-scroll { overflow-y: auto; flex: 1; padding-right: 4px; }
                .uc-detail-scroll::-webkit-scrollbar { width: 4px; }
                .uc-detail-scroll::-webkit-scrollbar-track { background: transparent; }
                .uc-detail-scroll::-webkit-scrollbar-thumb { background: #bfdbfe; border-radius: 99px; }

                .uc-date-pill {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 8px 16px; border-radius: 12px; margin-bottom: 18px;
                    background: linear-gradient(135deg,#eff6ff,#dbeafe);
                    border: 1px solid #bfdbfe;
                    font-size: 14px; font-weight: 500; color: #1e40af;
                }

                .uc-work-card {
                    border-radius: 16px; margin-bottom: 14px;
                    background: rgba(255,255,255,0.92);
                    border: 1px solid rgba(147,197,253,0.3);
                    overflow: hidden;
                    transition: box-shadow 0.2s, transform 0.2s;
                    box-shadow: 0 2px 10px rgba(59,130,246,0.06);
                }
                .uc-work-card:hover {
                    box-shadow: 0 6px 20px rgba(59,130,246,0.12);
                    transform: translateY(-2px);
                }
                .uc-work-card-body { padding: 16px 18px; }
                .uc-meta { display: flex; gap: 14px; flex-wrap: wrap; margin: 8px 0 10px; }
                .uc-meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #64748b; }

                .uc-start-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 7px 16px; border-radius: 10px; border: none;
                    font-family: 'Kanit', sans-serif; font-size: 13px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                }
                .uc-start-btn-primary { background: linear-gradient(135deg,#3b82f6,#1d4ed8); color: #fff; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
                .uc-start-btn-primary:hover { box-shadow: 0 6px 18px rgba(59,130,246,0.4); transform: translateY(-1px); }
                .uc-start-btn-danger { background: linear-gradient(135deg,#ef4444,#b91c1c); color: #fff; box-shadow: 0 4px 12px rgba(239,68,68,0.3); }
                .uc-start-btn-danger:hover { box-shadow: 0 6px 18px rgba(239,68,68,0.4); transform: translateY(-1px); }

                .uc-warning-notice {
                    display: flex; align-items: center; gap: 8px;
                    padding: 9px 14px; border-radius: 10px; margin: 8px 0;
                    background: #fef3c7; border: 1px solid #fde68a;
                    font-size: 12px; color: '#92400e';
                }

                .uc-empty {
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; padding: 50px 0; color: #94a3b8;
                    gap: 10px; text-align: center;
                }
                .uc-empty-icon { font-size: 40px; }
            `}</style>

            <div className="uc-wrap">
                <div className="uc-content">

                    {/* ── Header ── */}
                    <div className="ws-glass uc-header-card">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="uc-icon-wrap">
                                <CalendarDays size={26} color="#fff" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e3a8a', margin: 0, letterSpacing: '-0.5px' }}>
                                    ปฏิทินกิจกรรม
                                </h1>
                                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>
                                    กดเลือกวันที่เพื่อดูรายละเอียดงาน
                                </p>
                            </div>
                        </div>
                        <button className="uc-refresh-btn" onClick={fetchWorks}>
                            <RefreshCw size={14} className={spinning ? 'uc-spin' : ''} />
                            รีเฟรช
                        </button>
                    </div>

                    <hr className="uc-divider" />

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
                            <div style={{
                                width: 38, height: 38, margin: '0 auto 14px',
                                borderRadius: '50%', border: '3px solid #bfdbfe',
                                borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite',
                            }} />
                            กำลังโหลดข้อมูลงาน...
                        </div>
                    ) : (
                        <>
                            {/* ── Calendar + Detail ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, marginBottom: 24 }}>

                                {/* Calendar */}
                                <div className="ws-glass uc-cal-card" style={{ position: 'relative' }}>
                                    <Calendar
                                        value={selectedDate}
                                        onChange={e => setSelectedDate(e.value)}
                                        inline showIcon
                                        dateTemplate={dateTemplate}
                                        className="p-component w-100"
                                    />
                                    {selectedDate && (
                                        <div style={{
                                            marginTop: 14, padding: '9px 14px', borderRadius: 12,
                                            background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                                            border: '1px solid #bfdbfe', fontSize: 13,
                                            color: '#1e40af', fontWeight: 500, textAlign: 'center',
                                        }}>
                                            {selectedDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                                        </div>
                                    )}
                                </div>

                                {/* Detail panel */}
                                <div className="ws-glass uc-detail-panel">
                                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1e3a8a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <ClipboardList size={16} />
                                        รายละเอียดงาน
                                        {selectedDate && selectedTasks.length > 0 && (
                                            <span style={{
                                                marginLeft: 6, padding: '2px 10px', borderRadius: 999,
                                                background: '#dbeafe', color: '#1d4ed8',
                                                fontSize: 12, fontWeight: 700,
                                            }}>
                                                {selectedTasks.length} งาน
                                            </span>
                                        )}
                                    </div>

                                    <div className="uc-detail-scroll">
                                        {!selectedDate ? (
                                            <div className="uc-empty">
                                                <div className="uc-empty-icon">👆</div>
                                                <span>กรุณาเลือกวันที่จากปฏิทิน</span>
                                            </div>
                                        ) : selectedTasks.length === 0 ? (
                                            <div className="uc-empty">
                                                <div className="uc-empty-icon">🎉</div>
                                                <span>ไม่มีงานในวันที่เลือก</span>
                                            </div>
                                        ) : selectedTasks.map(work => {
                                            const cfg = getStatusCfg(work)
                                            const ns  = normalizeStatus(work.assign_status || work.status)
                                            const isDone     = ['completed','เสร็จสิ้น','approved'].includes(ns)
                                            const isWaiting  = ns === 'pendinginspection'
                                            const isRevision = ['rejected','revision'].includes(ns)
                                            return (
                                                <div key={work.work_id} className="uc-work-card"
                                                    style={{ borderLeft: `4px solid ${cfg.border}` }}>
                                                    <div className="uc-work-card-body">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                                            <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', flex: 1 }}>
                                                                {work.job_name || 'ไม่มีชื่องาน'}
                                                            </div>
                                                            <StatusBadge work={work} />
                                                        </div>

                                                        {work.job_detail && (
                                                            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                                                                {work.job_detail}
                                                            </p>
                                                        )}

                                                        <div className="uc-meta">
                                                            {work.work_time && (
                                                                <span className="uc-meta-item">
                                                                    <Clock size={12} /> {work.work_time}
                                                                </span>
                                                            )}
                                                            {work.start_date && (
                                                                <span className="uc-meta-item">
                                                                    <CalendarDays size={12} />
                                                                    {new Date(work.start_date).toLocaleDateString('th-TH')}
                                                                </span>
                                                            )}
                                                            {work.location && (
                                                                <span className="uc-meta-item">
                                                                    <MapPin size={12} /> {work.location}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isWaiting && (
                                                            <div className="uc-warning-notice" style={{ color: '#92400e' }}>
                                                                <Hourglass size={13} />
                                                                งานนี้ถูกส่งตรวจสอบแล้ว กรุณารอหัวหน้าอนุมัติ
                                                            </div>
                                                        )}

                                                        {!isDone && !isWaiting && (
                                                            <button
                                                                className={`uc-start-btn ${isRevision ? 'uc-start-btn-danger' : 'uc-start-btn-primary'}`}
                                                                onClick={() => navigate('/sheetv2', { state: { work } })}
                                                            >
                                                                {isRevision ? 'แก้ไขงานส่งใหม่' : 'เริ่มทำงาน'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* ── Summary ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                                <SummaryCard count={stats.total}      title="งานทั้งหมด"  color="#3b82f6" icon={ClipboardList} />
                                <SummaryCard count={stats.done}       title="เสร็จสิ้น"   color="#22c55e" icon={CheckCircle} />
                                <SummaryCard count={stats.pending}    title="รอดำเนินการ" color="#f59e0b" icon={Clock} />
                                <SummaryCard count={stats.inspection} title="รอตรวจสอบ"   color="#a855f7" icon={Eye} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}