import { Form, Button, Dropdown, Badge, Modal, Table, Row, Col, InputGroup } from 'react-bootstrap';
import { useState, useEffect, useRef, useMemo } from 'react';

const BASE_URL = 'http://localhost:3000/api';

const AdminAccount = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [curPage, setCurPage] = useState(1);
  const itemsPerPage = 10;

  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // --- Image Handling ---
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // --- Refs ---
  const nameRef = useRef();
  const nicknameRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const typeWorkRef = useRef();
  const expertiseRef = useRef();
  const incomeRef = useRef();

  const roleRef = useRef();
  const [selectedRole, setSelectedRole] = useState('technician');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // ─── ดึงข้อมูลช่างและหัวหน้าช่างจาก API ──────────────────────────────────────
  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const [resTech, resSup] = await Promise.all([
        fetch(`${BASE_URL}/users/role/technician`),
        fetch(`${BASE_URL}/users/role/supervisor`),
      ]);

      const dataTech = await resTech.json();
      const dataSup = await resSup.json();
      const combined = [...(dataTech.users || []), ...(dataSup.users || [])];

      const mapped = combined.map(u => ({
        id: u.user_id,
        username: u.username,
        name: u.name,
        role: u.role,
        status: u.status,
        type: u.type || '', 
        income: Number(u.salary) || 0,
        phone: u.phone || '',
        email: u.email || '',
        nickname: u.nickname || '',
        expertise: u.expertise || '',
      }));
      setUsers(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setEditingUser(null);
    setImagePreview(null);
    setSelectedRole('technician');
  };
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (show && editMode && editingUser) {
      setTimeout(() => {
        if (nameRef.current) nameRef.current.value = editingUser.name || '';
        if (nicknameRef.current) nicknameRef.current.value = editingUser.nickname || '';
        if (phoneRef.current) phoneRef.current.value = editingUser.phone || '';
        if (emailRef.current) emailRef.current.value = editingUser.email || '';
        if (typeWorkRef.current) typeWorkRef.current.value = editingUser.typework || '';
        if (expertiseRef.current) expertiseRef.current.value = editingUser.expertise || '';
        if (incomeRef.current) incomeRef.current.value = editingUser.income || '';
        if (editingUser.role) setSelectedRole(editingUser.role);
        // if (editingUser.profileImage) setImagePreview(editingUser.profileImage);
      }, 100);
    } else if (show && !editMode) {
      setImagePreview(null);
    }
  }, [show, editMode, editingUser]);

  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.income && user.income.toString().includes(searchLower)) ||
        (user.typework && user.typework.toLowerCase().includes(searchLower)) ||
        (user.id && user.id.toString().includes(searchTerm));

      const matchType = !filterType || user.typework === filterType;
      const matchStatus = !filterStatus || user.status === filterStatus;
      const matchRole = !filterRole || user.role === filterRole;

      return matchSearch && matchType && matchStatus && matchRole;
    });

    const supervisors = filtered.filter(u => u.role === 'supervisor').sort((a, b) => a.id - b.id);
    const technicians = filtered.filter(u => u.role === 'technician').sort((a, b) => a.id - b.id);
    return [...supervisors, ...technicians];
  }, [users, searchTerm, filterType, filterStatus, filterRole]);

  useEffect(() => { setCurPage(1); }, [searchTerm, filterType, filterStatus, filterRole]);

  const handleEdit = (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setEditingUser(user);
      setEditMode(true);
      setSelectedRole(user.role || 'technician');
      setShow(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบรายชื่อนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`ลบไม่สำเร็จ: ${res.status}`);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  const saveClicked = async () => {
    const name = nameRef.current.value.trim();
    const nickname = nicknameRef.current.value.trim();
    const phone = phoneRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const typework = typeWorkRef.current.value;
    const expertise = expertiseRef.current.value.trim();
    const income = parseFloat(incomeRef.current.value) || 0;
    const role = selectedRole;

    if (!name) { alert('กรุณากรอกชื่อช่าง'); return; }
    if (income <= 0) { alert('กรุณากรอกรายได้ที่ถูกต้อง'); return; }
    if (!typework) { alert('กรุณาเลือกประเภทงาน'); return; }

    const userData = {
      name,
      nickname,
      phone,
      email,
      typework,
      expertise,
      role,
      salary: income,
      // profileImage: imagePreview
    };

    if (editMode && editingUser) {
      try {
        const currentId = editingUser.id || editingUser.user_id;

        const userRes = await fetch(`${BASE_URL}/users/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (!userRes.ok) throw new Error('ไม่สามารถบันทึกข้อมูลส่วนตัวได้');

        const salaryRes = await fetch(`http://localhost:3000/salary/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ salary: income }),
        });

        if (!salaryRes.ok) console.error('เกิดข้อผิดพลาดในการอัปเดตเงินเดือน');

        setUsers(users.map(user =>
          (user.id === currentId || user.user_id === currentId)
            ? { ...user, ...userData, income }
            : user
        ));

        alert('อัปเดตข้อมูลสำเร็จ!');

      } catch (err) {
        console.error('Update error:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        return;
      }

    } else {
      const newUser = {
        user_id: users.reduce((prev, user) => (user.user_id > prev ? user.user_id : prev), 0) + 1,
        ...userData,
        income,
        status: 'ว่าง'
      };
      setUsers([newUser, ...users]);
    }

    handleClose();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'ว่าง': return 'success';
      case 'กำลังทำงาน': return 'primary';
      case 'ลา': return 'danger';
      default: return 'secondary';
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const goToFirst = () => setCurPage(1);
  const goToLast = () => setCurPage(totalPages);
  const goToNext = () => setCurPage(prev => Math.min(prev + 1, totalPages));
  const goToPrev = () => setCurPage(prev => Math.max(prev - 1, 1));

  const totalWork = users.length;
  const totalIncome = users.reduce((sum, user) => sum + Number(user.income || 0), 0);
  const totalPresent = users.filter(user => user.status === 'กำลังทำงาน' || user.status === 'มา' || user.status === 'ว่าง').length;

  const paginatedUsers = filteredUsers.slice((curPage - 1) * itemsPerPage, curPage * itemsPerPage);

  return (
    <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }}>

      <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="bg-light border-0">
          <Modal.Title className="fw-bold text-primary">
            <i className={`bi ${editMode ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-2`}></i>
            {editMode ? 'แก้ไขข้อมูลพนักงาน' : 'ลงทะเบียนช่างใหม่'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 py-4">
          <Form>
            <div className="d-flex justify-content-end mb-3">
              <Badge bg="secondary" className="p-2 px-3 fw-normal" style={{ fontSize: '0.9rem' }}>
                {editMode ? `รหัส: ${editingUser?.id}` : 'ช่างใหม่'}
              </Badge>
            </div>

            <div className="text-center mb-4">
              <div onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer', display: 'inline-block' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="profile" className="rounded-circle border" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                ) : (
                  <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-secondary mx-auto" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-camera fs-3"></i>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }} />
              <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>คลิกเพื่อเลือกรูป</div>
            </div>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>ชื่อ - นามสกุล <span className="text-danger">*</span></Form.Label>
                  <Form.Control ref={nameRef} placeholder="กรอกชื่อ-นามสกุล" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>ชื่อเล่น</Form.Label>
                  <Form.Control ref={nicknameRef} placeholder="กรอกชื่อเล่น" />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>เบอร์โทรศัพท์</Form.Label>
                  <Form.Control ref={phoneRef} placeholder="กรอกเบอร์โทร" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>อีเมล</Form.Label>
                  <Form.Control type="email" ref={emailRef} placeholder="กรอกอีเมล" />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>ประเภทงาน <span className="text-danger">*</span></Form.Label>
                  <Form.Select ref={typeWorkRef}>
                    <option value="">-- เลือกประเภท --</option>
                    <option value="ช่างไฟฟ้า">ช่างไฟฟ้า</option>
                    <option value="ช่างประปา">ช่างประปา</option>
                    <option value="ช่างทาสี">ช่างทาสี</option>
                    <option value="ช่างแอร์">ช่างแอร์</option>
                    <option value="ช่าง IT">ช่าง IT</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>ความเชี่ยวชาญ</Form.Label>
                  <Form.Control ref={expertiseRef} placeholder="กรอกความเชี่ยวชาญ" />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>รายได้/เดือน <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                    <InputGroup.Text>฿</InputGroup.Text>
                    <Form.Control type="number" ref={incomeRef} placeholder="0" min="0" />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>ตำแหน่ง (Role) <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    ref={roleRef}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="technician">🔧 ช่าง (Technician)</option>
                    <option value="supervisor">👑 หัวหน้าช่าง (Supervisor)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light border-0">
          <Button variant="light" onClick={handleClose}>ยกเลิก</Button>
          <Button variant="primary" onClick={saveClicked}><i className="bi bi-save me-2"></i>บันทึกข้อมูล</Button>
        </Modal.Footer>
      </Modal>

      <h3 className="mb-2">
        <i className="bi bi-person-badge-fill me-2 text-primary"></i>
        จัดการบัญชีช่าง
      </h3>
      <p className="text-muted mb-4">จัดการรายชื่อ ข้อมูล และสถานะพนักงานช่าง</p>

      {loading && <div className="text-center py-5"><div className="spinner-border text-primary" /></div>}
      {error && <div className="alert alert-danger">เกิดข้อผิดพลาด: {error} <Button size="sm" variant="outline-danger" onClick={fetchTechnicians}>ลองใหม่</Button></div>}

      {!loading && !error && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded me-3"><i className="bi bi-people-fill text-primary fs-4"></i></div>
                    <div><small className="text-muted">ช่างทั้งหมด</small><h3 className="mb-0">{totalWork}</h3></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="bg-danger bg-opacity-10 p-3 rounded me-3"><i className="bi bi-cash-coin text-danger fs-4"></i></div>
                    <div><small className="text-muted">รายจ่ายเงินเดือนรวม</small><h3 className="mb-0">฿{totalIncome.toLocaleString()}</h3></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-3 rounded me-3"><i className="bi bi-person-check-fill text-success fs-4"></i></div>
                    <div><small className="text-muted">พร้อมทำงาน (ว่าง)</small><h3 className="mb-0">{totalPresent}</h3></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <Form.Control type="text" placeholder="🔍 ค้นหาชื่อ, รหัส..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="">ประเภททั้งหมด</option>
                    <option value="ช่างไฟฟ้า">ช่างไฟฟ้า</option>
                    <option value="ช่างประปา">ช่างประปา</option>
                    <option value="ช่างทาสี">ช่างทาสี</option>
                    <option value="ช่างแอร์">ช่างแอร์</option>
                    <option value="ช่าง IT">ช่าง IT</option>
                  </Form.Select>
                </div>
                <div className="col-md-2">
                  <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">สถานะทั้งหมด</option>
                    <option value="ว่าง">ว่าง (พร้อมทำงาน)</option>
                    <option value="กำลังทำงาน">กำลังทำงาน</option>
                    <option value="ลา">ลา</option>
                  </Form.Select>
                </div>
                <div className="col-md-2">
                  <Form.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="">ทุกตำแหน่ง</option>
                    <option value="technician">ช่าง</option>
                    <option value="supervisor">หัวหน้าช่าง</option>
                  </Form.Select>
                </div>
                <div className="col-md-2 text-end">
                  <Button variant="primary" className="w-100" onClick={handleShow}>
                    <i className="bi bi-plus-lg me-1"></i> เพิ่มรายชื่อ
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div style={{ height: '60vh', overflowY: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }} className="table-light">
                    <tr className="text-center">
                      <th style={{ width: '150px' }}>รหัสพนักงาน</th>
                      <th className="text-start ps-4">ชื่อ - นามสกุล</th>
                      <th>ตำแหน่ง</th>
                      <th>ประเภทงาน</th>
                      <th>รายได้/เดือน</th>
                      <th>สถานะ</th>
                      <th style={{ width: '100px' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="text-center align-middle">
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <tr key={user.id}>
                          <td><Badge bg="secondary">{user.id}</Badge></td>
                          <td className="text-start ps-4 fw-semibold">
                            <div className="d-flex align-items-center gap-2">
                              {/* {user.profileImage ? (
                                <img src={user.profileImage} alt="" className="rounded-circle border" style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
                              ) : (
                                <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-secondary" style={{ width: '32px', height: '32px' }}>
                                  <i className="bi bi-person-fill"></i>
                                </div>
                              )} */}
                              <div>{user.name}</div>
                            </div>
                          </td>
                          <td>
                            <Badge bg={user.role === 'supervisor' ? 'warning' : 'info'} text="dark" className="rounded-pill px-3">
                              {user.role === 'supervisor' ? '👑 หัวหน้าช่าง' : '🔧 ช่าง'}
                            </Badge>
                          </td>
                          <td>
                            {user.type
                              ? <Badge bg="light" text="dark" className="border rounded-pill px-3">{user.type}</Badge>
                              : <span className="text-muted">-</span>
                            }
                          </td>
                          <td className="fw-bold text-success">฿{(user.income || 0).toLocaleString()}</td>
                          <td><Badge bg={getStatusBadgeVariant(user.status)} pill>{user.status}</Badge></td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" size="sm">
                                <i className="bi bi-three-dots"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEdit(user.id)}><i className="bi bi-pencil-square me-2 text-warning"></i>แก้ไข</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => handleDelete(user.id)} className="text-danger"><i className="bi bi-trash me-2"></i>ลบ</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-5">
                          <i className="bi bi-inbox fs-1 d-block mb-2"></i> ไม่พบข้อมูล
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              แสดง {filteredUsers.length === 0 ? 0 : (curPage - 1) * itemsPerPage + 1} - {Math.min(curPage * itemsPerPage, filteredUsers.length)} จาก {filteredUsers.length} รายการ
            </div>
            <div>
              <Button variant="outline-primary" onClick={goToFirst} disabled={curPage === 1} size="sm" className="me-1"><i className="bi bi-chevron-bar-left"></i></Button>
              <Button variant="outline-primary" onClick={goToPrev} disabled={curPage === 1} size="sm" className="me-2"><i className="bi bi-chevron-left"></i></Button>
              <span className="mx-2">หน้า <strong>{curPage}</strong> / {totalPages}</span>
              <Button variant="outline-primary" onClick={goToNext} disabled={curPage === totalPages} size="sm" className="ms-2"><i className="bi bi-chevron-right"></i></Button>
              <Button variant="outline-primary" onClick={goToLast} disabled={curPage === totalPages} size="sm" className="ms-1"><i className="bi bi-chevron-bar-right"></i></Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAccount;