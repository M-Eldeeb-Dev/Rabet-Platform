import React from "react";
import { useNotifications } from "../../hooks/useNotifications";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  FolderOpen,
  Calendar,
  Info,
  AlertTriangle,
  Megaphone,
  Eye,
  Heart,
} from "lucide-react";

const typeIcons = {
  new_message: MessageSquare,
  project_view: Eye,
  project_like: Heart,
  application_status: FolderOpen,
  event_reminder: Calendar,
  event_invitation: Calendar,
  system_alert: AlertTriangle,
  admin_broadcast: Megaphone,
  chat_request: MessageSquare,
};

const typeColors = {
  new_message: "bg-violet-100 text-violet-600",
  project_view: "bg-cyan-100 text-cyan-600",
  project_like: "bg-pink-100 text-pink-600",
  application_status: "bg-emerald-100 text-emerald-600",
  event_reminder: "bg-amber-100 text-amber-600",
  event_invitation: "bg-blue-100 text-blue-600",
  system_alert: "bg-red-100 text-red-600",
  admin_broadcast: "bg-primary/10 text-primary",
  chat_request: "bg-violet-100 text-violet-600",
};

const Notifications = () => {
  const { notifications, handleMarkRead, handleMarkAllRead } =
    useNotifications();

  const formatDate = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return d.toLocaleDateString("ar-SA");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">الإشعارات</h1>
          <p className="text-sm text-text-secondary mt-1">
            {notifications.length} إشعار
          </p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            قراءة الكل
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden divide-y dark:divide-gray-700">
          {notifications.map((notif) => {
            const IconComponent = typeIcons[notif.type] || Info;
            const colorClass =
              typeColors[notif.type] || "bg-blue-100 text-blue-600";

            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notif.is_read ? "bg-primary/5" : ""
                }`}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm ${!notif.is_read ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {notif.message}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatDate(notif.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <Bell className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 mb-1">لا توجد إشعارات</h3>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            ستظهر الإشعارات الجديدة هنا
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
