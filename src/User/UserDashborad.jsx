import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts'
import { TrendingUp, CheckCircle, Clock, Award, Star, ClipboardList } from 'lucide-react'

const initialMaterialHistory = [
  { id: 1, name: 'ตะปู 1 นิ้ว', quantity: 50, date: '2025-11-20' },
  { id: 2, name: 'สายไฟ VAF 2x2.5', quantity: 15, date: '2025-11-22' },
];

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '' });
  const [materialHistory, setMaterialHistory] = useState(initialMaterialHistory);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // ✅ ดึง user_id จาก session จริง
        const storedSession = JSON.parse(localStorage.getItem('session'));
        const userId = storedSession?.user?.user_id || storedSession?.user?.id;

        if (!userId) {
          console.error("ไม่พบ userId ใน session");
          setLoading(false);
          return;
        }

        // ✅ เรียก Node.js API port 3000 ตาม workRoutes.js
        const response = await fetch(`http://localhost:3000/works/technician/${userId}`);
        const data = await response.json();

        // ✅ workRoutes ส่งกลับเป็น { works: [...] }
        setTasks(data.works || []);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // --- คำนวณ Stats --- (แก้ field ให้ตรงกับ DB จริง)
  const stats = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const total = safeTasks.length;
    // ✅ เปลี่ยนจาก w.completed → w.status เพราะ DB ใช้ status
    const completed = safeTasks.filter(w => w.status === 'completed' || w.status === 'เสร็จสิ้น').length;
    const inProgress = safeTasks.filter(w => w.status !== 'completed' && w.status !== 'เสร็จสิ้น').length;
    const successRate = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, successRate };
  }, [tasks]);

  // --- คำนวณกราฟรายเดือน --- (แก้ field datework → start_date)
  const monthlyData = useMemo(() => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const data = months.map(m => ({ name: m, jobs: 0 }));

    tasks.forEach(task => {
      // ✅ เปลี่ยนจาก task.datework → task.start_date ให้ตรงกับ DB
      const dateField = task.start_date || task.datework;
      if (dateField) {
        const date = new Date(dateField);
        if (!isNaN(date.getTime())) {
          const monthIndex = date.getMonth();
          data[monthIndex].jobs += 1;
        }
      }
    });
    return data;
  }, [tasks]);

  // ... ส่วนที่เหลือคงเดิมทุกอย่าง
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || '' : value }));
  };

  const handleSubmitMaterial = (e) => {
    e.preventDefault();
    if (newMaterial.name && newMaterial.quantity > 0) {
      const newEntry = { id: Date.now(), name: newMaterial.name, quantity: newMaterial.quantity };
      setMaterialHistory(prev => [newEntry, ...prev]);
      setNewMaterial({ name: '', quantity: '' });
    }
  };

  if (loading) return <div className="p-5 text-center">กำลังเชื่อมต่อข้อมูลจากฐานข้อมูล...</div>;

  return (
    <div className='p-4' style={{ width: '100%', minHeight: '100vh', background: '#F0F8FF', marginLeft: '15rem' }}>
      <div className='p-4'>
        <h1 className='fw-bolder mb-4 text-primary'>หน้าหลัก (งานของฉัน)</h1>
        <hr />
      </div>

      <div className='row g-3 mb-4 justify-content-center'>
        <div className='col-md-3'>
          <div className='bg-white rounded-3 shadow-sm p-3 h-100'>
            <p className='text-muted mb-1 small'>งานทั้งหมด</p>
            <h3 className='fw-bold text-primary'>{stats.total}</h3>
            <small><ClipboardList size={14} /> รายการ</small>
          </div>
        </div>
        <div className='col-md-3'>
          <div className='bg-white rounded-3 shadow-sm p-3 h-100'>
            <p className='text-muted mb-1 small'>งานสำเร็จ</p>
            <h3 className='fw-bold text-success'>{stats.completed}</h3>
            <small className='text-success'><CheckCircle size={14} /> {stats.successRate}%</small>
          </div>
        </div>
        <div className='col-md-3'>
          <div className='bg-white rounded-3 shadow-sm p-3 h-100'>
            <p className='text-muted mb-1 small'>รอดำเนินการ</p>
            <h3 className='fw-bold text-warning'>{stats.inProgress}</h3>
            <small><Clock size={14} /> งานที่เหลือ</small>
          </div>
        </div>
      </div>

      <div className='row g-3 mb-3'>
        <div className='col-lg-8'>
          <div className='bg-white rounded-3 shadow-sm p-4' style={{ height: '400px' }}>
            <h5 className='fw-bold mb-3'>📊 กราฟสรุปงานรายเดือน</h5>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="jobs" fill="#667eea" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='col-lg-4'>
          <div className='bg-white rounded-3 shadow-sm p-4' style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <h5 className='fw-bold mb-3'>🔨 วัสดุที่ใช้</h5>
            <form onSubmit={handleSubmitMaterial} className='mb-3'>
              <div className='row g-2'>
                <div className='col-7'><input type="text" name="name" className='form-control form-control-sm' placeholder='ชื่อวัสดุ' value={newMaterial.name} onChange={handleInputChange} /></div>
                <div className='col-5'><input type="number" name="quantity" className='form-control form-control-sm' placeholder='จำนวน' value={newMaterial.quantity} onChange={handleInputChange} /></div>
                <button type="submit" className='btn btn-primary btn-sm w-100 mt-2'>บันทึก</button>
              </div>
            </form>
            <div style={{ overflowY: 'auto' }}>
              <ul className='list-group list-group-flush'>
                {materialHistory.map((m) => (
                  <li key={m.id} className='list-group-item d-flex justify-content-between'>
                    <span>{m.name}</span>
                    <span className='badge bg-info'>{m.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard;