import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Form, Dropdown, Table, Badge, InputGroup } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

const API_URL = 'http://192.168.1.93:3000/api';

const AdminWork = () => {
  const [works, setWorks] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  // --- State ---
  const [show, setShow] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [curPage, setCurPage] = useState(1);
  const itemsPerPage = 10;

  const [generatedId, setGeneratedId] = useState('');
  const [techniciansList, setTechniciansList] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState('');

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [supervisorId, setSupervisorId] = useState('');

  // --- Map ---
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState({ lat: 13.7563, lng: 100.5018 });
  const [addressInput, setAddressInput] = useState('');

  // --- Filter ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // --- Ref (ตัวดึงค่าจากช่องกรอก) ---
  const nameWorkRef = useRef();
  const detailRef = useRef();
  const dateWorkRef = useRef();
  const timeStartRef = useRef();
  const timeEndRef = useRef();
  const nameCustomerRef = useRef();
  const moneyRef = useRef();
  const costRef = useRef();
  const jobPriceRef = useRef();

  // ในไฟล์ AdminWork.jsx
  const fetchWorks = async () => {
    try {
      const res = await fetch(`${API_URL}/works/getAll`);

      // 1. เช็คก่อนว่า Server ตอบกลับมาสำเร็จ (Status 200-299) หรือไม่
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setWorks(data.works || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("ไม่สามารถดึงข้อมูลได้: " + err.message);
    }
    // ลบ finally { setLoading(false); } ออกไปเลย
  };

  const fetchSupervisors = async () => {
    try {
      const res = await fetch(`${API_URL}/users/role/supervisor`);
      const data = await res.json();
      setSupervisors(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorks();
    fetchSupervisors();
  }, []);

  const handleClose = () => setShow(false);

  const handleShow = () => {
    setIsEditMode(false);
    setSelectedWorkType('');
    setAddressInput('');
    setSupervisorId('');
    setMapLocation({ lat: 13.7563, lng: 100.5018 });
    setShow(true);
  };

  const handleEdit = (work) => {
    setIsEditMode(true);
    setEditingId(work.work_id);
    setSelectedWorkType(work.job_type || '');
    setAddressInput(work.location || '');
    setSupervisorId(work.supervisor_id ? String(work.supervisor_id) : '');
    setMapLocation({ lat: 13.7563, lng: 100.5018 });
    setShow(true);

    setTimeout(() => {
      if (nameWorkRef.current) nameWorkRef.current.value = work.job_name || '';
      if (detailRef.current) detailRef.current.value = work.job_detail || '';
      if (dateWorkRef.current) dateWorkRef.current.value = work.start_date ? work.start_date.split('T')[0] : '';
      if (nameCustomerRef.current) nameCustomerRef.current.value = work.customer_name || '';
      if (timeStartRef.current) timeStartRef.current.value = work.work_time || '09:00';
      if (jobPriceRef.current) jobPriceRef.current.value = work.job_price || '';
    }, 100);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedWork(null);
    setExpenses([]);
  };
  const handleShowDetail = async (work) => {
    setSelectedWork(work);
    setShowDetail(true);
    setLoadingExpenses(true);
    try {
      const res = await fetch(`${API_URL}/works/${work.work_id}/expenses`);
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error(err);
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleOpenMap = () => setShowMap(true);
  const handleCloseMap = () => setShowMap(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, (error) => {
        alert("ไม่สามารถดึงตำแหน่งได้: " + error.message);
      });
    } else {
      alert("Browser ของคุณไม่รองรับ Geolocation");
    }
  };

  const handleSaveMapLocation = () => {
    if (!addressInput) {
      setAddressInput(`พิกัด: ${mapLocation.lat.toFixed(6)}, ${mapLocation.lng.toFixed(6)}`);
    }
    handleCloseMap();
  };

  const saveWork = async () => {
    const job_name = nameWorkRef.current?.value.trim();
    const job_detail = detailRef.current?.value.trim();
    const start_date = dateWorkRef.current?.value;
    const work_time = timeStartRef.current?.value;
    const customer_name = nameCustomerRef.current?.value;
    const job_price = jobPriceRef.current?.value || 0;

    if (!job_name || !selectedWorkType || !job_detail || !addressInput || !start_date || !customer_name) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const body = {
      job_name,
      customer_name,
      job_type: selectedWorkType,
      job_detail,
      location: addressInput,
      start_date,
      work_time,
      job_price: parseFloat(job_price) || 0,
      supervisor_id: parseInt(supervisorId) || 2,
      admin_id: parseInt(localStorage.getItem('user_id')) || 1
    };

    try {
      let res;
      if (isEditMode) {
        res = await fetch(`${API_URL}/works/update/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch(`${API_URL}/works/creatework`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      if (res.ok) {
        await fetchWorks();
        handleClose();
        alert(isEditMode ? '✅ แก้ไขใบงานสำเร็จ' : '✅ สร้างใบงานสำเร็จ');
      } else {
        const err = await res.json();
        alert('❌ เกิดข้อผิดพลาด: ' + (err.message || 'ไม่ทราบสาเหตุ'));
      }
    } catch (err) {
      console.error(err);
      alert('❌ ไม่สามารถเชื่อมต่อ server ได้');
    }
  };

  const handleSendToLeader = async (id) => {
    if (window.confirm('ยืนยันการส่งใบงานนี้ให้หัวหน้างาน?')) {
      try {
        await fetch(`${API_URL}/works/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'มอบหมายแล้ว' })
        });
        await fetchWorks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ต้องการลบใบงานนี้ใช่หรือไม่?')) {
      try {
        await fetch(`${API_URL}/works/delete/${id}`, { method: 'DELETE' });
        await fetchWorks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredWorks = useMemo(() => {
    let filtered = works;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((work) => {
        return (
          (work.job_name && work.job_name.toLowerCase().includes(searchLower)) ||
          (work.customer_name && work.customer_name.toLowerCase().includes(searchLower)) ||
          (work.work_id && work.work_id.toString().includes(searchTerm))
        );
      });
    }
    if (selectedType) filtered = filtered.filter(work => work.job_type === selectedType);
    if (selectedStatus) filtered = filtered.filter(work => work.status === selectedStatus);

    return filtered;
  }, [works, searchTerm, selectedType, selectedTime, selectedStatus]);

  useEffect(() => { setCurPage(1); }, [searchTerm, selectedType, selectedTime, selectedStatus]);

  const getStatusBadge = (work) => {
    switch (work.status) {
      case 'รอดำเนินการ': return <Badge bg="secondary">รอดำเนินการ</Badge>;
      case 'มอบหมายแล้ว': return <Badge bg="primary">มอบหมายแล้ว</Badge>;
      case 'กำลังดำเนินการ': return <Badge bg="info" text="dark">กำลังดำเนินการ</Badge>;
      case 'รอตรวจงาน': return <Badge bg="warning" text="dark">รอตรวจงาน</Badge>;
      case 'เสร็จสิ้น': return <Badge bg="success">เสร็จสิ้น</Badge>;
      case 'ส่งกลับแก้ไข': return <Badge bg="danger">ส่งกลับแก้ไข</Badge>;
      default: return <Badge bg="light" text="dark">{work.status}</Badge>;
    }
  };

  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage) || 1;
  const paginatedWorks = filteredWorks.slice((curPage - 1) * itemsPerPage, curPage * itemsPerPage);
  const goToFirst = () => setCurPage(1);
  const goToLast = () => setCurPage(totalPages);
  const goToNext = () => setCurPage(prev => Math.min(prev + 1, totalPages));
  const goToPrev = () => setCurPage(prev => Math.max(prev - 1, 1));

  const workTypes = [...new Set(works.map(work => work.job_type).filter(Boolean))];
  const totalWorks = works.length;
  const completedWorks = works.filter(w => w.status === 'เสร็จสิ้น').length;
  const inProgressWorks = totalWorks - completedWorks;

  return (
    <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }}>

      {/* --- Modal Add/Edit Work --- */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-plus-circle me-2"></i>
            {isEditMode ? 'แก้ไขใบงาน' : 'เพิ่มงานใหม่'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* ... ฟอร์มเดิมของคุณ ... */}
            <div className="row">
              <div className="col-md-8"><Form.Group className="mb-3"><Form.Label>ชื่องาน <span className="text-danger">*</span></Form.Label><Form.Control ref={nameWorkRef} placeholder="ระบุชื่องาน" autoFocus /></Form.Group></div>
              <div className="col-md-4"><Form.Group className="mb-3"><Form.Label>ประเภทงาน <span className="text-danger">*</span></Form.Label><Form.Select value={selectedWorkType} onChange={(e) => setSelectedWorkType(e.target.value)}><option value="">-- เลือกประเภทงาน --</option><option value="งานไฟฟ้า">งานไฟฟ้า</option><option value="งานประปา">งานประปา</option><option value="งานซ่อม">งานซ่อม</option><option value="งานติดตั้ง">งานติดตั้ง</option><option value="อื่นๆ">อื่นๆ</option></Form.Select></Form.Group></div>
            </div>
            <div className="row">
              <div className="col-md-6"><Form.Group className="mb-3"><Form.Label>หัวหน้าช่าง <span className="text-danger">*</span></Form.Label><Form.Select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}><option value="">-- เลือกหัวหน้าช่าง --</option>{supervisors.map(s => (<option key={s.user_id} value={s.user_id}>{s.name}</option>))}</Form.Select></Form.Group></div>
              <div className="col-md-6"><Form.Group className="mb-3"><Form.Label>สถานะ</Form.Label><Form.Control value="รอดำเนินการ" readOnly className="bg-light text-muted" /></Form.Group></div>
            </div>
            <Form.Group className="mb-3"><Form.Label>รายละเอียดงาน <span className="text-danger">*</span></Form.Label><Form.Control ref={detailRef} as="textarea" rows={3} placeholder="อธิบายรายละเอียด" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>สถานที่ / จุดปักหมุด <span className="text-danger">*</span></Form.Label><InputGroup><Button variant="outline-danger" onClick={handleOpenMap}><i className="bi bi-geo-alt-fill me-1"></i> ปักหมุด</Button><Form.Control value={addressInput} onChange={(e) => setAddressInput(e.target.value)} placeholder="ระบุสถานที่ หรือ กดปักหมุดเพื่อระบุพิกัด" /></InputGroup></Form.Group>
            <div className="row">
              <div className="col-md-6"><Form.Group className="mb-3"><Form.Label>ชื่อลูกค้า <span className="text-danger">*</span></Form.Label><Form.Control ref={nameCustomerRef} type="text" placeholder="ระบุชื่อลูกค้า" /></Form.Group></div>
              <div className="col-md-6"><Form.Group className="mb-3"><Form.Label>ราคางาน (บาท)</Form.Label><Form.Control ref={jobPriceRef} type="number" min="0" step="0.01" placeholder="0.00" /></Form.Group></div>
            </div>
            <div className="row"><div className="col-md-6"><Form.Group className="mb-3"><Form.Label>วันที่ <span className="text-danger">*</span></Form.Label><Form.Control ref={dateWorkRef} type="date" /></Form.Group></div><div className="col-md-6"><Form.Group className="mb-3"><Form.Label>เวลาเริ่ม</Form.Label><Form.Control ref={timeStartRef} type="time" defaultValue="09:00" /></Form.Group></div></div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>ยกเลิก</Button>
          <Button variant="primary" onClick={saveWork}><i className="bi bi-save me-2"></i>{isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกใบงาน'}</Button>
        </Modal.Footer>
      </Modal>

      {/* --- Modal Detail --- */}
      <Modal show={showDetail} onHide={handleCloseDetail} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title><i className="bi bi-file-earmark-text me-2"></i>รายละเอียดงาน</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedWork && (
            <>
              <div className="row mb-3">
                <div className="col-6">
                  <small className="text-muted d-block">รหัสงาน</small>
                  <span className="fw-semibold">#{selectedWork.work_id}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">สถานะ</small>
                  {getStatusBadge(selectedWork)}
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <small className="text-muted d-block">ชื่องาน</small>
                  <span className="fw-semibold">{selectedWork.job_name || '-'}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">ประเภทงาน</small>
                  <span>{selectedWork.job_type || '-'}</span>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <small className="text-muted d-block">ชื่อลูกค้า</small>
                  <span>{selectedWork.customer_name || '-'}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">วันที่</small>
                  <span>{selectedWork.start_date ? new Date(selectedWork.start_date).toLocaleDateString('th-TH') : '-'}</span>
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">สถานที่</small>
                <span>{selectedWork.location || '-'}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">รายละเอียดงาน</small>
                <p className="mb-0">{selectedWork.job_detail || '-'}</p>
              </div>
              <div className="col-md-4 text-md-end">
                <div className="p-3 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25">
                  <small className="text-primary d-block fw-bold mb-1">ราคางานรวม</small>
                  <h3 className="fw-bold mb-0 text-primary">
                    ฿{Number(selectedWork.job_price || 0).toLocaleString()}
                  </h3>
                </div>
              </div>

              {/* ตารางรายการวัสดุ/ค่าใช้จ่าย */}
              <div className="mt-3">
                <h6 className="fw-bold text-secondary mb-2">
                  <i className="bi bi-tools me-2"></i>รายการวัสดุและค่าใช้จ่าย
                </h6>
                {loadingExpenses ? (
                  <div className="text-center text-muted py-3"><div className="spinner-border spinner-border-sm me-2"></div>กำลังโหลด...</div>
                ) : expenses.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered mb-0">
                      <thead className="table-light text-center">
                        <tr>
                          <th>#</th>
                          <th>หมายเหตุ / รายการ</th>
                          <th>ค่าวัสดุ</th>
                          <th>ค่าใช้จ่ายอื่น</th>
                          <th>รวม</th>
                          <th>รายได้</th>
                          <th>กำไร</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((exp, i) => (
                          <tr key={exp.expense_id} className="text-center">
                            <td className="text-muted">{i + 1}</td>
                            <td className="text-start">{exp.note || '-'}</td>
                            <td>{Number(exp.material_cost || 0).toLocaleString()}</td>
                            <td>{Number(exp.other_cost || 0).toLocaleString()}</td>
                            <td className="fw-semibold">{Number(exp.total_cost || 0).toLocaleString()}</td>
                            <td className="text-success fw-semibold">{Number(exp.job_price || 0).toLocaleString()}</td>
                            <td className={`fw-bold ${Number(exp.profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                              {Number(exp.profit || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-secondary fw-bold text-center">
                        <tr>
                          <td colSpan="2">รวมทั้งหมด</td>
                          <td>{expenses.reduce((s, e) => s + Number(e.material_cost || 0), 0).toLocaleString()}</td>
                          <td>{expenses.reduce((s, e) => s + Number(e.other_cost || 0), 0).toLocaleString()}</td>
                          <td>{expenses.reduce((s, e) => s + Number(e.total_cost || 0), 0).toLocaleString()}</td>
                          <td className="text-success">{expenses.reduce((s, e) => s + Number(e.job_price || 0), 0).toLocaleString()}</td>
                          <td className={expenses.reduce((s, e) => s + Number(e.profit || 0), 0) >= 0 ? 'text-success' : 'text-danger'}>
                            {expenses.reduce((s, e) => s + Number(e.profit || 0), 0).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted small mb-0"><i className="bi bi-inbox me-1"></i>ยังไม่มีรายการวัสดุ</p>
                )}
              </div>

              {selectedWork.status === 'เสร็จสิ้น' && (
                <div className="mt-4 p-3 bg-light border border-secondary rounded shadow-sm">
                  <h6 className="fw-bold mb-3 text-primary">
                    <i className="bi bi-cash-stack me-2"></i> สรุปข้อมูลทางการเงิน
                  </h6>
                  <div className="row text-center">
                    <div className="col-3">
                      <small className="text-muted d-block">รายได้</small>
                      <span className="fw-bold fs-5 text-dark">
                        {Number(selectedWork.job_price || 0).toLocaleString()}
                      </span>
                      <small className="text-muted ms-1">บาท</small>
                    </div>
                    <div className="col-3 border-start">
                      <small className="text-muted d-block">ค่าวัสดุ</small>
                      <span className="fw-bold fs-5 text-warning">
                        {Number(selectedWork.material_cost || 0).toLocaleString()}
                      </span>
                      <small className="text-muted ms-1">บาท</small>
                    </div>
                    <div className="col-3 border-start">
                      <small className="text-muted d-block">ค่าใช้จ่ายอื่น</small>
                      <span className="fw-bold fs-5 text-warning">
                        {Number(selectedWork.other_cost || 0).toLocaleString()}
                      </span>
                      <small className="text-muted ms-1">บาท</small>
                    </div>
                    <div className="col-3 border-start">
                      <small className="text-muted d-block">กำไรสุทธิ</small>
                      <span className={`fw-bold fs-5 ${Number(selectedWork.profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                        {Number(selectedWork.profit || 0).toLocaleString()}
                      </span>
                      <small className="text-muted ms-1">บาท</small>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetail}>ปิด</Button>
        </Modal.Footer>
      </Modal>

      {/* Stats, Table, Pagination       {/* Stats, Table, Pagination เหมือนเดิม ... */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div><h3 className="mb-2"><i className="bi bi-file-text-fill me-2"></i>ระบบงาน</h3><p className="text-muted mb-0">จัดการและติดตามประวัติการทำงานทั้งหมด</p></div>
          <Button variant="primary" onClick={handleShow} size="m"><i className="bi bi-plus-circle me-2"></i>เพิ่มงานใหม่</Button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><div className="d-flex align-items-center"><div className="bg-primary bg-opacity-10 p-3 rounded me-3"><i className="bi bi-list-check text-primary fs-4"></i></div><div><small className="text-muted">งานทั้งหมด</small><h3 className="mb-0">{totalWorks}</h3></div></div></div></div></div>
        <div className="col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><div className="d-flex align-items-center"><div className="bg-success bg-opacity-10 p-3 rounded me-3"><i className="bi bi-check-circle text-success fs-4"></i></div><div><small className="text-muted">เสร็จสิ้น</small><h3 className="mb-0">{completedWorks}</h3></div></div></div></div></div>
        <div className="col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><div className="d-flex align-items-center"><div className="bg-warning bg-opacity-10 p-3 rounded me-3"><i className="bi bi-clock-history text-warning fs-4"></i></div><div><small className="text-muted">กำลังดำเนินการ</small><h3 className="mb-0">{inProgressWorks}</h3></div></div></div></div></div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3"><Form.Control type="text" placeholder="🔍 ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="col-md-3"><Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}><option value="">ประเภททั้งหมด</option>{workTypes.map(type => <option key={type} value={type}>{type}</option>)}</Form.Select></div>
            <div className="col-md-3"><Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}><option value="">สถานะทั้งหมด</option><option value="รอดำเนินการ">รอดำเนินการ</option><option value="มอบหมายแล้ว">มอบหมายแล้ว</option><option value="กำลังดำเนินการ">กำลังดำเนินการ</option><option value="รอตรวจงาน">รอตรวจงาน</option><option value="เสร็จสิ้น">เสร็จสิ้น</option><option value="ส่งกลับแก้ไข">ส่งกลับแก้ไข</option></Form.Select></div>
            <div className="col-md-3"><Form.Select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}><option value="">ช่วงเวลาทั้งหมด</option><option value="1month">1 เดือนที่ผ่านมา</option><option value="6months">6 เดือนที่ผ่านมา</option><option value="1year">1 ปีที่ผ่านมา</option></Form.Select></div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div style={{ height: '60vh', overflowY: 'auto' }}>
            <Table striped hover className="mb-0">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }} className="table-light">
                <tr className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th style={{ width: '120px' }}>รหัส</th><th>ชื่องาน</th><th>ประเภท</th><th>วันที่</th><th>รายละเอียด</th><th>สถานที่</th><th>สถานะ</th><th style={{ width: '100px' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {paginatedWorks.length > 0 ? (
                  paginatedWorks.map((work) => (
                    <tr key={work.work_id}>
                      <td><Badge bg="secondary">#{work.work_id}</Badge></td>
                      <td className="text-start fw-semibold">{work.job_name}</td>
                      <td><Badge bg="info" text="dark">{work.job_type || '-'}</Badge></td>
                      <td>{work.start_date ? new Date(work.start_date).toLocaleDateString('th-TH') : '-'}</td>
                      <td className="text-start" style={{ maxWidth: '200px' }}><small className="text-muted">{work.job_detail ? work.job_detail.substring(0, 40) + '...' : '-'}</small></td>
                      <td className="text-start"><small>{work.location || '-'}</small></td>
                      <td>{getStatusBadge(work)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm"><i className="bi bi-three-dots"></i></Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleShowDetail(work)}><i className="bi bi-eye me-2 text-primary"></i>ดูรายละเอียด</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEdit(work)}><i className="bi bi-pencil me-2 text-warning"></i>แก้ไขข้อมูล</Dropdown.Item>
                            {work.status === 'รอดำเนินการ' && (<Dropdown.Item onClick={() => handleSendToLeader(work.work_id)}><i className="bi bi-send me-2 text-success"></i>ส่งให้หัวหน้าช่าง</Dropdown.Item>)}
                            {/* <Dropdown.Divider /><Dropdown.Item onClick={() => handleDelete(work.work_id)} className="text-danger"><i className="bi bi-trash me-2"></i>ลบ</Dropdown.Item> */}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="text-center text-muted py-5">ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted">แสดง {(curPage - 1) * itemsPerPage + 1} - {Math.min(curPage * itemsPerPage, filteredWorks.length)} จาก {filteredWorks.length} รายการ</div>
        <div>
          <Button variant="outline-primary" onClick={goToFirst} disabled={curPage === 1} size="sm" className="me-1"><i className="bi bi-chevron-bar-left"></i></Button>
          <Button variant="outline-primary" onClick={goToPrev} disabled={curPage === 1} size="sm" className="me-2"><i className="bi bi-chevron-left"></i></Button>
          <span className="mx-2">หน้า <strong>{curPage}</strong> / {totalPages}</span>
          <Button variant="outline-primary" onClick={goToNext} disabled={curPage === totalPages} size="sm" className="ms-2"><i className="bi bi-chevron-right"></i></Button>
          <Button variant="outline-primary" onClick={goToLast} disabled={curPage === totalPages} size="sm" className="ms-1"><i className="bi bi-chevron-bar-right"></i></Button>
        </div>
      </div>
    </div>
  );
};

export default AdminWork;