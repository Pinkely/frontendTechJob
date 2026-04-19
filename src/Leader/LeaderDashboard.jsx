import React, { useState, useEffect, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, CartesianGrid
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600&display=swap');
  
  body { font-family: 'Prompt', sans-serif; background-color: #f4f4f5; }

  .glass-card {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .hover-lift:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-color: #d1d5db;
  }
  .work-item {
    transition: background-color 0.2s ease;
    border-radius: 6px;
    border: 1px solid transparent;
  }
  .work-item:hover { 
    background-color: #f9fafb !important; 
    border-color: #e5e7eb;
  }
  .work-item.active {
    background-color: #f8fafc !important;
    border: 1px solid #cbd5e1;
  }
  .btn-gradient {
  .btn-gradient {
    background: #18181b;
    border: 1px solid #18181b;
    color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    font-weight: 500;
    border-radius: 6px;
  }
  .btn-gradient:hover {
    background: #27272a;
    border-color: #27272a;
    color: white;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
`;

// ======================================================
// ดึง supervisor_id จาก localStorage/sessionStorage
// รองรับทุกรูปแบบที่ backend อาจส่งมาตอน login
// ======================================================
const getSupervisorId = () => {
    try {
        // รูปแบบ 1: เก็บเป็น JSON object ชื่อ "user"
        // { supervisor_id: 1, username: "supervisor01", ... }
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.supervisor_id) return Number(user.supervisor_id);
            if (user.id) return Number(user.id);
        }

        // รูปแบบ 2: เก็บ token แล้ว decode (ถ้าใช้ JWT)
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.supervisor_id) return Number(payload.supervisor_id);
            if (payload.id) return Number(payload.id);
        }

        // รูปแบบ 3: เก็บ key แยก
        const sid = localStorage.getItem("supervisor_id") || sessionStorage.getItem("supervisor_id");
        if (sid) return Number(sid);

        // รูปแบบ 4: เก็บเป็น JSON object ชื่อ "supervisor"
        const supStr = localStorage.getItem("supervisor") || sessionStorage.getItem("supervisor");
        if (supStr) {
            const sup = JSON.parse(supStr);
            if (sup.supervisor_id) return Number(sup.supervisor_id);
            if (sup.id) return Number(sup.id);
        }
    } catch (e) {
        console.error("getSupervisorId error:", e);
    }
    return null;
};

// ======================================================
// แสดง badge สี ตาม status จาก DB
// ======================================================
const getStatusBadge = (status) => {
    switch (status) {
        case 'มอบหมายแล้ว':
        case 'Assigned': return 'bg-primary text-white';
        case 'รอดำเนินการ':
        case 'Pending': return 'bg-warning text-dark';
        case 'กำลังดำเนินการ': return 'bg-info text-dark';
        case 'เสร็จสิ้น':
        case 'Completed': return 'bg-success text-white';
        case 'PendingInspection': return 'bg-info text-dark';
        default: return 'bg-secondary text-white';
    }
};

// ======================================================
// COMPONENT
// ======================================================
const LeaderDashboard = ({ tasks: propTasks, setTasks: setPropTasks }) => {
    const [tasks, setTasks] = useState([]);
    const [todayWorks, setTodayWorks] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedWork, setSelectedWork] = useState(null);
    const [assignTechs, setAssignTechs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [supervisorName, setSupervisorName] = useState("");

    // ดึง supervisor_id ณ ตอน render ครั้งแรก
    const supervisorId = useMemo(() => getSupervisorId(), []);

    const navigate = useNavigate();
    const goCheckWork = () => navigate("/leader-work");
    const goReport = () => navigate("/leader-report");

    // ===================================================
    // Fetch งานทั้งหมดของ supervisor นี้
    // GET /works/supervisor/:id
    // ===================================================
    useEffect(() => {
        if (!supervisorId) {
            console.warn("⚠️ ไม่พบ supervisor_id — ตรวจสอบว่า login แล้วเก็บข้อมูลใน localStorage หรือยัง");
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`http://192.168.1.93:3000/works/supervisor/${supervisorId}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                // workController คืน { message: 'Ok', works: [...] }
                const works = Array.isArray(data) ? data : (data.works || []);

                // Map ชื่อ field DB → ชื่อที่ component ใช้
                const mapped = works.map(w => ({
                    id: w.work_id,
                    namework: w.job_name,
                    customer_name: w.customer_name,
                    typework: w.job_type,
                    detail: w.job_detail,
                    role: w.location,
                    time: w.work_time,
                    start_date: w.start_date,
                    status: w.status || "รอดำเนินการ",
                    technicianName: w.technicianName || null,
                    supervisor_id: w.supervisor_id,
                    location: (w.lat && w.lng) ? { lat: w.lat, lng: w.lng } : null,
                }));

                setTasks(mapped);
                if (setPropTasks) setPropTasks(mapped);
            })
            .catch(err => console.error("❌ Error fetching works:", err))
            .finally(() => setLoading(false));
    }, [supervisorId]);

    // ===================================================
    // Fetch งานวันนี้ของ supervisor
    // GET /works/supervisor/:id/today  → นับ "งานวันนี้"
    // ===================================================
    useEffect(() => {
        if (!supervisorId) return;
        fetch(`http://192.168.1.93:3000/works/supervisor/${supervisorId}/today`)
            .then(res => res.json())
            .then(data => {
                const works = Array.isArray(data) ? data : (data.works || []);
                setTodayWorks(works);
            })
            .catch(err => console.error("❌ Error fetching today works:", err));
    }, [supervisorId]);

    // ===================================================
    // Fetch ชื่อ supervisor เพื่อแสดงใน header
    // ===================================================
    useEffect(() => {
        try {
            const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                setSupervisorName(user.name || user.username || "");
            }
        } catch (_) { }
    }, []);

    // ===================================================
    // Fetch ช่าง
    // ===================================================
    useEffect(() => {
        fetch("http://192.168.1.93:3000/technicians")
            .then(res => res.json())
            .then(data => setTechnicians(data.technicians || data || []))
            .catch(err => console.error("Error fetching technicians:", err));
    }, []);

    // Toggle เลือกช่าง
    const handleTechToggle = (techName) => {
        setAssignTechs(prev =>
            prev.includes(techName)
                ? prev.filter(n => n !== techName)
                : [...prev, techName]
        );
    };

    // ===================================================
    // Summary Counts
    // ===================================================
    const todayCount = todayWorks.length;
    const pendingCount = tasks.filter(w => w.status === "รอดำเนินการ" || w.status === "Pending").length;
    const inspectCount = tasks.filter(w => w.status === "PendingInspection").length;
    const inProgressCount = tasks.filter(w =>
        w.status === "มอบหมายแล้ว" || w.status === "Assigned" || w.status === "กำลังดำเนินการ"
    ).length;

    // ===================================================
    // Map Location (ใช้งานที่เลือกอยู่ หรืองานล่าสุด)
    // ===================================================
    const currentMapLocation = useMemo(() => {
        const src = selectedWork || tasks.find(w => w.location?.lat);
        if (src?.location?.lat) {
            return { lat: src.location.lat, lng: src.location.lng, name: src.namework, tech: src.technicianName || "-" };
        }
        return { lat: 13.7563, lng: 100.5018, name: "Main Office", tech: "-" };
    }, [tasks, selectedWork]);

    // ===================================================
    // RENDER
    // ===================================================
    return (
        <div style={{ width: "100%", padding: "30px 50px", marginLeft: "14rem", minHeight: "100vh", backgroundColor: "#f4f4f5" }}>
            <style>{styles}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>Leader Dashboard</h2>
                    <small className="text-muted">
                        {supervisorName && <span className="me-2">👤 {supervisorName}</span>}
                        {supervisorId
                            ? <span className="badge bg-primary bg-opacity-10 text-primary">Supervisor ID: {supervisorId}</span>
                            : <span className="badge bg-danger bg-opacity-10 text-danger">⚠️ ไม่พบ supervisor_id กรุณา login ใหม่</span>
                        }
                    </small>
                </div>
                <div className="glass-card px-3 py-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
                    <div className="position-relative">
                        <i className="bi bi-bell-fill" style={{ fontSize: "22px", color: "#18181b" }}></i>
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <span className="visually-hidden">New alerts</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* LOADING */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p className="text-muted">กำลังโหลดข้อมูลงาน...</p>
                </div>
            ) : (
                <>
                    {/* ไม่พบ supervisor_id */}
                    {!supervisorId && (
                        <div className="alert alert-danger rounded-3 mb-4">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            ไม่พบข้อมูล supervisor กรุณา <strong>login ใหม่</strong> แล้วลองอีกครั้ง
                        </div>
                    )}

                    {/* SUMMARY CARDS */}
                    <div className="row g-4 mb-5">
                        {[
                            {
                                title: "งานวันนี้",
                                count: todayCount,       // ← นับจาก DB start_date = วันนี้
                                color: "#4a6ff0",
                                icon: "bi-calendar-check",
                                sub: `start_date = วันนี้`
                            },
                            {
                                title: "รอจ่ายงาน",
                                count: pendingCount,
                                color: "#f39c12",
                                icon: "bi-hourglass-split",
                                sub: "สถานะ: รอดำเนินการ"
                            },
                            {
                                title: "รอตรวจงาน",
                                count: inspectCount,
                                color: "#dc3545",
                                icon: "bi-search",
                                sub: "สถานะ: PendingInspection"
                            },
                            {
                                title: "กำลังดำเนินการ",
                                count: inProgressCount,
                                color: "#00c0ef",
                                icon: "bi-tools",
                                sub: "สถานะ: มอบหมายแล้ว"
                            },
                        ].map((item, i) => (
                            <div className="col-12 col-md-3" key={i}>
                                <div className="glass-card hover-lift p-4 h-100 position-relative overflow-hidden">
                                    <div className="d-flex justify-content-between align-items-start z-1 position-relative">
                                        <div>
                                            <p className="text-muted mb-1 fw-medium">{item.title}</p>
                                            <h2 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>{item.count}</h2>
                                            <small className="text-muted" style={{ fontSize: "0.72rem" }}>{item.sub}</small>
                                        </div>
                                        <div className="rounded-4 d-flex align-items-center justify-content-center"
                                            style={{ width: "50px", height: "50px", background: `${item.color}20`, color: item.color }}>
                                            <i className={`bi ${item.icon}`} style={{ fontSize: "24px" }}></i>
                                        </div>
                                    </div>
                                    <div className="position-absolute"
                                        style={{ width: "100px", height: "100px", background: item.color, borderRadius: "50%", opacity: "0.05", right: "-20px", bottom: "-20px" }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* MAIN ACTIONS */}
                    <div className="row g-4 mb-5">
                        <div className="col-6">
                            <div className="glass-card hover-lift p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center"
                                style={{ cursor: "pointer", borderBottom: "5px solid #18181b" }}
                                onClick={goCheckWork}>
                                <div className="mb-3 p-3 rounded-circle bg-light">
                                    <i className="bi bi-clipboard-check-fill" style={{ fontSize: 40, color: "#18181b" }}></i>
                                </div>
                                <h4 className="fw-bold mb-1">ตรวจงาน</h4>
                                <small className="text-muted">อนุมัติและตรวจสอบงานช่าง</small>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="glass-card hover-lift p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center"
                                style={{ cursor: "pointer", borderBottom: "5px solid #18181b" }}
                                onClick={goReport}>
                                <div className="mb-3 p-3 rounded-circle bg-light">
                                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 40, color: "#18181b" }}></i>
                                </div>
                                <h4 className="fw-bold mb-1">รายงานปัญหา</h4>
                                <small className="text-muted">ดูรายการแจ้งปัญหาและข้อร้องเรียน</small>
                            </div>
                        </div>
                    </div>

                    {/* WORK LIST + DETAIL */}
                    <div className="row g-4 mb-5">

                        {/* รายการงานทั้งหมด */}
                        <div className="col-lg-7">
                            <div className="glass-card p-4 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold m-0" style={{ color: "#18181b" }}>
                                        <i className="bi bi-list-task me-2"></i>รายการงานทั้งหมด
                                    </h5>
                                    <span className="badge bg-light text-dark border">{tasks.length} งาน</span>
                                </div>

                                <div style={{ height: "500px", overflowY: "auto", paddingRight: "5px" }}>
                                    {tasks.length > 0 ? (
                                        <ul className="list-group border-0">
                                            {tasks.map(task => (
                                                <li key={task.id}
                                                    className={`list-group-item border-0 rounded-3 mb-2 px-3 py-3 shadow-sm work-item ${selectedWork?.id === task.id ? 'active' : ''}`}
                                                    style={{ cursor: "pointer", backgroundColor: "#fff" }}
                                                    onClick={() => { setSelectedWork(task); setAssignTechs([]); }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <div className="fw-bold text-dark">{task.namework}</div>
                                                        <span className={`badge rounded-pill ${getStatusBadge(task.status)}`}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                    <small className="text-muted d-block text-truncate">{task.detail}</small>
                                                    <div className="d-flex gap-3 mt-1">
                                                        <small className="text-muted">
                                                            <i className="bi bi-person me-1"></i>{task.customer_name}
                                                        </small>
                                                        {task.start_date && (
                                                            <small className="text-muted">
                                                                <i className="bi bi-calendar3 me-1"></i>
                                                                {new Date(task.start_date).toLocaleDateString('th-TH')}
                                                            </small>
                                                        )}
                                                        {task.time && (
                                                            <small className="text-muted">
                                                                <i className="bi bi-clock me-1"></i>{task.time}
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
                                            {supervisorId && (
                                                <small>supervisor_id: {supervisorId}</small>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* รายละเอียดงาน + มอบหมายช่าง */}
                        <div className="col-lg-5">
                            <div className="glass-card p-4 h-100 d-flex flex-column">
                                <h5 className="fw-bold mb-4" style={{ color: "#18181b" }}>
                                    <i className="bi bi-card-text me-2"></i>รายละเอียดงาน
                                </h5>

                                {selectedWork ? (
                                    <div className="d-flex flex-column h-100">
                                        <div className="flex-grow-1">
                                            {/* ข้อมูลงาน */}
                                            <div className="mb-4">
                                                <h5 className="fw-bold mb-3">{selectedWork.namework}</h5>
                                                <div className="row g-3">
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
                                                <div className="mt-3 p-3 bg-light rounded-3 border">
                                                    <small className="text-muted fw-bold">รายละเอียด:</small>
                                                    <p className="mb-0 mt-1 small text-secondary">{selectedWork.detail || "-"}</p>
                                                </div>
                                            </div>

                                            <hr className="my-3 opacity-25" />

                                            {/* เลือกช่าง */}
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-uppercase text-muted">
                                                    มอบหมายช่าง (เลือกได้หลายคน)
                                                </label>
                                                <div className="border rounded-3 p-2 bg-white shadow-sm" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                                    {technicians.length > 0 ? technicians.map(emp => (
                                                        <div key={emp.id || emp.technician_id} className="form-check mb-2">
                                                            <input
                                                                className="form-check-input shadow-none"
                                                                type="checkbox"
                                                                id={`tech-${emp.id || emp.technician_id}`}
                                                                value={emp.name}
                                                                checked={assignTechs.includes(emp.name)}
                                                                onChange={() => handleTechToggle(emp.name)}
                                                                disabled={emp.status === "ลา"}
                                                                style={{ cursor: emp.status === "ลา" ? "not-allowed" : "pointer" }}
                                                            />
                                                            <label
                                                                className="form-check-label w-100"
                                                                htmlFor={`tech-${emp.id || emp.technician_id}`}
                                                                style={{ color: emp.status === "ลา" ? "#dc3545" : "#212529", cursor: emp.status === "ลา" ? "not-allowed" : "pointer" }}
                                                            >
                                                                {emp.name} {emp.nickname ? `(${emp.nickname})` : ''}
                                                                <span className="text-muted ms-1" style={{ fontSize: '0.85em' }}>
                                                                    — {emp.typework || emp.type || ''} {emp.status === "ลา" ? '(ลา)' : ''}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    )) : (
                                                        <p className="text-muted small p-2 mb-0">ไม่มีข้อมูลช่าง</p>
                                                    )}
                                                </div>
                                            </div>

                                            {assignTechs.length > 0 && (
                                                <div className="alert alert-primary border-0 bg-primary bg-opacity-10 py-2 px-3 mb-3 small rounded-3">
                                                    <div className="d-flex align-items-center mb-1">
                                                        <i className="bi bi-people-fill me-2 text-primary"></i>
                                                        <span className="fw-bold text-primary">ทีมช่างที่เลือก ({assignTechs.length} คน)</span>
                                                    </div>
                                                    {assignTechs.map(name => {
                                                        const tech = technicians.find(e => e.name === name);
                                                        return (
                                                            <div key={name} className="ps-3 text-dark">
                                                                • {name} <span className="text-muted">({tech?.typework || tech?.type || 'ไม่ระบุ'})</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            disabled={assignTechs.length === 0}
                                            onClick={() => {
                                                const updated = tasks.map(t =>
                                                    t.id === selectedWork.id
                                                        ? { ...t, technicianName: assignTechs.join(", "), status: "มอบหมายแล้ว" }
                                                        : t
                                                );
                                                setTasks(updated);
                                                if (setPropTasks) setPropTasks(updated);
                                                alert(`มอบหมายงาน "${selectedWork.namework}" ให้ช่าง ${assignTechs.length} คน เรียบร้อยแล้ว`);
                                                setAssignTechs([]);
                                                setSelectedWork(null);
                                            }}
                                            className="w-100 rounded-3 py-2 btn-gradient fw-bold mt-auto"
                                        >
                                            <i className="bi bi-send-check-fill me-2"></i>ยืนยันส่งงาน
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted my-auto opacity-50">
                                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                        <p>กรุณาเลือกงานจากรายการด้านซ้าย<br />เพื่อดูรายละเอียด</p>
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
                                    <h5 className="fw-bold m-0" style={{ color: "#18181b" }}>
                                        <i className="bi bi-geo-alt-fill me-2 text-danger"></i>ติดตามตำแหน่งงาน
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
                            <div className="rounded-4 overflow-hidden shadow-sm border bg-light">
                                <iframe
                                    title="Location Map"
                                    width="100%"
                                    height="500"
                                    style={{ border: 0, display: 'block' }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://maps.google.com/maps?q=${currentMapLocation.lat},${currentMapLocation.lng}&hl=th&z=15&output=embed`}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LeaderDashboard;