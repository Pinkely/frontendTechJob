import React, { useState, useEffect } from 'react';
import { Package, Search, Tool, FileText } from 'lucide-react';
import axios from 'axios'; // แนะนำให้ใช้ axios หรือใช้ fetch แบบปกติก็ได้

const ManagerInventory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [inventoryLogs, setInventoryLogs] = useState([]); // เริ่มต้นเป็น Array ว่าง
    const [loading, setLoading] = useState(true);

    // 1. สร้าง useEffect ดึงข้อมูลเมื่อเปิดหน้าจอ
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                // ยิง API ไปที่ Backend ของเรา
                const response = await axios.get('http://localhost:5000/api/manager/inventory');
                setInventoryLogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data: ", error);
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // ฟังก์ชันค้นหา
    const filteredLogs = inventoryLogs.filter(log =>
        (log.materialName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.jobName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.technician || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // แปลงวันที่ให้อ่านง่าย
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    if (loading) return <div className="ml-[14rem] p-8">กำลังโหลดข้อมูล...</div>;

    return (
        <div style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }} className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">ประวัติการใช้วัสดุและคลังสินค้า</h1>
                    <p className="text-slate-500 mt-1">ตรวจสอบการเบิกจ่ายวัสดุ และดูว่าถูกใช้ไปกับงานไหน</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาวัสดุ, ชื่องาน, หรือช่าง..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 w-72 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-gray-100 text-slate-500 font-medium text-sm">
                    <div className="col-span-3">รายการวัสดุ (Material)</div>
                    <div className="col-span-2">จำนวนที่เบิกใช้</div>
                    <div className="col-span-4">นำไปใช้กับงาน (Work Reference)</div>
                    <div className="col-span-2">ผู้เบิก (Technician)</div>
                    <div className="col-span-1 text-right">วันที่เบิก</div>
                </div>

                <div className="divide-y divide-gray-50">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-blue-50/50 transition cursor-pointer">
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Package size={20} /></div>
                                    <div className="font-bold text-slate-700">{log.materialName}</div>
                                </div>
                                <div className="col-span-2 font-mono font-medium text-slate-600">
                                    {log.usedAmount}
                                </div>
                                <div className="col-span-4 flex flex-col justify-center">
                                    <span className="font-medium text-slate-800">{log.jobName}</span>
                                    <span className="text-xs text-blue-500 flex items-center gap-1 mt-1">
                                        <FileText size={12} /> {log.jobId}
                                    </span>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
                                    <Tool size={14} className="text-slate-400" /> {log.technician}
                                </div>
                                <div className="col-span-1 text-right text-sm text-slate-400">
                                    {formatDate(log.date)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">ไม่พบข้อมูลการเบิกจ่ายวัสดุ</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerInventory;