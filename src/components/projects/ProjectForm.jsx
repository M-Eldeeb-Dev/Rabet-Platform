import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { getCategories } from "../../lib/supabase/projects";
import { uploadProjectFile } from "../../lib/supabase/storage";
import {
  Upload,
  FileText,
  Image,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const stageLabels = {
  idea: "فكرة",
  prototype: "نموذج أولي",
  mvp: "منتج أولي",
  beta: "تجريبي",
  launched: "مُطلق",
  scaling: "توسع",
};

const ProjectForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading: parentLoading,
}) => {
  const [categories, setCategories] = useState([]);

  // Helper to clean initialData
  const getCleanData = (data) => {
    if (!data) return {};
    const { categories, profiles, id, created_at, updated_at, ...clean } = data;
    return clean;
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    funding_goal: "",
    stage: "idea",
    ...getCleanData(initialData),
  });

  // Local state for files (only relevant for new uploads)
  const [logoFile, setLogoFile] = useState(null);
  const [pitchDeckFile, setPitchDeckFile] = useState(null);
  const [businessPlanFile, setBusinessPlanFile] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");

  // Refs
  const logoInputRef = useRef(null);
  const pitchDeckInputRef = useRef(null);
  const businessPlanInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Update form if initialData changes
  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...getCleanData(initialData) }));
    }
  }, [initialData]);

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

    try {
      // Prepare call to parent
      const files = {
        logo: logoFile,
        pitchDeck: pitchDeckFile,
        businessPlan: businessPlanFile,
        images: projectImages,
      };

      await onSubmit(form, files, setUploadProgress);
    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

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

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          وصف المشروع *
        </label>
        <textarea
          rows={4}
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="صف مشروعك بالتفصيل"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            التصنيف *
          </label>
          <select
            required
            className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
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
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          هدف التمويل (Egy Pound)
        </label>
        <input
          type="number"
          min="0"
          className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          value={form.funding_goal || ""}
          onChange={(e) => setForm({ ...form, funding_goal: e.target.value })}
          placeholder="مثال: 50000"
        />
      </div>

      {/* ── File Upload Section ── */}
      <div className="border-t border-gray-100 pt-4 mt-2">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          ملفات المشروع (اختياري - سيتم استبدال الملفات القديمة عند الرفع)
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
              className="w-full h-10 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {initialData?.logo_url ? "تغيير الشعار" : "اختر صورة الشعار"}
            </button>
          )}
        </div>

        {/* Pitch Deck */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            العرض التقديمي (PDF, PPTX)
          </label>
          <input
            ref={pitchDeckInputRef}
            type="file"
            accept=".pdf,.pptx,.ppt"
            className="hidden"
            onChange={(e) => setPitchDeckFile(e.target.files[0] || null)}
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
              {initialData?.pitch_deck_url
                ? "تغيير العرض التقديمي"
                : "اختر ملف العرض التقديمي"}
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
            onChange={(e) => setBusinessPlanFile(e.target.files[0] || null)}
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
              {initialData?.business_plan_url
                ? "تغيير خطة العمل"
                : "اختر ملف خطة العمل"}
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
              أضف المزيد من الصور ({projectImages.length}/5)
            </button>
          )}
          <p className="text-xs text-gray-400 mt-1">
            تنبيه: رفع صور جديدة سيضيفها للقائمة الحالية
          </p>
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
          disabled={parentLoading}
          className="flex-1 h-11 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {parentLoading
            ? "جاري الحفظ..."
            : initialData
              ? "حفظ التعديلات"
              : "إنشاء المشروع"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 px-6 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
