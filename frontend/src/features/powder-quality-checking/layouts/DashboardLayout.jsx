import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div
      className="
        flex
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#050505]
        text-white
      "
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div
        className="
          flex
          min-h-screen
          min-w-0
          w-0
          flex-1
          flex-col
          overflow-x-hidden
          bg-[#050505]
        "
      >
        {/* Top Navbar */}
        <div className="w-full min-w-0 shrink-0">
          <TopNavbar />
        </div>

        {/* Page Area */}
        <main
          className="
            flex-1
            w-full
            min-w-0
            overflow-x-hidden
            bg-[#050505]
            py-6
          "
        >
          {/* 
              Desktop:
              LEFT  = 40px
              RIGHT = 40px
          */}
          <div
            className="
              mx-auto
              min-w-0

              w-[calc(100%-32px)]
              sm:w-[calc(100%-40px)]
              md:w-[calc(100%-48px)]
              lg:w-[calc(100%-64px)]
              xl:w-[calc(100%-80px)]

              max-w-none
            "
          >
            <div
              className="
                w-full
                min-w-0
                max-w-full

                [&>*]:!w-full
                [&>*]:!max-w-full
                [&>*]:!min-w-0
              "
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
