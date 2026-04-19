import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios' // เพิ่ม import axios

const UserNavbar = ({ onLogout }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState(location.pathname)
    const [userProfile, setUserProfile] = useState(null)

    useEffect(() => {
        setActiveMenu(location.pathname)

        const fetchNavbarData = async () => {
            // ดึงข้อมูล User จาก session ที่ App.jsx เก็บไว้ตอน Login
            const storedSession = JSON.parse(localStorage.getItem('session'));
            const userData = storedSession?.user;
            const userId = userData?.id || userData?.userId; // ดึง ID จาก session

            if (userId) {
                try {
                    const response = await axios.get(`http://192.168.1.106:3000/users/${userId}`);

                    if (response.data && response.data.user) {
                        setUserProfile(response.data.user); // เก็บข้อมูลที่ได้ลง State
                    }
                } catch (error) {
                    console.error("Navbar fetch error:", error);
                }
            }
        };

        fetchNavbarData();
    }, [location.pathname])

    const handleLogout = () => {
        localStorage.removeItem('session');
        if (onLogout) onLogout();
        navigate('/login');
    }

    return (
        <div className="fixed-top h-100 shadow-lg border-end bg-white" style={{ width: '240px', zIndex: 1030 }}>
            <div className="d-flex flex-column h-100">
                <div className="p-4 mb-2 text-center border-bottom bg-light">
                    <div className="position-relative d-inline-block mb-3">
                        <div className="rounded-circle border border-3 border-primary p-1 shadow-sm" style={{ width: '90px', height: '90px' }}>
                            <Link to="/profile">
                                {userProfile?.avatar ? (
                                    <img src={userProfile.avatar} alt="Profile" className="rounded-circle w-100 h-100" style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div className="bg-primary-subtle rounded-circle w-100 h-100 d-flex align-items-center justify-content-center">
                                        <i className="bi bi-person-fill text-primary fs-1"></i>
                                    </div>
                                )}
                            </Link>
                        </div>
                        <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white" style={{ width: '18px', height: '18px' }}></span>
                    </div>

                    <h6 className="mb-0 fw-bold text-dark text-truncate px-2">
                        {userProfile ? userProfile.name : 'กำลังโหลด...'}
                    </h6>
                    <p className="small text-muted mb-3">
                        {userProfile ? userProfile.role : 'ตำแหน่งทั่วไป'}
                    </p>

                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-box-arrow-right"></i>
                        <span>ออกจากระบบ</span>
                    </button>
                </div>

                <div className="flex-grow-1 overflow-auto px-3 py-2">
                    <p className="text-uppercase x-small fw-bold text-muted mb-3 ps-2" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>เมนูหลัก</p>
                    <div className="d-flex flex-column gap-1">
                        <MenuButton to="/user" active={activeMenu === '/user'} icon="bi-grid-1x2-fill" label="แดชบอร์ด" />
                        <MenuButton to="/calendar" active={activeMenu === '/calendar'} icon="bi-calendar-event" label="ปฏิทินงาน" />
                        <MenuButton to="/worksheet" active={activeMenu === '/worksheet'} icon="bi-file-earmark-text" label="ใบงานของฉัน" />
                    </div>
                </div>

                <div className="p-3 text-center border-top">
                    <div className="small fw-bold text-primary">TECH <span className="text-dark">JOB</span></div>
                </div>
            </div>

            <Link to="/notification" className="position-fixed" style={{ bottom: '30px', left: '230px', zIndex: 1040 }}>
                <button className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-bell-fill fs-5 text-white"></i>
                </button>
            </Link>
        </div>
    )
}

const MenuButton = ({ to, active, icon, label }) => (
    <Link to={to} className="text-decoration-none">
        <button className={`btn w-100 text-start d-flex align-items-center gap-3 py-2 px-3 rounded-3 transition-all ${active ? 'btn-primary shadow-sm text-white' : 'btn-light text-secondary'
            }`}>
            <i className={`bi ${icon} ${active ? 'text-white' : 'text-primary'}`}></i>
            <span className="fw-medium">{label}</span>
        </button>
    </Link>
)
    
export default UserNavbar