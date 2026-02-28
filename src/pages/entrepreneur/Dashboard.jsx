import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getMyProjects,
  getMostViewedProjects,
} from "../../lib/supabase/projects";
import { getUnreadMessageCount } from "../../lib/supabase/chats";
import { getRecommendedEvents } from "../../lib/supabase/events";
import {
  FolderOpen,
  Hourglass,
  Eye,
  Mail,
  CheckCircle,
  UserPlus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Video,
  Clock,
  ExternalLink,
  Star,
  Users,
} from "lucide-react";
import StorageImage from "../../components/ui/StorageImage";

// --- Components ---

const StatCard = ({ icon: Icon, label, value, subLabel, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
    <div className="flex justify-between items-start">
      <div className={`p-2 rounded-xl ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      {subLabel && (
        <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
          {subLabel}
        </span>
      )}
    </div>
    <div>
      <p className="text-text-secondary dark:text-gray-400 text-sm font-bold mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">
        {value}
      </p>
    </div>
  </div>
);

const ProjectRow = ({ project }) => {
  const statusColors = {
    active: "bg-blue-50 text-blue-700 border-blue-100",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    completed: "bg-green-50 text-green-700 border-green-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    pending_review: "bg-amber-50 text-amber-700 border-amber-100",
    draft: "bg-gray-50 text-gray-600 border-gray-100",
    closed: "bg-blue-50 text-blue-700 border-blue-100",
  };

  const statusLabels = {
    active: "مرحلة النمو",
    pending: "فكرة أولية",
    completed: "مكتمل",
    rejected: "مرفوض",
    approved: "مقبول",
    pending_review: "قيد المراجعة",
    draft: "مسودة",
    closed: "مغلق",
  };

  const calculateProgress = () => {
    let score = 0;
    if (project.title) score += 10;
    if (project.description) score += 10;
    if (project.category_id) score += 10;
    if (project.stage) score += 10;
    if (project.funding_goal) score += 10;
    if (project.logo_url) score += 10;
    if (project.images_urls?.length > 0) score += 10;
    if (project.pitch_deck_url) score += 15;
    if (project.business_plan_url) score += 15;
    return Math.min(score, 100);
  };

  const progress = calculateProgress();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group">
      <div className="h-16 w-16 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shrink-0">
        {project.logo_url ? (
          <StorageImage
            path={project.logo_url}
            alt={project.title}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
            fallbackSrc="https://images.unsplash.com/photo-1572177812156-58036aae439c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-300">
            <FolderOpen className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-base font-bold text-gray-900 dark:text-white truncate pr-2 group-hover:text-primary transition-colors">
            {project.title}
          </h4>
          <span
            className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${statusColors[project.status] || "bg-gray-100"}`}
          >
            {statusLabels[project.status] || project.status}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full max-w-sm pr-2">
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-bold text-text-secondary shrink-0">
            {progress}%
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 border-r border-gray-100 dark:border-gray-700 pr-4">
        <div className="text-center px-3 border-l border-gray-100 dark:border-gray-700">
          <div className="text-sm font-black text-gray-900 dark:text-white">
            {project.views_count || 0}
          </div>
          <div className="text-[10px] text-text-secondary font-bold">
            مشاهدة
          </div>
        </div>
        <Link
          to={`/entrepreneur/projects/${project.id}`}
          className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
        >
          <ExternalLink className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    messages: 0,
    totalViews: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [popularProjects, setPopularProjects] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      try {
        const [myProjs, unreadMsgs, popProjs, recEvents] = await Promise.all([
          getMyProjects(profile.id),
          getUnreadMessageCount(profile.id),
          getMostViewedProjects(3), // Top 3
          getRecommendedEvents(3), // Top 3
        ]);

        const totalProjectViews = myProjs.reduce(
          (sum, p) => sum + (p.views_count || 0),
          0,
        );

        setStats({
          projects: myProjs.length,
          messages: unreadMsgs,
          totalViews: totalProjectViews,
        });
        setRecentProjects(myProjs.slice(0, 3));
        setPopularProjects(popProjs.filter((p) => p.owner_id !== profile.id)); // Don't show own projects in popular
        setRecommendedEvents(recEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fadeIn"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-l from-primary via-violet-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-primary/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                أهلاً بك، {profile?.full_name?.split(" ")[0]}{" "}
                <span className="animate-bounce">👋</span>
              </h2>
              <p className="text-white/80 max-w-xl text-sm leading-relaxed">
                إليك نظرة سريعة على أداء مشاريعك، وتوصيات خاصة لك بفرص استثمارية
                وفعاليات قادمة.
              </p>
            </div>
            <Link
              to="/entrepreneur/projects"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
            >
              <FolderOpen className="h-4 w-4" />
              إدارة مشاريعي
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={FolderOpen}
            label="إجمالي مشاريعي"
            value={stats.projects}
            colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
          />
          <StatCard
            icon={Eye}
            label="مجموع المشاهدات"
            value={stats.totalViews}
            subLabel={
              stats.totalViews > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3" /> نمو
                </>
              ) : null
            }
            colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
          />
          <StatCard
            icon={Mail}
            label="رسائل غير مقروءة"
            value={stats.messages}
            colorClass="bg-pink-50 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400"
          />
          <StatCard
            icon={Star}
            label="الفعاليات المُوصى بها"
            value={recommendedEvents.length}
            colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
          />
        </div>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (My Projects & Popular Projects) - 2 Columns wide */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Recent Projects */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="h-6 w-1 rounded-full bg-primary" />
                  آخر مشاريعي
                </h3>
                <Link
                  to="/entrepreneur/projects"
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                >
                  عرض الكل{" "}
                  <ArrowRight className="h-4 w-4 transform rotate-180" />
                </Link>
              </div>

              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <ProjectRow key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-text-secondary dark:text-gray-400">
                    لا توجد مشاريع مضافة حالياً
                  </p>
                </div>
              )}
            </div>

            {/* Popular Projects from Others */}
            {popularProjects.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-emerald-500" />
                    مشاريع رائجة للإلهام
                  </h3>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {popularProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/entrepreneur/projects/${project.id}`}
                      className="block group"
                    >
                      <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative aspect-video">
                        <StorageImage
                          path={project.logo_url}
                          bucket="project-files"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          fallbackSrc="https://images.unsplash.com/photo-1572177812156-58036aae439c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
                        <div className="absolute bottom-3 right-3 left-3">
                          <h4 className="text-white font-bold text-sm truncate">
                            {project.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-300 font-medium line-clamp-1">
                              {project.profiles?.full_name}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/20 px-1.5 py-0.5 rounded mr-auto backdrop-blur-sm">
                              <Eye className="h-2.5 w-2.5" />{" "}
                              {project.views_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area (Events & Quick Actions) - 1 Column wide */}
          <div className="space-y-8">
            {/* Recommended Events */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="h-6 w-1 rounded-full bg-violet-600" />
                  فعاليات مقترحة
                </h3>
                <Link
                  to="/entrepreneur/events"
                  className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                >
                  <ArrowRight className="h-4 w-4 transform rotate-180" />
                </Link>
              </div>

              <div className="space-y-5">
                {recommendedEvents.length > 0 ? (
                  recommendedEvents.map((event) => {
                    const date = new Date(event.start_date);
                    return (
                      <Link
                        key={event.id}
                        to={`/entrepreneur/events/${event.id}`}
                        className="group flex gap-4 items-center"
                      >
                        <div className="shrink-0 w-14 h-14 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex flex-col items-center justify-center border border-violet-100 dark:border-violet-800 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <span className="text-lg font-black text-violet-700 dark:text-violet-400 group-hover:text-white leading-none">
                            {date.getDate()}
                          </span>
                          <span className="text-[10px] font-bold text-violet-500 group-hover:text-violet-200">
                            {date.toLocaleDateString("ar", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-[10px] text-text-secondary bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                              {event.location_type === "online" ? (
                                <Video className="h-3 w-3" />
                              ) : (
                                <MapPin className="h-3 w-3" />
                              )}
                              {event.location_type === "online"
                                ? "عن بعد"
                                : "حضوري"}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full font-bold">
                              <Star className="h-3 w-3" /> مقترح
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-sm text-text-secondary">
                    لا توجد فعاليات مقترحة حالياً
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
