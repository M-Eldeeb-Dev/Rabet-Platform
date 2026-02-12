import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getProject,
  approveProject,
  rejectProject,
} from "../../lib/supabase/projects";
import { useAuth } from "../../hooks/useAuth";
import {
  ArrowRight,
  FolderOpen,
  User,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle,
  XCircle,
  FileText,
  Image,
  Download,
} from "lucide-react";
import StorageImage from "../../components/ui/StorageImage";

const stageLabels = {
  idea: "فكرة",
  prototype: "نموذج أولي",
  mvp: "منتج أولي",
  beta: "تجريبي",
  launched: "مُطلق",
  scaling: "توسع",
};

const statusLabels = {
  draft: "مسودة",
  pending_review: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
  closed: "مغلق",
};

const statusColors = {
  draft: "bg-gray-100 text-gray-600 dark:text-gray-400",
  pending_review: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-gray-100 text-gray-600 dark:text-gray-400",
};

const ProjectDetails = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProject(id);
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = await approveProject(project.id, profile.id);
      setProject({ ...project, ...updated });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const updated = await rejectProject(project.id, profile.id);
      setProject({ ...project, ...updated });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary dark:text-gray-400">
          المشروع غير موجود
        </p>
        <Link
          to="/admin/projects"
          className="text-primary font-bold mt-2 inline-block"
        >
          العودة للمشاريع
        </Link>
      </div>
    );
  }

  const InfoRow = ({ icon: Icon, label, value }) =>
    value ? (
      <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-text-secondary dark:text-gray-400">
            {label}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    ) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <Link
        to="/admin/projects"
        className="inline-flex items-center gap-1 text-sm text-primary font-bold hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للمشاريع
      </Link>

      {/* Hero */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-primary/10 to-blue-200 flex items-center justify-center">
          {project.logo_url ? (
            <div className="h-20 w-20 rounded-xl overflow-hidden">
              <StorageImage
                path={project.logo_url}
                alt={project.title}
                className="h-full w-full object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
              />
            </div>
          ) : (
            <FolderOpen className="h-16 w-16 text-primary/30" />
          )}
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[project.status] || "bg-gray-100 text-gray-600 dark:text-gray-400"}`}
            >
              {statusLabels[project.status] || project.status}
            </span>
            <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold">
              {stageLabels[project.stage] || project.stage}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {project.title}
          </h1>
          {project.tagline && (
            <p className="text-primary font-medium">{project.tagline}</p>
          )}
          <p className="text-text-secondary leading-relaxed">
            {project.description}
          </p>

          {/* Admin Actions */}
          {(project.status === "pending_review" ||
            project.status === "draft") && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 h-10 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                قبول المشروع
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 h-10 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                رفض المشروع
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Details */}
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="font-bold text-gray-900 mb-3 text-lg">
            تفاصيل المشروع
          </h2>
          <InfoRow
            icon={Tag}
            label="التصنيف"
            value={project.categories?.display_name}
          />
          <InfoRow
            icon={DollarSign}
            label="هدف التمويل"
            value={
              project.funding_goal ? `${project.funding_goal} Egy Pound` : null
            }
          />
          <InfoRow
            icon={DollarSign}
            label="التمويل الحالي"
            value={
              project.current_funding
                ? `${project.current_funding} Egy Pound`
                : null
            }
          />
          <InfoRow
            icon={User}
            label="حجم الفريق"
            value={project.team_size?.toString()}
          />
          <InfoRow
            icon={Calendar}
            label="تاريخ الإنشاء"
            value={new Date(project.created_at).toLocaleDateString("ar-SA")}
          />
          <InfoRow
            icon={FolderOpen}
            label="حالة المشروع"
            value={project.is_public ? "عام" : "خاص"}
          />
        </div>

        {/* Owner */}
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
          <h2 className="font-bold text-gray-900 mb-3 text-lg">صاحب المشروع</h2>
          {project.profiles && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {project.profiles.full_name?.[0] || "U"}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {project.profiles.full_name}
                </p>
                <p className="text-xs text-text-secondary dark:text-gray-400">
                  {project.profiles.role}
                </p>
              </div>
            </div>
          )}

          {/* Problem & Solution */}
          {project.problem_statement && (
            <div className="p-3 rounded-lg bg-red-50">
              <p className="text-sm font-bold text-red-700 mb-1">المشكلة</p>
              <p className="text-sm text-red-600">
                {project.problem_statement}
              </p>
            </div>
          )}
          {project.solution_description && (
            <div className="p-3 rounded-lg bg-emerald-50">
              <p className="text-sm font-bold text-emerald-700 mb-1">الحل</p>
              <p className="text-sm text-emerald-600">
                {project.solution_description}
              </p>
            </div>
          )}

          {/* Files */}
          <div className="space-y-2">
            {project.pitch_deck_url && (
              <a
                href={project.pitch_deck_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors"
              >
                <FileText className="h-4 w-4" />
                عرض تقديمي
                <Download className="h-3 w-3 mr-auto" />
              </a>
            )}
            {project.business_plan_url && (
              <a
                href={project.business_plan_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 text-sm font-medium transition-colors"
              >
                <FileText className="h-4 w-4" />
                خطة العمل
                <Download className="h-3 w-3 mr-auto" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Images */}
      {project.images_urls?.length > 0 && (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="font-bold text-gray-900 mb-3 text-lg">صور المشروع</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {project.images_urls.map((url, i) => (
              <div key={i} className="rounded-lg w-full h-32 overflow-hidden">
                <StorageImage
                  path={url}
                  alt={`صورة ${i + 1}`}
                  className="w-full h-full object-cover"
                  fallbackSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
