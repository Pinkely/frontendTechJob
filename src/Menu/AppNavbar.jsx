import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'


const AppNavbar = ({ onLogout }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState(location.pathname)

    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location.pathname])

    const handleLogout = () => {
        // ถ้ามี onLogout function ส่งมาจาก parent component (App.jsx)
        if (onLogout) {
            onLogout() // เรียกใช้ฟังก์ชัน logout จาก App.jsx
        }

        // นำทางไปหน้า login (ใช้ navigate แทน Link เพราะเราต้องทำงานก่อน redirect)
        navigate('/login')
    }

    // ฟังก์ชันช่วยเช็คคลาส Active เพื่อให้โค้ดสะอาดขึ้น
    const getBtnClass = (path) => {
        return `btn mb-2 w-100 text-start ${activeMenu === path ? 'btn-light text-primary fw-bold' : 'text-light'}`
    }


    return (
        <div className="border-1 bg-primary" style={{ width: '14rem', position: 'fixed', height: '100vh' }}>


            <div className="d-flex align-items-center justify-content-between border-1 m-3 border-light px-2 py-2 btn btn-outline-danger" style={{ borderRadius: '30px' }}
                onClick={handleLogout}>
                <div >
                    {/* <Link to="/setting">
                    <button className="btn btn-outline-primary m-2 rounded-5">1</button>
                </Link> */}
                    <span className='text-light ml-4'>Logout</span>
                </div>
                <div>
                    <button><i className="bi bi-box-arrow-right text-light"></i></button>
                </div>

            </div>

            <p className='mt-2 text-light mx-4'>Main Menu</p>

            <Link to="/admin">
                <button
                    className={`btn mb-2 w-100 text-start ${activeMenu === '/admin' ? 'btn-light' : 'text-light'}`}
                    onClick={() => setActiveMenu('/admin')}
                >
                    <i className="bi bi-bar-chart-fill mx-3"></i>
                    DashBoard
                </button>
            </Link>


            <Link to="/work">
                <button
                    className={`btn mb-2 w-100 text-start ${activeMenu === '/work' ? 'btn-light' : 'text-light'}`}
                    onClick={() => setActiveMenu('/work')}
                >
                    <i className="bi bi-file-text-fill mx-3"></i>
                    ระบบงาน
                </button>
            </Link>

            <Link to='/material' className="text-decoration-none">
                <button
                    className={`btn mb-2 w-100 text-start ${activeMenu === '/material' ? 'btn-light text-primary fw-bold' : 'text-light'}`}
                    onClick={() => setActiveMenu('/material')}
                >
                    <i className="bi bi-box-seam-fill mx-3"></i>
                    จัดการวัสดุ
                </button>
            </Link>

            <Link to="/account">
                <button
                    className={`btn mb-2 w-100 text-start ${activeMenu === '/account' ? 'btn-light' : 'text-light'}`}
                    onClick={() => setActiveMenu('/account')}
                >
                    <i className="bi bi-person mx-3"></i>
                    จัดการบัญชี
                </button>
            </Link>

            <Link to="/setting">
                <button
                    className={`btn  ${activeMenu === '/setting' ? 'btn-light' : 'text-light'}`} style={{ position: 'absolute', bottom: '0.2rem', left: '0.3rem' }}
                    onClick={() => setActiveMenu('/setting')}
                >
                    <i className="bi bi-gear"></i>
                </button>
            </Link>
        </div>
    )
}

export default AppNavbar