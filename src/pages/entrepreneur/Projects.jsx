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
} from "lucide-react";
import StorageImage from "../../components/ui/StorageImage";
import ProjectForm from "../../components/projects/ProjectForm";
import Swal from "sweetalert2";

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

const stageLabels = {
  idea: "فكرة",
  prototype: "نموذج أولي",
  mvp: "منتج أولي",
  beta: "تجريبي",
  launched: "مُطلق",
  scaling: "توسع",
};

const Projects = () => {
  const { projects, loading, createProject, removeProject } = useProjects("my");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateOrUpdate = async (formData, files, setUploadProgress) => {
    setSaving(true);
    try {
      let projectId;

      // 1. Create or Update Project Data
      const payload = {
        ...formData,
        funding_goal: formData.funding_goal
          ? parseFloat(formData.funding_goal)
          : null,
      };

      if (editingProject) {
        // Update
        projectId = editingProject.id;
        const { updateProject } = await import("../../lib/supabase/projects");
        await updateProject(projectId, payload);
      } else {
        // Create
        const created = await createProject(payload);
        projectId = created.id;
      }

      // 2. Upload Files
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

        // If editing, append to existing images, otherwise just set
        // NOTE: For simplicity, we are appending. Real world might need better management.
        if (editingProject && editingProject.images_urls) {
          updates.images_urls = [...editingProject.images_urls, ...imageUrls];
        } else {
          updates.images_urls = imageUrls;
        }
      }

      // 3. Apply file updates to project
      if (Object.keys(updates).length > 0) {
        const { updateProject } = await import("../../lib/supabase/projects");
        await updateProject(projectId, updates);
      }

      // Success
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
      // Force refresh? hooks/useProjects likely listens to realtime or needs manual refresh?
      // Since createProject in hook likely updates state, we are good. Update might need reload or state update.
      window.location.reload(); // Simple refresh to show updates
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            مشاريعي
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {projects.length} مشروع
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
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
          className="w-full h-10 rounded-lg border border-gray-200 bg-white pr-10 pl-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Show logo if exists */}
              {project.logo_url && (
                <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                  <StorageImage
                    path={project.logo_url}
                    alt={project.title}
                    bucket="project-files"
                    className="h-full w-full object-cover"
                    fallbackSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                  />
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusColors[project.status] || "bg-gray-100 text-gray-600 dark:text-gray-400"}`}
                  >
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2">
                  {project.description || "بدون وصف"}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-secondary flex-wrap">
                  {project.categories && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {project.categories.display_name}
                    </span>
                  )}
                  {project.stage && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {stageLabels[project.stage] || project.stage}
                    </span>
                  )}
                  {project.funding_goal && (
                    <span>
                      {Number(project.funding_goal).toLocaleString()} Egy Pound
                    </span>
                  )}
                </div>
                {/* File indicators */}
                <div className="flex items-center gap-2 text-xs">
                  {project.pitch_deck_url && (
                    <a
                      href={project.pitch_deck_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      عرض تقديمي
                    </a>
                  )}
                  {project.business_plan_url && (
                    <a
                      href={project.business_plan_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      خطة عمل
                    </a>
                  )}
                  {project.images_urls?.length > 0 && (
                    <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-1 rounded">
                      <Image className="h-3 w-3" />
                      {project.images_urls.length} صور
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Link
                    to={`/entrepreneur/projects/${project.id}`}
                    className="flex-1 h-9 rounded-lg bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors flex items-center justify-center"
                  >
                    تفاصيل
                  </Link>
                  <button
                    onClick={() => openEditModal(project)}
                    className="h-9 w-9 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors flex items-center justify-center"
                    title="تعديل"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
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
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
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
