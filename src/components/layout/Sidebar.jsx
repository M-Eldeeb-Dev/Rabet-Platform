import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNavigation } from "../../hooks/useNavigation";
import { cn } from "../../lib/utils/helpers";
import { LogOut, X, Plus } from "lucide-react";
import useAuthStore from "../../store/authStore";

const Sidebar = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const { links } = useNavigation();
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (!profile) return null;

  const roleLabels = {
    entrepreneur: "رائد أعمال",
    co_founder: "شريك مؤسس",
    event_manager: "مدير فعاليات",
    admin: "مسؤول",
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-[100dvh] w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-auto lg:min-h-[calc(100vh-60px)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="h-full flex flex-col" dir="rtl">
          {/* Mobile close button */}
          <div className="p-4 flex items-center justify-between lg:hidden border-b dark:border-gray-800">
            <span className="font-bold text-lg dark:text-white">القائمة</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <X className="h-5 w-5 dark:text-gray-300" />
            </button>
          </div>

          {/* User Profile Summary (Stitch Design) */}
          <div className="p-6 pb-2 border-b border-dashed border-gray-200 dark:border-gray-800">
            <div
              onClick={() => {
                const routes = {
                  entrepreneur: "/entrepreneur/dashboard",
                  co_founder: "/cofounder/dashboard",
                  admin: "/admin/dashboard",
                  event_manager: "/eventmanager/events",
                };
                navigate(routes[profile.role] || "/");
                onClose();
              }}
              className="flex items-center gap-4 mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors -mx-2"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-800">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  profile.full_name?.[0] || "U"
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">
                  {profile.full_name}
                </h1>
                <p className="text-text-secondary dark:text-gray-400 text-sm font-medium">
                  {roleLabels[profile.role]}
                </p>
              </div>
            </div>

            {(profile.role === "entrepreneur" ||
              profile.role === "co_founder") && (
              <button
                onClick={() => {
                  navigate(
                    profile.role === "co_founder"
                      ? "/cofounder/add-project"
                      : "/entrepreneur/projects",
                  );
                  onClose();
                }}
                className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold shadow-sm shadow-blue-200 dark:shadow-none"
              >
                <Plus className="h-5 w-5" />
                <span>مشروع جديد</span>
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            <nav className="space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group",
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                        : "text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white",
                    )
                  }
                  onClick={onClose}
                >
                  <link.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      ({ isActive }) =>
                        isActive
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-primary",
                    )}
                  />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Sign Out */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <p className="px-3 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              الدعم
            </p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2 text-text-secondary hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors group"
            >
              <LogOut className="h-5 w-5 group-hover:text-red-600 dark:group-hover:text-red-400" />
              تسجيل خروج
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
