import { Outlet } from "react-router-dom";
import LeaderNavbar from "../Menu/LeaderNavbar";

const LeaderLayout = ({ onLogout , tasks , setTasks}) => {
    return (
        <div className="d-flex mx-auto " style={{ width: '100%', height: '100vh' }}>
            {/* <AppHeader /> */}
            <LeaderNavbar onLogout={onLogout} tasks={tasks}  setTasks={setTasks}/>
            <Outlet />
            {/* <AppFooter /> */}
        </div>
    );
}

export default LeaderLayout;