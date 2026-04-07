import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, Calendar, ArrowUp } from 'lucide-react';

const ManagerDashboard = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [financialData, setFinancialData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/manager/financial-report?year=${selectedYear}`);
                setFinancialData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [selectedYear]);

    // คำนวณข้อมูลสำหรับกราฟจาก financialData
    const chartData = useMemo(() => {
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return months.map((m, index) => {
            const dataInMonth = financialData.filter(d => new Date(d.datework).getMonth() === index);
            return {
                month: m,
                income: dataInMonth.reduce((sum, curr) => sum + Number(curr.income), 0),
                expense: dataInMonth.reduce((sum, curr) => sum + Number(curr.total_cost), 0)
            };
        });
    }, [financialData]);

    const totalStats = useMemo(() => {
        const income = financialData.reduce((sum, curr) => sum + Number(curr.income), 0);
        const expense = financialData.reduce((sum, curr) => sum + Number(curr.total_cost), 0);
        return { income, expense, profit: income - expense };
    }, [financialData]);

    return (
        <div style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }} className="p-5 bg-slate-50 min-h-screen">
            {/* Header และตัวเลือกปี */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Manager Dashboard</h1>
                <select className="p-2 rounded-lg border shadow-sm" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>ปี {y + 543}</option>)}
                </select>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <StatCard title="รายได้รวม" value={totalStats.income} color="blue" icon={<DollarSign />} />
                <StatCard title="รายจ่ายรวม" value={totalStats.expense} color="red" icon={<ShoppingCart />} />
                <StatCard title="กำไรสุทธิ" value={totalStats.profit} color="green" icon={<ArrowUp />} />
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h5 className="font-bold mb-6">แนวโน้มรายรับ - รายจ่าย ปี {selectedYear + 543}</h5>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="income" name="รายได้" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="รายจ่าย" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className={`p-3 rounded-2xl inline-block mb-3 bg-${color}-500 text-white`}>{icon}</div>
        <div className="text-gray-400 text-sm">{title}</div>
        <div className="text-2xl font-bold">฿{value.toLocaleString()}</div>
    </div>
);

export default ManagerDashboard;