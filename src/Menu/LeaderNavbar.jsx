import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Leader/leader.css";

const LeaderNavbar = ({ onLogout }) => {
    const location = useLocation()
    const [activeMenu, setActiveMenu] = useState(location.pathname)
    const navigate = useNavigate()
    const [user, setUser] = useState(null)

    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location.pathname])

    const loadUserData = () => {
        try {
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                setUser(JSON.parse(storedUser))
            } else {
                const sessionData = localStorage.getItem('session')
                if (sessionData) {
                    const parsedSession = JSON.parse(sessionData)
                    if (parsedSession.user) {
                        setUser(parsedSession.user)
                    }
                }
            }
        } catch (error) {
            console.error("Error parsing user data from localStorage", error)
        }
    };

    useEffect(() => {
        loadUserData();
        
        // Listen for custom event from LeaderSetting to update profile dynamically
        window.addEventListener('user-profile-updated', loadUserData);
        return () => window.removeEventListener('user-profile-updated', loadUserData);
    }, [])

    const handleLogout = () => {
        if (onLogout) {
            onLogout()
        }
        navigate('/login')
    }

    const getButtonClass = (path) => {
        const isActive = activeMenu === path;
        return `btn w-100 text-start px-3 py-2 mb-2 d-flex align-items-center gap-3 leader-nav-btn ${isActive ? 'active' : ''}`;
    }

    return (
        <div className="d-flex flex-column leader-sidebar">
            
            {/* User Profile Card */}
            <div className="p-4 pb-2 mt-2">
                <div className="position-relative p-3 rounded-4 leader-profile-card">
                    
                    <div className="d-flex flex-column align-items-center mt-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow overflow-hidden leader-avatar">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : user?.name ? (
                                user.name.charAt(0).toUpperCase()
                            ) : (
                                <i className="bi bi-person-fill"></i>
                            )}
                        </div>
                        
                        <div className="text-center w-100 overflow-hidden">
                            <h6 className="fw-bold mb-1 text-truncate" style={{ color: '#f4f4f5', fontSize: '1rem' }}>
                                {user?.name || 'Supervisor'}
                            </h6>
                            <span className="badge px-2 py-1 fw-medium rounded-pill" style={{ fontSize: '0.7rem', backgroundColor: '#3f3f46', color: '#d4d4d8' }}>
                                {user?.role === 'leader' ? 'Leader' : (user?.role || 'Staff').toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-3 pt-4 flex-grow-1">
                <p className="fw-semibold small text-uppercase mb-3 px-2" style={{ letterSpacing: '1px', fontSize: '0.7rem', color: '#71717a' }}>Main Menu</p>
                
                <Link to="/leader" className="text-decoration-none">
                    <button
                        className={getButtonClass('/leader')}
                        onClick={() => setActiveMenu('/leader')}
                    >
                        <i className="bi bi-grid-1x2-fill" style={{ fontSize: '1.1rem' }}></i> หน้าหลัก
                    </button>
                </Link>

                <Link to="/leader-list" className="text-decoration-none">
                    <button
                        className={getButtonClass('/leader-list')}
                        onClick={() => setActiveMenu('/leader-list')}
                    >
                        <i className="bi bi-people-fill" style={{ fontSize: '1.1rem' }}></i> รายชื่อช่าง
                    </button>
                </Link>
            </div>

            <div className="p-4 mt-auto d-flex flex-column gap-2">
                <button
                    className="btn w-100 d-flex align-items-center justify-content-center gap-2 leader-logout-btn"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right fs-5"></i>
                    <span>ออกจากระบบ</span>
                </button>

                <Link to="/leader-setting" className="text-decoration-none">
                    <button
                        className={`btn w-100 d-flex align-items-center justify-content-center gap-2 leader-setting-btn ${activeMenu === '/leader-setting' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('/leader-setting')}
                    >
                        <i className="bi bi-gear-fill fs-5"></i>
                        <span>ตั้งค่า</span>
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default LeaderNavbar