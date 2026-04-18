import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Prompt:wght@400;500;600;700&display=swap');

  .leader-list-root {
    font-family: 'Sarabun', sans-serif;
    background: linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%);
    min-height: 100vh;
  }

  .page-header {
    background: linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #7c3aed 100%);
    border-radius: 24px;
    padding: 28px 36px;
    margin-bottom: 32px;
    box-shadow: 0 20px 60px rgba(79, 70, 229, 0.3);
    position: relative;
    overflow: hidden;
  }

  .page-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
  }

  .page-header::after {
    content: '';
    position: absolute;
    bottom: -60%;
    right: 15%;
    width: 200px;
    height: 200px;
    background: rgba(255,255,255,0.04);
    border-radius: 50%;
  }

  .page-title {
    font-family: 'Prompt', sans-serif;
    font-weight: 700;
    font-size: 1.8rem;
    color: #fff;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0,0,0,0.15);
  }

  .page-subtitle {
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
    margin-top: 4px;
  }

  .stat-chip {
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 50px;
    padding: 8px 20px;
    color: white;
    font-size: 0.85rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .controls-bar {
    background: white;
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 28px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    border: 1px solid rgba(79, 70, 229, 0.08);
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .search-wrap {
    position: relative;
    flex: 1;
    min-width: 220px;
  }

  .search-wrap .icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #a5b4fc;
    font-size: 1rem;
  }

  .search-input {
    border-radius: 12px !important;
    border: 2px solid #e8eaff !important;
    padding-left: 42px !important;
    height: 44px;
    font-family: 'Sarabun', sans-serif;
    transition: all 0.25s;
    background: #fafbff !important;
  }

  .search-input:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
    background: white !important;
  }

  .filter-select {
    border-radius: 12px !important;
    border: 2px solid #e8eaff !important;
    height: 44px;
    font-family: 'Sarabun', sans-serif;
    cursor: pointer;
    min-width: 180px;
    background: #fafbff !important;
    transition: all 0.25s;
  }

  .filter-select:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
  }

  /* === TECH CARD === */
  .tech-card {
    background: white;
    border-radius: 22px;
    border: 2px solid transparent;
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    cursor: pointer;
    position: relative;
  }

  .tech-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #f0f4ff, #fafbff);
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: 20px;
  }

  .tech-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 60px rgba(79, 70, 229, 0.15);
    border-color: #c7d2fe;
  }

  .tech-card:hover::before {
    opacity: 1;
  }

  .tech-card.selected {
    border-color: #6366f1;
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.2);
  }

  .tech-card.selected::before {
    opacity: 1;
  }

  .card-inner {
    position: relative;
    z-index: 1;
    padding: 28px 24px 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .avatar-ring {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    padding: 3px;
    margin-bottom: 16px;
    position: relative;
    flex-shrink: 0;
  }

  .avatar-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Prompt', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }

  .tech-name {
    font-family: 'Prompt', sans-serif;
    font-weight: 600;
    font-size: 1.05rem;
    color: #1e1b4b;
    margin-bottom: 2px;
  }

  .tech-username {
    color: #94a3b8;
    font-size: 0.82rem;
    margin-bottom: 10px;
  }

  .type-badge {
    background: linear-gradient(135deg, #ede9fe, #e0e7ff);
    color: #4338ca;
    border: 1px solid #c7d2fe;
    border-radius: 50px;
    padding: 4px 16px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 14px;
  }

  .status-dot {
    position: absolute;
    top: 14px;
    right: 14px;
    padding: 5px 14px;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .expand-hint {
    color: #cbd5e1;
    font-size: 0.78rem;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
  }

  .tech-card:hover .expand-hint {
    color: #818cf8;
  }

  /* === EXPANDED DETAILS === */
  .details-panel {
    border-top: 2px dashed #e8eaff;
    margin: 0 -24px;
    padding: 18px 24px 0;
    margin-top: 14px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    text-align: left;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .detail-item.full-width {
    grid-column: span 2;
  }

  .detail-label {
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .detail-value {
    color: #334155;
    font-weight: 600;
    font-size: 0.9rem;
  }

  /* === LOADING === */
  .skeleton-card {
    background: white;
    border-radius: 22px;
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  }

  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: #94a3b8;
  }
`;

// Avatar gradient pallette
const GRADIENTS = [
    ['#6366f1', '#818cf8'],
    ['#f59e0b', '#fbbf24'],
    ['#10b981', '#34d399'],
    ['#ef4444', '#f87171'],
    ['#8b5cf6', '#a78bfa'],
    ['#ec4899', '#f472b6'],
    ['#0ea5e9', '#38bdf8'],
    ['#14b8a6', '#2dd4bf'],
];

const getGradient = (str) => {
    const idx = (str?.charCodeAt(0) ?? 0) % GRADIENTS.length;
    return GRADIENTS[idx];
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'ว่าง': return { bg: '#dcfce7', color: '#166534' };
        case 'กำลังทำงาน': return { bg: '#dbeafe', color: '#1e40af' };
        case 'ลา': return { bg: '#fee2e2', color: '#991b1b' };
        default: return { bg: '#f1f5f9', color: '#475569' };
    }
};

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton" style={{ width: 88, height: 88, borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: '70%', height: 20 }} />
        <div className="skeleton" style={{ width: '50%', height: 14 }} />
        <div className="skeleton" style={{ width: '60%', height: 28, borderRadius: 50 }} />
    </div>
);

const LeaderList = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        fetch('http://192.168.1.93:3000/technicians')
            .then(res => {
                if (!res.ok) throw new Error('Server error');
                return res.json();
            })
            .then(data => {
                setTechnicians(data.technicians ?? []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่');
                setLoading(false);
            });
    }, []);

    const allTypes = [...new Set(technicians.map(t => t.type).filter(Boolean))];

    const filtered = technicians.filter(t => {
        const matchName = t.name?.toLowerCase().includes(search.toLowerCase()) ||
            t.username?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter ? t.type === typeFilter : true;
        return matchName && matchType;
    });

    const availableCount = technicians.filter(t => t.status === 'ว่าง').length;
    const busyCount = technicians.filter(t => t.status === 'กำลังทำงาน').length;

    return (
        <div className="leader-list-root" style={{ marginLeft: '14rem', padding: '32px 40px' }}>
            <style>{styles}</style>

            {/* ── HEADER ── */}
            <div className="page-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 className="page-title">
                            <i className="bi bi-people-fill me-3"></i>รายชื่อช่าง
                        </h2>
                        <p className="page-subtitle">
                            ทีมช่างทั้งหมด {technicians.length} คน
                        </p>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        <div className="stat-chip">
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                            ว่าง {availableCount} คน
                        </div>
                        <div className="stat-chip">
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }}></span>
                            ทำงาน {busyCount} คน
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTROLS ── */}
            <div className="controls-bar">
                <div className="search-wrap">
                    <i className="bi bi-search icon"></i>
                    <input
                        type="text"
                        className="form-control search-input"
                        placeholder="ค้นหาชื่อ หรือ username..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Form.Select
                    className="filter-select"
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    style={{ width: 'auto' }}
                >
                    <option value="">🔧 ทุกประเภท</option>
                    {allTypes.map((type, i) => (
                        <option key={i} value={type}>{type}</option>
                    ))}
                </Form.Select>
                {(search || typeFilter) && (
                    <button
                        className="btn btn-sm"
                        style={{ borderRadius: 12, border: '2px solid #e8eaff', color: '#6366f1', padding: '8px 16px', fontFamily: 'Sarabun' }}
                        onClick={() => { setSearch(''); setTypeFilter(''); }}
                    >
                        <i className="bi bi-x-circle me-1"></i>ล้าง
                    </button>
                )}
                <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '0.85rem' }}>
                    แสดง {filtered.length} / {technicians.length} คน
                </span>
            </div>

            {/* ── ERROR ── */}
            {error && (
                <div className="alert" style={{ borderRadius: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '16px 20px' }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                </div>
            )}

            {/* ── GRID ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                gap: 24,
                paddingBottom: 48,
            }}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-search" style={{ fontSize: '3rem', opacity: 0.2 }}></i>
                        <p className="mt-3 mb-0" style={{ fontFamily: 'Prompt' }}>ไม่พบช่างที่ค้นหา</p>
                        <p style={{ fontSize: '0.85rem' }}>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                    </div>
                ) : (
                    filtered.map(t => {
                        const isSelected = selectedId === t.id || selectedId === t.technician_id;
                        const statusStyle = getStatusStyle(t.status);
                        const [c1, c2] = getGradient(t.name);
                        const cardId = t.technician_id ?? t.id;

                        return (
                            <div
                                key={cardId}
                                className={`tech-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedId(isSelected ? null : cardId)}
                            >
                                <div className="card-inner">
                                    {/* Status badge */}
                                    <span className="status-dot" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                                        {t.status ?? 'ไม่ระบุ'}
                                    </span>

                                    {/* Avatar */}
                                    <div className="avatar-ring" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                        <div className="avatar-inner" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                                            {t.name?.charAt(0) ?? '?'}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <h5 className="tech-name">{t.name}</h5>
                                    <p className="tech-username">@{t.username}</p>

                                    {/* Type */}
                                    {t.type && (
                                        <span className="type-badge">
                                            <i className="bi bi-tools me-1"></i>{t.type}
                                        </span>
                                    )}

                                    {/* Phone preview */}
                                    {!isSelected && t.phone && (
                                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 6 }}>
                                            <i className="bi bi-telephone me-1"></i>{t.phone}
                                        </div>
                                    )}

                                    {/* Expand hint */}
                                    {!isSelected && (
                                        <div className="expand-hint">
                                            <i className="bi bi-chevron-down"></i>ดูข้อมูลเพิ่มเติม
                                        </div>
                                    )}

                                    {/* Expanded Details */}
                                    {isSelected && (
                                        <div className="details-panel">
                                            <div className="detail-item">
                                                <span className="detail-label"><i className="bi bi-telephone"></i>เบอร์โทร</span>
                                                <span className="detail-value">{t.phone ?? '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label"><i className="bi bi-envelope"></i>อีเมล</span>
                                                <span className="detail-value" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{t.email ?? '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label"><i className="bi bi-wrench"></i>ประเภทงาน</span>
                                                <span className="detail-value">{t.type ?? '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label"><i className="bi bi-calendar3"></i>วันที่เพิ่ม</span>
                                                <span className="detail-value">
                                                    {t.created_at ? new Date(t.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                                </span>
                                            </div>
                                            <div className="detail-item full-width">
                                                <span className="detail-label"><i className="bi bi-person-badge"></i>Technician ID</span>
                                                <span className="detail-value" style={{ color: '#6366f1' }}>#{t.technician_id ?? t.id ?? '-'}</span>
                                            </div>
                                            <div className="detail-item full-width" style={{ marginTop: 4 }}>
                                                <button
                                                    style={{
                                                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                        border: 'none',
                                                        color: 'white',
                                                        borderRadius: 12,
                                                        padding: '10px 0',
                                                        fontFamily: 'Sarabun',
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                        transition: 'opacity 0.2s',
                                                    }}
                                                    onMouseEnter={e => e.target.style.opacity = '0.85'}
                                                    onMouseLeave={e => e.target.style.opacity = '1'}
                                                    onClick={e => { e.stopPropagation(); setSelectedId(null); }}
                                                >
                                                    <i className="bi bi-chevron-up me-2"></i>ย่อข้อมูล
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LeaderList;