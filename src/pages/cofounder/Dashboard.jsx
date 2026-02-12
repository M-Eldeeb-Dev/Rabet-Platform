import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMyProjects } from "../../lib/supabase/projects";
import { getAllProjects } from "../../lib/supabase/projects";
import {
  FolderPlus,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ myProjects: 0, allProjects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!profile) return;
      try {
        const my = await getMyProjects(profile.id);
        const all = await getAllProjects();
        setStats({ myProjects: my.length, allProjects: all.length });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-l from-primary/10 via-violet-500/10 to-transparent dark:from-primary/20 dark:via-violet-500/15 p-6 border border-primary/10 dark:border-primary/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              مرحباً، {profile?.full_name} 👋
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              إليك ملخص نشاطك كشريك مؤسس ورائد اعمال
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/cofounder/add-project" className="block">
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FolderPlus className="h-5 w-5" />
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-300" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.myProjects}
            </p>
            <p className="text-sm text-text-secondary mt-1">مشاريعي</p>
          </div>
        </Link>
        <Link to="/cofounder/other-projects" className="block">
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <FolderOpen className="h-5 w-5" />
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-300" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.allProjects}
            </p>
            <p className="text-sm text-text-secondary mt-1">مشاريع متاحة</p>
          </div>
        </Link>
        <Link to="/cofounder/chat" className="block">
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-300" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              —
            </p>
            <p className="text-sm text-text-secondary mt-1">المحادثات</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
