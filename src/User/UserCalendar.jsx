import React, { useState, useEffect } from 'react'
import { Calendar } from 'primereact/calendar'
import { Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

export default function UserCalendar({ tasks }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [workData, setWorkData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("tasks ที่ได้รับ:", tasks) 
        // ✅ แก้: รองรับ status จาก work_assign ที่ส่งมาจริงจาก API
        const relevantWorks = Array.isArray(tasks) ? tasks.filter(work =>
            work.status === "Assigned" ||
            work.status === "assigned" ||
            work.status === "PendingInspection" ||
            work.status === "pending_inspection" ||
            work.status === "Rejected" ||
            work.status === "rejected" ||
            work.status === "Revision" ||
            work.status === "revision" ||
            work.status === "completed" ||
            work.status === "เสร็จสิ้น" ||
            work.status === null ||
            work.status === undefined
        ) : [];

        setWorkData(relevantWorks);
    }, [tasks]);

 // ✅ แก้ไข: ใช้การเทียบวันที่แบบตัดเรื่อง "เวลา" ออกให้เหลือแค่ "ปี-เดือน-วัน"
const getTasksForDate = (date) => {
    if (!date || !workData.length) return [];
    
    // แปลงวันที่จากปฏิทิน (ที่เลือก) ให้เป็น Format YYYY-MM-DD
    const selectedStr = new Date(date).toLocaleDateString('en-CA'); 

    return workData.filter(work => {
        if (!work.start_date) return false;
        
        // แปลงวันที่จาก Database ให้เป็น Format YYYY-MM-DD เหมือนกัน
        const workDateStr = new Date(work.start_date).toLocaleDateString('en-CA');
        
        return workDateStr === selectedStr;
    });
};
const dateTemplate = (date) => {
    // สร้าง Object วันที่ของช่องนั้นๆ ในปฏิทิน
    const dayDate = new Date(date.year, date.month, date.day);
    
    // เช็คว่าวันนั้นมีงานไหมโดยใช้ฟังก์ชันที่เราแก้ข้างบน
    const hasWork = getTasksForDate(dayDate).length > 0;
    
    return (
        <div style={{
            backgroundColor: hasWork ? '#fff3cd' : 'transparent', // สีเหลืองเดิมของคุณ
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: hasWork ? '1px solid #ffda6a' : 'none' // เพิ่มขอบนิดนึงให้ชัด
        }}>
            {date.day}
        </div>
    );
};
    const selectedTasks = getTasksForDate(selectedDate);

    // ✅ แก้: เช็ค status ให้ตรงกับ DB จริง
    const getWorkStatusBadge = (work) => {
        const s = work.status?.toLowerCase();
        if (s === 'completed' || s === 'เสร็จสิ้น') {
            return <Badge bg="success" className='rounded-pill'>✅ เสร็จสิ้น</Badge>;
        } else if (s === 'pendinginspection' || s === 'pending_inspection') {
            return <Badge bg="warning" className='rounded-pill'>⏳ รอตรวจสอบ</Badge>;
        } else if (s === 'rejected' || s === 'revision') {
            return <Badge bg="danger" className='rounded-pill'>❌ ให้แก้ไขงาน</Badge>;
        } else {
            return <Badge bg="primary" className='rounded-pill'>🔧 รอดำเนินการ</Badge>;
        }
    };

    // ✅ แก้: สีขอบการ์ด
    const getCardBorderColor = (work) => {
        const s = work.status?.toLowerCase();
        if (s === 'completed' || s === 'เสร็จสิ้น') return '#10b981';
        if (s === 'pendinginspection' || s === 'pending_inspection') return '#f59e0b';
        if (s === 'rejected' || s === 'revision') return '#dc3545';
        return '#3b82f6';
    };

    return (
        <div
            className="container-fluid py-5"
            style={{ minHeight: '100vh', background: '#F0F8FF', marginLeft: '14rem' }}
        >
            <div className='p-4'>
               <h1 className='fw-bolder mb-4 text-primary'>
  <i className="bi bi-calendar-check me-3"></i>
  ปฏิทินกิจกรรม
</h1>
                <hr className='mb-4' />

                <div className='row'>
                    {/* คอลัมน์ปฏิทิน */}
                    <div className='col-lg-5 mb-4'>
                        <div className="card border-0 shadow-lg p-3">
                            <Calendar
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.value)}
                                inline
                                showIcon
                                dateTemplate={dateTemplate}
                                className="p-component w-100 prime-calendar-custom"
                            />
                        </div>
                    </div>

                    {/* คอลัมน์รายละเอียดงาน */}
                    <div className='col-lg-7'>
                        <div
                            className="p-4 border rounded-4 shadow-sm"
                            style={{ maxHeight: '80vh', overflowY: 'auto', background: 'white' }}>

                            <h4 className="mb-4 fw-bold text-dark">📋 รายละเอียดงาน</h4>

                            {selectedDate ? (
                                <>
                                    <div className="alert alert-primary bg-opacity-10 border-0 mb-4">
                                        <i className="bi bi-calendar-day-fill me-2"></i>
                                        <strong>วันที่เลือก: </strong>
                                        {selectedDate.toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'long'
                                        })}
                                    </div>

                                    {selectedTasks.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {selectedTasks.map((work) => (
                                                <div
                                                    key={work.work_id}
                                                    className="card border-0 shadow-sm"
                                                    style={{ borderLeft: `5px solid ${getCardBorderColor(work)}` }}
                                                >
                                                    <div className="card-body py-3 px-4">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            {/* ✅ แก้: ใช้ job_name แทน namework */}
                                                            <h5 className="card-title fw-semibold text-truncate mb-0" style={{ maxWidth: '70%' }}>
                                                                {work.job_name || 'ไม่มีชื่องาน'}
                                                            </h5>
                                                            {getWorkStatusBadge(work)}
                                                        </div>

                                                        {/* ✅ แก้: ใช้ job_detail แทน detail */}
                                                        {work.job_detail && (
                                                            <p className="card-text text-muted small mb-2">
                                                                {work.job_detail}
                                                            </p>
                                                        )}

                                                        <div className="d-flex gap-4 text-secondary small mb-2">
                                                            {/* ✅ แก้: ใช้ work_time แทน time */}
                                                            {work.work_time && (
                                                                <span>
                                                                    <i className="bi bi-clock me-1"></i> {work.work_time}
                                                                </span>
                                                            )}
                                                            {/* ✅ แก้: ใช้ start_date แทน datework */}
                                                            {work.start_date && (
                                                                <span>
                                                                    {new Date(work.start_date).toLocaleDateString('th-TH')}
                                                                </span>
                                                            )}
                                                            {/* ✅ เพิ่ม: แสดง location */}
                                                            {work.location && (
                                                                <span>
                                                                    <i className="bi bi-geo-alt me-1"></i> {work.location}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* แสดงข้อความเพิ่มเติมถ้ารอตรวจสอบ */}
                                                        {(work.status === "PendingInspection" || work.status === "pending_inspection") && (
                                                            <div className="alert alert-warning py-2 px-3 mb-2 small">
                                                                <i className="bi bi-info-circle me-2"></i>
                                                                งานนี้ถูกส่งไปตรวจสอบแล้ว กรุณารอหัวหน้าอนุมัติ
                                                            </div>
                                                        )}

                                                        {/* ✅ แก้: ปุ่มเริ่มทำงาน เช็ค status ให้ถูกต้อง */}
                                                        {work.status !== 'completed' &&
                                                            work.status !== 'เสร็จสิ้น' &&
                                                            work.status !== 'PendingInspection' &&
                                                            work.status !== 'pending_inspection' && (
                                                                <button
                                                                    className={`btn btn-sm ${work.status === "Rejected" || work.status === "rejected" || work.status === "Revision" || work.status === "revision"
                                                                        ? 'btn-danger' : 'btn-primary'}`}
                                                                    onClick={() => navigate('/sheetv2', { state: { work: work } })}
                                                                >
                                                                    {work.status === "Rejected" || work.status === "rejected" || work.status === "Revision" || work.status === "revision"
                                                                        ? "แก้ไขงานส่งใหม่" : "เริ่มทำงาน"}
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div style={{ fontSize: '3rem', color: '#6c757d' }}>🎉</div>
                                            <p className="text-muted mt-3 fw-light">ไม่มีงานในวันนี้! สนุกกับวันว่างของคุณ</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <div style={{ fontSize: '3rem', color: '#6c757d' }}>👆</div>
                                    <p className="text-muted mt-3 fw-light">กรุณาเลือกวันที่จากปฏิทินเพื่อดูรายละเอียดงาน</p>
                                </div>
                            )}
                        </div>

                        {/* สรุปงานทั้งหมด */}
                        <div className="mt-4 pt-3">
                            <h6 className="text-muted mb-3 fw-bold">📊 สรุปภาพรวม</h6>
                            <div className="row g-3">
                                <div className="col-sm-6 col-md-3">
                                    <SummaryCard
                                        count={workData.length}
                                        title="งานทั้งหมด"
                                        color="primary"
                                        icon="list-task"
                                    />
                                </div>
                                <div className="col-sm-6 col-md-3">
                                    <SummaryCard
                                        count={workData.filter(w => w.status === 'completed' || w.status === 'เสร็จสิ้น').length}
                                        title="เสร็จสิ้น"
                                        color="success"
                                        icon="check-circle-fill"
                                    />
                                </div>
                                <div className="col-sm-6 col-md-3">
                                    <SummaryCard
                                        count={workData.filter(w => w.status === 'assigned' || w.status === 'Assigned' || !w.status).length}
                                        title="รอดำเนินการ"
                                        color="info"
                                        icon="hourglass-split"
                                    />
                                </div>
                                <div className="col-sm-6 col-md-3">
                                    <SummaryCard
                                        count={workData.filter(w => w.status === "PendingInspection" || w.status === "pending_inspection").length}
                                        title="รอตรวจสอบ"
                                        color="warning"
                                        icon="clock-history"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SummaryCard = ({ count, title, color, icon }) => {
    return (
        <div className={`card border-0 shadow-sm bg-${color} bg-opacity-10`}>
            <div className="card-body text-center p-3">
                <div className={`h4 mb-1 fw-bold text-${color}`}>
                    <i className={`bi bi-${icon} me-1`}></i>
                    {count}
                </div>
                <small className="text-muted">{title}</small>
            </div>
        </div>
    );
};