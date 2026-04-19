import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Container, Card, Button, Spinner } from 'react-bootstrap';

const API_BASE = 'http://localhost:3000';

const UserNotification = () => {
    const navigate = useNavigate();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);

    const getUserId = () => {
        const session = JSON.parse(localStorage.getItem('session'));
        return session?.user?.id || session?.user?.user_id || null;
    };

    const fetchWorks = useCallback(async () => {
        const userId = getUserId();
        if (!userId) { setLoading(false); return; }
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/works/technician/${userId}`);
            const data = await res.json();
            setWorks(data.works || []);
        } catch (err) {
            console.error('fetchWorks error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchWorks(); }, [fetchWorks]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Assigned': return { bg: 'primary', label: 'งานใหม่', icon: 'bi-briefcase', hex: '#0d6efd' };
            case 'PendingInspection': return { bg: 'warning', label: 'รอตรวจสอบ', icon: 'bi-clock-history', text: 'dark', hex: '#ffc107' };
            case 'Approved': return { bg: 'success', label: 'อนุมัติแล้ว', icon: 'bi-check-circle', hex: '#198754' };
            case 'Revision':
            case 'Rejected': return { bg: 'danger', label: 'ต้องแก้ไข', icon: 'bi-exclamation-octagon', hex: '#dc3545' };
            default: return { bg: 'secondary', label: status || 'ไม่ทราบสถานะ', icon: 'bi-question-circle', hex: '#6c757d' };
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const sortedWorks = [...works].sort((a, b) => {
        const priority = { 'Revision': 0, 'Rejected': 0, 'Approved': 1, 'Assigned': 2, 'PendingInspection': 3 };
        return (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
    });

    return (
        <div style={{ marginLeft: '15rem', minHeight: '100vh', background: '#f4f7f6', paddingBottom: '3rem' }}>
            {/* เปลี่ยนเป็น fluid เพื่อให้ขยายเต็มจอ 100% ของพื้นที่ที่เหลือ */}
            <Container fluid className="pt-5 px-4 px-xl-5">
                
                {/* --- Header Section --- */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 pb-3 border-bottom">
                    <div>
                        <Badge bg="primary" pill className="mb-2 px-3 py-2 text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                            <i className="bi bi-bell-fill me-2"></i>Update & Tracking
                        </Badge>
                        <h2 className="fw-bold text-dark m-0">การแจ้งเตือนงานของคุณ</h2>
                        <p className="text-muted mt-2 mb-0">ติดตามสถานะและอัปเดตงานที่ได้รับมอบหมาย</p>
                    </div>
                    <div className="mt-3 mt-md-0">
                        <Button 
                            variant="white" 
                            className="shadow-sm border px-4 py-2 d-flex align-items-center hover-scale" 
                            onClick={fetchWorks} 
                            disabled={loading}
                            style={{ borderRadius: '12px', background: '#fff' }}
                        >
                            {loading ? <Spinner size="sm" className="me-2 text-primary" /> : <i className="bi bi-arrow-clockwise me-2 text-primary fs-5"></i>}
                            <span className="fw-medium">{loading ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}</span>
                        </Button>
                    </div>
                </div>

                {/* --- Main Content --- */}
                {loading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
                        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                        <h5 className="mt-4 text-muted">กำลังดึงข้อมูลงานของคุณ...</h5>
                    </div>
                ) : sortedWorks.length === 0 ? (
                    <Card className="border-0 shadow-sm text-center py-5 mt-4" style={{ borderRadius: '20px' }}>
                        <Card.Body className="py-5">
                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '100px', height: '100px' }}>
                                <i className="bi bi-inbox fs-1 text-primary opacity-75"></i>
                            </div>
                            <h4 className="text-dark fw-bold">ไม่มีรายการแจ้งเตือน</h4>
                            <p className="text-muted">ขณะนี้คุณยังไม่มีงานใหม่หรือการแจ้งเตือนใดๆ</p>
                        </Card.Body>
                    </Card>
                ) : (
                    <div className="d-flex flex-column gap-3 mt-4">
                        {sortedWorks.map((work) => {
                            const config = getStatusConfig(work.status);
                            const isUrgent = ['Revision', 'Rejected'].includes(work.status);
                            const isFinished = work.status === 'Approved'; // เช็คสถานะว่างานเสร็จหรือยัง
                            
                            return (
                                <Card 
                                    key={work.work_id} 
                                    className={`border-0 shadow-sm transition-all notification-card ${isFinished ? 'opacity-75' : ''}`} 
                                    style={{ 
                                        borderRadius: '16px', 
                                        borderLeft: `6px solid ${config.hex}`,
                                        background: isUrgent ? '#fffcfc' : isFinished ? '#fdfdfd' : '#fff' 
                                    }}
                                >
                                    <Card.Body className="p-4 p-md-4">
                                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
                                            
                                            {/* Left Section: Info */}
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                                                    <Badge bg={config.bg} text={config.text || 'white'} className="px-3 py-2 rounded-pill fw-medium" style={{ fontSize: '0.85rem' }}>
                                                        <i className={`bi ${config.icon} me-2`}></i>
                                                        {config.label}
                                                    </Badge>
                                                    <span className="text-muted small fw-semibold px-2 py-1 bg-light rounded">ID: #{work.work_id}</span>
                                                </div>

                                                <h4 className={`fw-bold mt-2 mb-3 ${isFinished ? 'text-secondary' : 'text-dark'}`}>
                                                    {work.job_name || 'ไม่ได้ระบุชื่อโครงการ'}
                                                </h4>

                                                <div className="d-flex flex-wrap gap-3 gap-md-4 text-secondary" style={{ fontSize: '0.95rem' }}>
                                                    <div className="d-flex align-items-center bg-light px-3 py-1 rounded-pill">
                                                        <i className="bi bi-geo-alt text-danger me-2"></i>
                                                        {work.location || 'ไม่ระบุสถานที่'}
                                                    </div>
                                                    <div className="d-flex align-items-center bg-light px-3 py-1 rounded-pill">
                                                        <i className="bi bi-calendar3 text-primary me-2"></i>
                                                        {formatDate(work.start_date)}
                                                    </div>
                                                    <div className="d-flex align-items-center bg-light px-3 py-1 rounded-pill">
                                                        <i className="bi bi-tools text-warning me-2"></i>
                                                        {work.job_type || 'ทั่วไป'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Section: Action Button */}
                                            <div className="mt-2 mt-lg-0 min-w-max">
                                                {isFinished ? (
                                                    // กรณีงานเสร็จแล้ว (อนุมัติแล้ว) จะล็อคปุ่มไม่ให้กด
                                                    <div className="text-start text-lg-end">
                                                        <span className="d-block text-success small fw-bold mb-2">
                                                            <i className="bi bi-shield-lock-fill me-1"></i> งานเสร็จสมบูรณ์
                                                        </span>
                                                        <Button 
                                                            variant="secondary" 
                                                            className="px-4 py-2 fw-bold w-100 d-flex align-items-center justify-content-center"
                                                            disabled
                                                            style={{ borderRadius: '10px' }}
                                                        >
                                                            <i className="bi bi-lock-fill me-2"></i> ไม่สามารถแก้ไขได้
                                                        </Button>
                                                    </div>
                                                ) : isUrgent ? (
                                                    // กรณีงานต้องแก้ไข
                                                    <div className="text-start text-lg-end">
                                                        <span className="d-block text-danger small fw-bold mb-2">
                                                            <i className="bi bi-exclamation-triangle-fill me-1"></i> พบข้อผิดพลาดที่ต้องแก้ไข
                                                        </span>
                                                        <Button 
                                                            variant="danger" 
                                                            className="px-4 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center w-100"
                                                            onClick={() => navigate('/sheetv2', { state: { work } })}
                                                            style={{ borderRadius: '10px' }}
                                                        >
                                                            เปิดหน้ารายงาน <i className="bi bi-arrow-right ms-2"></i>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    // กรณีงานใหม่ หรือ รอตรวจสอบ
                                                    <Button 
                                                        variant="outline-primary" 
                                                        className="px-4 py-2 fw-bold bg-white w-100 d-flex align-items-center justify-content-center"
                                                        onClick={() => navigate('/sheetv2', { state: { work } })}
                                                        style={{ borderRadius: '10px', borderWidth: '2px' }}
                                                    >
                                                        ดูรายละเอียด <i className="bi bi-chevron-right ms-1"></i>
                                                    </Button>
                                                )}
                                            </div>

                                        </div>
                                    </Card.Body>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </Container>

            <style jsx="true">{`
                .transition-all {
                    transition: all 0.3s ease;
                }
                .notification-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.08)!important;
                }
                .hover-scale:hover {
                    transform: scale(1.02);
                }
                .min-w-max {
                    min-width: 220px;
                }
            `}</style>
        </div>
    );
};

export default UserNotification;