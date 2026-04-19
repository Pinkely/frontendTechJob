import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Nav, Tab } from 'react-bootstrap';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
  
  body {
    font-family: 'Prompt', sans-serif;
    background-color: #f4f4f5;
  }

  .glass-card {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
  }

  /* Navigation Styling */
  .setting-nav .nav-link {
    color: #4b5563;
    border-radius: 6px;
    padding: 10px 16px;
    margin-bottom: 4px;
    font-weight: 500;
  }
  
  .setting-nav .nav-link:hover {
    background-color: #f3f4f6;
    color: #111827;
  }

  .setting-nav .nav-link.active {
    background-color: #18181b;
    color: white;
  }

  /* Form Controls */
  .form-control, .form-select {
    border-radius: 6px;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    background-color: #f9fafb;
  }

  .form-control:focus, .form-select:focus {
    border-color: #18181b;
    box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.1);
    background-color: #fff;
  }

  /* Switch Styling */
  .form-check-input:checked {
    background-color: #18181b;
    border-color: #18181b;
  }

  .btn-gradient {
    background: #18181b;
    border: 1px solid #18181b;
    color: white;
    padding: 8px 20px;
    border-radius: 6px;
    transition: all 0.2s;
  }
  
  .btn-gradient:hover {
    background: #27272a;
    color: white;
  }

  .section-title {
    color: #111827;
    font-weight: 600;
    margin-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 10px;
  }
`;

const LeaderSetting = () => {
    // Profile settings
    const [profile, setProfile] = useState({
        name: 'Leader',
        email: 'Leader@company.com',
        phone: '089-964-5838',
        avatar: null
    });

    // System settings
    const [system, setSystem] = useState({
        language: 'th',
        timezone: 'Asia/Bangkok',
        dateFormat: 'DD/MM/YYYY',
        currency: 'THB'
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotify: true,
        smsNotify: false,
        pushNotify: true,
        weeklyReport: true,
        monthlyReport: false
    });

    // Security settings
    const [security, setSecurity] = useState({
        twoFactor: false,
        sessionTimeout: '30',
        loginAlert: true
    });

    const handleProfileChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSystemChange = (field, value) => {
        setSystem(prev => ({ ...prev, [field]: value }));
    };

    const handleNotificationChange = (field, value) => {
        setNotifications(prev => ({ ...prev, [field]: value }));
    };

    const handleSecurityChange = (field, value) => {
        setSecurity(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
        console.log({ profile, system, notifications, security });
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', padding: "30px 50px", marginLeft: '14rem', backgroundColor: "#f4f4f5" }}>
            <style>{styles}</style>

            {/* Header */}
            <div className="mb-5">
                <h2 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
                    <i className="bi bi-gear-fill me-2" style={{ color: "#4a4eb7" }}></i>
                    ตั้งค่าระบบ
                </h2>
                <p className="text-muted">จัดการข้อมูลส่วนตัวและการทำงานของระบบ</p>
            </div>

            <Tab.Container defaultActiveKey="profile">
                <Row className="g-4">
                    {/* Sidebar Menu */}
                    <Col md={3}>
                        <Card className="glass-card border-0 h-100">
                            <Card.Body className="p-3">
                                <Nav variant="pills" className="flex-column setting-nav">
                                    <Nav.Item>
                                        <Nav.Link eventKey="profile" className="d-flex align-items-center">
                                            <i className="bi bi-person-circle me-3 fs-5"></i>
                                            ข้อมูลส่วนตัว
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="system" className="d-flex align-items-center">
                                            <i className="bi bi-sliders me-3 fs-5"></i>
                                            ตั้งค่าระบบ
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="notifications" className="d-flex align-items-center">
                                            <i className="bi bi-bell me-3 fs-5"></i>
                                            การแจ้งเตือน
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="security" className="d-flex align-items-center">
                                            <i className="bi bi-shield-check me-3 fs-5"></i>
                                            ความปลอดภัย
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Content Area */}
                    <Col md={9}>
                        <div className="glass-card p-4 h-100 position-relative">
                            <Tab.Content>
                                {/* Profile Tab */}
                                <Tab.Pane eventKey="profile">
                                    <h5 className="section-title">ข้อมูลส่วนตัว</h5>
                                    <Row className="justify-content-center mb-4">
                                        <Col md={12} className="text-center mb-4">
                                            <div className="position-relative d-inline-block">
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm"
                                                    style={{ width: '120px', height: '120px', backgroundColor: '#eef2ff', border: '4px solid white' }}
                                                >
                                                    <i className="bi bi-person-fill" style={{ fontSize: '4rem', color: '#4a4eb7' }}></i>
                                                </div>
                                                <div
                                                    className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm p-2"
                                                    style={{ cursor: 'pointer', border: '1px solid #e2e8f0' }}
                                                >
                                                    <i className="bi bi-camera-fill text-primary"></i>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-muted small">อัปโหลดรูปโปรไฟล์ (สูงสุด 2MB)</div>
                                        </Col>

                                        <Col md={8}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold">ชื่อ-นามสกุล</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={profile.name}
                                                    onChange={(e) => handleProfileChange('name', e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold">อีเมล</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => handleProfileChange('email', e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold">เบอร์โทรศัพท์</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    value={profile.phone}
                                                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                {/* System Tab */}
                                <Tab.Pane eventKey="system">
                                    <h5 className="section-title">ตั้งค่าระบบทั่วไป</h5>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold">ภาษา</Form.Label>
                                                <Form.Select
                                                    value={system.language}
                                                    onChange={(e) => handleSystemChange('language', e.target.value)}
                                                >
                                                    <option value="th">🇹🇭 ไทย</option>
                                                    <option value="en">🇺🇸 English</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold">เขตเวลา</Form.Label>
                                                <Form.Select
                                                    value={system.timezone}
                                                    onChange={(e) => handleSystemChange('timezone', e.target.value)}
                                                >
                                                    <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                                                    <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                                                    <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold">รูปแบบวันที่</Form.Label>
                                                <Form.Select
                                                    value={system.dateFormat}
                                                    onChange={(e) => handleSystemChange('dateFormat', e.target.value)}
                                                >
                                                    <option value="DD/MM/YYYY">31/12/2024</option>
                                                    <option value="MM/DD/YYYY">12/31/2024</option>
                                                    <option value="YYYY-MM-DD">2024-12-31</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold">สกุลเงิน</Form.Label>
                                                <Form.Select
                                                    value={system.currency}
                                                    onChange={(e) => handleSystemChange('currency', e.target.value)}
                                                >
                                                    <option value="THB">฿ บาท (THB)</option>
                                                    <option value="USD">$ ดอลลาร์ (USD)</option>
                                                    <option value="EUR">€ ยูโร (EUR)</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                {/* Notifications Tab */}
                                <Tab.Pane eventKey="notifications">
                                    <h5 className="section-title">การแจ้งเตือน</h5>
                                    <div className="bg-light p-4 rounded-3 mb-4">
                                        <h6 className="fw-bold mb-3 text-dark">ช่องทางการติดต่อ</h6>
                                        <Form.Check
                                            type="switch"
                                            id="emailNotify"
                                            label="แจ้งเตือนทางอีเมล"
                                            checked={notifications.emailNotify}
                                            onChange={(e) => handleNotificationChange('emailNotify', e.target.checked)}
                                            className="mb-3"
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="smsNotify"
                                            label="แจ้งเตือนทาง SMS"
                                            checked={notifications.smsNotify}
                                            onChange={(e) => handleNotificationChange('smsNotify', e.target.checked)}
                                            className="mb-3"
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="pushNotify"
                                            label="แจ้งเตือนผ่านแอปพลิเคชัน (Push Notification)"
                                            checked={notifications.pushNotify}
                                            onChange={(e) => handleNotificationChange('pushNotify', e.target.checked)}
                                            className="mb-3"
                                        />
                                    </div>

                                    <div className="bg-light p-4 rounded-3">
                                        <h6 className="fw-bold mb-3 text-dark">สรุปรายงาน</h6>
                                        <Form.Check
                                            type="switch"
                                            id="weeklyReport"
                                            label="ส่งรายงานสรุปประจำสัปดาห์"
                                            checked={notifications.weeklyReport}
                                            onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                                            className="mb-3"
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="monthlyReport"
                                            label="ส่งรายงานสรุปประจำเดือน"
                                            checked={notifications.monthlyReport}
                                            onChange={(e) => handleNotificationChange('monthlyReport', e.target.checked)}
                                            className="mb-3"
                                        />
                                    </div>
                                </Tab.Pane>

                                {/* Security Tab */}
                                <Tab.Pane eventKey="security">
                                    <h5 className="section-title">ความปลอดภัย & การเข้าสู่ระบบ</h5>

                                    <div className="mb-4">
                                        <Form.Check
                                            type="switch"
                                            id="loginAlert"
                                            label={
                                                <span>
                                                    แจ้งเตือนเมื่อเข้าสู่ระบบจากอุปกรณ์ใหม่ <span className="text-muted small">(แนะนำ)</span>
                                                </span>
                                            }
                                            checked={security.loginAlert}
                                            onChange={(e) => handleSecurityChange('loginAlert', e.target.checked)}
                                            className="mb-3"
                                        />

                                        <Form.Group className="mb-3">
                                            <Form.Label className="text-muted small fw-bold">ตัดการเชื่อมต่ออัตโนมัติ (Session Timeout)</Form.Label>
                                            <Form.Select
                                                value={security.sessionTimeout}
                                                onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                                                style={{ maxWidth: '300px' }}
                                            >
                                                <option value="15">15 นาที</option>
                                                <option value="30">30 นาที</option>
                                                <option value="60">1 ชั่วโมง</option>
                                                <option value="120">2 ชั่วโมง</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>

                                    <h6 className="fw-bold mt-5 mb-3 pt-3 border-top">เปลี่ยนรหัสผ่าน</h6>
                                    <Row>
                                        <Col md={8}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold">รหัสผ่านปัจจุบัน</Form.Label>
                                                <Form.Control type="password" />
                                            </Form.Group>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="text-muted small fw-bold">รหัสผ่านใหม่</Form.Label>
                                                        <Form.Control type="password" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="text-muted small fw-bold">ยืนยันรหัสผ่านใหม่</Form.Label>
                                                        <Form.Control type="password" />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Button variant="outline-danger" size="sm" className="mt-2 rounded-pill px-3">
                                                <i className="bi bi-key me-1"></i> อัปเดตรหัสผ่าน
                                            </Button>
                                        </Col>
                                    </Row>
                                </Tab.Pane>
                            </Tab.Content>

                            {/* Footer Action Buttons */}
                            <div className="mt-5 d-flex justify-content-end border-top pt-4">
                                <Button variant="light" className="me-3 px-4 rounded-3 text-muted">ยกเลิก</Button>
                                <Button className="btn-gradient fw-bold" onClick={handleSave}>
                                    <i className="bi bi-check2-circle me-2"></i>
                                    บันทึกการเปลี่ยนแปลง
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Tab.Container>
        </div>
    );
};

export default LeaderSetting;