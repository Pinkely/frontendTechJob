import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "./leader.css";

// ======================================================
// ดึง supervisor_id จาก localStorage/sessionStorage
// ======================================================
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

const getStatusBadge = (status) => {
    switch (status) {
        case 'Completed':
        case 'เสร็จสิ้น': return 'bg-success text-white';
        case 'Pending':
        case 'รอดำเนินการ': return 'bg-warning text-dark bg-opacity-75';
        case 'Assigned':
        case 'มอบหมายแล้ว': return 'bg-primary text-white';
        case 'PendingInspection': return 'bg-info text-dark';
        default: return 'bg-secondary text-white';
    }
};

const LeaderDashboard = ({ tasks: propTasks, setTasks: setPropTasks }) => {
    // If props are provided, use them; otherwise manage locally
    const [localTasks, setLocalTasks] = useState([]);
    const tasks = propTasks || localTasks;
    const setTasks = setPropTasks || setLocalTasks;

    const [technicians, setTechnicians] = useState([]);
    const [selectedWork, setSelectedWork] = useState(null);
    const [assignTechs, setAssignTechs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [todayWorks, setTodayWorks] = useState([]);
    const [supervisorName, setSupervisorName] = useState("");

    const supervisorId = useMemo(() => getSupervisorId(), []);
    const navigate = useNavigate();

    const goCheckWork = () => navigate("/leader-work");
    const goReport = () => navigate("/leader-report");

    // Fetch All Works for Supervisor
    useEffect(() => {
        if (!supervisorId) return;
        setLoading(true);
        fetch(`http://localhost:3000/works/supervisor/${supervisorId}`)
            .then(res => res.json())
            .then(data => {
                const works = Array.isArray(data) ? data : (data.works || []);
                const mapped = works.map(w => ({
                    id: w.work_id || w.id,
                    namework: w.job_name || w.namework,
                    customer_name: w.customer_name,
                    typework: w.job_type || w.typework,
                    detail: w.job_detail || w.detail,
                    role: w.location_name || w.location || w.role,
                    time: w.work_time || w.time,
                    start_date: w.start_date,
                    status: w.status || "Pending",
                    technicianName: w.technicianName,
                    supervisor_id: w.supervisor_id,
                    location: (w.lat && w.lng) ? { lat: w.lat, lng: w.lng } : null,
                }));
                setTasks(mapped);
            })
            .catch(err => console.error("❌ Error fetching works:", err))
            .finally(() => setLoading(false));
    }, [supervisorId, setTasks]);

    // Fetch Today's Works
    useEffect(() => {
        if (!supervisorId) return;
        fetch(`http://localhost:3000/works/supervisor/${supervisorId}/today`)
            .then(res => res.json())
            .then(data => {
                const works = Array.isArray(data) ? data : (data.works || []);
                setTodayWorks(works);
            })
            .catch(err => console.error("❌ Error fetching today works:", err));
    }, [supervisorId]);

    // Get Supervisor Info
    useEffect(() => {
        try {
            const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                setSupervisorName(user.name || user.username || "");
            }
        } catch (_) { }
    }, []);

    // Fetch Technicians
    useEffect(() => {
        fetch("http://localhost:3000/technicians")
            .then(res => res.json())
            .then(data => setTechnicians(data.technicians || data || []))
            .catch(err => console.error("Error fetching technicians:", err));
    }, []);

    const handleTechToggle = (techName) => {
        setAssignTechs(prev =>
            prev.includes(techName)
                ? prev.filter(name => name !== techName)
                : [...prev, techName]
        );
    };

    const currentMapLocation = useMemo(() => {
        if (selectedWork?.location?.lat) {
            return {
                lat: selectedWork.location.lat,
                lng: selectedWork.location.lng,
                name: selectedWork.namework,
                tech: selectedWork.technicianName || "กำลังเลือกช่าง..."
            };
        }
        const activeWork = tasks.find(w => w.location?.lat);
        if (activeWork) {
            return {
                lat: activeWork.location.lat,
                lng: activeWork.location.lng,
                name: activeWork.namework,
                tech: activeWork.technicianName || "-"
            };
        }
        return { lat: 13.7563, lng: 100.5018, name: "Main Office", tech: "-" };
    }, [tasks, selectedWork]);

    return (
        <div className="container-fluid py-4" style={{ marginLeft: "14rem", backgroundColor: "#f4f4f5", minHeight: "100vh" }}>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>Leader Dashboard</h2>
                    <small className="text-muted">
                        {supervisorName && <span className="me-2">👤 {supervisorName}</span>}
                        {supervisorId
                            ? <span className="badge bg-primary bg-opacity-10 text-primary">ID: {supervisorId}</span>
                            : <span className="badge bg-danger bg-opacity-10 text-danger">⚠️ ไม่พบ supervisor_id กรุณา login ใหม่</span>
                        }
                    </small>
                </div>
                <div className="glass-card px-3 py-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
                    <div className="position-relative">
                        <i className="bi bi-bell-fill" style={{ fontSize: "22px", color: "#4a4eb7" }}></i>
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
                </div>
            ) : (
                <>
                    {/* SUMMARY CARDS */}
                    <div className="row g-4 mb-5">
                        {[
                            { title: "งานวันนี้", count: todayWorks.length, color: "#4a6ff0", icon: "bi-calendar-check" },
                            { title: "รอจ่ายงาน", count: tasks.filter(w => w.status === "Pending" || w.status === "รอดำเนินการ").length, color: "#f39c12", icon: "bi-hourglass-split" },
                            { title: "รอตรวจงาน", count: tasks.filter(w => w.status === "PendingInspection").length, color: "#dc3545", icon: "bi-search" },
                            { title: "กำลังดำเนินการ", count: tasks.filter(w => w.status === "Assigned" || w.status === "มอบหมายแล้ว").length, color: "#00c0ef", icon: "bi-tools" },
                        ].map((item, i) => (
                            <div className="col-12 col-md-3" key={i}>
                                <div className="glass-card hover-lift p-4 h-100 position-relative overflow-hidden">
                                    <div className="d-flex justify-content-between align-items-start z-1 position-relative">
                                        <div>
                                            <p className="text-muted mb-1 fw-medium">{item.title}</p>
                                            <h2 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>{item.count}</h2>
                                        </div>
                                        <div className="rounded-4 d-flex align-items-center justify-content-center"
                                            style={{ width: "50px", height: "50px", background: `${item.color}20`, color: item.color }}>
                                            <i className={`bi ${item.icon}`} style={{ fontSize: "24px" }}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* MAIN ACTIONS */}
                    <div className="row g-4 mb-5">
                        <div className="col-6">
                            <div className="glass-card hover-lift p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center"
                                style={{ cursor: "pointer", borderBottom: "5px solid #4a4eb7" }}
                                onClick={goCheckWork}>
                                <div className="mb-3 p-3 rounded-circle bg-light">
                                    <i className="bi bi-clipboard-check-fill" style={{ fontSize: 40, color: "#4a4eb7" }}></i>
                                </div>
                                <h4 className="fw-bold mb-1">ตรวจงาน</h4>
                                <small className="text-muted">อนุมัติและตรวจสอบงานช่าง</small>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="glass-card hover-lift p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center"
                                style={{ cursor: "pointer", borderBottom: "5px solid #ff5a5a" }}
                                onClick={goReport}>
                                <div className="mb-3 p-3 rounded-circle bg-light">
                                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 40, color: "#ff5a5a" }}></i>
                                </div>
                                <h4 className="fw-bold mb-1">รายงานปัญหา</h4>
                                <small className="text-muted">ดูรายการแจ้งปัญหาและข้อร้องเรียน</small>
                            </div>
                        </div>
                    </div>

                    {/* WORK ASSIGNMENT SECTION */}
                    <div className="row g-4 mb-5">
                        <div className="col-lg-7">
                            <div className="glass-card p-4 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold m-0" style={{ color: "#4a4eb7" }}>
                                        <i className="bi bi-list-task me-2"></i>รายการงานทั้งหมด
                                    </h5>
                                    <span className="badge bg-light text-dark border">{tasks.length} งาน</span>
                                </div>
                                <div style={{ height: "500px", overflowY: "auto" }}>
                                    {tasks.length > 0 ? (
                                        <ul className="list-group border-0">
                                            {tasks.map(task => (
                                                <li key={task.id}
                                                    className={`list-group-item border-0 rounded-3 mb-2 px-3 py-3 shadow-sm work-item ${selectedWork?.id === task.id ? 'active' : ''}`}
                                                    style={{ cursor: "pointer", backgroundColor: "#fff" }}
                                                    onClick={() => { setSelectedWork(task); setAssignTechs([]); }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <div className="fw-bold text-dark">{task.namework}</div>
                                                        <span className={`badge rounded-pill ${getStatusBadge(task.status)}`}>{task.status}</span>
                                                    </div>
                                                    <small className="text-muted d-block text-truncate">{task.detail}</small>
                                                    <div className="d-flex gap-3 mt-1">
                                                        {task.customer_name && (
                                                            <small className="text-muted">
                                                                <i className="bi bi-person me-1"></i>{task.customer_name}
                                                            </small>
                                                        )}
                                                        {task.start_date && (
                                                            <small className="text-muted">
                                                                <i className="bi bi-calendar3 me-1"></i>
                                                                {new Date(task.start_date).toLocaleDateString('th-TH')}
                                                            </small>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center text-muted mt-5 py-5">
                                            <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                                            <p>ไม่มีงานที่ได้รับมอบหมาย</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="glass-card p-4 h-100 d-flex flex-column">
                                <h5 className="fw-bold mb-4" style={{ color: "#4a4eb7" }}>
                                    <i className="bi bi-card-text me-2"></i>รายละเอียดงาน
                                </h5>
                                {selectedWork ? (
                                    <div className="d-flex flex-column h-100">
                                        <div className="flex-grow-1">
                                            <h5 className="fw-bold mb-3">{selectedWork.namework}</h5>
                                            <div className="row g-3 mb-4">
                                                <div className="col-6">
                                                    <small className="text-muted d-block">ลูกค้า</small>
                                                    <span className="fw-medium">{selectedWork.customer_name || "-"}</span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">ประเภทงาน</small>
                                                    <span className="fw-medium">{selectedWork.typework || "-"}</span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">วันที่</small>
                                                    <span className="fw-medium">
                                                        {selectedWork.start_date
                                                            ? new Date(selectedWork.start_date).toLocaleDateString('th-TH')
                                                            : "-"}
                                                    </span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">เวลา</small>
                                                    <span className="fw-medium">{selectedWork.time || "-"}</span>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted d-block">สถานที่</small>
                                                    <span className="fw-medium">
                                                        <i className="bi bi-geo-alt me-1 text-danger"></i>
                                                        {selectedWork.role || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-muted">มอบหมายช่าง</label>
                                                <div className="border rounded-3 p-2 bg-white" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {technicians.map(emp => (
                                                        <div key={emp.technician_id || emp.id} className="form-check mb-2">
                                                            <input className="form-check-input" type="checkbox" id={`tech-${emp.technician_id || emp.id}`}
                                                                checked={assignTechs.includes(emp.name)}
                                                                onChange={() => handleTechToggle(emp.name)}
                                                                disabled={emp.status === "ลา"} />
                                                            <label className="form-check-label" htmlFor={`tech-${emp.technician_id || emp.id}`}
                                                                style={{ color: emp.status === "ลา" ? "#dc3545" : "#212529" }}>
                                                                {emp.name} {emp.nickname ? `(${emp.nickname})` : ""}
                                                                <small className="text-muted ms-2">- {emp.type || emp.typework} {emp.status === "ลา" ? "(ลา)" : ""}</small>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="w-100 btn-gradient fw-bold mt-auto py-2"
                                            disabled={assignTechs.length === 0}
                                            onClick={() => {
                                                const updatedTasks = tasks.map(t => t.id === selectedWork.id ?
                                                    { ...t, technicianName: assignTechs.join(", "), status: "Assigned" } : t);
                                                setTasks(updatedTasks);
                                                alert("มอบหมายงานเรียบร้อยแล้ว");
                                                setAssignTechs([]);
                                                setSelectedWork(null);
                                            }}>
                                            ยืนยันส่งงาน
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted my-auto opacity-50">
                                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                        <p>เลือกงานเพื่อดูรายละเอียด</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MAP SECTION */}
                    <div className="col-12">
                        <div className="glass-card p-4 mb-5">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h5 className="fw-bold m-0" style={{ color: "#4a4eb7" }}>
                                        <i className="bi bi-geo-alt-fill me-2 text-danger"></i>ตำแหน่งงาน
                                    </h5>
                                    <div className="mt-1">
                                        <small className="text-muted"><i className="bi bi-pin-map me-1"></i>สถานที่: {currentMapLocation.name}</small>
                                        <small className="text-muted ms-3"><i className="bi bi-person me-1"></i>ผู้รับผิดชอบ: {currentMapLocation.tech}</small>
                                    </div>
                                </div>
                                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                                    <i className="bi bi-circle-fill small me-2"></i>Live Location
                                </span>
                            </div>
                            <div className="rounded-4 overflow-hidden border">
                                <iframe title="Location Map" width="100%" height="450" style={{ border: 0 }} loading="lazy"
                                    src={`https://maps.google.com/maps?q=${currentMapLocation.lat},${currentMapLocation.lng}&hl=th&z=15&output=embed`} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LeaderDashboard;
