import { getAllProfiles } from "../../lib/supabase/auth";
import {
  getTotalProjectCount,
  getPendingProjects,
  approveProject,
  rejectProject,
} from "../../lib/supabase/projects";
import { getTotalEventCount } from "../../lib/supabase/events";
import { getContactMessageCount } from "../../lib/supabase/contactMessages";
import {
  Users,
  FolderPlus,
  Calendar,
  Bell,
  ArrowLeft,
  MessageSquare,
  Mail,
  Briefcase,
  UserCheck,
  Mic,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../hooks/useAuth";

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  // ... (unchanged)
  <Link to={to} className="block">
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ArrowLeft className="h-4 w-4 text-gray-300 dark:text-gray-600" />
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
        {label}
      </p>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    events: 0,
    chats: 0,
    contactMessages: 0,
    entrepreneurs: 0,
    coFounders: 0,
    eventManagers: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [
          profiles,
          projectCount,
          eventCount,
          contactMsgCount,
          pendingProjs,
        ] = await Promise.all([
          getAllProfiles(),
          getTotalProjectCount(),
          getTotalEventCount(),
          getContactMessageCount(),
          getPendingProjects(),
        ]);

        // ... (chat count logic unchanged)
        // Get total chats
        let chatCount = 0;
        try {
          const { count } = await supabase
            .from("chats")
            .select("*", { count: "exact", head: true });
          chatCount = count || 0;
        } catch (e) {
          console.warn("Chat count failed:", e);
        }

        const entrepreneurs = profiles.filter(
          (p) => p.role === "entrepreneur",
        ).length;
        const coFounders = profiles.filter(
          (p) => p.role === "co_founder",
        ).length;
        const eventManagers = profiles.filter(
          (p) => p.role === "event_manager",
        ).length;

        setStats({
          users: profiles.length,
          projects: projectCount,
          events: eventCount,
          chats: chatCount,
          contactMessages: contactMsgCount,
          entrepreneurs,
          coFounders,
          eventManagers,
        });
        setRecentUsers(profiles.slice(0, 5));
        setPendingProjects(pendingProjs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleApprove = async (id) => {
    if (!user) return;
    try {
      await approveProject(id, user.id);
      setPendingProjects((prev) => prev.filter((p) => p.id !== id));
      // Optionally show toast success
    } catch (err) {
      console.error("Error approving project:", err);
      // Optionally show toast error
    }
  };

  const handleReject = async (id) => {
    if (!user) return;
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد رفض هذا المشروع؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، ارفضه",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;
    try {
      await rejectProject(id, user.id);
      setPendingProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error rejecting project:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const roleLabels = {
    entrepreneur: "رائد أعمال",
    co_founder: "شريك مؤسس",
    event_manager: "مدير فعاليات",
    admin: "مسؤول",
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          لوحة تحكم المسؤول
        </h1>
        <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
          نظرة عامة على المنصة
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="إجمالي المستخدمين"
          value={stats.users}
          color="bg-primary/10 text-primary"
          to="/admin/users"
        />
        <StatCard
          icon={FolderPlus}
          label="إجمالي المشاريع"
          value={stats.projects}
          color="bg-emerald-100 text-emerald-600"
          to="/admin/projects"
        />
        <StatCard
          icon={Calendar}
          label="إجمالي الفعاليات"
          value={stats.events}
          color="bg-violet-100 text-violet-600"
          to="/admin/events"
        />
        <StatCard
          icon={Mail}
          label="رسائل تواصل جديدة"
          value={stats.contactMessages}
          color="bg-amber-100 text-amber-600"
          to="/admin/contact-messages"
        />
      </div>

      {/* Role Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              {stats.entrepreneurs}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400">
              رواد أعمال
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              {stats.coFounders}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400">
              شركاء مشاريع الشباب
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              {stats.eventManagers}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400">
              مديرو فعاليات
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              {stats.chats}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400">
              إجمالي المحادثات
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/send-notification"
          className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex items-center gap-4 hover:shadow-md transition-all"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              إرسال إشعار
            </p>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              أرسل إشعاراً لجميع المستخدمين أو فئة معينة
            </p>
          </div>
          <ArrowLeft className="h-5 w-5 text-gray-300 mr-auto" />
        </Link>
        <Link
          to="/admin/contact-messages"
          className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex items-center gap-4 hover:shadow-md transition-all"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              رسائل التواصل
            </p>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              عرض والرد على رسائل الزوار
            </p>
          </div>
          <ArrowLeft className="h-5 w-5 text-gray-300 mr-auto" />
        </Link>
      </div>

      {/* Pending Projects */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="flex items-center justify-between border-b dark:border-gray-700 p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            المشاريع المعلقة
          </h2>
          <Link
            to="/admin/projects?status=pending"
            className="text-sm font-bold text-primary hover:underline"
          >
            عرض الكل
          </Link>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {pendingProjects.length === 0 ? (
            <div className="p-8 text-center text-text-secondary dark:text-gray-400">
              لا توجد مشاريع معلقة حالياً
            </div>
          ) : (
            pendingProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FolderPlus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="text-xs text-text-secondary dark:text-gray-400">
                      بواسطة {project.profiles?.full_name || "مستخدم"} •{" "}
                      {new Date(project.created_at).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(project.id)}
                    className="px-3 py-1.5 bg-growth/10 text-growth hover:bg-growth/20 rounded-lg text-xs font-bold transition-colors"
                  >
                    قبول
                  </button>
                  <button
                    onClick={() => handleReject(project.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                  >
                    رفض
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="flex items-center justify-between border-b dark:border-gray-700 p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            آخر المستخدمين المسجلين
          </h2>
          <Link
            to="/admin/users"
            className="text-sm font-bold text-primary hover:underline"
          >
            عرض الكل
          </Link>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {user.full_name?.[0] || "U"}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    {user.full_name || "بدون اسم"}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-gray-400">
                    {roleLabels[user.role] || user.role}
                  </p>
                </div>
              </div>
              <span className="text-xs text-text-secondary dark:text-gray-500">
                {new Date(user.created_at).toLocaleDateString("ar-SA")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
