import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';

const UserWorkSheet = ({ tasks = [] }) => {
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

 useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser?.user_id || storedUser?.id;

    if (userId && tasks.length > 0) {
        // 1. กรองเฉพาะงานที่มี ID ตรงกับเรา (เช็คหลายชื่อคอลัมน์เผื่อไว้)
        const myTasks = tasks.filter(work => {
            const ownerId = work.user_id || work.technician_id || work.u_id || work.id_user;
            return String(ownerId) === String(userId);
        });
        
        // 2. กรองด้วย Search Term (ถ้าช่องค้นหาว่าง จะแสดง myTasks ทั้งหมด)
        const lowerSearch = searchTerm.toLowerCase();
        const finalData = myTasks.filter(work =>
            (String(work.id).toLowerCase().includes(lowerSearch)) ||
            (work.namework && work.namework.toLowerCase().includes(lowerSearch))
        );

        setFilteredData(finalData);
    } else {
        setFilteredData([]);
    }
}, [tasks, searchTerm]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Assigned': return <Badge bg="primary">ได้รับมอบหมาย</Badge>;
            case 'Pending': return <Badge bg="info" text="dark">รอรับงาน</Badge>;
            case 'PendingInspection': return <Badge bg="warning" text="dark">รอหัวหน้าตรวจสอบ</Badge>;
            case 'Approved': return <Badge bg="success">อนุมัติแล้ว</Badge>;
            case 'Revision': return <Badge bg="danger">ต้องแก้ไขงาน</Badge>;
            default: return <Badge bg="secondary">{status || 'Draft'}</Badge>;
        }
    };

    return (
        <div className="container-fluid py-5" style={{ minHeight: '100vh', background: '#F0F8FF', marginLeft: '14rem' }}>
            <div className='container p-4 p-md-5 rounded-4'>
                <h1 className='fw-bold mb-4 text-primary'> 
                    <i className="bi bi-file-earmark-text me-3"></i>ประวัติใบงานของฉัน
                </h1>
                
                <div className="d-flex mb-4">
                    <input 
                        className="form-control" 
                        type="text" 
                        placeholder="ค้นหาด้วยรหัสหรือชื่องาน..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>

                <div className="shadow-sm rounded-3 overflow-hidden border bg-white">
                    <table className="table table-hover table-striped mb-0">
                        <thead className="table-primary text-white">
                            <tr>
                                <th>รหัส</th>
                                <th>ชื่องาน</th>
                                <th>รายละเอียด</th>
                                <th>วันที่ทำรายการ</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map(work => (
                                <tr key={work.id}>
                                    <td className='fw-bold text-primary'>{work.id}</td>
                                    <td>{work.namework}</td>
                                    <td className='text-muted small text-truncate' style={{ maxWidth: '200px' }}>
                                        {work.detail}
                                    </td>
                                    <td>{work.finishDate ? new Date(work.finishDate).toLocaleDateString('th-TH') : '-'}</td>
                                    <td>{getStatusBadge(work.status)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-4 text-muted">
                                        ไม่พบข้อมูลใบงานของคุณ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserWorkSheet;