import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ChevronLeft, MapPin, Wrench, Search,
    Zap, Droplets, Wind, Calendar, DollarSign, TrendingUp, User, Filter, CheckCircle, List
} from 'lucide-react';

const ManagerRecord = () => {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);

    // States สำหรับฟิลเตอร์และค้นหา
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
    const [jobTypeFilter, setJobTypeFilter] = useState('ทั้งหมด');
    const [yearFilter, setYearFilter] = useState('ทั้งหมด');
    const [monthFilter, setMonthFilter] = useState('ทั้งหมด');

    // 🌟 เพิ่ม State สำหรับจำกัดจำนวนการแสดงผล
    const [limit, setLimit] = useState('10');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await axios.get('http://172.26.48.124:3000/api/manager/work-records');
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

    // ฟังก์ชันคำนวณการฟิลเตอร์ทั้งหมดรวมกัน
    useEffect(() => {
        const results = records.filter(item => {
            // 1. กรองตามสถานะ
            const matchStatus = statusFilter === 'ทั้งหมด' || item.status === statusFilter;
            // 2. กรองตามประเภทงาน
            const matchType = jobTypeFilter === 'ทั้งหมด' || item.job_type === jobTypeFilter;

            // 3. กรองตาม ปี และ เดือน
            const dateStr = item.start_date || item.created_at;
            let matchYear = true;
            let matchMonth = true;

            if (dateStr) {
                const itemDate = new Date(dateStr);
                const itemYear = itemDate.getFullYear().toString();
                const itemMonth = (itemDate.getMonth() + 1).toString();

                if (yearFilter !== 'ทั้งหมด') matchYear = itemYear === yearFilter;
                if (monthFilter !== 'ทั้งหมด') matchMonth = itemMonth === monthFilter;
            } else {
                if (yearFilter !== 'ทั้งหมด' || monthFilter !== 'ทั้งหมด') {
                    matchYear = false;
                    matchMonth = false;
                }
            }

            // 4. กรองตามคำค้นหา
            const term = searchTerm.toLowerCase();
            const matchSearch =
                (item.job_name || '').toLowerCase().includes(term) ||
                (item.customer_name || '').toLowerCase().includes(term) ||
                (item.technician_name || '').toLowerCase().includes(term) ||
                (item.location || '').toLowerCase().includes(term) ||
                (item.job_detail || '').toLowerCase().includes(term) ||
                String(item.work_id).includes(term);

            return matchStatus && matchType && matchSearch && matchYear && matchMonth;
        });

        // 🌟 5. นำผลลัพธ์ที่กรองแล้วมาจำกัดจำนวนตาม Limit ที่เลือก
        const limitedResults = limit === 'ทั้งหมด' ? results : results.slice(0, Number(limit));
        setFilteredRecords(limitedResults);
    }, [searchTerm, statusFilter, jobTypeFilter, yearFilter, monthFilter, limit, records]);

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

    const availableYears = [...new Set(records.map(item => {
        const d = item.start_date || item.created_at;
        return d ? new Date(d).getFullYear().toString() : null;
    }).filter(Boolean))].sort((a, b) => b - a);

    const months = [
        { val: '1', label: 'มกราคม' }, { val: '2', label: 'กุมภาพันธ์' }, { val: '3', label: 'มีนาคม' },
        { val: '4', label: 'เมษายน' }, { val: '5', label: 'พฤษภาคม' }, { val: '6', label: 'มิถุนายน' },
        { val: '7', label: 'กรกฎาคม' }, { val: '8', label: 'สิงหาคม' }, { val: '9', label: 'กันยายน' },
        { val: '10', label: 'ตุลาคม' }, { val: '11', label: 'พฤศจิกายน' }, { val: '12', label: 'ธันวาคม' }
    ];

    if (loading) return <div className="p-8 ml-[14rem]">กำลังโหลดข้อมูล...</div>;

    return (
        <div style={{ marginLeft: '14rem', minHeight: '100vh', width: 'calc(100% - 14rem)', padding: '2rem' }} className="bg-slate-50 font-sans">
            <div className="flex flex-col mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">ประวัติงานและสถานะทั้งหมด</h1>
                    <p className="text-slate-500 mt-1 text-sm">ตรวจสอบรายละเอียดงาน สถานะ และค้นหาข้อมูลที่ต้องการ</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    {/* ค้นหาทั่วไป */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors text-sm"
                        />
                    </div>

                    {/* ตัวกรองปี */}
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-slate-50">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <select className="py-2 bg-transparent focus:outline-none text-slate-600 text-sm cursor-pointer" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                            <option value="ทั้งหมด">ทุกปี</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>ปี {Number(year) + 543}</option>
                            ))}
                        </select>
                    </div>

                    {/* ตัวกรองเดือน (ปลดล็อคให้กดได้ตลอดเวลาแล้ว) */}
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-slate-50">
                        <select className="py-2 bg-transparent focus:outline-none text-slate-600 text-sm cursor-pointer" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                            <option value="ทั้งหมด">ทุกเดือน</option>
                            {months.map(m => (
                                <option key={m.val} value={m.val}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* 🌟 ตัวกรองจำนวนรายการ (Limit) */}
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-slate-50">
                        <List size={16} className="text-gray-400 mr-2" />
                        <select className="py-2 bg-transparent focus:outline-none text-slate-600 text-sm cursor-pointer" value={limit} onChange={(e) => setLimit(e.target.value)}>
                            <option value="ทั้งหมด">แสดงทั้งหมด</option>
                            <option value="10">แสดง 10 รายการ</option>
                            <option value="50">แสดง 50 รายการ</option>
                            <option value="100">แสดง 100 รายการ</option>
                        </select>
                    </div>

                    {/* ตัวกรองประเภทงาน */}
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-slate-50">
                        <Wrench size={16} className="text-gray-400 mr-2" />
                        <select className="py-2 bg-transparent focus:outline-none text-slate-600 text-sm cursor-pointer" value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)}>
                            <option value="ทั้งหมด">ประเภททั้งหมด</option>
                            <option value="ไฟฟ้า">ไฟฟ้า</option>
                            <option value="แอร์">แอร์</option>
                            <option value="ประปา">ประปา</option>
                        </select>
                    </div>

                    {/* ตัวกรองสถานะ */}
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-slate-50">
                        <CheckCircle size={16} className="text-gray-400 mr-2" />
                        <select className="py-2 bg-transparent focus:outline-none text-slate-600 text-sm cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="ทั้งหมด">สถานะทั้งหมด</option>
                            <option value="รอดำเนินการ">รอดำเนินการ</option>
                            <option value="มอบหมายแล้ว">มอบหมายแล้ว</option>
                            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                            <option value="รอตรวจงาน">รอตรวจงาน</option>
                            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                            <option value="ส่งกลับแก้ไข">ส่งกลับแก้ไข</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ส่วนแสดงผลตาราง */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-gray-100 text-slate-500 font-medium text-sm">
                    <div className="col-span-1">รหัส</div>
                    <div className="col-span-3">ชื่องาน</div>
                    <div className="col-span-2">ลูกค้า / ช่าง</div>
                    <div className="col-span-2 text-center">วันที่เริ่มงาน</div>
                    <div className="col-span-2 text-center">สถานะ</div>
                    <div className="col-span-2 text-right pr-4">กำไร (Profit)</div>
                </div>

                <div className="divide-y divide-gray-50">
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((item, idx) => (
                            <div key={idx} onClick={() => setSelectedJob(item)} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50/50 transition cursor-pointer items-center">
                                <div className="col-span-1 font-mono text-sm text-gray-500">#{item.work_id}</div>
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">{getJobIcon(item.job_type)}</div>
                                    <div className="font-bold text-slate-700 truncate">{item.job_name}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-sm font-medium text-slate-700 truncate">{item.customer_name || '-'}</div>
                                    <div className="text-xs text-blue-500 truncate mt-1">{item.technician_name || 'ยังไม่ระบุช่าง'}</div>
                                </div>
                                <div className="col-span-2 text-center text-sm text-slate-500">{formatDate(item.start_date)}</div>
                                <div className="col-span-2 flex justify-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(item.status)}`}>{item.status}</span>
                                </div>
                                <div className="col-span-2 text-right pr-4 font-mono font-bold text-slate-700">
                                    {item.status === 'เสร็จสิ้น' ? `฿${Number(item.profit || 0).toLocaleString()}` : '-'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                            <Search size={48} className="text-gray-200 mb-4" />
                            <p>ไม่พบข้อมูลงาน</p>
                        </div>
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
                                <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><User size={12} /> ลูกค้า / ผู้ติดต่อ</div>
                                    <div className="font-medium text-gray-700">{selectedJob.customer_name || '-'}</div>
                                    <div className="text-xs text-gray-400 mt-3 mb-1 flex items-center gap-1"><MapPin size={12} /> สถานที่</div>
                                    <div className="font-medium text-gray-700">{selectedJob.location || '-'}</div>
                                </div>
                                <div className="p-4 border border-blue-50 bg-blue-50/30 rounded-xl shadow-sm">
                                    <div className="text-xs text-blue-400 mb-1 flex items-center gap-1"><Wrench size={12} /> ช่างผู้รับผิดชอบ</div>
                                    <div className="font-medium text-blue-700 text-lg">{selectedJob.technician_name || 'ยังไม่มีการมอบหมาย'}</div>
                                </div>
                            </div>

                            <hr className="border-dashed border-gray-200" />

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
                                <div className={`mt-4 p-4 rounded-xl border flex justify-between items-center ${Number(selectedJob.profit) >= 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
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