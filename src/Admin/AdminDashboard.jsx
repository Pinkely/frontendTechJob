import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ShoppingCart, DollarSign, ArrowUp, ClipboardList, CheckCircle, Clock } from 'lucide-react';

const API_URL = 'http://192.168.1.106:3000';

const AdminDashboard = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/works/getAll`);
        const data = await res.json();
        setWorks(data.works || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  // นับสถิติจาก database
  const totalWorks = works.length;
  const completedWorks = works.filter(w => w.status === 'เสร็จสิ้น').length;
  const pendingWorks = works.filter(w => w.status === 'รอดำเนินการ').length;
  const inProgressWorks = works.filter(w => w.status === 'กำลังดำเนินการ').length;
  const waitingReviewWorks = works.filter(w => w.status === 'รอตรวจงาน').length;

  // สร้างข้อมูลกราฟ — นับจำนวนใบงานรายเดือน
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const currentYear = new Date().getFullYear();

  const chartData = monthNames.map((month, index) => {
    const monthWorks = works.filter(w => {
      if (!w.created_at) return false;
      const d = new Date(w.created_at);
      return d.getFullYear() === currentYear && d.getMonth() === index;
    });
    const monthCompleted = monthWorks.filter(w => w.status === 'เสร็จสิ้น').length;

    return {
      date: month,
      total: monthWorks.length,
      completed: monthCompleted,
    };
  });

  if (loading) return <div className="p-4 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }}>

      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="mb-2 fw-bold text-dark">
            <i className="bi bi-bar-chart-fill me-2 text-primary"></i>Admin Dashboard
          </h3>
          <p className="text-muted small">ภาพรวมสถิติใบงานทั้งหมดในระบบ</p>
        </div>

        {/* Notification Bell */}
        <div className="position-relative">
          <button
            className="btn btn-light position-relative shadow-sm border"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
          >
            <i className="bi bi-bell-fill text-secondary"></i>
          </button>

          {showNotificationDropdown && (
            <div className="position-absolute end-0 mt-2 bg-white rounded shadow-lg border"
              style={{ width: '350px', maxHeight: '500px', overflowY: 'auto', zIndex: 1000 }}>
              <div className="p-3 border-bottom bg-light">
                <h6 className="mb-0 fw-bold text-dark">การแจ้งเตือน</h6>
              </div>
              <div className="p-3 text-center text-muted small">ไม่มีการแจ้งเตือนใหม่</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <ClipboardList size={24} />
                </div>
              </div>
              <h6 className="text-muted mb-1 text-uppercase small fw-bold">ใบงานทั้งหมด</h6>
              <h3 className="fw-bold mb-0 text-dark">{totalWorks}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <CheckCircle size={24} />
                </div>
              </div>
              <h6 className="text-muted mb-1 text-uppercase small fw-bold">เสร็จสิ้น</h6>
              <h3 className="fw-bold mb-0 text-success">{completedWorks}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                  <Clock size={24} />
                </div>
              </div>
              <h6 className="text-muted mb-1 text-uppercase small fw-bold">รอดำเนินการ</h6>
              <h3 className="fw-bold mb-0 text-warning">{pendingWorks}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                  <ShoppingCart size={24} />
                </div>
              </div>
              <h6 className="text-muted mb-1 text-uppercase small fw-bold">กำลังดำเนินการ</h6>
              <h3 className="fw-bold mb-0 text-info">{inProgressWorks}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                  <DollarSign size={24} />
                </div>
              </div>
              <h6 className="text-muted mb-1 text-uppercase small fw-bold">รอตรวจงาน</h6>
              <h3 className="fw-bold mb-0 text-danger">{waitingReviewWorks}</h3>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="bg-secondary bg-opacity-10 text-secondary p-3 rounded-circle">
                  <ArrowUp size={24} />
                </div>
              </div>
              <h6 className="text-muted mb-1 text-uppercase small fw-bold">อัตราสำเร็จ</h6>
              <h3 className="fw-bold mb-0 text-secondary">
                {totalWorks > 0 ? Math.round((completedWorks / totalWorks) * 100) : 0}%
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Chart */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h6 className="m-0 fw-bold text-primary">
            กราฟจำนวนใบงานรายเดือน (ปี {currentYear})
          </h6>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6c757d', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6c757d', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                formatter={(value, name) => [`${value} ใบงาน`, name]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                name="ใบงานทั้งหมด"
                type="monotone"
                dataKey="total"
                stroke="#0d6efd"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0d6efd', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="เสร็จสิ้น"
                type="monotone"
                dataKey="completed"
                stroke="#198754"
                strokeWidth={3}
                dot={{ r: 4, fill: '#198754', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;