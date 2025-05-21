
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {!isAuthPage && <Navbar />}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
