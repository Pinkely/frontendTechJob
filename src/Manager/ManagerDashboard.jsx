import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Filter, BarChart2 } from 'lucide-react';

const ManagerDashboard = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [jobTypeFilter, setJobTypeFilter] = useState('ทั้งหมด');
    // เพิ่ม State ใหม่ สำหรับควบคุมการแสดงผล รายได้/ต้นทุน/กำไร
    const [metricFilter, setMetricFilter] = useState('ทั้งหมด');

    const [financialData, setFinancialData] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://192.168.1.106:3000/api/manager/financial-report?year=${selectedYear}`);
                if (Array.isArray(res.data)) {
                    setFinancialData(res.data);
                } else {
                    setFinancialData([]);
                }
            } catch (err) {
                console.error("Error fetching financial data:", err);
                setFinancialData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [selectedYear]);

    // 1. ฟิลเตอร์ข้อมูลตามประเภทงาน (ไฟฟ้า/แอร์/ประปา)
    const filteredData = useMemo(() => {
        if (jobTypeFilter === 'ทั้งหมด') return financialData;
        return financialData.filter(d => d.job_type === jobTypeFilter);
    }, [financialData, jobTypeFilter]);

    // 2. แปลงข้อมูลสำหรับกราฟแท่ง (รายเดือน)
    const chartData = useMemo(() => {
        if (!Array.isArray(filteredData)) return [];
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

        return months.map((m, index) => {
            const dataInMonth = filteredData.filter(d => {
                const dateVal = d.start_date;
                if (!dateVal) return false;
                return new Date(dateVal).getMonth() === index;
            });
            return {
                month: m,
                revenue: dataInMonth.reduce((sum, curr) => sum + Number(curr.revenue || 0), 0),
                cost: dataInMonth.reduce((sum, curr) => sum + Number(curr.total_cost || 0), 0),
                profit: dataInMonth.reduce((sum, curr) => sum + Number(curr.profit || 0), 0)
            };
        });
    }, [filteredData]);

    // 3. ข้อมูลสรุป "แยกตามประเภทงาน" 
    const summaryByType = useMemo(() => {
        if (!Array.isArray(financialData)) return [];

        const grouped = financialData.reduce((acc, curr) => {
            const type = curr.job_type || 'ไม่ระบุ';
            if (!acc[type]) acc[type] = { name: type, revenue: 0, cost: 0, profit: 0 };

            acc[type].revenue += Number(curr.revenue || 0);
            acc[type].cost += Number(curr.total_cost || 0);
            acc[type].profit += Number(curr.profit || 0);
            return acc;
        }, {});

        return Object.values(grouped);
    }, [financialData]);

    // 4. ดึงข้อมูลให้ Pie Chart เปลี่ยนตามตัวเลือก Metric (รายได้/ต้นทุน/กำไร)
    const pieData = useMemo(() => {
        if (metricFilter === 'cost') return summaryByType.map(d => ({ name: d.name, value: d.cost })).filter(d => d.value > 0);
        if (metricFilter === 'profit') return summaryByType.map(d => ({ name: d.name, value: d.profit })).filter(d => d.value > 0);
        return summaryByType.map(d => ({ name: d.name, value: d.revenue })).filter(d => d.value > 0); // Default เป็นรายได้
    }, [summaryByType, metricFilter]);

    // คำนวณตัวเลขสถิติรวมด้านบน
    const totalStats = useMemo(() => {
        if (!Array.isArray(filteredData)) return { revenue: 0, cost: 0, profit: 0 };
        return {
            revenue: filteredData.reduce((sum, curr) => sum + Number(curr.revenue || 0), 0),
            cost: filteredData.reduce((sum, curr) => sum + Number(curr.total_cost || 0), 0),
            profit: filteredData.reduce((sum, curr) => sum + Number(curr.profit || 0), 0)
        };
    }, [filteredData]);

    return (
        <div style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }} className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">แดชบอร์ดการเงิน (Financial)</h1>
                    <p className="text-slate-500 mt-1 text-sm">วิเคราะห์รายได้ ต้นทุน และกำไรประจำปี {selectedYear + 543}</p>
                </div>

                <div className="flex gap-4">
                    {/* ตัวกรอง 1: เลือกดู รายได้ / ต้นทุน / กำไร */}
                    <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
                        <BarChart2 className="w-4 h-4 text-slate-400 mr-2" />
                        <select
                            className="bg-transparent focus:outline-none text-slate-700 font-medium"
                            value={metricFilter}
                            onChange={(e) => setMetricFilter(e.target.value)}
                        >
                            <option value="ทั้งหมด">แสดงกราฟทั้งหมด</option>
                            <option value="revenue">แสดงเฉพาะรายได้</option>
                            <option value="cost">แสดงเฉพาะต้นทุน</option>
                            <option value="profit">แสดงเฉพาะกำไร</option>
                        </select>
                    </div>

                    {/* ตัวกรอง 2: ประเภทงาน */}
                    <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
                        <Filter className="w-4 h-4 text-slate-400 mr-2" />
                        <select
                            className="bg-transparent focus:outline-none text-slate-700"
                            value={jobTypeFilter}
                            onChange={(e) => setJobTypeFilter(e.target.value)}
                        >
                            <option value="ทั้งหมด">งานทุกประเภท</option>
                            <option value="ไฟฟ้า">ไฟฟ้า</option>
                            <option value="แอร์">แอร์</option>
                            <option value="ประปา">ประปา</option>
                        </select>
                    </div>

                    {/* ตัวกรอง 3: ปี */}
                    <select
                        className="px-4 py-2 rounded-xl border border-gray-200 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>ปี {y + 543}</option>)}
                    </select>
                </div>
            </div>

            {/* Stat Cards ด้านบน (แสดงตลอดเพื่อให้เห็นตัวเลขรวม) */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <StatCard title="รายได้รวม" value={totalStats.revenue} color="text-blue-600" bg="bg-blue-100" icon={<DollarSign />} isActive={metricFilter === 'ทั้งหมด' || metricFilter === 'revenue'} />
                <StatCard title="ต้นทุนรวม" value={totalStats.cost} color="text-red-600" bg="bg-red-100" icon={<ShoppingCart />} isActive={metricFilter === 'ทั้งหมด' || metricFilter === 'cost'} />
                <StatCard title="กำไรสุทธิ" value={totalStats.profit} color="text-green-600" bg="bg-green-100" icon={<TrendingUp />} isActive={metricFilter === 'ทั้งหมด' || metricFilter === 'profit'} />
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Chart แท่ง (รายเดือน) */}
                <div className="col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h5 className="font-bold text-slate-700 mb-6">แนวโน้มรายเดือน</h5>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `฿${val.toLocaleString()}`} />
                            <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, '']} cursor={{ fill: '#f8fafc' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            {/* ใช้เงื่อนไขซ่อน/โชว์ แท่งกราฟ */}
                            {(metricFilter === 'ทั้งหมด' || metricFilter === 'revenue') && <Bar dataKey="revenue" name="รายได้" fill="#3b82f6" radius={[4, 4, 0, 0]} />}
                            {(metricFilter === 'ทั้งหมด' || metricFilter === 'cost') && <Bar dataKey="cost" name="ต้นทุน" fill="#ef4444" radius={[4, 4, 0, 0]} />}
                            {(metricFilter === 'ทั้งหมด' || metricFilter === 'profit') && <Bar dataKey="profit" name="กำไร" fill="#10b981" radius={[4, 4, 0, 0]} />}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart โดนัท (สัดส่วน) */}
                <div className="col-span-1 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
                    <h5 className="font-bold text-slate-700 text-center mb-2">
                        สัดส่วน {metricFilter === 'cost' ? 'ต้นทุน' : metricFilter === 'profit' ? 'กำไร' : 'รายได้'} (ตามแผนก)
                    </h5>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `฿${value.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">ไม่มีข้อมูล</div>
                    )}
                </div>
            </div>

            {/* สรุปแยกตามประเภทงาน แนวนอน */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h5 className="font-bold text-slate-700 mb-6">เปรียบเทียบผลประกอบการ แยกตามประเภทงาน</h5>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={summaryByType} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `฿${val.toLocaleString()}`} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 600 }} width={80} />
                        <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, '']} cursor={{ fill: '#f8fafc' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />

                        {/* ใช้เงื่อนไขซ่อน/โชว์ แท่งกราฟ */}
                        {(metricFilter === 'ทั้งหมด' || metricFilter === 'revenue') && <Bar dataKey="revenue" name="รายได้รวม" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />}
                        {(metricFilter === 'ทั้งหมด' || metricFilter === 'cost') && <Bar dataKey="cost" name="ต้นทุนรวม" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />}
                        {(metricFilter === 'ทั้งหมด' || metricFilter === 'profit') && <Bar dataKey="profit" name="กำไรสุทธิ" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />}
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

// Component การ์ดปรับให้สีซีดลงเล็กน้อย ถ้าเราฟิลเตอร์ไม่ได้ดูมันอยู่
const StatCard = ({ title, value, color, bg, icon, isActive }) => (
    <div className={`bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`p-4 rounded-2xl ${bg} ${color}`}>
            {icon}
        </div>
        <div>
            <div className="text-slate-500 text-sm font-medium">{title}</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">฿{value.toLocaleString()}</div>
        </div>
    </div>
);

export default ManagerDashboard;