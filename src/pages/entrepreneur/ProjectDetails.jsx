import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProject } from "../../lib/supabase/projects";
import { useAuth } from "../../hooks/useAuth";
import { getOrCreateChat } from "../../lib/supabase/chats";
import {
  ArrowRight,
  MessageSquare,
  Calendar,
  Tag,
  DollarSign,
  Layers,
  FileText,
  Image,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

const stageLabels = {
  idea: "فكرة",
  prototype: "نموذج أولي",
  mvp: "منتج أولي",
  beta: "تجريبي",
  launched: "مُطلق",
  scaling: "توسع",
};

const statusColors = {
  approved: "bg-emerald-100 text-emerald-700",
  pending_review: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-600 dark:text-gray-400",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-blue-100 text-blue-700",
};

const statusLabels = {
  approved: "مقبول",
  pending_review: "قيد المراجعة",
  draft: "مسودة",
  rejected: "مرفوض",
  closed: "مغلق",
};

const ProjectDetails = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

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

  const handleStartChat = async () => {
    if (!profile || !project?.profiles) return;
    try {
      await getOrCreateChat(profile.id, project.profiles.id);
      navigate(
        profile.role === "co_founder"
          ? "/cofounder/chat"
          : "/entrepreneur/chat",
      );
    } catch (err) {
      console.error(err);
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
      <div className="text-center py-16">
        <p className="text-text-secondary dark:text-gray-400">
          المشروع غير موجود
        </p>
        <Link
          to=".."
          className="text-primary font-bold hover:underline mt-2 inline-block"
        >
          العودة
        </Link>
      </div>
    );
  }

  const owner = project.profiles;
  const category = project.categories;
  const images = project.images_urls || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <Link
        to=".."
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowRight className="h-4 w-4" />
        العودة
      </Link>

      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 overflow-hidden">
        {/* Header with Logo */}
        <div className="bg-gradient-to-l from-primary/5 to-transparent p-6 border-b dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Logo */}
              {project.logo_url ? (
                <img
                  src={project.logo_url}
                  alt={project.title}
                  className="h-16 w-16 rounded-xl object-cover border border-gray-100 shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FolderOpen className="h-8 w-8 text-primary/40" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                  {project.title}
                </h1>
                {project.tagline && (
                  <p className="text-sm text-text-secondary mt-1">
                    {project.tagline}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(project.created_at).toLocaleDateString("ar-SA")}
                  </span>
                  {category && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      {category.display_name}
                    </span>
                  )}
                  {project.stage && (
                    <span className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      {stageLabels[project.stage] || project.stage}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span
              className={`self-start rounded-full px-4 py-1.5 text-sm font-bold ${statusColors[project.status] || "bg-gray-100 text-gray-600 dark:text-gray-400"}`}
            >
              {statusLabels[project.status] || project.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2">
              وصف المشروع
            </h2>
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
              {project.description || "لا يوجد وصف"}
            </p>
          </div>

          {project.problem_statement && (
            <div className="p-4 rounded-lg bg-red-50">
              <h2 className="text-sm font-bold text-red-700 mb-1">المشكلة</h2>
              <p className="text-sm text-red-600 leading-relaxed">
                {project.problem_statement}
              </p>
            </div>
          )}

          {project.solution_description && (
            <div className="p-4 rounded-lg bg-emerald-50">
              <h2 className="text-sm font-bold text-emerald-700 mb-1">الحل</h2>
              <p className="text-sm text-emerald-600 leading-relaxed">
                {project.solution_description}
              </p>
            </div>
          )}

          {project.funding_goal && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                هدف التمويل:
              </span>
              <span className="text-sm text-text-secondary dark:text-gray-400">
                {Number(project.funding_goal).toLocaleString()} جنيه
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Project Files ── */}
      {(project.pitch_deck_url ||
        project.business_plan_url ||
        images.length > 0) && (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            ملفات المشروع
          </h2>

          {/* Document Downloads */}
          {(project.pitch_deck_url || project.business_plan_url) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {project.pitch_deck_url && (
                <a
                  href={project.pitch_deck_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-blue-800">
                      العرض التقديمي
                    </p>
                    <p className="text-xs text-blue-600">
                      Pitch Deck — انقر للعرض
                    </p>
                  </div>
                  <Download className="h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                </a>
              )}
              {project.business_plan_url && (
                <a
                  href={project.business_plan_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
                >
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-green-800">
                      خطة العمل
                    </p>
                    <p className="text-xs text-green-600">
                      Business Plan — انقر للعرض
                    </p>
                  </div>
                  <Download className="h-4 w-4 text-green-400 group-hover:text-green-600 transition-colors" />
                </a>
              )}
            </div>
          )}

          {/* Image Gallery */}
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                صور المشروع ({images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className="group relative rounded-xl overflow-hidden border border-gray-100 hover:border-primary/30 transition-all hover:shadow-md aspect-square"
                  >
                    <img
                      src={url}
                      alt={`صورة ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 transition-opacity">
                        عرض
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Owner Info */}
      {owner && (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">صاحب المشروع</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {owner.full_name?.[0] || "U"}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {owner.full_name}
                </p>
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  {owner.bio || "بدون نبذة"}
                </p>
              </div>
            </div>
            {profile && owner.id !== profile.id && (
              <button
                onClick={handleStartChat}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                تواصل
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Lightbox Modal ── */}
      {lightboxIndex >= 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(-1)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(-1)}
            className="absolute top-4 left-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 right-4 text-white/70 text-sm bg-white/10 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(
                  (lightboxIndex - 1 + images.length) % images.length,
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightboxIndex]}
            alt={`صورة ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex + 1) % images.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
