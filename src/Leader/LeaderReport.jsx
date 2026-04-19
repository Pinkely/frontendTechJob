import React, { useState, useEffect, useMemo } from "react";
import { Button, Table, Form } from "react-bootstrap";
import "./leader.css";

const getSupervisorId = () => {
    try {
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.supervisor_id) return Number(user.supervisor_id);
            if (user.id) return Number(user.id);
        }
        const sid = localStorage.getItem("supervisor_id") || sessionStorage.getItem("supervisor_id");
        if (sid) return Number(sid);
    } catch (e) {
        console.error("getSupervisorId error:", e);
    }
    return null;
};

export default function LeaderReport() {
    const [selectedJob, setSelectedJob] = useState(null);
    const [reports, setReports] = useState([]);
    const [detail, setDetail] = useState("");
    const [note, setNote] = useState("");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const supervisorId = useMemo(() => getSupervisorId(), []);

    useEffect(() => {
        if (!supervisorId) {
            setLoading(false);
            return;
        }
        fetch(`http://localhost:3000/works/supervisor/${supervisorId}`)
            .then(res => res.json())
            .then(data => {
                const works = Array.isArray(data) ? data : (data.works || []);
                const mapped = works.map(w => ({
                    id: w.work_id || w.id,
                    namework: w.job_name || w.namework || "งานทั่วไป",
                    typework: w.job_type || w.typework || "-",
                    role: w.location_name || w.location || w.role || "-",
                    datework: w.start_date ? new Date(w.start_date).toLocaleDateString("th-TH") : new Date().toLocaleDateString("th-TH"),
                    time: w.work_time || w.time || "-",
                    detail: w.job_detail || w.detail || "",
                    status: w.status || "Pending",
                    completed: w.status === "Completed" || w.status === "เสร็จสิ้น",
                }));
                setJobs(mapped);
            })
            .catch(err => console.error("❌ Error fetching works:", err))
            .finally(() => setLoading(false));
    }, [supervisorId]);

    const handleSend = () => {
        if (!detail) return alert("กรุณากรอกรายละเอียดงาน");
        const newReport = {
            jobId: selectedJob.id,
            title: selectedJob.namework,
            location: selectedJob.role,
            detail,
            note,
            date: new Date().toLocaleString("th-TH"),
        };
        setReports([newReport, ...reports]);
        setSelectedJob(null);
        setDetail("");
        setNote("");
    };

    return (
        <div className="container-fluid py-5" style={{ marginLeft: "14rem", backgroundColor: "#f4f4f5", minHeight: "100vh" }}>
            {!selectedJob && (
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-5">
                        <div>
                            <h2 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>รายงานปัญหา / การทำงาน</h2>
                            <p className="text-muted">ดูรายการงานและแจ้งปัญหาที่เกิดขึ้นในการปฏิบัติงาน</p>
                        </div>
                    </div>

                    <div className="glass-card p-4 mb-5 border-0 shadow-sm">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : (
                        <Table hover responsive borderless className="align-middle leader-table">
                            <thead>
                                <tr className="border-bottom text-muted small text-uppercase fw-bold">
                                    <th className="py-3">ID</th>
                                    <th className="py-3">ชื่องาน</th>
                                    <th className="py-3">ประเภทงาน</th>
                                    <th className="py-3">สถานที่</th>
                                    <th className="py-3 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => (
                                    <tr key={job.id} className="border-bottom-faint">
                                        <td className="py-3 fw-medium">#{job.id}</td>
                                        <td className="py-3">
                                            <div className="fw-bold text-dark">{job.namework}</div>
                                        </td>
                                        <td className="py-3">
                                            <span className="badge bg-light text-dark fw-medium border px-2 py-1">{job.typework}</span>
                                        </td>
                                        <td className="py-3 text-muted">
                                            <i className="bi bi-geo-alt me-1 text-danger opacity-75"></i>{job.role}
                                        </td>
                                        <td className="py-3 text-center">
                                            <Button variant="outline-primary" className="rounded-pill px-4 btn-sm fw-bold"
                                                    onClick={() => { setSelectedJob(job); setDetail(job.detail); }}>
                                                รายงาน
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        )}
                    </div>

                    {reports.length > 0 && (
                        <div className="mt-5">
                            <h5 className="fw-bold mb-4" style={{ color: "#2c3e50" }}>ประวัติการรายงานล่าสุด</h5>
                            <div className="row g-4">
                                {reports.map((r, i) => (
                                    <div key={i} className="col-12">
                                        <div className="glass-card p-4 border-start-thick border-primary">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold mb-1">{r.title}</h6>
                                                    <div className="small text-muted mb-3">📍 {r.location}</div>
                                                    <p className="mb-0 text-dark bg-light p-3 rounded-3">{r.detail}</p>
                                                    {r.note && <p className="mt-2 small text-secondary italic">หมายเหตุ: {r.note}</p>}
                                                </div>
                                                <span className="badge bg-light text-muted fw-normal">{r.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedJob && (
                <div className="container" style={{ maxWidth: "800px" }}>
                    <Button variant="link" onClick={() => setSelectedJob(null)} className="text-decoration-none text-muted p-0 mb-4 hover-primary">
                        <i className="bi bi-arrow-left me-2"></i> ย้อนกลับ
                    </Button>
                    
                    <div className="glass-card p-5">
                        <h3 className="fw-bold mb-2">{selectedJob.namework}</h3>
                        <div className="text-muted mb-4 pb-3 border-bottom">📍 {selectedJob.role}</div>
                        
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold small text-muted text-uppercase">รายละเอียดปัญหา / ผลการทำงาน</Form.Label>
                            <Form.Control as="textarea" rows={5} value={detail} onChange={e => setDetail(e.target.value)}
                                           className="rounded-4 border-light-subtle bg-light-subtle p-3" />
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold small text-muted text-uppercase">หมายเหตุเพิ่มเติม</Form.Label>
                            <Form.Control as="textarea" rows={2} value={note} onChange={e => setNote(e.target.value)}
                                           className="rounded-4 border-light-subtle bg-light-subtle p-3" />
                        </Form.Group>
                        
                        <Button className="w-100 btn-gradient py-3 fw-bold rounded-4 shadow-sm" onClick={handleSend}>
                            ส่งรายงาน
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}