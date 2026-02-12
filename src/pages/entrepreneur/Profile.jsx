import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getProfile, updateProfile } from "../../lib/supabase/auth";
import { uploadAvatar } from "../../lib/supabase/storage";
import { User, Save, CheckCircle, Camera, Loader2 } from "lucide-react";

import useAuthStore from "../../store/authStore";

const Profile = () => {
  const { profile: authProfile } = useAuth();
  const { setProfile } = useAuthStore();
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    phone: "",
    skills: "",
    company_name: "",
    website_url: "",
    city: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      if (!authProfile) return;
      try {
        const data = await getProfile(authProfile.id);
        setForm({
          full_name: data.full_name || "",
          bio: data.bio || "",
          phone: data.phone || "",
          skills: Array.isArray(data.skills)
            ? data.skills.join("، ")
            : data.skills || "",
          company_name: data.company_name || "",
          website_url: data.website_url || "",
          city: data.city || "",
          avatar_url: data.avatar_url || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [authProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills
          ? form.skills
              .split(/[,،]/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };
      await updateProfile(authProfile.id, payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const publicUrl = await uploadAvatar(file, authProfile.id);

      // Update local state
      setForm((prev) => ({ ...prev, avatar_url: publicUrl }));

      // Update database immediately
      await updateProfile(authProfile.id, { avatar_url: publicUrl });

      // Update global store
      setProfile({ ...authProfile, avatar_url: publicUrl });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      // You might want to show an error message here
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          الملف الشخصي
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          قم بتحديث معلوماتك الشخصية
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b dark:border-gray-700">
          <div
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
          >
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt={form.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-primary font-bold text-2xl">
                  {form.full_name?.[0] || "U"}
                </span>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="text-white h-6 w-6" />
              </div>

              {/* Loading State */}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-10">
                  <Loader2 className="text-white h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {form.full_name}
            </p>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              {authProfile?.email}
            </p>
            <button
              onClick={handleAvatarClick}
              className="text-xs text-primary hover:underline mt-1 font-medium"
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? "جاري الرفع..." : "تغيير الصورة"}
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            تم حفظ التغييرات بنجاح!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              الاسم الكامل
            </label>
            <input
              type="text"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              نبذة تعريفية
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="أخبرنا عن نفسك..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                رقم الهاتف
              </label>
              <input
                type="tel"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="05XXXXXXXX"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                اسم الشركة
              </label>
              <input
                type="text"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={form.company_name}
                onChange={(e) =>
                  setForm({ ...form, company_name: e.target.value })
                }
                placeholder="اسم شركتك"
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
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              المهارات
            </label>
            <input
              type="text"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="مفصولة بفواصل: تطوير تطبيقات، تسويق، إدارة..."
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
