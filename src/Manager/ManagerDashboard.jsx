import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const ManagerDashboard = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [financialData, setFinancialData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                // เรียก API ที่ Join ตาราง work และ work_expense
                const res = await axios.get(`http://192.168.1.93:3000/api/manager/financial-report?year=${selectedYear}`);
                if (Array.isArray(res.data)) {
                    setFinancialData(res.data);
                } else {
                    setFinancialData([]);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching financial data:", err);
                setFinancialData([]);
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [selectedYear]);

    // แปลงข้อมูลเพื่อนำเข้ากราฟ Recharts
    const chartData = useMemo(() => {
        if (!Array.isArray(financialData)) return [];

        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return months.map((m, index) => {
            // กรองข้อมูลเฉพาะเดือนนั้นๆ โดยดูจาก start_date หรือ created_at
            const dataInMonth = financialData.filter(d => {
                const dateVal = d.start_date || d.created_at; // อิงตามฟิลด์วันที่
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
    }, [financialData]);

    const totalStats = useMemo(() => {
        if (!Array.isArray(financialData)) return { revenue: 0, cost: 0, profit: 0 };
        return {
            revenue: financialData.reduce((sum, curr) => sum + Number(curr.revenue || 0), 0),
            cost: financialData.reduce((sum, curr) => sum + Number(curr.total_cost || 0), 0),
            profit: financialData.reduce((sum, curr) => sum + Number(curr.profit || 0), 0)
        };
    }, [financialData]);

    return (
        <div style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }} className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">แดชบอร์ดการเงิน (Financial Dashboard)</h1>
                    <p className="text-slate-500 mt-1 text-sm">สรุปรายรับ รายจ่าย และผลกำไรประจำปี</p>
                </div>
                <select
                    className="px-4 py-2 rounded-xl border border-gray-200 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                    {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>ปี {y + 543}</option>)}
                </select>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <StatCard title="รายได้รวม (Revenue)" value={totalStats.revenue} color="text-blue-600" bg="bg-blue-100" icon={<DollarSign />} />
                <StatCard title="ต้นทุนรวม (Total Cost)" value={totalStats.cost} color="text-red-600" bg="bg-red-100" icon={<ShoppingCart />} />
                <StatCard title="กำไรสุทธิ (Profit)" value={totalStats.profit} color="text-green-600" bg="bg-green-100" icon={<TrendingUp />} />
            </div>

            {/* Chart */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h5 className="font-bold text-slate-700 mb-8">สถิติรายรับ-รายจ่าย ประจำปี {selectedYear + 543}</h5>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `฿${value.toLocaleString()}`} />
                        <Tooltip
                            formatter={(value) => [`฿${value.toLocaleString()}`, '']}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="revenue" name="รายได้รวม" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="cost" name="ต้นทุนรวม" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="profit" name="กำไร" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, bg, icon }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
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