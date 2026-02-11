import {
  LayoutDashboard,
  User,
  FolderPlus,
  FolderOpen,
  MessageSquare,
  Users,
  Calendar,
  Bell,
  Send,
  Mail,
  LogOut,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const useNavigation = () => {
  const { profile } = useAuth();

  const getLinks = () => {
    switch (profile?.role) {
      case "entrepreneur":
        return [
          {
            to: "/entrepreneur/dashboard",
            icon: LayoutDashboard,
            label: "لوحة التحكم",
          },
          { to: "/entrepreneur/projects", icon: FolderPlus, label: "مشاريعي" },
          { to: "/entrepreneur/events", icon: Calendar, label: "الفعاليات" },
          { to: "/entrepreneur/chat", icon: MessageSquare, label: "المحادثات" },
          { to: "/entrepreneur/notifications", icon: Bell, label: "الإشعارات" },
          { to: "/entrepreneur/profile", icon: User, label: "الملف الشخصي" },
        ];
      case "co_founder":
        return [
          {
            to: "/cofounder/dashboard",
            icon: LayoutDashboard,
            label: "لوحة التحكم",
          },
          {
            to: "/cofounder/add-project",
            icon: FolderPlus,
            label: "إضافة مشروع",
          },
          {
            to: "/cofounder/other-projects",
            icon: FolderOpen,
            label: "مشاريع الآخرين",
          },
          { to: "/cofounder/chat", icon: MessageSquare, label: "المحادثات" },
          { to: "/cofounder/events", icon: Calendar, label: "الفعاليات" },
          { to: "/cofounder/notifications", icon: Bell, label: "الإشعارات" },
          { to: "/cofounder/profile", icon: User, label: "الملف الشخصي" },
        ];
      case "event_manager":
        return [
          {
            to: "/eventmanager/add-event",
            icon: Calendar,
            label: "إضافة فعالية",
          },
          { to: "/eventmanager/events", icon: Calendar, label: "الفعاليات" },
          { to: "/eventmanager/notifications", icon: Bell, label: "الإشعارات" },
          { to: "/eventmanager/profile", icon: User, label: "الملف الشخصي" },
        ];
      case "admin":
        return [
          {
            to: "/admin/dashboard",
            icon: LayoutDashboard,
            label: "لوحة التحكم",
          },
          { to: "/admin/users", icon: Users, label: "المستخدمين" },
          { to: "/admin/projects", icon: FolderPlus, label: "المشاريع" },
          { to: "/admin/events", icon: Calendar, label: "الفعاليات" },
          {
            to: "/admin/send-notification",
            icon: Send,
            label: "إرسال إشعارات",
          },
          {
            to: "/admin/contact-messages",
            icon: Mail,
            label: "رسائل التواصل",
          },
          {
            to: "/admin/subscriptions",
            icon: CreditCard,
            label: "الاشتراكات",
          },
          { to: "/admin/profile", icon: User, label: "الملف الشخصي" },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return { links };
};
