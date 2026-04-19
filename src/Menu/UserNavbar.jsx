import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    LayoutDashboard, CalendarDays, FileText,
    Bell, LogOut, User
} from 'lucide-react'

const UserNavbar = ({ onLogout }) => {
    const location  = useLocation()
    const navigate  = useNavigate()
    const [activeMenu, setActiveMenu]   = useState(location.pathname)
    const [userProfile, setUserProfile] = useState(null)

    useEffect(() => {
        setActiveMenu(location.pathname)

        const fetchNavbarData = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('user'))
                const userId = u?.user_id || u?.id
                if (!userId) return
                const res = await axios.get(`/api/users/${userId}`)
                if (res.data?.user) setUserProfile(res.data.user)
            } catch (err) {
                console.error('Navbar fetch error:', err)
            }
        }
        fetchNavbarData()
    }, [location.pathname])

    const handleLogout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('session')
        if (onLogout) onLogout()
        navigate('/login')
    }

    const menus = [
        { to: '/user',      icon: <LayoutDashboard size={17} />, label: 'แดชบอร์ด' },
        { to: '/calendar',  icon: <CalendarDays    size={17} />, label: 'ปฏิทินงาน' },
        { to: '/worksheet', icon: <FileText         size={17} />, label: 'ใบงานของฉัน' },
    ]

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

                .nav-wrap {
                    position: fixed; top: 0; left: 0;
                    width: 15rem; height: 100vh; z-index: 1030;
                    font-family: 'Kanit', sans-serif;
                    display: flex; flex-direction: column;
                    background: linear-gradient(180deg,#e0f0ff 0%,#f0f8ff 60%,#dbeefe 100%);
                    border-right: 1px solid rgba(147,197,253,0.4);
                    box-shadow: 4px 0 24px rgba(59,130,246,0.08);
                }
                .nav-wrap::before {
                    content: '';
                    position: absolute; inset: 0;
                    background-image: radial-gradient(circle,#93c5fd18 1px,transparent 1px);
                    background-size: 24px 24px; pointer-events: none;
                }

                /* profile section */
                .nav-profile {
                    padding: 24px 20px 18px;
                    border-bottom: 1px solid rgba(147,197,253,0.35);
                    display: flex; flex-direction: column; align-items: center; gap: 10px;
                    position: relative;
                }
                .nav-avatar-ring {
                    width: 76px; height: 76px; border-radius: 50%;
                    padding: 3px;
                    background: linear-gradient(135deg,#3b82f6,#1d4ed8);
                    box-shadow: 0 4px 16px rgba(59,130,246,0.3);
                    cursor: pointer; text-decoration: none;
                }
                .nav-avatar-inner {
                    width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
                    background: #eff6ff;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid #fff;
                }
                .nav-online {
                    position: absolute; top: 86px; right: calc(50% - 28px);
                    width: 14px; height: 14px; border-radius: 50%;
                    background: #22c55e; border: 2px solid #fff;
                    box-shadow: 0 0 0 2px #22c55e44;
                }
                .nav-name {
                    font-size: 14px; font-weight: 700; color: '#1e3a8a';
                    text-align: center; max-width: 90%; overflow: hidden;
                    text-overflow: ellipsis; white-space: nowrap; color: #1e3a8a;
                }
                .nav-role {
                    font-size: 11px; color: #64748b; margin-top: -6px;
                }
                .nav-logout-btn {
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    width: 100%; padding: 7px 0; border-radius: 10px;
                    border: 1.5px solid rgba(239,68,68,0.4);
                    background: rgba(254,242,242,0.7); color: #dc2626;
                    font-family: 'Kanit', sans-serif; font-size: 13px; font-weight: 500;
                    cursor: pointer; transition: all 0.2s;
                }
                .nav-logout-btn:hover {
                    background: #fee2e2; border-color: #ef4444;
                    box-shadow: 0 2px 10px rgba(239,68,68,0.15);
                }

                /* menu section */
                .nav-menu { flex: 1; padding: 18px 14px 12px; display: flex; flex-direction: column; gap: 4px; overflow: auto; }
                .nav-section-label {
                    font-size: 10px; font-weight: 700; color: #94a3b8;
                    letter-spacing: 1.2px; text-transform: uppercase;
                    padding: 0 6px; margin-bottom: 6px;
                }

                .nav-menu-btn {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 14px; border-radius: 13px;
                    border: none; width: 100%; text-align: left;
                    font-family: 'Kanit', sans-serif; font-size: 14px; font-weight: 500;
                    cursor: pointer; transition: all 0.18s; text-decoration: none;
                    color: #475569; background: transparent;
                }
                .nav-menu-btn:hover {
                    background: rgba(255,255,255,0.65);
                    color: #1e40af;
                    transform: translateX(2px);
                }
                .nav-menu-btn.active {
                    background: rgba(255,255,255,0.82);
                    backdrop-filter: blur(10px);
                    color: #1d4ed8; font-weight: 700;
                    border: 1px solid rgba(147,197,253,0.5);
                    box-shadow: 0 4px 14px rgba(59,130,246,0.1);
                }
                .nav-menu-btn.active .nav-icon-wrap {
                    background: linear-gradient(135deg,#3b82f6,#1d4ed8);
                    color: #fff;
                    box-shadow: 0 3px 10px rgba(59,130,246,0.3);
                }
                .nav-icon-wrap {
                    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(219,234,254,0.6); color: #3b82f6;
                    transition: all 0.18s;
                }

                /* footer */
                .nav-footer {
                    padding: 14px 20px;
                    border-top: 1px solid rgba(147,197,253,0.3);
                    text-align: center; font-size: 12px; font-weight: 700;
                    color: #3b82f6; letter-spacing: 1px;
                }
                .nav-footer span { color: #1e293b; }

                /* bell fab */
                .nav-bell {
                    position: fixed; bottom: 28px; left: 15.5rem; z-index: 1040;
                    width: 46px; height: 46px; border-radius: 50%; border: none;
                    background: linear-gradient(135deg,#3b82f6,#1d4ed8);
                    color: #fff; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 6px 20px rgba(59,130,246,0.35);
                    cursor: pointer; transition: all 0.2s; text-decoration: none;
                }
                .nav-bell:hover { transform: scale(1.08); box-shadow: 0 8px 24px rgba(59,130,246,0.45); }
            `}</style>

            <div className="nav-wrap">
                {/* Profile */}
                <div className="nav-profile">
                    <Link to="/profile" className="nav-avatar-ring">
                        <div className="nav-avatar-inner">
                            {userProfile?.avatar
                                ? <img src={userProfile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <User size={30} color="#3b82f6" />
                            }
                        </div>
                    </Link>
                    <div className="nav-online" />
                    <div className="nav-name">{userProfile?.name || 'กำลังโหลด...'}</div>
                    <div className="nav-role">{userProfile?.role || 'ช่างเทคนิค'}</div>
                    <button className="nav-logout-btn" onClick={handleLogout}>
                        <LogOut size={14} /> ออกจากระบบ
                    </button>
                </div>

                {/* Menu */}
                <div className="nav-menu">
                    <div className="nav-section-label">เมนูหลัก</div>
                    {menus.map(m => (
                        <Link key={m.to} to={m.to} className={`nav-menu-btn ${activeMenu === m.to ? 'active' : ''}`}>
                            <div className="nav-icon-wrap">{m.icon}</div>
                            {m.label}
                        </Link>
                    ))}
                </div>

                {/* Footer */}
                <div className="nav-footer">TECH <span>JOB</span></div>
            </div>

            {/* Bell FAB */}
            <Link to="/notification" className="nav-bell">
                <Bell size={18} />
            </Link>
        </>
    )
}

export default UserNavbar