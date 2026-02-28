import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import { getCategories } from "../../lib/supabase/projects";
import { uploadProjectFile } from "../../lib/supabase/storage";
import {
  Plus,
  Trash2,
  FolderOpen,
  Search,
  FileText,
  Image,
  Edit2,
  Eye,
  Users,
  Layers,
  TrendingUp,
} from "lucide-react";
import StorageImage from "../../components/ui/StorageImage";
import ProjectForm from "../../components/projects/ProjectForm";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import Swal from "sweetalert2";

const statusColors = {
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending_review: "bg-amber-100 text-amber-700 border-amber-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  closed: "bg-blue-100 text-blue-700 border-blue-200",
};

const statusLabels = {
  approved: "مقبول",
  pending_review: "قيد المراجعة",
  draft: "مسودة",
  rejected: "مرفوض",
  closed: "مغلق",
};

const stageLabels = {
  idea: "فكرة",
  prototype: "نموذج أولي",
  mvp: "منتج أولي",
  beta: "تجريبي",
  launched: "مُطلق",
  scaling: "توسع",
};

const stageIcons = {
  idea: "💡",
  prototype: "🔧",
  mvp: "🚀",
  beta: "🧪",
  launched: "✅",
  scaling: "📈",
};

const Projects = () => {
  const { projects, loading, createProject, removeProject } = useProjects("my");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { reObserve } = useScrollAnimation();

  useEffect(() => {
    if (!loading) {
      setTimeout(() => reObserve(), 100);
    }
  }, [loading, reObserve]);

  const handleCreateOrUpdate = async (formData, files, setUploadProgress) => {
    setSaving(true);
    try {
      let projectId;
      const payload = {
        ...formData,
        funding_goal: formData.funding_goal
          ? parseFloat(formData.funding_goal)
          : null,
      };

      if (editingProject) {
        projectId = editingProject.id;
        const { updateProject } = await import("../../lib/supabase/projects");
        await updateProject(projectId, payload);
      } else {
        const created = await createProject(payload);
        projectId = created.id;
      }

      const updates = {};

      if (files.logo) {
        setUploadProgress("جاري رفع الشعار...");
        const result = await uploadProjectFile(files.logo, projectId);
        updates.logo_url = result.url;
      }

      if (files.pitchDeck) {
        setUploadProgress("جاري رفع العرض التقديمي...");
        const result = await uploadProjectFile(files.pitchDeck, projectId);
        updates.pitch_deck_url = result.url;
      }

      if (files.businessPlan) {
        setUploadProgress("جاري رفع خطة العمل...");
        const result = await uploadProjectFile(files.businessPlan, projectId);
        updates.business_plan_url = result.url;
      }

      if (files.images && files.images.length > 0) {
        setUploadProgress("جاري رفع الصور...");
        const imageUrls = [];
        for (const img of files.images) {
          const result = await uploadProjectFile(img, projectId);
          imageUrls.push(result.url);
        }
        if (editingProject && editingProject.images_urls) {
          updates.images_urls = [...editingProject.images_urls, ...imageUrls];
        } else {
          updates.images_urls = imageUrls;
        }
      }

      if (Object.keys(updates).length > 0) {
        const { updateProject } = await import("../../lib/supabase/projects");
        await updateProject(projectId, updates);
      }

      setSaving(false);
      setShowModal(false);
      setEditingProject(null);
      Swal.fire({
        icon: "success",
        title: "تم بنجاح",
        text: editingProject ? "تم تحديث المشروع" : "تم إنشاء المشروع",
        timer: 1500,
        showConfirmButton: false,
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ: " + err.message,
        confirmButtonText: "حسناً",
      });
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;
    try {
      await removeProject(id);
      Swal.fire("تم الحذف!", "تم حذف المشروع بنجاح.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("خطأ!", "فشل حذف المشروع.", "error");
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-primary" />
            مشاريعي
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {projects.length} مشروع
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-primary to-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          مشروع جديد
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث في مشاريعك..."
          className="w-full h-11 rounded-xl border border-gray-200 bg-white pr-10 pl-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="scroll-animate card-glow rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden group"
            >
              {/* Card Top - Gradient strip + Logo */}
              <div className="h-36 relative overflow-hidden">
                {project.logo_url ? (
                  <StorageImage
                    path={project.logo_url}
                    alt={project.title}
                    bucket="project-files"
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    fallbackSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/10 via-violet-100/50 to-sky-100/30 flex items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-primary/30" />
                  </div>
                )}
                {/* Status badge overlay */}
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold border backdrop-blur-sm ${statusColors[project.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                  >
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
                {/* Views overlay */}
                <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                  <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <Eye className="h-3 w-3" />
                    {project.views_count || 0}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                  {project.description || "بدون وصف"}
                </p>

                {/* Tags row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {project.stage && (
                    <span className="inline-flex items-center gap-1 bg-primary/5 text-primary px-2 py-0.5 rounded-full text-[11px] font-bold">
                      <span>{stageIcons[project.stage] || "📋"}</span>
                      {stageLabels[project.stage] || project.stage}
                    </span>
                  )}
                  {project.funding_goal && (
                    <span className="text-[11px] text-text-secondary bg-gray-50 px-2 py-0.5 rounded-full">
                      {Number(project.funding_goal).toLocaleString()} EGP
                    </span>
                  )}
                </div>

                {/* File indicators */}
                <div className="flex items-center gap-1.5 text-xs">
                  {project.pitch_deck_url && (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      <FileText className="h-2.5 w-2.5" />
                      عرض
                    </span>
                  )}
                  {project.business_plan_url && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      <FileText className="h-2.5 w-2.5" />
                      خطة
                    </span>
                  )}
                  {project.images_urls?.length > 0 && (
                    <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      <Image className="h-2.5 w-2.5" />
                      {project.images_urls.length}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Link
                    to={`/entrepreneur/projects/${project.id}`}
                    className="flex-1 h-9 rounded-lg bg-primary/10 text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center"
                  >
                    تفاصيل
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openEditModal(project);
                    }}
                    className="h-9 w-9 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors flex items-center justify-center"
                    title="تعديل"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(project.id);
                    }}
                    className="h-9 w-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <FolderOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-2">لا توجد مشاريع</h3>
          <p className="text-sm text-text-secondary mb-4">
            ابدأ بإضافة مشروعك الأول
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-primary to-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Plus className="h-4 w-4" />
            أضف مشروع
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-white dark:bg-gray-800 shadow-xl animate-fadeIn flex flex-col">
            <div className="flex items-center justify-between p-6 pb-0 mb-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {editingProject ? "تعديل المشروع" : "مشروع جديد"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProject(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-6 pb-6 flex-1">
              <ProjectForm
                initialData={editingProject}
                onSubmit={handleCreateOrUpdate}
                onCancel={() => {
                  setShowModal(false);
                  setEditingProject(null);
                }}
                loading={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
