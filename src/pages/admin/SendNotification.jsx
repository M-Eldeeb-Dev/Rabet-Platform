import React, { useState } from "react";
import { sendBulkNotification } from "../../lib/supabase/notifications";
import { Send, CheckCircle, AlertTriangle } from "lucide-react";

const SendNotification = () => {
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "admin_broadcast",
    role: "all",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const types = [
    { value: "admin_broadcast", label: "إعلان إداري" },
    { value: "system_alert", label: "تنبيه نظام" },
    { value: "event_reminder", label: "تذكير فعالية" },
  ];

  const roles = [
    { value: "all", label: "الجميع" },
    { value: "entrepreneur", label: "رواد الأعمال" },
    { value: "co_founder", label: "الشركاء المؤسسون" },
    { value: "event_manager", label: "مديرو الفعاليات" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendBulkNotification(
        form.title,
        form.message,
        form.type,
        form.role,
      );
      setSuccess(true);
      setForm({ title: "", message: "", type: "admin_broadcast", role: "all" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء إرسال الإشعار");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">إرسال إشعارات</h1>
        <p className="text-sm text-text-secondary mt-1">
          أرسل إشعارات لمستخدمي المنصة
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            تم إرسال الإشعار بنجاح!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              عنوان الإشعار
            </label>
            <input
              required
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="أدخل عنوان الإشعار"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              نص الإشعار
            </label>
            <textarea
              required
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="اكتب محتوى الإشعار"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                نوع الإشعار
              </label>
              <select
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                الفئة المستهدفة
              </label>
              <select
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {loading ? "جاري الإرسال..." : "إرسال الإشعار"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendNotification;
