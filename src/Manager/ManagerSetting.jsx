import { Form, Button, Card, Row, Col, Nav, Tab } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null
  });

  const [system, setSystem] = useState({ language: 'th', timezone: 'Asia/Bangkok', dateFormat: 'DD/MM/YYYY', currency: 'THB' });
  const [notifications, setNotifications] = useState({ emailNotify: true, smsNotify: false, pushNotify: true, weeklyReport: true, monthlyReport: false });
  const [security, setSecurity] = useState({ loginAlert: true, sessionTimeout: '30' });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ใช้สำหรับการตั้งค่า API URL ให้เปลี่ยนง่ายขึ้นในอนาคต
  const API_BASE_URL = 'http://192.168.1.106:3000/api/manager';

  useEffect(() => {
    // 1. เปลี่ยนมาดึงข้อมูลจากคีย์ "session" ตามที่ App.jsx บันทึกไว้
    const sessionString = localStorage.getItem('session');
    console.log("1. ข้อมูลดิบใน LocalStorage:", sessionString);

    if (!sessionString) return;

    // 2. แปลงข้อมูลและเจาะเข้าไปเอา .user ออกมา
    const sessionData = JSON.parse(sessionString);
    const loggedInUser = sessionData.user;

    // เช็ค id ให้รองรับทั้ง user_id
    const userId = loggedInUser?.id || loggedInUser?.user_id;
    console.log("2. ไอดีผู้ใช้ที่ค้นพบ:", userId);

    if (userId) {
      setProfile(prev => ({
        ...prev,
        name: loggedInUser.name || '',
        email: loggedInUser.email || ''
      }));

      axios.get(`${API_BASE_URL}/profile/${userId}`)
        .then(response => {
          console.log("3. ข้อมูลสำเร็จจาก Backend:", response.data);
          const userData = response.data;
          setProfile({
            name: userData.name || loggedInUser.name || '',
            email: userData.email || loggedInUser.email || '',
            phone: userData.phone || '',
            avatar: null
          });
        })
        .catch(error => {
          console.error("🚨 เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        });
    } else {
      console.warn("ไม่พบ userId ใน Session ครับ");
    }
  }, []);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const sessionString = localStorage.getItem('session');
    if (!sessionString) {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    const sessionData = JSON.parse(sessionString);
    const loggedInUser = sessionData.user;
    const userId = loggedInUser?.id || loggedInUser?.user_id;

    if (userId) {
      try {
        const response = await axios.put(`${API_BASE_URL}/update-profile/${userId}`, {
          name: profile.name,
          email: profile.email,
          phone: profile.phone
        });

        if (response.status === 200) {
          alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
          // อัปเดต Session ใน LocalStorage
          sessionData.user = { ...loggedInUser, name: profile.name, email: profile.email, phone: profile.phone };
          localStorage.setItem('session', JSON.stringify(sessionData));
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    }
  };

  const handleChangePassword = async () => {
    const sessionString = localStorage.getItem('session');
    if (!sessionString) return;

    const sessionData = JSON.parse(sessionString);
    const loggedInUser = sessionData.user;
    const userId = loggedInUser?.id || loggedInUser?.user_id;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/update-password/${userId}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      if (response.status === 200) {
        alert('เปลี่ยนรหัสผ่านสำเร็จ');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    }
  };

  // เพิ่มในส่วนของฟังก์ชันหลักใน ManagerSetting.jsx
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const sessionString = localStorage.getItem('session');
    const sessionData = JSON.parse(sessionString);
    const userId = sessionData.user?.id || sessionData.user?.user_id;

    // สร้าง FormData เพื่อส่งไฟล์
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-avatar/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        // อัปเดต state รูปภาพในหน้าจอทันที
        setProfile(prev => ({ ...prev, avatar: response.data.avatar }));
        alert('เปลี่ยนรูปโปรไฟล์สำเร็จ');
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert('อัปโหลดรูปภาพล้มเหลว');
    }
  };

  // สไตล์ที่ปรับให้ดูนุ่มนวลและน่ารักขึ้นเล็กน้อย
  const inputStyle = { borderRadius: '12px', border: '1px solid #e0e0e0', padding: '10px 15px' };
  const btnSoftStyle = { backgroundColor: '#ffb6c1', borderColor: '#ffb6c1', color: '#fff', borderRadius: '12px', padding: '8px 20px', fontWeight: '500' };

  return (
    <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem', backgroundColor: '#fafafa' }} >
      <h3 className="mb-4" style={{ color: '#555' }}>
        <i className="bi bi-gear me-2"></i>
        ตั้งค่าระบบ
      </h3>

      <Tab.Container defaultActiveKey="profile">
        <Row>
          <Col md={3}>
            <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="profile" className="d-flex align-items-center p-3" style={{ borderRadius: '16px 16px 0 0' }}>
                      <i className="bi bi-person-circle me-2"></i> ข้อมูลส่วนตัว
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="security" className="d-flex align-items-center p-3">
                      <i className="bi bi-shield-lock me-2"></i> ความปลอดภัย
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              {/* Profile Tab */}
              <Tab.Pane eventKey="profile">
                <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <Card.Header className="bg-white border-bottom-0 pt-4 pb-2">
                    <h5 className="mb-0 px-2" style={{ color: '#666' }}>ข้อมูลส่วนตัว</h5>
                  </Card.Header>
                  <Card.Body className="px-4 pb-4">
                    <Row className="mb-4">
                      <Col md={3} className="text-center">
                        <div
                          className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                          style={{ width: '120px', height: '120px', overflow: 'hidden' }}
                        >
                          {profile.avatar ? (
                            <img
                              src={`http://192.168.1.106:3000/uploads/${profile.avatar}`}
                              alt="Profile"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <i className="bi bi-person-fill text-secondary" style={{ fontSize: '4rem' }}></i>
                          )}
                        </div>

                        {/* ซ่อน input file จริงๆ แล้วใช้ปุ่มกดสั่งแทน */}
                        <input
                          type="file"
                          id="avatarInput"
                          hidden
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          style={{ borderRadius: '20px' }}
                          onClick={() => document.getElementById('avatarInput').click()}
                        >
                          <i className="bi bi-camera me-1"></i> เปลี่ยนรูป
                        </Button>
                      </Col>
                      <Col md={9}>
                        <Form.Group className="mb-3">
                          <Form.Label className="text-muted">ชื่อ-นามสกุล</Form.Label>
                          <Form.Control type="text" style={inputStyle} value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="text-muted">อีเมล</Form.Label>
                          <Form.Control type="email" style={inputStyle} value={profile.email} onChange={(e) => handleProfileChange('email', e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="text-muted">เบอร์โทรศัพท์</Form.Label>
                          <Form.Control type="tel" style={inputStyle} value={profile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                <div className="d-flex justify-content-end mt-4">
                  <Button variant="light" className="me-3" style={{ borderRadius: '12px', padding: '8px 20px' }}>ยกเลิก</Button>
                  <Button style={btnSoftStyle} onClick={handleSave}>
                    <i className="bi bi-check-lg me-1"></i> บันทึกข้อมูล
                  </Button>
                </div>
              </Tab.Pane>

              {/* Security Tab */}
              <Tab.Pane eventKey="security">
                <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <Card.Header className="bg-white border-bottom-0 pt-4 pb-2">
                    <h5 className="mb-0 px-2" style={{ color: '#666' }}>เปลี่ยนรหัสผ่าน</h5>
                  </Card.Header>
                  <Card.Body className="px-4 pb-4">
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">รหัสผ่านปัจจุบัน</Form.Label>
                      <Form.Control type="password" style={{ ...inputStyle, maxWidth: '400px' }} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">รหัสผ่านใหม่</Form.Label>
                      <Form.Control type="password" style={{ ...inputStyle, maxWidth: '400px' }} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="text-muted">ยืนยันรหัสผ่านใหม่</Form.Label>
                      <Form.Control type="password" style={{ ...inputStyle, maxWidth: '400px' }} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                    </Form.Group>
                    <Button style={btnSoftStyle} onClick={handleChangePassword}>
                      เปลี่ยนรหัสผ่าน
                    </Button>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div >
  );
};

export default Settings;