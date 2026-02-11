import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useAuth } from "../../hooks/useAuth";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isDashboard = [
    "/entrepreneur",
    "/cofounder",
    "/eventmanager",
    "/admin",
  ].some((path) => location.pathname.startsWith(path));

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      <Header toggleSidebar={toggleSidebar} />
      <div className={`flex flex-1 ${isDashboard ? "" : "flex-col"}`}>
        {user && isDashboard && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        )}
        <main
          className={`flex-1 ${
            isDashboard ? "p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto" : ""
          }`}
        >
          <Outlet />
        </main>
      </div>
      {!isDashboard && <Footer />}
      {user && isDashboard && <BottomNav />}
    </div>
  );
};

export default Layout;
