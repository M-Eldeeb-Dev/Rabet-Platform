import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createEvent } from "../../lib/supabase/events";
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

const AddEvent = () => {
  const { profile } = useAuth();
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
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const eventData = {
        organizer_id: profile.id,
        title: form.title,
        description: form.description,
        type: form.type,
        category_id: form.category_id,
        location_type: form.location_type,
        venue_name: form.venue_name || null,
        city: form.city || null,
        online_link: form.online_link || null,
        registration_fee: form.registration_fee
          ? parseFloat(form.registration_fee)
          : 0,
        prize_pool: form.prize_pool ? parseFloat(form.prize_pool) : null,
        max_participants: form.max_participants
          ? parseInt(form.max_participants)
          : null,
        start_date: form.start_date
          ? new Date(form.start_date).toISOString()
          : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        registration_deadline: form.registration_deadline
          ? new Date(form.registration_deadline).toISOString()
          : null,
      };

      const created = await createEvent(eventData);

      // Upload image if selected
      if (imageFile && created?.id) {
        try {
          const imageUrl = await uploadEventImage(imageFile, created.id);
          const { updateEvent } = await import("../../lib/supabase/events");
          await updateEvent(created.id, { image_url: imageUrl });
        } catch (imgErr) {
          console.warn("Image upload failed:", imgErr);
        }
      }

      setSuccess(true);
      setForm({
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
      });
      setImageFile(null);
      setImagePreview(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء إنشاء الفعالية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          إضافة فعالية جديدة
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          أنشئ فعالية جديدة ليراها المستخدمون
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-6">
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            تم إنشاء الفعالية بنجاح!
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
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
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
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
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
                value={form.venue_name}
                onChange={(e) =>
                  setForm({ ...form, venue_name: e.target.value })
                }
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
                value={form.city}
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
                value={form.online_link}
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
                رسوم التسجيل (جنيه)
              </label>
              <input
                type="number"
                min="0"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={form.registration_fee}
                onChange={(e) =>
                  setForm({ ...form, registration_fee: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                الجوائز (جنيه)
              </label>
              <input
                type="number"
                min="0"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={form.prize_pool}
                onChange={(e) =>
                  setForm({ ...form, prize_pool: e.target.value })
                }
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
                value={form.max_participants}
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
                    src={imagePreview}
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
            {loading ? "جاري الإنشاء..." : "إنشاء الفعالية"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;
