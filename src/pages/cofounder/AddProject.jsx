import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { getCategories } from "../../lib/supabase/projects";
import { uploadProjectFile } from "../../lib/supabase/storage";
import {
  AlertTriangle,
  CheckCircle,
  Upload,
  FileText,
  Image,
  X,
  Sparkles,
} from "lucide-react";

const stageLabels = {
  idea: "فكرة",
  prototype: "نموذج أولي",
  mvp: "منتج أولي",
  beta: "تجريبي",
  launched: "مُطلق",
  scaling: "توسع",
};

const AddProject = () => {
  const { profile } = useAuth();
  const { createProject, checkLimit } = useProjects("my");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    funding_goal: "",
    stage: "idea",
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const limitReached = await checkLimit();
      if (limitReached) {
        setError("لقد وصلت للحد الأقصى (مشروعين كل أسبوعين). يرجى الانتظار.");
        setLoading(false);
        return;
      }

      // 1. Create project
      const payload = {
        ...form,
        funding_goal: form.funding_goal ? parseFloat(form.funding_goal) : null,
      };

      const created = await createProject(payload);
      const projectId = created.id;

      // 2. Upload files
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

      // 3. Update project with file URLs
      if (Object.keys(updates).length > 0) {
        const { updateProject } = await import("../../lib/supabase/projects");
        await updateProject(projectId, updates);
      }

      setSuccess(true);
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

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء إنشاء المشروع");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-l from-primary/10 via-violet-500/10 to-transparent dark:from-primary/20 dark:via-violet-500/15 p-6 border border-primary/10 dark:border-primary/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              إضافة مشروع جديد
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              يمكنك إضافة مشروعين كحد أقصى كل أسبوعين
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            تم إنشاء المشروع بنجاح!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              اسم المشروع *
            </label>
            <input
              required
              className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="أدخل اسم المشروع"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              وصف المشروع *
            </label>
            <textarea
              rows={4}
              required
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-colors"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="صف مشروعك بالتفصيل"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                التصنيف *
              </label>
              <select
                required
                className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
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
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                المرحلة *
              </label>
              <select
                required
                className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              >
                {Object.entries(stageLabels).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              هدف التمويل (Egy Pound)
            </label>
            <input
              type="number"
              min="0"
              className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              value={form.funding_goal}
              onChange={(e) =>
                setForm({ ...form, funding_goal: e.target.value })
              }
              placeholder="مثال: 50000"
            />
          </div>

          {/* ── File Upload Section ── */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              ملفات المشروع (اختياري)
            </h3>

            {/* Logo */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
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
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Image className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                    {logoFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      if (logoInputRef.current) logoInputRef.current.value = "";
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
                  className="w-full h-10 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 text-sm text-gray-400 dark:text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  اختر صورة الشعار
                </button>
              )}
            </div>

            {/* Pitch Deck */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                العرض التقديمي (PDF أو PPTX)
              </label>
              <input
                ref={pitchDeckInputRef}
                type="file"
                accept=".pdf,.pptx,.ppt"
                className="hidden"
                onChange={(e) => setPitchDeckFile(e.target.files[0] || null)}
              />
              {pitchDeckFile ? (
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
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
                  className="w-full h-10 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 text-sm text-gray-400 dark:text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  اختر ملف العرض التقديمي
                </button>
              )}
            </div>

            {/* Business Plan */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                خطة العمل (PDF)
              </label>
              <input
                ref={businessPlanInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setBusinessPlanFile(e.target.files[0] || null)}
              />
              {businessPlanFile ? (
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FileText className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
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
                  className="w-full h-10 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 text-sm text-gray-400 dark:text-gray-500 hover:border-green-400 hover:text-green-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  اختر ملف خطة العمل
                </button>
              )}
            </div>

            {/* Project Images */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
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
                      className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
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
                  className="w-full h-10 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 text-sm text-gray-400 dark:text-gray-500 hover:border-purple-400 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Image className="h-4 w-4" />
                  أضف صور المشروع ({projectImages.length}/5)
                </button>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span className="text-sm text-primary font-medium">
                {uploadProgress}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-gradient-to-l from-primary to-primary-dark text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء المشروع"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProject;
