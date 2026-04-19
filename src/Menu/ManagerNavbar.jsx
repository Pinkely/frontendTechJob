import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, BarChart2, LogOut, Briefcase, Settings } from 'lucide-react'

const ManagerNavbar = ({ onLogout }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState(location.pathname)

    useEffect(() => { setActiveMenu(location.pathname) }, [location.pathname])

    const handleLogout = () => {
        localStorage.removeItem('session') // แก้เป็น session ให้ตรงกับระบบ login ปัจจุบัน
        if (onLogout) onLogout()
        navigate('/login')
    }

    const menus = [
        { to: '/manager', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
        { to: '/manager-account', icon: <Users size={17} />, label: 'Users' },
        { to: '/manager-record', icon: <BarChart2 size={17} />, label: 'Reports' },
        // เพิ่มเมนู Settings ตรงนี้
        { to: '/manager-setting', icon: <Settings size={17} />, label: 'Settings' },
    ]

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

                .mnav-wrap {
                    position: fixed; top: 0; left: 0;
                    width: 15rem; height: 100vh; z-index: 1030;
                    font-family: 'Kanit', sans-serif;
                    display: flex; flex-direction: column;
                    background: linear-gradient(180deg,#e0f0ff 0%,#f0f8ff 60%,#dbeefe 100%);
                    border-right: 1px solid rgba(147,197,253,0.4);
                    box-shadow: 4px 0 24px rgba(59,130,246,0.08);
                }
                .mnav-wrap::before {
                    content: ''; position: absolute; inset: 0;
                    background-image: radial-gradient(circle,#93c5fd18 1px,transparent 1px);
                    background-size: 24px 24px; pointer-events: none;
                }

                .mnav-header {
                    padding: 28px 20px 20px;
                    border-bottom: 1px solid rgba(147,197,253,0.35);
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                }
                
                /* ทำให้ส่วน Logo เป็นปุ่มกดไปหน้า Setting */
                .mnav-logo-link {
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                    text-decoration: none; cursor: pointer; transition: transform 0.2s;
                }
                .mnav-logo-link:hover { transform: scale(1.05); }

                .mnav-logo-wrap {
                    width: 60px; height: 60px; border-radius: 16px;
                    background: linear-gradient(135deg,#3b82f6,#1d4ed8);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 6px 18px rgba(59,130,246,0.3); margin-bottom: 4px;
                }
                .mnav-title { font-size: 16px; font-weight: 700; color: #1e3a8a; }
                .mnav-sub   { font-size: 11px; color: #64748b; }
                .mnav-logout-btn {
                    margin-top: 10px;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    width: 100%; padding: 7px 0; border-radius: 10px;
                    border: 1.5px solid rgba(239,68,68,0.4);
                    background: rgba(254,242,242,0.7); color: #dc2626;
                    font-family: 'Kanit', sans-serif; font-size: 13px; font-weight: 500;
                    cursor: pointer; transition: all 0.2s;
                }
                .mnav-logout-btn:hover { background: #fee2e2; border-color: #ef4444; }

                .mnav-menu { flex: 1; padding: 18px 14px 12px; display: flex; flex-direction: column; gap: 4px; }
                .mnav-section-label {
                    font-size: 10px; font-weight: 700; color: #94a3b8;
                    letter-spacing: 1.2px; text-transform: uppercase;
                    padding: 0 6px; margin-bottom: 6px;
                }
                .mnav-menu-btn {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 14px; border-radius: 13px;
                    border: none; width: 100%; text-align: left;
                    font-family: 'Kanit', sans-serif; font-size: 14px; font-weight: 500;
                    cursor: pointer; transition: all 0.18s; text-decoration: none;
                    color: #475569; background: transparent;
                }
                .mnav-menu-btn:hover { background: rgba(255,255,255,0.65); color: #1e40af; transform: translateX(2px); }
                .mnav-menu-btn.active {
                    background: rgba(255,255,255,0.82); backdrop-filter: blur(10px);
                    color: #1d4ed8; font-weight: 700;
                    border: 1px solid rgba(147,197,253,0.5);
                    box-shadow: 0 4px 14px rgba(59,130,246,0.1);
                }
                .mnav-menu-btn.active .mnav-icon { background: linear-gradient(135deg,#3b82f6,#1d4ed8); color: #fff; box-shadow: 0 3px 10px rgba(59,130,246,0.3); }
                .mnav-icon {
                    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(219,234,254,0.6); color: #3b82f6; transition: all 0.18s;
                }

                .mnav-footer {
                    padding: 14px 20px;
                    border-top: 1px solid rgba(147,197,253,0.3);
                    text-align: center; font-size: 12px; font-weight: 700;
                    color: #3b82f6; letter-spacing: 1px;
                }
                .mnav-footer span { color: #1e293b; }
            `}</style>

            <div className="mnav-wrap">
                <div className="mnav-header">
                    <Link to="/manager-setting" className="mnav-logo-link">
                        <div className="mnav-logo-wrap">
                            <Briefcase size={28} color="#fff" />
                        </div>
                        <div className="mnav-title">ผู้จัดการ</div>
                        <div className="mnav-sub">Manager Panel</div>
                    </Link>
                    <button className="mnav-logout-btn" onClick={handleLogout}>
                        <LogOut size={14} /> Logout
                    </button>
                </div>

                <div className="mnav-menu">
                    <div className="mnav-section-label">Main Menu</div>
                    {menus.map(m => (
                        <Link key={m.to} to={m.to} className={`mnav-menu-btn ${activeMenu === m.to ? 'active' : ''}`}>
                            <div className="mnav-icon">{m.icon}</div>
                            {m.label}
                        </Link>
                    ))}
                </div>

                <div className="mnav-footer">TECH <span>JOB</span></div>
            </div>
        </>
    )
}

export default ManagerNavbar