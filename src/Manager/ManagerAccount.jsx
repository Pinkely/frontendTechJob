import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Briefcase, ChevronRight, X, Calendar, Clock, Activity, MapPin } from 'lucide-react';

const ManagerAccount = () => {
    const [employees, setEmployees] = useState([]);
    const [allWorkHistory, setAllWorkHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/manager/employees');
                setEmployees(res.data.employees);
                setAllWorkHistory(res.data.workHistory);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectEmployee = (emp) => {
        const history = allWorkHistory
            .filter(h => h.technician_id === emp.id)
            .map(h => ({
                id: h.id,
                jobTitle: h.namework,
                role: emp.role === 'Technician' ? 'ช่างปฏิบัติงาน' : emp.role,
                location: h.location || 'ไม่ระบุ',
                date: new Date(h.datework).toLocaleDateString('th-TH')
            }));

        setSelectedEmployee({ ...emp, jobHistory: history, workDuration: `${history.length} งานที่ทำเสร็จ` });
    };

    // ... ส่วนการ Render (เหมือนเดิมแต่เปลี่ยนการดึงข้อมูลพนักงานจาก filteredEmployees) ...
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (emp.nickname || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, employees]);

    if (loading) return <div className="p-5 ml-56">กำลังโหลดข้อมูลพนักงาน...</div>;

    return (
        <div style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }} className="bg-light min-vh-100 p-5 font-sans">
            {/* Header & Search เหมือนเดิม */}
            <div className="row g-4">
                {filteredEmployees.map((emp) => (
                    <div key={emp.id} className="col-12 col-md-4 col-xl-3">
                        <div className="card h-100 border-0 shadow-sm p-4 cursor-pointer" onClick={() => handleSelectEmployee(emp)}>
                            {/* Content การ์ดพนักงาน */}
                            <div className="text-center">
                                <div className="rounded-circle bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 70, height: 70, fontSize: 24 }}>
                                    {emp.name.charAt(0)}
                                </div>
                                <h5 className="fw-bold">{emp.name} ({emp.nickname})</h5>
                                <p className="text-muted small">{emp.role}</p>
                                <div className="text-primary small fw-bold">ดูรายละเอียด <ChevronRight size={16} /></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Modal Detail เหมือนเดิม */}
        </div>
    );
};

export default ManagerAccount;