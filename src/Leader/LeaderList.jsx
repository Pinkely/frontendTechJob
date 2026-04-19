import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600&display=swap');

  .leader-list-root {
    font-family: 'Prompt', sans-serif;
    background: #f4f4f5;
    min-height: 100vh;
  }

  .page-header {
    background: #18181b;
    border-radius: 8px;
    padding: 24px 32px;
    margin-bottom: 24px;
    color: white;
  }

  .page-title {
    font-weight: 600;
    font-size: 1.5rem;
    color: #fff;
    margin: 0;
  }

  .page-subtitle {
    color: #a1a1aa;
    font-size: 0.9rem;
    margin-top: 4px;
  }

  .stat-chip {
    background: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    padding: 6px 16px;
    color: white;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .controls-bar {
    background: white;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 24px;
    border: 1px solid #e5e7eb;
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
    color: #9ca3af;
    font-size: 1rem;
  }

  .search-input {
    border-radius: 6px !important;
    border: 1px solid #d1d5db !important;
    padding-left: 42px !important;
    height: 40px;
    background: #f9fafb !important;
  }

  .search-input:focus {
    border-color: #18181b !important;
    box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.1) !important;
    background: white !important;
  }

  .filter-select {
    border-radius: 6px !important;
    border: 1px solid #d1d5db !important;
    height: 40px;
    cursor: pointer;
    min-width: 180px;
    background: #f9fafb !important;
  }

  .filter-select:focus {
    border-color: #18181b !important;
    box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.1) !important;
  }

  .tech-card {
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
  }

  .tech-card:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  }

  .tech-card.selected {
    border-color: #18181b;
  }

  .card-inner {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .avatar-ring {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin-bottom: 16px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: #4b5563;
  }

  .tech-name {
    font-weight: 600;
    font-size: 1.05rem;
    color: #111827;
    margin-bottom: 2px;
  }

  .tech-username {
    color: #6b7280;
    font-size: 0.85rem;
    margin-bottom: 10px;
  }

  .type-badge {
    background: #f3f4f6;
    color: #4b5563;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 4px 12px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 14px;
  }

  .status-dot {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .expand-hint {
    color: #9ca3af;
    font-size: 0.8rem;
    margin-top: 8px;
  }

  .details-panel {
    border-top: 1px solid #e5e7eb;
    margin: 0 -24px;
    padding: 16px 24px 0;
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    text-align: left;
  }

  .detail-label {
    font-size: 0.75rem;
    color: #6b7280;
    display: block;
    margin-bottom: 2px;
  }

  .detail-value {
    color: #111827;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .detail-item.full-width {
    grid-column: span 2;
  }

  .btn-collapse {
    background: #18181b;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px;
    width: 100%;
    margin-top: 8px;
    font-weight: 500;
    transition: background 0.2s;
  }
  .btn-collapse:hover { background: #27272a; }

  .skeleton-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .skeleton {
    background: #e5e7eb;
    border-radius: 4px;
  }
`;

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
        <div className="leader-list-root" style={{ marginLeft: '14rem', padding: '32px 40px', width: '100%' }}>
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
                                    <div className="avatar-ring">
                                        {t.name?.charAt(0) ?? '?'}
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
                                                    className="btn-collapse"
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