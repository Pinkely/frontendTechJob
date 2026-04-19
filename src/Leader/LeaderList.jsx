import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import "./leader.css";

// Avatar gradient palette
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
        fetch('http://192.168.1.106:3000/technicians')
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
        <div className="leader-list-root" style={{ marginLeft: '14rem', padding: '32px 40px', width: '100%', minHeight: '100vh', backgroundColor: '#f4f4f5' }}>
            {/* ── HEADER ── */}
            <div className="page-header" style={{ background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)', borderRadius: '16px', padding: '30px', marginBottom: '30px', color: 'white' }}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 className="fw-bold m-0">
                            <i className="bi bi-people-fill me-3"></i>รายชื่อช่าง
                        </h2>
                        <p className="opacity-75 mb-0 mt-1">
                            ทีมช่างทั้งหมด {technicians.length} คน
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <div className="bg-white bg-opacity-10 px-3 py-2 rounded-pill small border border-white border-opacity-20">
                            <span className="bg-success d-inline-block rounded-circle me-2" style={{ width: 8, height: 8 }}></span>
                            ว่าง {availableCount}
                        </div>
                        <div className="bg-white bg-opacity-10 px-3 py-2 rounded-pill small border border-white border-opacity-20">
                            <span className="bg-primary d-inline-block rounded-circle me-2" style={{ width: 8, height: 8 }}></span>
                            ทำงาน {busyCount}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTROLS ── */}
            <div className="glass-card p-3 mb-4 d-flex gap-3 align-items-center flex-wrap">
                <div className="position-relative flex-grow-1">
                    <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                    <Form.Control
                        type="text"
                        placeholder="ค้นหาชื่อ หรือ username..."
                        className="ps-5 rounded-3 border-0 bg-light"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Form.Select
                    className="rounded-3 border-0 bg-light"
                    style={{ width: '200px' }}
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                >
                    <option value="">🔧 ทุกประเภท</option>
                    {allTypes.map((type, i) => (
                        <option key={i} value={type}>{type}</option>
                    ))}
                </Form.Select>
            </div>

            {/* ── ERROR ── */}
            {error && <div className="alert alert-danger rounded-3">{error}</div>}

            {/* ── GRID ── */}
            <div className="row g-4">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <div key={i} className="col-md-4"><SkeletonCard /></div>)
                ) : filtered.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="bi bi-search fs-1 opacity-25 d-block mb-3"></i>
                        <p>ไม่พบช่างที่ค้นหา</p>
                    </div>
                ) : (
                    filtered.map(t => {
                        const isSelected = selectedId === t.id || selectedId === t.technician_id;
                        const statusStyle = getStatusStyle(t.status);
                        const [c1, c2] = getGradient(t.name);
                        const cardId = t.technician_id ?? t.id;

                        return (
                            <div key={cardId} className="col-md-6 col-lg-4 col-xl-3">
                                <div className={`glass-card p-4 h-100 text-center hover-lift position-relative ${isSelected ? 'border-primary border-2' : ''}`}
                                    onClick={() => setSelectedId(isSelected ? null : cardId)}
                                    style={{ cursor: 'pointer' }}>
                                    
                                    <span className="badge position-absolute top-0 end-0 m-3 rounded-pill px-3 py-2"
                                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                        {t.status}
                                    </span>

                                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                                         style={{ width: 80, height: 80, background: `linear-gradient(135deg, ${c1}, ${c2})`, fontSize: '2rem' }}>
                                        {t.name?.charAt(0)}
                                    </div>

                                    <h5 className="fw-bold mb-1">{t.name}</h5>
                                    <p className="text-muted small mb-3">@{t.username}</p>

                                    <div className="bg-light rounded-pill px-3 py-1 small d-inline-block mb-3">
                                        <i className="bi bi-tools me-2 text-primary"></i>{t.type}
                                    </div>

                                    {isSelected && (
                                        <div className="mt-3 pt-3 border-top text-start">
                                            <div className="mb-2">
                                                <small className="text-muted d-block small text-uppercase fw-bold">เบอร์โทร</small>
                                                <span>{t.phone || '-'}</span>
                                            </div>
                                            <div className="mb-2">
                                                <small className="text-muted d-block small text-uppercase fw-bold">อีเมล</small>
                                                <span className="small">{t.email || '-'}</span>
                                            </div>
                                            <div className="mb-2">
                                                <small className="text-muted d-block small text-uppercase fw-bold">ประเภทงาน</small>
                                                <span>{t.type || '-'}</span>
                                            </div>
                                            <div className="mb-2">
                                                <small className="text-muted d-block small text-uppercase fw-bold">Technician ID</small>
                                                <span style={{ color: '#6366f1' }}>#{t.technician_id ?? t.id ?? '-'}</span>
                                            </div>
                                            <div className="text-center mt-3">
                                                <Button variant="link" className="text-decoration-none small" onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}>
                                                    <i className="bi bi-chevron-up me-1"></i>ย่อข้อมูล
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {!isSelected && (
                                        <div className="text-muted small mt-2 opacity-50">
                                            <i className="bi bi-chevron-down me-1"></i>คลิกเพื่อดูเพิ่มเติม
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
