import { Outlet } from "react-router-dom";

import Sidebar from "../shared/components/Sidebar";

function DashboardLayout() {
  return (
    <>
      <style>
        {`
          .dashboard-layout {
            min-height: 100vh;
            display: flex;
            background: #f4f7f5;
          }

          .dashboard-content {
            flex: 1;
            min-width: 0;
            min-height: 100vh;
          }

          @media (max-width: 850px) {
            .dashboard-layout {
              overflow-x: auto;
            }
          }
        `}
      </style>

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default DashboardLayout;
