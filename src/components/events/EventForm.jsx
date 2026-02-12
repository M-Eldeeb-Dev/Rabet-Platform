import React, { useState, useEffect } from "react";
import { getCategories } from "../../lib/supabase/projects";
import { uploadEventImage } from "../../lib/supabase/storage";
import { Calendar, CheckCircle, AlertTriangle, Upload, X } from "lucide-react";

const eventTypes = [
  { value: "workshop", label: "ورشة عمل" },
  { value: "conference", label: "مؤتمر" },
  { value: "meetup", label: "لقاء" },
  { value: "webinar", label: "ندوة إلكترونية" },
  { value: "hackathon", label: "هاكاثون" },
  { value: "competition", label: "مسابقة" },
  { value: "other", label: "أخرى" },
  { value: "incubator_program", label: "برنامج حاضنة" },
  { value: "accelerator_program", label: "برنامج مسرعة" },
];

const locationTypes = [
  { value: "physical", label: "حضوري" },
  { value: "online", label: "عن بعد" },
  { value: "hybrid", label: "مختلط" },
];

const EventForm = ({ initialData, onSubmit, loading, submitLabel = "حفظ" }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    venue_name: "",
    city: "",
    location_type: "physical",
    type: "workshop",
    category_id: "",
    registration_deadline: "",
    online_link: "",
    registration_fee: "",
    prize_pool: "",
    max_participants: "",
    ...initialData,
  });

  // Handle Date formatting for inputs (datetime-local expects YYYY-MM-DDTHH:mm)
  useEffect(() => {
    if (initialData) {
      const formatDate = (dateStr) =>
        dateStr ? new Date(dateStr).toISOString().slice(0, 16) : "";
      setForm((prev) => ({
        ...prev,
        start_date: formatDate(initialData.start_date),
        end_date: formatDate(initialData.end_date),
        registration_deadline: formatDate(initialData.registration_deadline),
      }));
    }
  }, [initialData]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.image_url || null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await onSubmit(form, imageFile);
    } catch (err) {
      setError(err.message || "حدث خطأ");
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            عنوان الفعالية *
          </label>
          <input
            required
            className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="أدخل عنوان الفعالية"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            الوصف *
          </label>
          <textarea
            rows={4}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="صف الفعالية بالتفصيل"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              نوع الفعالية *
            </label>
            <select
              required
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {eventTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
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
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              تاريخ البداية *
            </label>
            <input
              type="datetime-local"
              required
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              تاريخ النهاية
            </label>
            <input
              type="datetime-local"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            آخر موعد للتسجيل *
          </label>
          <input
            type="datetime-local"
            required
            className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={form.registration_deadline}
            onChange={(e) =>
              setForm({ ...form, registration_deadline: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              نوع المكان *
            </label>
            <select
              required
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.location_type}
              onChange={(e) =>
                setForm({ ...form, location_type: e.target.value })
              }
            >
              {locationTypes.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              اسم المكان
            </label>
            <input
              type="text"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.venue_name || ""}
              onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
              placeholder="فندق الفيصلية"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              المدينة
            </label>
            <input
              type="text"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.city || ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="الرياض"
            />
          </div>
        </div>

        {/* Online Link */}
        {(form.location_type === "online" ||
          form.location_type === "hybrid") && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              رابط الانضمام
            </label>
            <input
              type="url"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.online_link || ""}
              onChange={(e) =>
                setForm({ ...form, online_link: e.target.value })
              }
              placeholder="https://zoom.us/j/..."
            />
          </div>
        )}

        {/* Fee, Prize, Max Participants */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              رسوم التسجيل (Egy Pound)
            </label>
            <input
              type="number"
              min="0"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.registration_fee || ""}
              onChange={(e) =>
                setForm({ ...form, registration_fee: e.target.value })
              }
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              الجوائز (Egy Pound)
            </label>
            <input
              type="number"
              min="0"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.prize_pool || ""}
              onChange={(e) => setForm({ ...form, prize_pool: e.target.value })}
              placeholder="مثلاً 5000"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              الحد الأقصى
            </label>
            <input
              type="number"
              min="1"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.max_participants || ""}
              onChange={(e) =>
                setForm({ ...form, max_participants: e.target.value })
              }
              placeholder="100"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            صورة الفعالية
          </label>
          <div className="relative rounded-lg border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors p-6 text-center">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={
                    imagePreview.startsWith("http")
                      ? imagePreview
                      : imagePreview
                  }
                  alt="Preview"
                  className="mx-auto h-32 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  اضغط لرفع صورة
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      setImageFile(f);
                      setImagePreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "جاري المعالجة..." : submitLabel}
        </button>
      </form>
    </div>
  );
};

export default EventForm;
