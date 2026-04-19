import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ChevronLeft, MapPin, Wrench, Search,
    Zap, Droplets, Wind, Calendar, DollarSign, TrendingUp, User
} from 'lucide-react';

const ManagerRecord = () => {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ดึงข้อมูลงานทั้งหมดจาก API (ครอบคลุม work, work_assign, work_expense)
        const fetchRecords = async () => {
            try {
                // สมมติว่าสร้าง API นี้ไว้ที่ Backend เพื่อดึงข้อมูลงานทั้งหมด
                const res = await axios.get('http://192.168.1.106:3000/api/manager/work-records');
                setRecords(res.data);
                setFilteredRecords(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching work records:", err);
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    useEffect(() => {
        const results = records.filter(item =>
            (item.job_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(item.work_id).includes(searchTerm)
        );
        setFilteredRecords(results);
    }, [searchTerm, records]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getJobIcon = (type) => {
        if (type?.includes('ไฟฟ้า')) return <Zap size={18} className="text-yellow-500" />;
        if (type?.includes('ประปา')) return <Droplets size={18} className="text-blue-500" />;
        if (type?.includes('แอร์')) return <Wind size={18} className="text-cyan-500" />;
        return <Wrench size={18} className="text-gray-400" />;
    };

    // สีป้ายสถานะตามตาราง work
    const getStatusBadge = (status) => {
        const styles = {
            'รอดำเนินการ': 'bg-gray-100 text-gray-600 border-gray-200',
            'มอบหมายแล้ว': 'bg-blue-50 text-blue-600 border-blue-200',
            'กำลังดำเนินการ': 'bg-purple-50 text-purple-600 border-purple-200',
            'รอตรวจงาน': 'bg-orange-50 text-orange-600 border-orange-200',
            'เสร็จสิ้น': 'bg-green-50 text-green-600 border-green-200',
            'ส่งกลับแก้ไข': 'bg-red-50 text-red-600 border-red-200'
        };
        return styles[status] || 'bg-gray-100 text-gray-600 border-gray-200';
    };

    if (loading) return <div className="p-8 ml-[14rem]">กำลังโหลดข้อมูล...</div>;

    return (
        <div style={{ marginLeft: '14rem', minHeight: '100vh', width: 'calc(100% - 14rem)', padding: '2rem' }} className="bg-slate-50 font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">ประวัติงานและสถานะทั้งหมด</h1>
                    <p className="text-slate-500 mt-1 text-sm">ตรวจสอบรายละเอียดงาน สถานะ และสรุปค่าใช้จ่าย</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่องาน, รหัส, ลูกค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 w-72 shadow-sm bg-white"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-gray-100 text-slate-500 font-medium text-sm">
                    <div className="col-span-1">รหัส</div>
                    <div className="col-span-3">ชื่องาน</div>
                    <div className="col-span-2">ลูกค้า / สถานที่</div>
                    <div className="col-span-2 text-center">วันที่เริ่มงาน</div>
                    <div className="col-span-2 text-center">สถานะ</div>
                    <div className="col-span-2 text-right pr-4">กำไร (Profit)</div>
                </div>

                <div className="divide-y divide-gray-50">
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedJob(item)}
                                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50/50 transition cursor-pointer items-center"
                            >
                                <div className="col-span-1 font-mono text-sm text-gray-500">#{item.work_id}</div>
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">{getJobIcon(item.job_type)}</div>
                                    <div className="font-bold text-slate-700 truncate">{item.job_name}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-sm font-medium text-slate-700 truncate">{item.customer_name || '-'}</div>
                                    <div className="text-xs text-slate-400 truncate">{item.location || '-'}</div>
                                </div>
                                <div className="col-span-2 text-center text-sm text-slate-500">
                                    {formatDate(item.start_date)}
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right pr-4 font-mono font-bold text-slate-700">
                                    {item.profit !== null && item.profit !== undefined
                                        ? `฿${Number(item.profit).toLocaleString()}`
                                        : '-'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-400">ไม่พบข้อมูลงานในระบบ</div>
                    )}
                </div>
            </div>

            {/* Modal Detail */}
            {selectedJob && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                            <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-white rounded-full transition text-gray-500">
                                <ChevronLeft size={24} />
                            </button>
                            <h3 className="font-bold text-gray-800 text-lg">รายละเอียดงาน #{selectedJob.work_id}</h3>
                            <div className="w-10"></div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xl">{selectedJob.job_name}</h4>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-slate-600">{selectedJob.job_type}</span>
                                        <span className={`text-xs px-2 py-1 rounded border ${getStatusBadge(selectedJob.status)}`}>{selectedJob.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl text-sm text-slate-600">
                                <strong>รายละเอียด:</strong> {selectedJob.job_detail || "ไม่มีรายละเอียดระบุไว้"}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-100 rounded-xl">
                                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><User size={12} /> ลูกค้า</div>
                                    <div className="font-medium text-gray-700">{selectedJob.customer_name || '-'}</div>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-xl">
                                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> สถานที่</div>
                                    <div className="font-medium text-gray-700">{selectedJob.location || '-'}</div>
                                </div>
                            </div>

                            <hr className="border-dashed border-gray-200" />

                            {/* สรุปค่าใช้จ่ายจาก work_expense */}
                            <div className="space-y-3">
                                <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                    <DollarSign size={18} /> สรุปงบประมาณและการเงิน
                                </h5>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>ต้นทุนวัสดุ (Material Cost)</span>
                                    <span>{Number(selectedJob.material_cost || 0).toLocaleString()} ฿</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>ต้นทุนอื่นๆ (Other Cost)</span>
                                    <span>{Number(selectedJob.other_cost || 0).toLocaleString()} ฿</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-800 mt-2">
                                    <span>รายได้รวม (Revenue)</span>
                                    <span>{Number(selectedJob.revenue || 0).toLocaleString()} ฿</span>
                                </div>
                                <div className={`mt-4 p-4 rounded-xl border flex justify-between items-center ${Number(selectedJob.profit) >= 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                                    }`}>
                                    <span className="font-bold flex items-center gap-2"><TrendingUp size={18} /> กำไรสุทธิ (Profit)</span>
                                    <span className="font-bold text-xl">
                                        {Number(selectedJob.profit || 0).toLocaleString()} ฿
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerRecord;