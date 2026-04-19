import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Nav, Tab } from 'react-bootstrap';
import "./leader.css";

const LeaderSetting = () => {
    // File input ref for avatar upload
    const fileInputRef = useRef(null);

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

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                setProfile(prev => ({
                    ...prev,
                    name: userObj.name || userObj.username || 'Leader',
                    avatar: userObj.avatar || null
                }));
            }
        } catch (error) {
            console.error("Error loading user data from localStorage", error);
        }
    }, []);

    const handleProfileChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('ไฟล์ภาพมีขนาดใหญ่เกิน 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
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
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                userObj.name = profile.name;
                userObj.avatar = profile.avatar;
                localStorage.setItem('user', JSON.stringify(userObj));
            }
            window.dispatchEvent(new Event('user-profile-updated'));
            alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
        } catch (error) {
            console.error("Error saving user data", error);
        }
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', padding: "30px 50px", marginLeft: '14rem', backgroundColor: "#f4f4f5" }}>

            <div className="mb-5">
                <h2 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
                    <i className="bi bi-gear-fill me-2" style={{ color: "#4a4eb7" }}></i>
                    ตั้งค่า
                </h2>
                <p className="text-muted">จัดการข้อมูลส่วนตัวและการทำงานของระบบ</p>
            </div>

            <Tab.Container defaultActiveKey="profile">
                <Row className="g-4">
                    <Col md={3}>
                        <Card className="glass-card border-0">
                            <Card.Body className="p-3">
                                <Nav variant="pills" className="flex-column setting-nav">
                                    <Nav.Item>
                                        <Nav.Link eventKey="profile" className="d-flex align-items-center mb-2">
                                            <i className="bi bi-person-circle me-3 fs-5"></i>
                                            ข้อมูลส่วนตัว
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="system" className="d-flex align-items-center mb-2">
                                            <i className="bi bi-sliders me-3 fs-5"></i>
                                            ตั้งค่าระบบ
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="notifications" className="d-flex align-items-center mb-2">
                                            <i className="bi bi-bell me-3 fs-5"></i>
                                            การแจ้งเตือน
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="security" className="d-flex align-items-center mb-2">
                                            <i className="bi bi-shield-check me-3 fs-5"></i>
                                            ความปลอดภัย
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={9}>
                        <div className="glass-card p-4 h-100">
                            <Tab.Content>
                                <Tab.Pane eventKey="profile">
                                    <h5 className="section-title">ข้อมูลส่วนตัว</h5>
                                    <div className="text-center mb-5">
                                        <div className="position-relative d-inline-block">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm overflow-hidden"
                                                style={{ width: '120px', height: '120px', backgroundColor: '#eef2ff', border: '4px solid white' }}>
                                                {profile.avatar ? (
                                                    <img src={profile.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <i className="bi bi-person-fill" style={{ fontSize: '4rem', color: '#4a4eb7' }}></i>
                                                )}
                                            </div>
                                            <div className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center"
                                                style={{ cursor: 'pointer', border: '1px solid #e2e8f0', width: '35px', height: '35px' }}
                                                onClick={() => fileInputRef.current.click()}>
                                                <i className="bi bi-camera-fill text-primary"></i>
                                            </div>
                                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                                        </div>
                                        <div className="mt-2 text-muted small">อัปโหลดรูปโปรไฟล์ (สูงสุด 2MB)</div>
                                    </div>
                                    <Row className="justify-content-center">
                                        <Col md={10}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold text-uppercase">ชื่อ-นามสกุล</Form.Label>
                                                <Form.Control type="text" value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold text-uppercase">อีเมล</Form.Label>
                                                <Form.Control type="email" value={profile.email} onChange={(e) => handleProfileChange('email', e.target.value)} />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold text-uppercase">เบอร์โทรศัพท์</Form.Label>
                                                <Form.Control type="tel" value={profile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                <Tab.Pane eventKey="system">
                                    <h5 className="section-title">ตั้งค่าระบบ</h5>
                                    <Row className="g-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted small fw-bold text-uppercase">ภาษา</Form.Label>
                                                <Form.Select value={system.language} onChange={(e) => handleSystemChange('language', e.target.value)}>
                                                    <option value="th">🇹🇭 ไทย</option>
                                                    <option value="en">🇺🇸 English</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted small fw-bold text-uppercase">เขตเวลา</Form.Label>
                                                <Form.Select value={system.timezone} onChange={(e) => handleSystemChange('timezone', e.target.value)}>
                                                    <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                                                    <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>

                                <Tab.Pane eventKey="notifications">
                                    <h5 className="section-title">การแจ้งเตือน</h5>
                                    <div className="p-4 bg-light rounded-4">
                                        <Form.Check type="switch" id="email-notif" label="แจ้งเตือนทางอีเมล" checked={notifications.emailNotify} onChange={(e) => handleNotificationChange('emailNotify', e.target.checked)} className="mb-3" />
                                        <Form.Check type="switch" id="push-notif" label="Push Notification" checked={notifications.pushNotify} onChange={(e) => handleNotificationChange('pushNotify', e.target.checked)} className="mb-3" />
                                    </div>
                                </Tab.Pane>

                                <Tab.Pane eventKey="security">
                                    <h5 className="section-title">ความปลอดภัย</h5>
                                    <div className="mb-4">
                                        <Form.Check type="switch" id="login-alert" label="แจ้งเตือนเมื่อเข้าสู่ระบบจากอุปกรณ์ใหม่" checked={security.loginAlert} onChange={(e) => handleSecurityChange('loginAlert', e.target.checked)} />
                                    </div>
                                    <h6 className="fw-bold mt-5 mb-3 border-top pt-4">เปลี่ยนรหัสผ่าน</h6>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-muted small fw-bold text-uppercase">รหัสผ่านปัจจุบัน</Form.Label>
                                        <Form.Control type="password" />
                                    </Form.Group>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold text-uppercase">รหัสผ่านใหม่</Form.Label>
                                                <Form.Control type="password" />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-muted small fw-bold text-uppercase">ยืนยันรหัสผ่านใหม่</Form.Label>
                                                <Form.Control type="password" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Tab.Pane>
                            </Tab.Content>

                            <div className="mt-5 d-flex justify-content-end border-top pt-4">
                                <Button variant="light" className="me-3 px-4 rounded-3 text-muted">ยกเลิก</Button>
                                <Button className="btn-gradient fw-bold px-4 py-2" onClick={handleSave}>
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