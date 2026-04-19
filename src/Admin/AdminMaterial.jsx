import { Form, Button, Card, Table, Badge, Modal, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminMaterial = () => {
    const [materials, setMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
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
            setLoading(true);
            const response = await axios.get('http://192.168.1.93:3000/api/materials');
            setMaterials(response.data);
        } catch (error) {
            console.error("ดึงข้อมูลวัสดุไม่สำเร็จ:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`http://192.168.1.93:3000/api/materials/${formData.material_id}`, formData);
            } else {
                await axios.post('http://192.168.1.93:3000/api/materials/add', formData);
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
        setFormData({ material_code: '', name: '', quantity: '', unit: '', price: '' });
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
                await axios.delete(`http://192.168.1.93:3000/api/materials/${id}`);
                fetchMaterials();
            } catch (error) {
                console.error("ลบข้อมูลไม่สำเร็จ:", error);
                alert("เกิดข้อผิดพลาดในการลบข้อมูล");
            }
        }
    };

    const filteredMaterials = materials.filter(item =>
        item.material_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockCount = materials.filter(m => m.quantity <= 5).length;

    return (
        <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0"><i className="bi bi-box-seam me-2"></i>จัดการวัสดุอุปกรณ์</h3>
                <Button variant="primary" onClick={openAddModal}>
                    <i className="bi bi-plus-circle me-2"></i>เพิ่มวัสดุ
                </Button>
            </div>

            {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-center py-3">
                        <div className="fs-2 fw-bold text-primary">{materials.length}</div>
                        <div className="text-muted small">วัสดุทั้งหมด (รายการ)</div>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-center py-3">
                        <div className="fs-2 fw-bold text-success">
                            {materials.filter(m => m.quantity > 5).length}
                        </div>
                        <div className="text-muted small">วัสดุพร้อมใช้งาน</div>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className={`border-0 shadow-sm text-center py-3 ${lowStockCount > 0 ? 'border-danger border' : ''}`}>
                        <div className={`fs-2 fw-bold ${lowStockCount > 0 ? 'text-danger' : 'text-muted'}`}>
                            {lowStockCount}
                        </div>
                        <div className="text-muted small">วัสดุใกล้หมด (≤5 ชิ้น)</div>
                    </Card>
                </Col>
            </Row>

            {/* Stock Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"><i className="bi bi-archive me-2"></i>คลังวัสดุ</h5>
                    <div style={{ width: '300px' }}>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search"></i>
                            </span>
                            <Form.Control
                                type="text"
                                placeholder="ค้นหารหัส หรือชื่อวัสดุ..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-start-0"
                            />
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-3">รหัส</th>
                                <th>ชื่อวัสดุ</th>
                                <th>ราคา/หน่วย</th>
                                <th>คงเหลือ</th>
                                <th>หน่วย</th>
                                <th>สถานะ</th>
                                <th className="text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm me-2"></div>กำลังโหลดข้อมูล...
                                </td></tr>
                            ) : filteredMaterials.length > 0 ? (
                                filteredMaterials.map(item => (
                                    <tr key={item.material_id}>
                                        <td className="ps-3"><strong>{item.material_code}</strong></td>
                                        <td>{item.name}</td>
                                        <td className="text-success fw-bold">
                                            ฿{Number(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="fw-semibold">{item.quantity}</td>
                                        <td>{item.unit}</td>
                                        <td>
                                            {item.quantity === 0
                                                ? <Badge bg="danger">หมดแล้ว</Badge>
                                                : item.quantity <= 5
                                                ? <Badge bg="warning" text="dark">ใกล้หมด</Badge>
                                                : <Badge bg="success">ปกติ</Badge>
                                            }
                                        </td>
                                        <td className="text-center">
                                            <Button variant="outline-warning" size="sm" className="me-1" onClick={() => openEditModal(item)}>
                                                <i className="bi bi-pencil"></i>
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.material_id)}>
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center py-4 text-muted">
                                    <i className="bi bi-inbox me-2"></i>ไม่พบข้อมูลวัสดุ
                                </td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
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