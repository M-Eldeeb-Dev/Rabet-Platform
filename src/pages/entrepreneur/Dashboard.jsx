import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMyProjects } from "../../lib/supabase/projects";
import { getUnreadMessageCount } from "../../lib/supabase/chats";
// import { getEvents } from "../../lib/supabase/events"; // We'll implement this if needed, or mock for now
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
  MoreHorizontal,
} from "lucide-react";
import StorageImage from "../../components/ui/StorageImage";

// --- Mock Data for UI Alignment ---
const MOCK_ACTIVITIES = [
  {
    type: "view",
    user: "صندوق الابتكار",
    project: "تغليف صديق للبيئة",
    time: "منذ 30 دقيقة",
    icon: Eye,
    color: "blue",
  },
  {
    type: "approval",
    title: "هاكاثون الرياض",
    time: "منذ 5 ساعات",
    icon: CheckCircle,
    color: "green",
  },
  {
    type: "join",
    project: "منصة تعليم ذكية",
    time: "أمس، 9:30 صباحاً",
    icon: UserPlus,
    color: "purple",
  },
];

const MOCK_EVENTS = [
  {
    id: 1,
    title: "ملتقى رواد الأعمال",
    date: { day: "24", month: "أكتوبر" },
    location: "الرياض، واجهة روشن",
    type: "physical",
  },
  {
    id: 2,
    title: "ورشة عمل: التسويق الرقمي",
    date: { day: "05", month: "نوفمبر" },
    location: "عن بعد (Zoom)",
    type: "online",
  },
];

const MOCK_MENTORS = [
  {
    name: "سارة العمر",
    role: "خبيرة استراتيجيات ونمو",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "خالد السالم",
    role: "مستشار مالي",
    image:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

// --- Components ---

const StatCard = ({
  icon: Icon,
  label,
  value,
  subLabel,
  colorClass,
  borderClass,
}) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 hover:border-primary/50 transition-colors cursor-pointer group">
    <div className="flex justify-between items-start">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      {subLabel && (
        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          {subLabel}
        </span>
      )}
    </div>
    <div>
      <p className="text-text-secondary dark:text-gray-400 text-sm font-medium mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
        {value}
      </p>
    </div>
  </div>
);

const ProjectCard = ({ project }) => {
  const statusColors = {
    active: "bg-blue-50 text-blue-700 border-blue-100",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    completed: "bg-green-50 text-green-700 border-green-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
  };

  const statusLabels = {
    active: "مرحلة النمو",
    pending: "فكرة أولية",
    completed: "مكتمل",
    rejected: "مرفوض",
  };

  // Calculate progress based on actual fields
  const calculateProgress = () => {
    let score = 0;
    // Basic Info (40%)
    if (project.title) score += 10;
    if (project.description) score += 10;
    if (project.category_id) score += 10;
    if (project.stage) score += 10;

    // Financials (10%)
    if (project.funding_goal) score += 10;

    // Visuals (20%)
    if (project.logo_url) score += 10;
    if (project.images_urls && project.images_urls.length > 0) score += 10;

    // Docs (30%)
    if (project.pitch_deck_url) score += 15;
    if (project.business_plan_url) score += 15;

    return Math.min(score, 100);
  };

  const progress = calculateProgress();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center">
      <div className="relative shrink-0">
        <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <StorageImage
            path={project.logo_url}
            alt={project.title}
            className="h-full w-full object-cover"
            fallbackSrc="https://images.unsplash.com/photo-1572177812156-58036aae439c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          />
          {!project.logo_url && (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
              <FolderOpen />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 w-full">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              {project.title}
            </h4>
            <p className="text-xs text-text-secondary dark:text-gray-400">
              {project.description?.slice(0, 40)}...
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[project.status] || "bg-gray-100"}`}
          >
            {statusLabels[project.status] || project.status}
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-text-secondary dark:text-gray-400">
          <span>اكتمال الملف: {progress}%</span>
          <span className="text-gray-900 dark:text-white font-medium">
            آخر تحديث:{" "}
            {new Date(project.updated_at).toLocaleDateString("ar-EG")}
          </span>
        </div>
      </div>
      <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <Link to={`/entrepreneur/projects/${project.id}`} className="flex-1">
          <button className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            تعديل
          </button>
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
    notifications: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;
      try {
        const projects = await getMyProjects(profile.id);
        const unreadMsgs = await getUnreadMessageCount(profile.id);
        // Using mock numbers for views/pending to match design, but keeping real data for projects/msgs
        setStats({
          projects: projects.length,
          messages: unreadMsgs,
          notifications: 3, // Mock
        });
        setRecentProjects(projects.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
      className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth animate-fadeIn"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            أهلاً بك، {profile?.full_name?.split(" ")[0]} 👋
          </h2>
          <p className="text-text-secondary dark:text-gray-400 text-sm">
            إليك نظرة سريعة على أداء مشاريعك والفرص المتاحة اليوم.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FolderOpen}
            label="المشاريع النشطة"
            value={stats.projects}
            subLabel="+1 جديد"
            colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          />
          <StatCard
            icon={Hourglass}
            label="طلبات قيد الانتظار"
            value="5"
            colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
          />
          <StatCard
            icon={Eye}
            label="مشاهدات الملف"
            value="124"
            subLabel={
              <>
                <TrendingUp className="h-3 w-3" /> 15%
              </>
            }
            colorClass="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
          />
          <StatCard
            icon={Mail}
            label="الرسائل الجديدة"
            value={stats.messages}
            subLabel={`${stats.messages} غير مقروءة`}
            colorClass="bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
          />
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Projects & Activity) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                مشاريعي الحالية
              </h3>
              <Link
                to="/entrepreneur/projects"
                className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
              >
                عرض الكل
                <ArrowRight className="h-4 w-4 transform rotate-180" />
              </Link>
            </div>

            {/* Projects List */}
            {recentProjects.length > 0 ? (
              <div className="flex flex-col gap-4">
                {recentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-text-secondary dark:text-gray-400">
                  لا توجد مشاريع بعد
                </p>
              </div>
            )}

            {/* Recent Activity Section */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mt-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  آخر النشاطات
                </h3>
                <button className="text-primary text-sm hover:underline">
                  عرض الكل
                </button>
              </div>
              <div className="space-y-6">
                {MOCK_ACTIVITIES.map((activity, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== MOCK_ACTIVITIES.length - 1 && (
                      <div className="absolute top-10 right-5 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />
                    )}
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-${activity.color}-50 text-${activity.color}-600 dark:bg-${activity.color}-900/20 dark:text-${activity.color}-400`}
                    >
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {activity.user ? (
                          <span className="font-bold">{activity.user}</span>
                        ) : null}
                        {activity.user && " قام بـ "}
                        {activity.type === "view" && "مشاهدة مشروع "}
                        {activity.type === "approval" && "الموافقة على "}
                        {activity.type === "join" && " الانضمام إلى فريق "}
                        <span className="font-bold text-primary">
                          {activity.project || activity.title}
                        </span>
                      </p>
                      <span className="text-xs text-text-secondary dark:text-gray-400 mt-1 block">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Right Column (Events & Mentors) */}
          <div className="flex flex-col gap-6">
            {/* Upcoming Events */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  فعاليات قادمة
                </h3>
                <Link
                  to="/entrepreneur/events"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
              <div className="space-y-4">
                {MOCK_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-4 group cursor-pointer"
                  >
                    <div className="bg-primary/5 group-hover:bg-primary/10 transition-colors rounded-xl p-3 text-center min-w-[60px]">
                      <span className="block text-xl font-black text-primary">
                        {event.date.day}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {event.date.month}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-secondary mt-0.5">
                        {event.type === "online" ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {event.type === "online"
                          ? "عن بعد"
                          : "5 مساءً - 9 مساءً"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-primary font-bold bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                استكشف المزيد
              </button>
            </div>

            {/* Recommended Mentors */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  موجهين مقترحين
                </h3>
              </div>
              <div className="space-y-4">
                {MOCK_MENTORS.map((mentor, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {mentor.name}
                      </h4>
                      <p className="text-xs text-text-secondary">
                        {mentor.role}
                      </p>
                    </div>
                    <button className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <UserPlus className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
