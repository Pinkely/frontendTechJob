import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Search, Briefcase, ChevronRight, X, MapPin, Users,
    ShieldCheck, Wrench, Mail, Phone, Building, ArrowLeft,
    Calendar, FileText, Filter, List
} from 'lucide-react';

const ManagerAccount = () => {
    const [employees, setEmployees] = useState([]);
    const [allWorkHistory, setAllWorkHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedJobDetail, setSelectedJobDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    const [historyYear, setHistoryYear] = useState('ทั้งหมด');
    const [historyMonth, setHistoryMonth] = useState('ทั้งหมด');
    const [historyLimit, setHistoryLimit] = useState('ทั้งหมด');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://172.26.48.124:3000/api/manager/employees?t=${new Date().getTime()}`);

                console.log("Data from API:", res.data?.workHistory);

                setEmployees(res.data?.employees || []);
                setAllWorkHistory(res.data?.workHistory || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setEmployees([]);
                setAllWorkHistory([]);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredEmployees = useMemo(() => {
        if (!employees || !Array.isArray(employees)) return [];
        return employees.filter(emp => {
            const matchesSearch = (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (emp.nickname || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === 'all' || emp.role === selectedRole;
            return matchesSearch && matchesRole;
        });
    }, [searchTerm, selectedRole, employees]);

    const handleSelectEmployee = (emp) => {
        let history = [];

        // 🌟 กรองข้อมูลประวัติงานตาม Role อย่างถูกต้อง
        if (emp.role === 'admin') {
            history = []; // Admin ไม่ดึงประวัติงาน
        } else if (emp.role === 'supervisor') {
            const uniqueWorks = new Map();
            allWorkHistory.forEach(h => {
                if (Number(h.supervisor_id) === Number(emp.user_id)) {
                    uniqueWorks.set(h.work_id, h);
                }
            });
            history = Array.from(uniqueWorks.values()); // Supervisor ดูเฉพาะงานที่คุม
        } else {
            history = allWorkHistory.filter(h => Number(h.technician_id) === Number(emp.user_id)); // Technician ดึงตามช่าง
        }

        const formattedHistory = history.map(h => ({
            id: h.work_id,
            jobTitle: h.job_name,
            location: h.location || 'ไม่ระบุ',
            date: h.start_date ? new Date(h.start_date).toLocaleDateString('th-TH') : '-',
            fullData: h
        }));

        setSelectedEmployee({ ...emp, jobHistory: formattedHistory });
        setSelectedJobDetail(null);
        setHistoryYear('ทั้งหมด');
        setHistoryMonth('ทั้งหมด');
        setHistoryLimit('ทั้งหมด');
    };

    const filteredHistory = useMemo(() => {
        if (!selectedEmployee) return [];
        let results = selectedEmployee.jobHistory.filter(job => {
            const dateStr = job.fullData.start_date || job.fullData.created_at;
            let matchYear = true;
            let matchMonth = true;

            if (dateStr) {
                const itemDate = new Date(dateStr);
                const y = itemDate.getFullYear().toString();
                const m = (itemDate.getMonth() + 1).toString();
                if (historyYear !== 'ทั้งหมด') matchYear = y === historyYear;
                if (historyMonth !== 'ทั้งหมด') matchMonth = m === historyMonth;
            } else {
                if (historyYear !== 'ทั้งหมด' || historyMonth !== 'ทั้งหมด') {
                    matchYear = false; matchMonth = false;
                }
            }
            return matchYear && matchMonth;
        });

        if (historyLimit !== 'ทั้งหมด') {
            results = results.slice(0, Number(historyLimit));
        }
        return results;
    }, [selectedEmployee, historyYear, historyMonth, historyLimit]);

    const availableHistoryYears = useMemo(() => {
        if (!selectedEmployee) return [];
        return [...new Set(selectedEmployee.jobHistory.map(job => {
            const d = job.fullData.start_date || job.fullData.created_at;
            return d ? new Date(d).getFullYear().toString() : null;
        }).filter(Boolean))].sort((a, b) => b - a);
    }, [selectedEmployee]);

    const getStatusBadge = (status) => {
        const styles = {
            'รอดำเนินการ': 'bg-secondary text-white',
            'มอบหมายแล้ว': 'bg-info text-dark',
            'กำลังดำเนินการ': 'bg-primary text-white',
            'รอตรวจงาน': 'bg-warning text-dark',
            'เสร็จสิ้น': 'bg-success text-white',
            'ส่งกลับแก้ไข': 'bg-danger text-white'
        };
        return styles[status] || 'bg-light text-dark border';
    };

    if (loading) return <div className="p-5 ml-56">กำลังโหลดข้อมูลพนักงาน...</div>;

    return (
        <div style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }} className="bg-light min-vh-100 p-5 font-sans">
            <div className="mb-5">
                <h2 className="fw-bold text-dark mb-4">จัดการบัญชีบุคลากร</h2>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                    <div className="position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input type="text" placeholder="ค้นหาชื่อ หรือชื่อเล่น..." className="form-control ps-5 py-2 rounded-3 border-0 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="bg-white p-1 rounded-3 shadow-sm d-flex gap-1">
                        {[{ id: 'all', label: 'ทั้งหมด', icon: <Users size={16} /> }, { id: 'admin', label: 'Admin', icon: <ShieldCheck size={16} /> }, { id: 'supervisor', label: 'Supervisor', icon: <Briefcase size={16} /> }, { id: 'technician', label: 'Technician', icon: <Wrench size={16} /> }].map((role) => (
                            <button key={role.id} onClick={() => setSelectedRole(role.id)} className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 border-0 transition-all ${selectedRole === role.id ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'}`}>
                                {role.icon} {role.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                        <div key={emp.user_id} className="col-12 col-md-4 col-xl-3">
                            <div className="card h-100 border-0 shadow-sm p-4 hover-shadow transition-all bg-white rounded-4" style={{ cursor: 'pointer' }} onClick={() => handleSelectEmployee(emp)}>
                                <div className="text-center">
                                    <div className={`rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white shadow-sm`} style={{ width: 70, height: 70, fontSize: 24, backgroundColor: emp.role === 'admin' ? '#ef4444' : emp.role === 'supervisor' ? '#3b82f6' : '#10b981' }}>
                                        {emp.name ? emp.name.charAt(0) : '?'}
                                    </div>
                                    <h6 className="fw-bold mb-1 text-dark">{emp.name} {emp.nickname ? `(${emp.nickname})` : ''}</h6>
                                    <div className="badge bg-light text-muted border mb-3 text-uppercase" style={{ fontSize: '10px' }}>{emp.role}</div>
                                    <div className="text-primary small fw-bold d-flex align-items-center justify-content-center gap-1">ดูรายละเอียด <ChevronRight size={14} /></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5"><p className="text-muted">ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไข</p></div>
                )}
            </div>

            {selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 d-flex align-items-center justify-content-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, backdropFilter: 'blur(2px)' }}>
                    <div className="bg-white rounded-4 shadow-lg w-100 max-w-3xl overflow-hidden animate-in position-relative">

                        {selectedJobDetail ? (
                            <>
                                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                                    <div className="d-flex align-items-center gap-3">
                                        <button onClick={() => setSelectedJobDetail(null)} className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center hover-bg-gray"><ArrowLeft size={20} /></button>
                                        <div><h5 className="mb-0 fw-bold">รายละเอียดงาน #{selectedJobDetail.work_id}</h5><span className="text-muted small">ผู้รับผิดชอบ: {selectedEmployee.name}</span></div>
                                    </div>
                                    <button onClick={() => { setSelectedJobDetail(null); setSelectedEmployee(null); }} className="btn btn-light rounded-circle p-2"><X size={20} /></button>
                                </div>
                                <div className="p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                                    <h4 className="fw-bold text-dark mb-3">{selectedJobDetail.job_name}</h4>
                                    <div className="row g-3 mb-4">
                                        <InfoCard icon={<Building size={18} />} color="primary" label="ลูกค้า" value={selectedJobDetail.customer_name || '-'} />
                                        <InfoCard icon={<MapPin size={18} />} color="danger" label="สถานที่" value={selectedJobDetail.location || '-'} />
                                        <InfoCard icon={<Calendar size={18} />} color="success" label="วันที่เริ่มงาน" value={selectedJobDetail.start_date ? new Date(selectedJobDetail.start_date).toLocaleDateString('th-TH') : '-'} />
                                    </div>
                                    <div className="p-4 bg-light rounded-3 border">
                                        <h6 className="fw-bold mb-2 d-flex align-items-center gap-2 text-dark"><FileText size={16} /> รายละเอียดและปัญหาที่แจ้ง</h6>
                                        <p className="text-muted mb-0">{selectedJobDetail.job_detail || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                                    <div><h5 className="mb-0 fw-bold">ข้อมูลบุคลากร</h5></div>
                                    <button onClick={() => setSelectedEmployee(null)} className="btn btn-light rounded-circle p-2"><X size={20} /></button>
                                </div>
                                <div className="p-4 overflow-auto" style={{ maxHeight: '70vh' }}>

                                    {/* 🌟 กู้คืนข้อมูลพนักงานที่หายไปกลับมาตรงนี้ครับ */}
                                    <div className="d-flex flex-column flex-sm-row gap-4 align-items-center align-items-sm-start mb-4 p-4 bg-light rounded-4 border">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0" style={{ width: 80, height: 80, fontSize: 32, backgroundColor: selectedEmployee.role === 'admin' ? '#ef4444' : selectedEmployee.role === 'supervisor' ? '#3b82f6' : '#10b981' }}>
                                            {selectedEmployee.name ? selectedEmployee.name.charAt(0) : '?'}
                                        </div>
                                        <div className="flex-grow-1 text-center text-sm-start">
                                            <h4 className="fw-bold mb-1">{selectedEmployee.name} {selectedEmployee.nickname ? `(${selectedEmployee.nickname})` : ''}</h4>
                                            <div className="d-flex gap-2 flex-wrap justify-content-center justify-content-sm-start mb-3">
                                                <span className="badge bg-primary text-white px-3 py-2 rounded-pill">{selectedEmployee.role}</span>
                                                {selectedEmployee.type && <span className="badge bg-info text-dark px-3 py-2 rounded-pill">{selectedEmployee.type}</span>}
                                                <span className={`badge px-3 py-2 rounded-pill ${selectedEmployee.status === 'ว่าง' ? 'bg-success' : selectedEmployee.status === 'มีงาน' ? 'bg-warning text-dark' : 'bg-secondary'}`}>สถานะ: {selectedEmployee.status || 'ว่าง'}</span>
                                            </div>
                                            <div className="d-flex flex-wrap gap-3 text-muted small justify-content-center justify-content-sm-start">
                                                <div className="d-flex align-items-center gap-1"><Mail size={14} /> {selectedEmployee.email || '-'}</div>
                                                <div className="d-flex align-items-center gap-1"><Phone size={14} /> {selectedEmployee.phone || '-'}</div>
                                                {selectedEmployee.department && <div className="d-flex align-items-center gap-1"><Building size={14} /> {selectedEmployee.department}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🌟 การคำนวณที่แก้ไขให้กันพัง (NaN) แล้ว */}
                                    {(() => {
                                        let totalRev = 0, totalCost = 0, totalProfit = 0;
                                        filteredHistory.forEach(job => {
                                            const data = job.fullData;
                                            totalRev += (Number(data.revenue) || 0);
                                            totalCost += (Number(data.material_cost) || 0) + (Number(data.other_cost) || 0);
                                            if (data.status === 'เสร็จสิ้น') {
                                                totalProfit += (Number(data.profit) || 0);
                                            }
                                        });

                                        return (
                                            <div className="row g-3 mb-4">
                                                <div className="col-12 col-md-4">
                                                    <div className="p-3 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-25 text-center shadow-sm">
                                                        <div className="small text-primary fw-bold mb-1">รายได้รวม</div>
                                                        <h5 className="mb-0 text-primary fw-bold">฿{totalRev.toLocaleString()}</h5>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-4">
                                                    <div className="p-3 bg-danger bg-opacity-10 rounded-4 border border-danger border-opacity-25 text-center shadow-sm">
                                                        <div className="small text-danger fw-bold mb-1">ต้นทุนรวม</div>
                                                        <h5 className="mb-0 text-danger fw-bold">฿{totalCost.toLocaleString()}</h5>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-4">
                                                    <div className="p-3 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25 text-center shadow-sm">
                                                        <div className="small text-success fw-bold mb-1">กำไรรวม (เฉพาะงานเสร็จสิ้น)</div>
                                                        <h5 className="mb-0 text-success fw-bold">฿{totalProfit.toLocaleString()}</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                                        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                            <Briefcase size={18} /> ประวัติการทำงาน ({filteredHistory.length})
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            <div className="input-group input-group-sm" style={{ width: '10rem' }}>
                                                <span className="input-group-text bg-white"><Calendar size={14} /></span>
                                                <select className="form-select border-start-0" value={historyYear} onChange={(e) => setHistoryYear(e.target.value)}>
                                                    <option value="ทั้งหมด">ทุกปี</option>
                                                    {availableHistoryYears.map(y => <option key={y} value={y}>ปี {Number(y) + 543}</option>)}
                                                </select>
                                            </div>
                                            <select className="form-select form-select-sm" style={{ width: '10rem' }} value={historyMonth} onChange={(e) => setHistoryMonth(e.target.value)}>
                                                <option value="ทั้งหมด">ทุกเดือน</option>
                                                {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map((m, i) => (
                                                    <option key={i} value={(i + 1).toString()}>{m}</option>
                                                ))}
                                            </select>
                                            <div className="input-group input-group-sm" style={{ width: '10rem' }}>
                                                <span className="input-group-text bg-white"><List size={14} /></span>
                                                <select className="form-select border-start-0" value={historyLimit} onChange={(e) => setHistoryLimit(e.target.value)}>
                                                    <option value="ทั้งหมด">ทั้งหมด</option>
                                                    <option value="10">10 งาน</option>
                                                    <option value="30">30 งาน</option>
                                                    <option value="50">50 งาน</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {filteredHistory.length > 0 ? (
                                        <div className="list-group list-group-flush gap-2">
                                            {filteredHistory.map(job => {
                                                const jobData = job.fullData;
                                                const totalCost = (Number(jobData.material_cost) || 0) + (Number(jobData.other_cost) || 0);
                                                return (
                                                    <button
                                                        key={job.id}
                                                        onClick={() => setSelectedJobDetail(jobData)}
                                                        className="list-group-item list-group-item-action p-3 border rounded-3 shadow-sm d-flex justify-content-between align-items-center transition-all bg-white"
                                                        style={{ borderLeft: '4px solid #0d6efd', cursor: 'pointer' }}
                                                    >
                                                        <div className="text-start flex-grow-1">
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <h6 className="fw-bold mb-0">{job.jobTitle}</h6>
                                                                <span className={`badge ${getStatusBadge(jobData.status)}`} style={{ fontSize: '11px', fontWeight: 'normal' }}>{jobData.status}</span>
                                                            </div>
                                                            <p className="text-muted small mb-2"><MapPin size={12} className="me-1" />{job.location}</p>

                                                            <div className="d-flex flex-wrap gap-3 small mt-1" style={{ fontSize: '0.8rem' }}>
                                                                <span className="text-primary fw-medium">รายได้: ฿{(Number(jobData.revenue) || 0).toLocaleString()}</span>
                                                                <span className="text-danger fw-medium">ต้นทุน: ฿{totalCost.toLocaleString()}</span>
                                                                {jobData.status === 'เสร็จสิ้น' && (
                                                                    <span className="text-success fw-bold">กำไร: ฿{(Number(jobData.profit) || 0).toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="d-flex flex-column align-items-end gap-2 ms-3">
                                                            <span className="badge bg-blue-50 text-primary border border-blue-100">{job.date}</span>
                                                            <ChevronRight size={18} className="text-muted" />
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-light rounded-3 text-muted border border-dashed">
                                            {selectedEmployee.role === 'admin' ? "บัญชีระดับ Admin จะไม่แสดงประวัติงานในส่วนนี้" : "ไม่พบประวัติงานตามเงื่อนไขที่เลือก"}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoCard = ({ icon, color, label, value }) => {
    const bgClass = `bg-${color} bg-opacity-10 text-${color}`;
    return (
        <div className="col-12 col-md-4">
            <div className="border border-gray-100 rounded-4 p-3 d-flex align-items-center gap-3 shadow-sm h-100 bg-white">
                <div className={`p-2 rounded-3 ${bgClass}`}>{icon}</div>
                <div>
                    <div className="small text-muted">{label}</div>
                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '120px' }} title={value}>{value}</div>
                </div>
            </div>
        </div>
    );
};

export default ManagerAccount;