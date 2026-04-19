import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, RefreshCw } from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────

const getUserId = () => {
    try {
        const u = JSON.parse(localStorage.getItem('user'));
        return u?.user_id || u?.id || null;
    } catch {
        return null;
    }
};

const normalizeStatus = (status) => (status || '').toLowerCase().replace(/[\s_]/g, '');

const formatDateTH = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d) ? '-' : d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    assigned:          { label: 'ได้รับมอบหมาย', color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' },
    pending:           { label: 'รอรับงาน',        color: '#065f46', bg: '#d1fae5', dot: '#10b981' },
    pendinginspection: { label: 'รอตรวจสอบ',       color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
    approved:          { label: 'อนุมัติแล้ว',      color: '#14532d', bg: '#dcfce7', dot: '#22c55e' },
    completed:         { label: 'เสร็จสิ้น',        color: '#14532d', bg: '#dcfce7', dot: '#22c55e' },
    เสร็จสิ้น:         { label: 'เสร็จสิ้น',        color: '#14532d', bg: '#dcfce7', dot: '#22c55e' },
    revision:          { label: 'แก้ไขงาน',         color: '#7f1d1d', bg: '#fee2e2', dot: '#ef4444' },
    rejected:          { label: 'ถูกปฏิเสธ',        color: '#7f1d1d', bg: '#fee2e2', dot: '#ef4444' },
};

const StatusBadge = ({ status }) => {
    const key = normalizeStatus(status);
    const cfg = STATUS_CONFIG[key] || { label: status || '-', color: '#374151', bg: '#f3f4f6', dot: '#9ca3af' };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, letterSpacing: '0.3px',
            color: cfg.color, backgroundColor: cfg.bg,
            whiteSpace: 'nowrap',
        }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%',
                backgroundColor: cfg.dot, flexShrink: 0,
                boxShadow: `0 0 0 2px ${cfg.dot}33`,
            }} />
            {cfg.label}
        </span>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────

const UserWorkSheet = () => {
    const [works, setWorks]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [spinning, setSpinning]     = useState(false);

    const fetchWorks = useCallback(async () => {
        const userId = getUserId();
        if (!userId) {
            setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
            setLoading(false);
            return;
        }
        setLoading(true);
        setSpinning(true);
        setError(null);
        try {
            const res = await fetch(`/api/works/technician/${userId}`);
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            setWorks(Array.isArray(data.works) ? data.works : []);
        } catch (err) {
            setError('โหลดข้อมูลไม่สำเร็จ: ' + err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setSpinning(false), 500);
        }
    }, []);

    useEffect(() => { fetchWorks(); }, [fetchWorks]);

    const filtered = works.filter(w => {
        const term = searchTerm.toLowerCase();
        return (
            String(w.work_id || '').includes(term) ||
            (w.job_name || '').toLowerCase().includes(term)
        );
    });

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

                .worksheet-wrap {
                    width: 100%;
                    min-height: 100vh;
                    margin-left: 15rem;
                    font-family: 'Kanit', sans-serif;
                    padding: 32px 32px 60px;
                    box-sizing: border-box;
                    background:
                        linear-gradient(160deg, #e0f0ff 0%, #f0f8ff 40%, #e8f4fd 70%, #dbeefe 100%);
                    background-attachment: fixed;
                    position: relative;
                }

                /* subtle dot grid overlay */
                .worksheet-wrap::before {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background-image: radial-gradient(circle, #93c5fd22 1px, transparent 1px);
                    background-size: 28px 28px;
                    pointer-events: none;
                    z-index: 0;
                }

                .worksheet-content { position: relative; z-index: 1; }

                /* header card */
                .ws-header-card {
                    background: rgba(255,255,255,0.75);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(147,197,253,0.4);
                    border-radius: 20px;
                    padding: 24px 28px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    box-shadow: 0 4px 24px rgba(59,130,246,0.08), 0 1px 4px rgba(59,130,246,0.06);
                }

                .ws-icon-wrap {
                    width: 52px; height: 52px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    display: flex; align-items: center; justify-content: center;
                    margin-right: 18px;
                    box-shadow: 0 6px 18px rgba(59,130,246,0.35);
                    flex-shrink: 0;
                }

                .ws-title {
                    font-size: 28px; font-weight: 700;
                    color: #1e3a8a; margin: 0;
                    letter-spacing: -0.5px; line-height: 1.2;
                }
                .ws-subtitle { font-size: 13px; color: #64748b; margin: 3px 0 0; }

                /* refresh button */
                .ws-refresh-btn {
                    display: flex; align-items: center; gap: 7px;
                    padding: 9px 18px; border-radius: 12px;
                    border: 1.5px solid #bfdbfe;
                    background: rgba(255,255,255,0.9);
                    color: #2563eb; font-family: 'Kanit', sans-serif;
                    font-size: 14px; font-weight: 500; cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(59,130,246,0.1);
                }
                .ws-refresh-btn:hover {
                    background: #eff6ff; border-color: #93c5fd;
                    box-shadow: 0 4px 12px rgba(59,130,246,0.18);
                    transform: translateY(-1px);
                }
                .ws-refresh-btn:active { transform: scale(0.97); }
                .ws-spin { animation: spin 0.6s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* search bar */
                .ws-search-wrap {
                    position: relative; max-width: 400px; margin-bottom: 20px;
                }
                .ws-search-icon {
                    position: absolute; left: 13px; top: 50%;
                    transform: translateY(-50%); color: #93c5fd; pointer-events: none;
                }
                .ws-search-input {
                    width: 100%; box-sizing: border-box;
                    padding: 11px 14px 11px 38px;
                    border-radius: 13px;
                    border: 1.5px solid rgba(147,197,253,0.5);
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(8px);
                    font-family: 'Kanit', sans-serif; font-size: 14px; color: #1e3a8a;
                    outline: none; transition: border 0.2s, box-shadow 0.2s;
                    box-shadow: 0 2px 8px rgba(59,130,246,0.06);
                }
                .ws-search-input::placeholder { color: #93c5fd; }
                .ws-search-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
                    background: #fff;
                }

                /* table card */
                .ws-table-card {
                    background: rgba(255,255,255,0.82);
                    backdrop-filter: blur(16px);
                    border-radius: 20px;
                    border: 1px solid rgba(147,197,253,0.35);
                    overflow: hidden;
                    box-shadow:
                        0 8px 32px rgba(59,130,246,0.08),
                        0 2px 8px rgba(59,130,246,0.05),
                        inset 0 1px 0 rgba(255,255,255,0.9);
                }

                .ws-table { width: 100%; border-collapse: collapse; }

                .ws-thead th {
                    padding: 14px 18px;
                    font-size: 12px; font-weight: 600;
                    letter-spacing: 0.6px; text-transform: uppercase;
                    color: #1e40af;
                    background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
                    border-bottom: 1.5px solid #bfdbfe;
                    white-space: nowrap;
                }
                .ws-thead th:first-child { border-radius: 0; padding-left: 24px; }
                .ws-thead th:last-child  { padding-right: 24px; }

                .ws-tbody tr {
                    border-bottom: 1px solid rgba(219,234,254,0.6);
                    transition: background 0.15s;
                }
                .ws-tbody tr:last-child { border-bottom: none; }
                .ws-tbody tr:nth-child(even) { background: rgba(239,246,255,0.45); }
                .ws-tbody tr:hover { background: rgba(219,234,254,0.55); }

                .ws-tbody td {
                    padding: 13px 18px;
                    font-size: 14px; color: #334155;
                    vertical-align: middle;
                }
                .ws-tbody td:first-child { padding-left: 24px; }
                .ws-tbody td:last-child  { padding-right: 24px; }

                .ws-id { font-weight: 700; color: #1d4ed8; font-size: 13px; }
                .ws-jobname { font-weight: 600; color: #1e293b; }
                .ws-muted { color: #64748b; font-size: 13px; }
                .ws-truncate {
                    max-width: 180px; overflow: hidden;
                    text-overflow: ellipsis; white-space: nowrap;
                    display: block;
                }

                /* footer */
                .ws-footer {
                    padding: 11px 24px;
                    border-top: 1px solid rgba(219,234,254,0.7);
                    font-size: 12px; color: #64748b;
                    background: rgba(239,246,255,0.5);
                    display: flex; align-items: center; gap: 6px;
                }

                /* loading / empty */
                .ws-center { padding: 60px 0; text-align: center; color: #64748b; }
                .ws-spinner {
                    width: 36px; height: 36px; border-radius: 50%;
                    border: 3px solid #bfdbfe; border-top-color: #3b82f6;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 14px;
                }

                hr.ws-divider {
                    border: none; border-top: 1.5px solid rgba(147,197,253,0.3);
                    margin: 0 0 24px;
                }
            `}</style>

            <div className="worksheet-wrap">
                <div className="worksheet-content">

                    {/* ── Header ── */}
                    <div className="ws-header-card">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="ws-icon-wrap">
                                <FileText size={26} color="#fff" />
                            </div>
                            <div>
                                <h1 className="ws-title">ใบงานของฉัน</h1>
                                <p className="ws-subtitle">แสดงเฉพาะงานที่ได้รับมอบหมายให้คุณ</p>
                            </div>
                        </div>
                        <button className="ws-refresh-btn" onClick={fetchWorks}>
                            <RefreshCw size={14} className={spinning ? 'ws-spin' : ''} />
                            รีเฟรช
                        </button>
                    </div>

                    <hr className="ws-divider" />

                    {/* ── Search ── */}
                    <div className="ws-search-wrap">
                        <Search size={15} className="ws-search-icon" />
                        <input
                            className="ws-search-input"
                            type="text"
                            placeholder="ค้นหาด้วยรหัสหรือชื่องาน..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* ── Table card ── */}
                    {loading ? (
                        <div className="ws-table-card ws-center">
                            <div className="ws-spinner" />
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : error ? (
                        <div className="ws-table-card ws-center">
                            <p style={{ color: '#dc2626', marginBottom: 14 }}>{error}</p>
                            <button className="ws-refresh-btn" onClick={fetchWorks} style={{ margin: '0 auto' }}>
                                ลองใหม่
                            </button>
                        </div>
                    ) : (
                        <div className="ws-table-card">
                            <table className="ws-table">
                                <thead className="ws-thead">
                                    <tr>
                                        <th>รหัส</th>
                                        <th>ชื่องาน</th>
                                        <th>ประเภทงาน</th>
                                        <th>รายละเอียด</th>
                                        <th>วันที่เริ่มงาน</th>
                                        <th>สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="ws-tbody">
                                    {filtered.length > 0 ? filtered.map(work => (
                                        <tr key={work.work_id}>
                                            <td><span className="ws-id">#{work.work_id}</span></td>
                                            <td><span className="ws-jobname">{work.job_name || '-'}</span></td>
                                            <td><span className="ws-muted">{work.job_type || '-'}</span></td>
                                            <td>
                                                <span
                                                    className="ws-muted ws-truncate"
                                                    title={work.job_detail || ''}
                                                >
                                                    {work.job_detail || '-'}
                                                </span>
                                            </td>
                                            <td><span className="ws-muted">{formatDateTH(work.start_date)}</span></td>
                                            <td>
                                                <StatusBadge status={work.assign_status || work.status} />
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '50px 0', textAlign: 'center', color: '#94a3b8' }}>
                                                {searchTerm ? 'ไม่พบงานที่ค้นหา' : 'ไม่มีใบงานของคุณในขณะนี้'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {filtered.length > 0 && (
                                <div className="ws-footer">
                                    <span style={{
                                        width: 7, height: 7, borderRadius: '50%',
                                        backgroundColor: '#3b82f6', display: 'inline-block', flexShrink: 0,
                                    }} />
                                    แสดง {filtered.length} รายการ
                                    {searchTerm && ` (กรองจาก ${works.length} รายการ)`}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default UserWorkSheet;