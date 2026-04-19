import React, { useState } from 'react';
import { Modal, Button, Badge, Card } from 'react-bootstrap';

// ใช้ Style เดียวกับ LeaderDashboard เพื่อความสวยงาม
const styles = `
  .glass-card {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
  }
  .btn-approve {
    background: #10b981;
    border: none; color: white;
  }
  .btn-approve:hover { background: #059669; color: white; }
  .btn-reject {
    background: #ef4444;
    border: none; color: white;
  }
  .btn-reject:hover { background: #dc2626; color: white; }
`;

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
                    status: status, // เปลี่ยนสถานะเป็น Approved หรือ Revision
                    completed: status === 'Approved' ? true : false, // ถ้า Approved ถือว่าจบงาน (completed = true)
                    checkedBy: 'Leader', // (Optional) บันทึกว่าใครตรวจ
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
            <style>{styles}</style>

            <div className="container">
                <h2 className="fw-bold mb-4 text-primary">
                    <i className="bi bi-clipboard-check me-2"></i>ตรวจรับงาน (Inspection)
                </h2>

                {/* แสดงรายการงานที่รอตรวจสอบ */}
                {pendingJobs.length > 0 ? (
                    <div className="row g-4">
                        {pendingJobs.map(job => (
                            <div key={job.id} className="col-md-6 col-lg-4">
                                <div className="glass-card p-4 h-100 d-flex flex-column">
                                    <div className="d-flex justify-content-between mb-3">
                                        <Badge bg="warning" text="dark">รอตรวจสอบ</Badge>
                                        <small className="text-muted">{new Date(job.finishDate).toLocaleDateString('th-TH')}</small>
                                    </div>
                                    <h5 className="fw-bold">{job.namework}</h5>
                                    <p className="text-muted small flex-grow-1">
                                        <i className="bi bi-person me-1"></i> ช่าง: {job.technicianName}
                                    </p>
                                    <Button variant="outline-primary" className="w-100 mt-3 rounded-pill" onClick={() => handleInspect(job)}>
                                        <i className="bi bi-eye me-2"></i>ตรวจสอบผลงาน
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted glass-card">
                        <i className="bi bi-check-circle-fill fs-1 text-success mb-3 d-block"></i>
                        <h5>ไม่พบงานที่รอตรวจสอบ</h5>
                        <p>งานทั้งหมดได้รับการดำเนินการเรียบร้อยแล้ว</p>
                    </div>
                )}
            </div>

            {/* Modal แสดงรายละเอียดงานเพื่อตรวจสอบ */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>ตรวจสอบงาน: {selectedJob?.namework}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedJob && (
                        <div className="row">
                            {/* ข้อมูลสรุป */}
                            <div className="col-12 mb-4">
                                <div className="p-3 bg-light rounded border">
                                    <p><strong>รายละเอียด:</strong> {selectedJob.detail}</p>
                                    <p><strong>ปัญหาที่พบ:</strong> {selectedJob.issues || '-'}</p>
                                    <p><strong>วัสดุที่ใช้:</strong> {selectedJob.materials || '-'}</p>
                                </div>
                            </div>

                            {/* รูปภาพหลักฐาน */}
                            <div className="col-md-4 text-center">
                                <p className="fw-bold small">รูปก่อนทำ</p>
                                <img src={selectedJob.beforeImage || 'https://via.placeholder.com/150'} className="img-fluid rounded border shadow-sm" alt="Before" />
                            </div>
                            <div className="col-md-4 text-center">
                                <p className="fw-bold small">รูปหลังทำ</p>
                                <img src={selectedJob.afterImage || 'https://via.placeholder.com/150'} className="img-fluid rounded border shadow-sm" alt="After" />
                            </div>
                            <div className="col-md-4 text-center">
                                <p className="fw-bold small">ลายเซ็นลูกค้า</p>
                                <img src={selectedJob.otherImage || 'https://via.placeholder.com/150'} className="img-fluid rounded border shadow-sm" alt="Sign" />
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>ปิด</Button>
                    <Button className="btn-reject" onClick={() => updateStatus('Revision', selectedJob.id)}>
                        <i className="bi bi-x-circle me-1"></i> ส่งแก้ไข (Reject)
                    </Button>
                    <Button className="btn-approve" onClick={() => updateStatus('Approved', selectedJob.id)}>
                        <i className="bi bi-check-circle me-1"></i> อนุมัติ (Approve)
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default LeaderWork;