import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase/client";
import { User, Save, CheckCircle, AlertTriangle } from "lucide-react";

const Profile = () => {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    phone: "",
    city: "",
    website_url: "",
    company_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        city: profile.city || "",
        website_url: profile.website_url || "",
        company_name: profile.company_name || "",
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          ...form,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">الملف الشخصي</h1>
        <p className="text-sm text-text-secondary mt-1">تعديل بيانات حسابك</p>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b dark:border-gray-700">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">
            {form.full_name?.[0] || "U"}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{profile?.email}</p>
            <p className="text-sm text-text-secondary dark:text-gray-400">مسؤول النظام</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            تم تحديث البيانات بنجاح!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              الاسم الكامل
            </label>
            <input
              required
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              نبذة عنك
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                الهاتف
              </label>
              <input
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                المدينة
              </label>
              <input
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              اسم المنظمة
            </label>
            <input
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.company_name}
              onChange={(e) =>
                setForm({ ...form, company_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              الموقع الإلكتروني
            </label>
            <input
              type="url"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.website_url}
              onChange={(e) =>
                setForm({ ...form, website_url: e.target.value })
              }
              placeholder="https://"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
