import { Form, Button, Card, Row, Col, Nav, Tab } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  // --- State สำหรับเก็บค่าต่างๆ แยกตามหมวดหมู่ ---

  // 1. Profile settings เปลี่ยนค่าเริ่มต้นให้เป็นค่าว่างไว้ก่อน
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null
  });

  // 2. System settings (ตั้งค่าระบบ: ภาษา, เวลา)
  const [system, setSystem] = useState({
    language: 'th',
    timezone: 'Asia/Bangkok',
    dateFormat: 'DD/MM/YYYY',
    currency: 'THB'
  });

  // 3. Notification settings (ตั้งค่าการแจ้งเตือน)
  const [notifications, setNotifications] = useState({
    emailNotify: true,
    smsNotify: false,
    pushNotify: true,
    weeklyReport: true,
    monthlyReport: false
  });

  // 4. Security settings (ความปลอดภัย)
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    loginAlert: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // --- เพิ่ม useEffect เพื่อดึงข้อมูลจาก Backend ---
  useEffect(() => {
    // ดึงข้อมูล User ที่ Login อยู่จาก LocalStorage
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    console.log("ข้อมูลใน LocalStorage คือ:", loggedInUser);

    // 1. แก้เป็น loggedInUser.id ให้ตรงกับคีย์ใน Object
    if (loggedInUser && loggedInUser.id) {

      // เซ็ตข้อมูลชุดแรกจาก LocalStorage ให้โชว์ชื่อและอีเมลทันทีไม่ต้องรอโหลด
      setProfile({
        name: loggedInUser.name || '',
        email: loggedInUser.email || '',
        phone: '', // ปล่อยว่างไว้ก่อน รอเบอร์โทรจาก Backend
        avatar: null
      });

      // 2. ยิง API ไปดึงข้อมูลเต็ม (เช็ค URL ของ Backend ให้ตรงด้วยนะครับ)
      // เปลี่ยนจาก /api/users/ เป็นเส้นทางที่ตั้งไว้ (เช่น /api/manager/profile/)
      axios.get(`http://localhost:3000/api/manager/profile/${loggedInUser.id}`)
        .then(response => {
          console.log("ข้อมูล User จาก Backend:", response.data);
          const userData = response.data;

          // 3. เอาข้อมูลจาก Backend มาอัปเดตทับอีกรอบ เพื่อใส่เบอร์โทรศัพท์
          setProfile({
            name: userData.name || loggedInUser.name || '',
            email: userData.email || loggedInUser.email || '',
            phone: userData.phone || '', // ได้เบอร์โทรมาแล้ว!
            avatar: null
          });
        })
        .catch(error => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, []);

  // --- ฟังก์ชันจัดการการเปลี่ยนค่า (Handle Change) ---
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

  // ฟังก์ชันกดบันทึก
  // ใน ManagerSetting.jsx หาฟังก์ชัน handleSave แล้วแทนที่ด้วยโค้ดนี้:
  const handleSave = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    if (loggedInUser && loggedInUser.id) {
      try {
        // เรียก API โดยส่งไอดี และข้อมูลใน state profile ไป
        const response = await axios.put(`http://localhost:3000/api/manager/update-profile/${loggedInUser.id}`, {
          name: profile.name,
          email: profile.email,
          phone: profile.phone
        });

        if (response.status === 200) {
          alert('บันทึกข้อมูลส่วนตัวลงฐานข้อมูลเรียบร้อยแล้ว');

          // อัปเดตข้อมูลใน LocalStorage ด้วยเพื่อให้ชื่อที่ Navbar เปลี่ยนตาม (ถ้ามีแสดง)
          const updatedUser = { ...loggedInUser, name: profile.name, email: profile.email };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } else {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    }
  };

  const handleChangePassword = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/api/manager/update-password/${loggedInUser.id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      if (response.status === 200) {
        alert('เปลี่ยนรหัสผ่านสำเร็จ');
        // ล้างฟอร์ม
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    }
  };

  return (
    <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }} >
      <h3 className="mb-4">
        <i className="bi bi-gear me-2"></i>
        ตั้งค่าระบบ
      </h3>

      <Tab.Container defaultActiveKey="profile">
        <Row>
          {/* เมนูด้านซ้าย (Sidebar Tabs) */}
          <Col md={3}>
            <Card className="mb-3">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="profile" className="d-flex align-items-center p-3">
                      <i className="bi bi-person-circle me-2"></i>
                      ข้อมูลส่วนตัว
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="system" className="d-flex align-items-center p-3">
                      <i className="bi bi-gear me-2"></i>
                      ระบบ
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications" className="d-flex align-items-center p-3">
                      <i className="bi bi-bell me-2"></i>
                      การแจ้งเตือน
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="security" className="d-flex align-items-center p-3">
                      <i className="bi bi-shield-lock me-2"></i>
                      ความปลอดภัย
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* เนื้อหาด้านขวา (Content Area) */}
          <Col md={9}>
            <Tab.Content>
              {/* Profile Tab */}
              <Tab.Pane eventKey="profile">
                <Card>
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">ข้อมูลส่วนตัว</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-4">
                      <Col md={3} className="text-center">
                        <div
                          className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                          style={{ width: '100px', height: '100px' }}
                        >
                          <i className="bi bi-person-fill text-white" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <Button variant="outline-primary" size="sm">
                          <i className="bi bi-camera me-1"></i>
                          เปลี่ยนรูป
                        </Button>
                      </Col>
                      <Col md={9}>
                        <Form.Group className="mb-3">
                          <Form.Label>ชื่อ-นามสกุล</Form.Label>
                          <Form.Control
                            type="text"
                            value={profile.name}
                            onChange={(e) => handleProfileChange('name', e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>อีเมล</Form.Label>
                          <Form.Control
                            type="email"
                            value={profile.email}
                            onChange={(e) => handleProfileChange('email', e.target.value)}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>เบอร์โทรศัพท์</Form.Label>
                          <Form.Control
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* System Tab */}
              <Tab.Pane eventKey="system">
                <Card>
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">ตั้งค่าระบบ</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>ภาษา</Form.Label>
                          <Form.Select
                            value={system.language}
                            onChange={(e) => handleSystemChange('language', e.target.value)}
                          >
                            <option value="th">ไทย</option>
                            <option value="en">English</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>เขตเวลา</Form.Label>
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
                          <Form.Label>รูปแบบวันที่</Form.Label>
                          <Form.Select
                            value={system.dateFormat}
                            onChange={(e) => handleSystemChange('dateFormat', e.target.value)}
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>สกุลเงิน</Form.Label>
                          <Form.Select
                            value={system.currency}
                            onChange={(e) => handleSystemChange('currency', e.target.value)}
                          >
                            <option value="THB">บาท (THB)</option>
                            <option value="USD">ดอลลาร์ (USD)</option>
                            <option value="EUR">ยูโร (EUR)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Notifications Tab */}
              <Tab.Pane eventKey="notifications">
                <Card>
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">การแจ้งเตือน</h5>
                  </Card.Header>
                  <Card.Body>
                    <h6 className="text-muted mb-3">ช่องทางการแจ้งเตือน</h6>
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
                      label="Push Notification"
                      checked={notifications.pushNotify}
                      onChange={(e) => handleNotificationChange('pushNotify', e.target.checked)}
                      className="mb-3"
                    />

                    <hr />

                    <h6 className="text-muted mb-3">รายงาน</h6>
                    <Form.Check
                      type="switch"
                      id="weeklyReport"
                      label="รายงานประจำสัปดาห์"
                      checked={notifications.weeklyReport}
                      onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                      className="mb-3"
                    />
                    <Form.Check
                      type="switch"
                      id="monthlyReport"
                      label="รายงานประจำเดือน"
                      checked={notifications.monthlyReport}
                      onChange={(e) => handleNotificationChange('monthlyReport', e.target.checked)}
                      className="mb-3"
                    />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Security Tab */}
              <Tab.Pane eventKey="security">
                <Card className="mb-3">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">ความปลอดภัย</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Check
                      type="switch"
                      id="loginAlert"
                      label="แจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่"
                      checked={security.loginAlert}
                      onChange={(e) => handleSecurityChange('loginAlert', e.target.checked)}
                      className="mb-3"
                    />

                    <Form.Group className="mb-3">
                      <Form.Label>หมดเวลาเซสชัน (นาที)</Form.Label>
                      <Form.Select
                        value={security.sessionTimeout}
                        onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                        style={{ width: '200px' }}
                      >
                        <option value="15">15 นาที</option>
                        <option value="30">30 นาที</option>
                        <option value="60">1 ชั่วโมง</option>
                        <option value="120">2 ชั่วโมง</option>
                      </Form.Select>
                    </Form.Group>

                    <hr />

                    <h6 className="text-muted mb-3">เปลี่ยนรหัสผ่าน</h6>
                    <Form.Group className="mb-3">
                      <Form.Label>รหัสผ่านปัจจุบัน</Form.Label>
                      <Form.Control
                        type="password"
                        style={{ width: '300px' }}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>รหัสผ่านใหม่</Form.Label>
                      <Form.Control
                        type="password"
                        style={{ width: '300px' }}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>ยืนยันรหัสผ่านใหม่</Form.Label>
                      <Form.Control
                        type="password"
                        style={{ width: '300px' }}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </Form.Group>
                    <Button variant="outline-primary" onClick={handleChangePassword}>
                      เปลี่ยนรหัสผ่าน
                    </Button>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>

            {/* Save Button */}
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" className="me-2">ยกเลิก</Button>
              <Button variant="primary" onClick={handleSave}>
                <i className="bi bi-check-lg me-1"></i>
                บันทึกการตั้งค่า
              </Button>
            </div>
          </Col>
        </Row>
      </Tab.Container>
    </div >
  );
};

export default Settings;