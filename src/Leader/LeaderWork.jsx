import React, { useState } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import "./leader.css";

const LeaderWork = ({ tasks, setTasks }) => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // กรองเฉพาะงานที่สถานะเป็น "PendingInspection" (รอตรวจสอบ)
    const pendingJobs = tasks.filter(task => task.status === 'PendingInspection');

    // ฟังก์ชันสำหรับดูรายละเอียด
    const handleInspect = (job) => {
        setSelectedJob(job);
        setShowModal(true);
    };

    // ฟังก์ชัน อนุมัติ (Approved) หรือ ส่งแก้ (Revision)
    const updateStatus = (status, jobID) => {
        const updatedTasks = tasks.map(t => {
            if (t.id === jobID) {
                return {
                    ...t,
                    status: status,
                    completed: status === 'Approved' ? true : false,
                    checkedBy: 'Leader',
                    checkedDate: new Date().toISOString()
                };
            }
            return t;
        });

        setTasks(updatedTasks);
        setShowModal(false);
        alert(status === 'Approved' ? '✅ อนุมัติงานเรียบร้อย' : '⚠️ ส่งกลับแก้ไขเรียบร้อย');
    };

    return (
        <div className="container-fluid py-5" style={{ marginLeft: '14rem', backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>ตรวจรับงาน (Inspection)</h2>
                        <small className="text-muted">อนุมัติและตรวจสอบงานที่ช่างส่งมา</small>
                    </div>
                </div>

                {/* แสดงรายการงานที่รอตรวจสอบ */}
                {pendingJobs.length > 0 ? (
                    <div className="row g-4">
                        {pendingJobs.map(job => (
                            <div key={job.id} className="col-md-6 col-lg-4">
                                <div className="glass-card p-4 h-100 d-flex flex-column hover-lift">
                                    <div className="d-flex justify-content-between mb-3">
                                        <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">รอตรวจสอบ</Badge>
                                        <small className="text-muted">{job.finishDate ? new Date(job.finishDate).toLocaleDateString('th-TH') : '-'}</small>
                                    </div>
                                    <h5 className="fw-bold mb-3">{job.namework}</h5>
                                    <div className="flex-grow-1">
                                        <p className="text-muted small mb-2">
                                            <i className="bi bi-person me-2"></i> ช่าง: {job.technicianName}
                                        </p>
                                        <p className="text-muted small mb-0">
                                            <i className="bi bi-geo-alt me-2"></i> {job.role}
                                        </p>
                                    </div>
                                    <Button variant="outline-primary" className="w-100 mt-4 rounded-3 fw-bold" onClick={() => handleInspect(job)}>
                                        <i className="bi bi-search me-2"></i>ตรวจสอบผลงาน
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted glass-card">
                        <div className="mb-4">
                            <i className="bi bi-check2-circle" style={{ fontSize: "5rem", color: "#22c55e" }}></i>
                        </div>
                        <h4 className="fw-bold text-dark">ไม่พบงานที่รอตรวจสอบ</h4>
                        <p>งานทั้งหมดได้รับการดำเนินการเรียบร้อยแล้ว</p>
                    </div>
                )}
            </div>

            {/* Modal แสดงรายละเอียดงานเพื่อตรวจสอบ */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="leader-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">ตรวจสอบงาน: {selectedJob?.namework}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-4">
                    {selectedJob && (
                        <div className="row g-4">
                            {/* ข้อมูลสรุป */}
                            <div className="col-12">
                                <div className="p-4 bg-light rounded-4 border-0">
                                    <div className="mb-3">
                                        <label className="fw-bold text-muted small text-uppercase">รายละเอียด:</label>
                                        <p className="mb-0 text-dark">{selectedJob.detail}</p>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="fw-bold text-muted small text-uppercase">ปัญหาที่พบ:</label>
                                            <p className="mb-0">{selectedJob.issues || '-'}</p>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="fw-bold text-muted small text-uppercase">วัสดุที่ใช้:</label>
                                            <p className="mb-0">{selectedJob.materials || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* รูปภาพหลักฐาน */}
                            <div className="col-md-4">
                                <label className="d-block fw-bold text-center mb-2 small text-muted">รูปก่อนทำ</label>
                                <div className="rounded-3 overflow-hidden border">
                                    <img src={selectedJob.beforeImage || 'https://via.placeholder.com/300x200?text=Before'} className="img-fluid w-100" style={{ height: '180px', objectFit: 'cover' }} alt="Before" />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="d-block fw-bold text-center mb-2 small text-muted">รูปหลังทำ</label>
                                <div className="rounded-3 overflow-hidden border">
                                    <img src={selectedJob.afterImage || 'https://via.placeholder.com/300x200?text=After'} className="img-fluid w-100" style={{ height: '180px', objectFit: 'cover' }} alt="After" />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="d-block fw-bold text-center mb-2 small text-muted">ลายเซ็นลูกค้า</label>
                                <div className="rounded-3 overflow-hidden border">
                                    <img src={selectedJob.otherImage || 'https://via.placeholder.com/300x200?text=Signature'} className="img-fluid w-100" style={{ height: '180px', objectFit: 'cover' }} alt="Sign" />
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-4 pb-4">
                    <Button variant="light" className="px-4 rounded-3 fw-bold" onClick={() => setShowModal(false)}>ปิด</Button>
                    <Button variant="danger" className="px-4 rounded-3 fw-bold bg-danger" onClick={() => updateStatus('Revision', selectedJob.id)}>
                        <i className="bi bi-x-circle me-2"></i> ส่งแก้ไข (Reject)
                    </Button>
                    <Button className="px-4 rounded-3 fw-bold btn-gradient" onClick={() => updateStatus('Approved', selectedJob.id)}>
                        <i className="bi bi-check-circle me-2"></i> อนุมัติ (Approve)
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default LeaderWork;