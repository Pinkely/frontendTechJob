import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Briefcase, ChevronRight, X, MapPin, Users, ShieldCheck, Wrench } from 'lucide-react';

const ManagerAccount = () => {
    const [employees, setEmployees] = useState([]);
    const [allWorkHistory, setAllWorkHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all'); // เพิ่ม State สำหรับกรอง Role
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    // เริ่มทำงานเมื่อเปิดหน้าเว็บ: ดึงข้อมูลพนักงาน
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://192.168.1.106:3000/api/manager/employees');
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

    // ปรับปรุงการ Filter ให้รองรับทั้ง Search และ Role
    const filteredEmployees = useMemo(() => {
        if (!employees || !Array.isArray(employees)) return [];

        return employees.filter(emp => {
            const matchesSearch =
                (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (emp.nickname || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = selectedRole === 'all' || emp.role === selectedRole;

            return matchesSearch && matchesRole;
        });
    }, [searchTerm, selectedRole, employees]);

    const handleSelectEmployee = (emp) => {
        const history = allWorkHistory
            .filter(h => Number(h.technician_id) === Number(emp.user_id))
            .map(h => ({
                id: h.work_id,
                jobTitle: h.job_name,
                location: h.location || 'ไม่ระบุ',
                date: h.start_date ? new Date(h.start_date).toLocaleDateString('th-TH') : '-'
            }));

        setSelectedEmployee({
            ...emp,
            jobHistory: history
        });
    };

    if (loading) return <div className="p-5 ml-56">กำลังโหลดข้อมูลพนักงาน...</div>;

    return (
        <div style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }} className="bg-light min-vh-100 p-5 font-sans">

            {/* Header & Controls */}
            <div className="mb-5">
                <h2 className="fw-bold text-dark mb-4">จัดการบัญชีบุคลากร</h2>

                <div className="d-flex flex-wrap gap-3 align-items-center">
                    {/* Search Bar */}
                    <div className="position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ หรือชื่อเล่น..."
                            className="form-control ps-5 py-2 rounded-3 border-0 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Role Filter Tabs/Buttons */}
                    <div className="bg-white p-1 rounded-3 shadow-sm d-flex gap-1">
                        {[
                            { id: 'all', label: 'ทั้งหมด', icon: <Users size={16} /> },
                            { id: 'admin', label: 'Admin', icon: <ShieldCheck size={16} /> },
                            { id: 'supervisor', label: 'Supervisor', icon: <Briefcase size={16} /> },
                            { id: 'technician', label: 'Technician', icon: <Wrench size={16} /> }
                        ].map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 border-0 transition-all ${selectedRole === role.id ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'
                                    }`}
                            >
                                {role.icon}
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Employee Cards Grid */}
            <div className="row g-4">
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                        <div key={emp.user_id} className="col-12 col-md-4 col-xl-3">
                            <div
                                className="card h-100 border-0 shadow-sm p-4 hover-shadow transition-all bg-white rounded-4"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSelectEmployee(emp)}
                            >
                                <div className="text-center">
                                    <div
                                        className={`rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white shadow-sm`}
                                        style={{
                                            width: 70, height: 70, fontSize: 24,
                                            backgroundColor: emp.role === 'admin' ? '#ef4444' : emp.role === 'supervisor' ? '#3b82f6' : '#10b981'
                                        }}
                                    >
                                        {emp.name ? emp.name.charAt(0) : '?'}
                                    </div>
                                    <h6 className="fw-bold mb-1 text-dark">
                                        {emp.name} {emp.nickname ? `(${emp.nickname})` : ''}
                                    </h6>
                                    <div className="badge bg-light text-muted border mb-3 text-uppercase" style={{ fontSize: '10px' }}>
                                        {emp.role}
                                    </div>
                                    <div className="text-primary small fw-bold d-flex align-items-center justify-content-center gap-1">
                                        ดูรายละเอียด <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted">ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไข</p>
                    </div>
                )}
            </div>

            {/* Modal Detail (เหมือนเดิม) */}
            {selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 d-flex align-items-center justify-content-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="bg-white rounded-4 shadow-lg w-100 max-w-2xl overflow-hidden animate-in">
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                            <div>
                                <h5 className="mb-0 fw-bold">ประวัติการทำงาน: {selectedEmployee.name}</h5>
                                <span className="text-muted small">ประเภท: {selectedEmployee.type || 'ทั่วไป'}</span>
                            </div>
                            <button onClick={() => setSelectedEmployee(null)} className="btn btn-light rounded-circle p-2">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                            {selectedEmployee.jobHistory.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {selectedEmployee.jobHistory.map(job => (
                                        <div key={job.id} className="list-group-item py-3 border-start border-4 border-primary mb-2 rounded shadow-sm bg-white">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold mb-1">{job.jobTitle}</h6>
                                                    <p className="text-muted small mb-0"><MapPin size={12} className="me-1" />{job.location}</p>
                                                </div>
                                                <span className="badge bg-blue-50 text-primary border border-blue-100">{job.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">ยังไม่มีประวัติงานที่ทำเสร็จ</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Component ย่อย: การ์ดแสดงข้อมูลเล็กๆ
const InfoCard = ({ icon, color, label, value }) => {
    const bgClass = `bg-${color} bg-opacity-10 text-${color}`;
    return (
        <div className="col-12 col-md-4">
            <div className="border rounded-4 p-3 d-flex align-items-center gap-3 shadow-sm h-100">
                <div className={`p-2 rounded-3 ${bgClass}`}>
                    {icon}
                </div>
                <div>
                    <div className="small text-secondary">{label}</div>
                    <div className="fw-bold text-dark">{value}</div>
                </div>
            </div>
        </div>
    );
};

export default ManagerAccount;