import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import { getCategories } from "../../lib/supabase/projects";
import { uploadProjectFile } from "../../lib/supabase/storage";
import {
  Plus,
  Trash2,
  FolderOpen,
  Search,
  Upload,
  FileText,
  Image,
  X,
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

const Projects = () => {
  const { projects, loading, createProject, removeProject } = useProjects("my");
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    funding_goal: "",
    stage: "idea",
  });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  // File states
  const [logoFile, setLogoFile] = useState(null);
  const [pitchDeckFile, setPitchDeckFile] = useState(null);
  const [businessPlanFile, setBusinessPlanFile] = useState(null);
  const [projectImages, setProjectImages] = useState([]);

  // Refs for hidden inputs
  const logoInputRef = useRef(null);
  const pitchDeckInputRef = useRef(null);
  const businessPlanInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category_id: "",
      funding_goal: "",
      stage: "idea",
    });
    setLogoFile(null);
    setPitchDeckFile(null);
    setBusinessPlanFile(null);
    setProjectImages([]);
    setUploadProgress("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Create the project first to get its ID
      const payload = {
        ...form,
        funding_goal: form.funding_goal ? parseFloat(form.funding_goal) : null,
      };
      const created = await createProject(payload);
      const projectId = created.id;

      // 2. Upload files if any
      const updates = {};

      if (logoFile) {
        setUploadProgress("جاري رفع الشعار...");
        const result = await uploadProjectFile(logoFile, projectId);
        updates.logo_url = result.url;
      }

      if (pitchDeckFile) {
        setUploadProgress("جاري رفع العرض التقديمي...");
        const result = await uploadProjectFile(pitchDeckFile, projectId);
        updates.pitch_deck_url = result.url;
      }

      if (businessPlanFile) {
        setUploadProgress("جاري رفع خطة العمل...");
        const result = await uploadProjectFile(businessPlanFile, projectId);
        updates.business_plan_url = result.url;
      }

      if (projectImages.length > 0) {
        setUploadProgress("جاري رفع الصور...");
        const imageUrls = [];
        for (const img of projectImages) {
          const result = await uploadProjectFile(img, projectId);
          imageUrls.push(result.url);
        }
        updates.images_urls = imageUrls;
      }

      // 3. Update the project with file URLs if any files were uploaded
      if (Object.keys(updates).length > 0) {
        const { updateProject } = await import("../../lib/supabase/projects");
        await updateProject(projectId, updates);
      }

      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء إنشاء المشروع: " + err.message,
        confirmButtonText: "حسناً",
      });
    } finally {
      setSaving(false);
      setUploadProgress("");
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (projectImages.length + files.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "الحد الأقصى 5 صور",
        confirmButtonText: "حسناً",
      });
      return;
    }
    setProjectImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setProjectImages((prev) => prev.filter((_, i) => i !== index));
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
          onClick={() => setShowModal(true)}
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
              className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Show logo if exists */}
              {project.logo_url && (
                <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={project.logo_url}
                    alt={project.title}
                    className="h-full w-full object-cover"
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
                      {Number(project.funding_goal).toLocaleString()} جنيه
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
                    onClick={() => handleDelete(project.id)}
                    className="h-9 w-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-12 text-center">
          <FolderOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-2">لا توجد مشاريع</h3>
          <p className="text-sm text-text-secondary mb-4">
            ابدأ بإضافة مشروعك الأول
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            أضف مشروع
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-white dark:bg-gray-800 shadow-xl animate-fadeIn flex flex-col">
            <div className="flex items-center justify-between p-6 pb-0 mb-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                مشروع جديد
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleCreate}
              className="space-y-4 overflow-y-auto px-6 pb-6 flex-1"
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  اسم المشروع *
                </label>
                <input
                  required
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="أدخل اسم المشروع"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  الوصف *
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="صف مشروعك بإيجاز"
                />
              </div>

              {/* Category + Stage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    التصنيف *
                  </label>
                  <select
                    required
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    المرحلة *
                  </label>
                  <select
                    required
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={form.stage}
                    onChange={(e) =>
                      setForm({ ...form, stage: e.target.value })
                    }
                  >
                    {Object.entries(stageLabels).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Funding Goal */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  هدف التمويل (ر.س)
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={form.funding_goal}
                  onChange={(e) =>
                    setForm({ ...form, funding_goal: e.target.value })
                  }
                  placeholder="مثال: 50000"
                />
              </div>

              {/* ── File Upload Section ── */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  ملفات المشروع (اختياري)
                </h3>

                {/* Logo */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    شعار المشروع
                  </label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setLogoFile(e.target.files[0] || null)}
                  />
                  {logoFile ? (
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                      <Image className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {logoFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          if (logoInputRef.current)
                            logoInputRef.current.value = "";
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full h-10 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      اختر صورة الشعار
                    </button>
                  )}
                </div>

                {/* Pitch Deck */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    العرض التقديمي (PDF أو PPTX)
                  </label>
                  <input
                    ref={pitchDeckInputRef}
                    type="file"
                    accept=".pdf,.pptx,.ppt"
                    className="hidden"
                    onChange={(e) =>
                      setPitchDeckFile(e.target.files[0] || null)
                    }
                  />
                  {pitchDeckFile ? (
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {pitchDeckFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPitchDeckFile(null);
                          if (pitchDeckInputRef.current)
                            pitchDeckInputRef.current.value = "";
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pitchDeckInputRef.current?.click()}
                      className="w-full h-10 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      اختر ملف العرض التقديمي
                    </button>
                  )}
                </div>

                {/* Business Plan */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    خطة العمل (PDF)
                  </label>
                  <input
                    ref={businessPlanInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) =>
                      setBusinessPlanFile(e.target.files[0] || null)
                    }
                  />
                  {businessPlanFile ? (
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                      <FileText className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {businessPlanFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setBusinessPlanFile(null);
                          if (businessPlanInputRef.current)
                            businessPlanInputRef.current.value = "";
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => businessPlanInputRef.current?.click()}
                      className="w-full h-10 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      اختر ملف خطة العمل
                    </button>
                  )}
                </div>

                {/* Project Images */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    صور المشروع (حتى 5 صور)
                  </label>
                  <input
                    ref={imagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImagesSelect}
                  />
                  {projectImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {projectImages.map((img, i) => (
                        <div
                          key={i}
                          className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          <img
                            src={URL.createObjectURL(img)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {projectImages.length < 5 && (
                    <button
                      type="button"
                      onClick={() => imagesInputRef.current?.click()}
                      className="w-full h-10 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <Image className="h-4 w-4" />
                      أضف صور المشروع ({projectImages.length}/5)
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  <span className="text-sm text-primary font-medium">
                    {uploadProgress}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : "إنشاء المشروع"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="h-11 px-6 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
