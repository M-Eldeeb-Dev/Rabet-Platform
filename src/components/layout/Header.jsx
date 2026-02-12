import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";
import Button from "../ui/Button";
import { Menu, Bell, LogOut, Link2, Sun, Moon } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { user, profile } = useAuth();
  const { signOut } = useAuthStore();
  const notificationData = useNotifications();
  const unreadCount = user && profile ? notificationData.unreadCount : 0;
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isDashboard = [
    "/entrepreneur",
    "/cofounder",
    "/eventmanager",
    "/admin",
  ].some((path) => location.pathname.startsWith(path));

  const getNotifRoute = () => {
    if (!profile) return "/";
    const roleRoutes = {
      entrepreneur: "/entrepreneur/notifications",
      co_founder: "/cofounder/notifications",
      event_manager: "/eventmanager/notifications",
      admin: "/admin/notifications",
    };
    return roleRoutes[profile.role] || "/";
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-3 lg:px-10 dark:bg-bg-dark/80 dark:border-gray-800">
      <div className="flex items-center gap-3" dir="rtl">
        {user && isDashboard && (
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-800"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Link2 className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
            رابط
          </h2>
        </Link>
      </div>

      {!isDashboard && (
        <nav className="hidden lg:flex items-center gap-8" dir="rtl">
          <Link
            to="/"
            className="text-sm font-medium text-gray-900 hover:text-primary transition-colors dark:text-gray-100 dark:hover:text-primary"
          >
            الرئيسية
          </Link>
          <a
            href="#about"
            className="text-sm font-medium text-text-secondary hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary"
          >
            عن المنصة
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-text-secondary hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary"
          >
            المميزات
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-text-secondary hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary"
          >
            تواصل معنا
          </a>
        </nav>
      )}

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800"
          title={theme === "dark" ? "وضع النهار" : "الوضع الليلي"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-text-secondary" />
          )}
        </button>

        {user && profile ? (
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => navigate(getNotifRoute())}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800"
            >
              <Bell className="h-5 w-5 text-text-secondary dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-bg-dark">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* User avatar */}
            <div
              onClick={() => {
                const routes = {
                  entrepreneur: "/entrepreneur/dashboard",
                  co_founder: "/cofounder/dashboard",
                  admin: "/admin/dashboard",
                  event_manager: "/eventmanager/events",
                };
                navigate(routes[profile.role] || "/");
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors"
              title="الذهاب للوحة التحكم"
            >
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  profile?.full_name?.[0] || "U"
                )}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-sm font-bold text-red-700 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <button className="hidden sm:flex h-9 items-center justify-center rounded-lg bg-gray-100 px-4 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                تسجيل دخول
              </button>
            </Link>
            <Link to="/register">
              <Button size="sm">إنشاء حساب</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
