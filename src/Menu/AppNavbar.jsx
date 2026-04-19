import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LayoutDashboard, FileText, Package, UserCog, Settings, LogOut, Shield } from 'lucide-react'

const AppNavbar = ({ onLogout }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState(location.pathname)

    useEffect(() => { setActiveMenu(location.pathname) }, [location.pathname])

    const handleLogout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('session')
        if (onLogout) onLogout()
        navigate('/login')
    }

    const menus = [
        { to: '/admin',    icon: <LayoutDashboard size={17} />, label: 'DashBoard' },
        { to: '/work',     icon: <FileText         size={17} />, label: 'ระบบงาน' },
        { to: '/material', icon: <Package          size={17} />, label: 'จัดการวัสดุ' },
        { to: '/account',  icon: <UserCog          size={17} />, label: 'จัดการบัญชี' },
    ]

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

                .anav-wrap {
                    position: fixed; top: 0; left: 0;
                    width: 15rem; height: 100vh; z-index: 1030;
                    font-family: 'Kanit', sans-serif;
                    display: flex; flex-direction: column;
                    background: linear-gradient(180deg,#e0f0ff 0%,#f0f8ff 60%,#dbeefe 100%);
                    border-right: 1px solid rgba(147,197,253,0.4);
                    box-shadow: 4px 0 24px rgba(59,130,246,0.08);
                }
                .anav-wrap::before {
                    content: ''; position: absolute; inset: 0;
                    background-image: radial-gradient(circle,#93c5fd18 1px,transparent 1px);
                    background-size: 24px 24px; pointer-events: none;
                }

                .anav-header {
                    padding: 28px 20px 20px;
                    border-bottom: 1px solid rgba(147,197,253,0.35);
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                }
                .anav-logo-wrap {
                    width: 60px; height: 60px; border-radius: 16px;
                    background: linear-gradient(135deg,#3b82f6,#1d4ed8);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 6px 18px rgba(59,130,246,0.3); margin-bottom: 4px;
                }
                .anav-title { font-size: 16px; font-weight: 700; color: #1e3a8a; }
                .anav-sub   { font-size: 11px; color: #64748b; }
                .anav-logout-btn {
                    margin-top: 10px;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    width: 100%; padding: 7px 0; border-radius: 10px;
                    border: 1.5px solid rgba(239,68,68,0.4);
                    background: rgba(254,242,242,0.7); color: #dc2626;
                    font-family: 'Kanit', sans-serif; font-size: 13px; font-weight: 500;
                    cursor: pointer; transition: all 0.2s;
                }
                .anav-logout-btn:hover { background: #fee2e2; border-color: #ef4444; }

                .anav-menu { flex: 1; padding: 18px 14px 12px; display: flex; flex-direction: column; gap: 4px; }
                .anav-section-label {
                    font-size: 10px; font-weight: 700; color: #94a3b8;
                    letter-spacing: 1.2px; text-transform: uppercase;
                    padding: 0 6px; margin-bottom: 6px;
                }
                .anav-menu-btn {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 14px; border-radius: 13px;
                    border: none; width: 100%; text-align: left;
                    font-family: 'Kanit', sans-serif; font-size: 14px; font-weight: 500;
                    cursor: pointer; transition: all 0.18s; text-decoration: none;
                    color: #475569; background: transparent;
                }
                .anav-menu-btn:hover { background: rgba(255,255,255,0.65); color: #1e40af; transform: translateX(2px); }
                .anav-menu-btn.active {
                    background: rgba(255,255,255,0.82); backdrop-filter: blur(10px);
                    color: #1d4ed8; font-weight: 700;
                    border: 1px solid rgba(147,197,253,0.5);
                    box-shadow: 0 4px 14px rgba(59,130,246,0.1);
                }
                .anav-menu-btn.active .anav-icon { background: linear-gradient(135deg,#3b82f6,#1d4ed8); color: #fff; box-shadow: 0 3px 10px rgba(59,130,246,0.3); }
                .anav-icon {
                    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(219,234,254,0.6); color: #3b82f6; transition: all 0.18s;
                }

                .anav-setting-btn {
                    margin: 0 14px 14px;
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 14px; border-radius: 13px;
                    border: none; width: calc(100% - 28px); text-align: left;
                    font-family: 'Kanit', sans-serif; font-size: 14px; font-weight: 500;
                    cursor: pointer; transition: all 0.18s; text-decoration: none;
                    color: #475569; background: transparent;
                }
                .anav-setting-btn:hover { background: rgba(255,255,255,0.65); color: #1e40af; }
                .anav-setting-btn.active {
                    background: rgba(255,255,255,0.82); color: #1d4ed8; font-weight: 700;
                    border: 1px solid rgba(147,197,253,0.5);
                }
                .anav-setting-btn.active .anav-icon { background: linear-gradient(135deg,#3b82f6,#1d4ed8); color: #fff; }

                .anav-footer {
                    padding: 14px 20px;
                    border-top: 1px solid rgba(147,197,253,0.3);
                    text-align: center; font-size: 12px; font-weight: 700;
                    color: #3b82f6; letter-spacing: 1px;
                }
                .anav-footer span { color: #1e293b; }
            `}</style>

            <div className="anav-wrap">
                <div className="anav-header">
                    <div className="anav-logo-wrap">
                        <Shield size={28} color="#fff" />
                    </div>
                    <div className="anav-title">แอดมิน</div>
                    <div className="anav-sub">Admin Panel</div>
                    <button className="anav-logout-btn" onClick={handleLogout}>
                        <LogOut size={14} /> ออกจากระบบ
                    </button>
                </div>

                <div className="anav-menu">
                    <div className="anav-section-label">เมนูหลัก</div>
                    {menus.map(m => (
                        <Link key={m.to} to={m.to} className={`anav-menu-btn ${activeMenu === m.to ? 'active' : ''}`}>
                            <div className="anav-icon">{m.icon}</div>
                            {m.label}
                        </Link>
                    ))}
                </div>

                <Link to="/setting" className={`anav-setting-btn ${activeMenu === '/setting' ? 'active' : ''}`}>
                    <div className="anav-icon"><Settings size={17} /></div>
                    ตั้งค่า
                </Link>

                <div className="anav-footer">TECH <span>JOB</span></div>
            </div>
        </>
    )
}

export default AppNavbar