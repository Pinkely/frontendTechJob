import { Form, Button, Card, Row, Col, Nav, Tab, Table, Badge, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminMaterial = () => {
    const [materials, setMaterials] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchRequestTerm, setSearchRequestTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        material_code: '',
        name: '',
        quantity: '',
        unit: '',
        price: ''
    });

    const handleClose = () => {
        setShowModal(false);
        setFormData({ material_code: '', name: '', quantity: '', unit: '', price: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fetchMaterials = async () => {
        try {
            const response = await axios.get('http://192.168.1.106:3000/api/materials');
            setMaterials(response.data);
        } catch (error) {
            console.error("ดึงข้อมูลวัสดุไม่สำเร็จ:", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await axios.get('http://192.168.1.106:3000/api/materials/requests');
            setRequests(response.data);
        } catch (error) {
            console.error("ดึงข้อมูลคำขอเบิกไม่สำเร็จ:", error);
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([fetchMaterials(), fetchRequests()]);
        setLoading(false);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`http://192.168.1.106:3000/api/materials/${formData.material_id}`, formData);
            } else {
                await axios.post('http://192.168.1.106:3000/api/materials/add', formData);
            }
            fetchMaterials();
            handleClose();
        } catch (error) {
            console.error("บันทึกข้อมูลไม่สำเร็จ:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setIsEditing(true);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบวัสดุนี้?")) {
            try {
                await axios.delete(`http://192.168.1.106:3000/api/materials/${id}`);
                fetchMaterials();
            } catch (error) {
                console.error("ลบข้อมูลไม่สำเร็จ:", error);
                alert("เกิดข้อผิดพลาดในการลบข้อมูล");
            }
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        if (window.confirm(`ต้องการ "${status}" คำขอนี้ใช่หรือไม่?`)) {
            try {
                await axios.patch(`http://192.168.1.106:3000/api/materials/request/${requestId}/approve`, {
                    status: status,
                    admin_id: 1
                });
                fetchRequests();
                fetchMaterials();
            } catch (error) {
                console.error("อัปเดตสถานะไม่สำเร็จ:", error);
                const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ";
                alert(errorMessage);
            }
        }
    };

    const filteredMaterials = materials.filter(item =>
        item.material_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRequests = requests.filter(item =>
        item.material_name?.toLowerCase().includes(searchRequestTerm.toLowerCase()) ||
        item.tech_name?.toLowerCase().includes(searchRequestTerm.toLowerCase())
    );

    return (
        <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }}>
            <h3 className="mb-4"><i className="bi bi-box-seam me-2"></i> จัดการวัสดุอุปกรณ์</h3>
            <Tab.Container defaultActiveKey="stock">
                <Row>
                    <Col md={3}>
                        <Card className="mb-3 border-0 shadow-sm">
                            <Card.Body className="p-0">
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link eventKey="stock" className="p-3"><i className="bi bi-archive me-2"></i> คลังวัสดุ</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="requests" className="p-3"><i className="bi bi-clipboard-check me-2"></i> รายการเบิกวัสดุ</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey="stock">
                                <Card className="border-0 shadow-sm">
                                    <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                                        <h5 className="mb-0">รายการวัสดุทั้งหมด</h5>
                                        <Button variant="primary" size="sm" onClick={openAddModal}>
                                            <i className="bi bi-plus-lg me-1"></i> เพิ่มวัสดุใหม่
                                        </Button>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form.Group className="mb-3">
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                                <Form.Control type="text" placeholder="ค้นหารหัสหรือชื่อวัสดุ..." onChange={(e) => setSearchTerm(e.target.value)} />
                                            </div>
                                        </Form.Group>
                                        <Table hover responsive className="align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>รหัส</th><th>ชื่อวัสดุ</th><th>ราคา/หน่วย</th><th>คงเหลือ</th><th>หน่วย</th><th className="text-center">จัดการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="6" className="text-center">กำลังโหลดข้อมูล...</td></tr>
                                                ) : filteredMaterials.length > 0 ? (
                                                    filteredMaterials.map(item => (
                                                        <tr key={item.material_id}>
                                                            <td><strong>{item.material_code}</strong></td>
                                                            <td>{item.name}</td>
                                                            <td className="text-success fw-bold">฿{Number(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td>{item.quantity <= 5 ? <Badge bg="danger">{item.quantity}</Badge> : <span>{item.quantity}</span>}</td>
                                                            <td>{item.unit}</td>
                                                            <td className="text-center">
                                                                <Button variant="outline-warning" size="sm" className="me-1" onClick={() => openEditModal(item)}><i className="bi bi-pencil"></i></Button>
                                                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.material_id)}><i className="bi bi-trash"></i></Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="6" className="text-center">ไม่พบข้อมูลวัสดุ</td></tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                            <Tab.Pane eventKey="requests">
                                <Card className="border-0 shadow-sm">
                                    <Card.Header className="bg-white py-3">
                                        <h5 className="mb-0">รายการคำขอเบิกวัสดุ</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form.Group className="mb-3">
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                                <Form.Control type="text" placeholder="ค้นหาชื่อวัสดุ หรือ ชื่อช่างเบิก..." onChange={(e) => setSearchRequestTerm(e.target.value)} />
                                            </div>
                                        </Form.Group>
                                        <Table hover responsive className="align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>รหัสคำขอ</th><th>ผู้เบิก (ช่าง)</th><th>ชื่อวัสดุ</th><th>จำนวนเบิก</th><th>สถานะ</th><th className="text-center">การจัดการ</th><th>วันที่ขอเบิก</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="7" className="text-center">กำลังโหลดข้อมูล...</td></tr>
                                                ) : filteredRequests.length > 0 ? (
                                                    filteredRequests.map(item => (
                                                        <tr key={item.request_id}>
                                                            <td><strong>REQ-{item.request_id}</strong></td>
                                                            <td>{item.tech_name || '-'}</td>
                                                            <td>{item.material_name || '-'}</td>
                                                            <td>{item.quantity} {item.unit}</td>
                                                            <td>
                                                                <Badge bg={item.status === 'อนุมัติ' ? 'success' : item.status === 'ไม่อนุมัติ' ? 'danger' : 'warning'}>{item.status}</Badge>
                                                            </td>
                                                            <td className="text-center">
                                                                {item.status === 'รออนุมัติ' ? (
                                                                    <>
                                                                        <Button variant="outline-success" size="sm" className="me-1" onClick={() => handleUpdateStatus(item.request_id, 'อนุมัติ')}><i className="bi bi-check-circle"></i> อนุมัติ</Button>
                                                                        <Button variant="outline-danger" size="sm" onClick={() => handleUpdateStatus(item.request_id, 'ไม่อนุมัติ')}><i className="bi bi-x-circle"></i> ปฏิเสธ</Button>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted">-</span>
                                                                )}
                                                            </td>
                                                            <td>{item.request_at ? new Date(item.request_at).toLocaleDateString('th-TH') : '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="7" className="text-center">ไม่พบข้อมูลคำขอเบิกวัสดุ</td></tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'แก้ไขวัสดุ' : 'เพิ่มวัสดุใหม่'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>รหัสวัสดุ</Form.Label>
                                    <Form.Control type="text" name="material_code" value={formData.material_code} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>ชื่อวัสดุ</Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>จำนวนคงเหลือ</Form.Label>
                                    <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>หน่วยนับ</Form.Label>
                                    <Form.Control type="text" name="unit" value={formData.unit} onChange={handleInputChange} placeholder="เช่น ชิ้น, กล่อง" required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>ราคา/หน่วย (บาท)</Form.Label>
                                    <Form.Control type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" min="0" step="0.01" required />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>ยกเลิก</Button>
                        <Button variant="primary" type="submit">บันทึกข้อมูล</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminMaterial;