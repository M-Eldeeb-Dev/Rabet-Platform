import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getProfile, updateProfile } from "../../lib/supabase/auth";
import { uploadAvatar } from "../../lib/supabase/storage";
import {
  User,
  Save,
  CheckCircle,
  Camera,
  Loader2,
  Briefcase,
  Calendar,
  MessageSquare,
  MapPin,
  Globe,
  Phone,
  Building2,
  Sparkles,
} from "lucide-react";
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
      setProfile({ ...authProfile, ...payload });
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
      setForm((prev) => ({ ...prev, avatar_url: publicUrl }));
      await updateProfile(authProfile.id, { avatar_url: publicUrl });
      setProfile({ ...authProfile, avatar_url: publicUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const roleLabels = {
    entrepreneur: "رائد أعمال",
    co_founder: "شريك مؤسس",
    event_manager: "مدير فعاليات",
    admin: "مسؤول",
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
      {/* Cover / Hero Banner */}
      <div className="rounded-xl overflow-hidden relative">
        <div className="h-36 bg-gradient-to-l from-primary via-violet-600 to-indigo-700 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 border-t-0 rounded-b-xl px-6 pb-5 pt-0">
          {/* Avatar - overlaps banner */}
          <div className="flex items-end gap-4 -mt-10">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={handleAvatarClick}
            >
              <div className="h-20 w-20 rounded-xl bg-white dark:bg-gray-800 p-1 shadow-lg">
                <div className="h-full w-full rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                  {form.avatar_url ? (
                    <img
                      src={form.avatar_url}
                      alt={form.full_name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-primary font-bold text-2xl">
                      {form.full_name?.[0] || "U"}
                    </span>
                  )}
                  <div className="absolute inset-1 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <Camera className="text-white h-5 w-5" />
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-1 bg-black/60 flex items-center justify-center rounded-lg z-10">
                      <Loader2 className="text-white h-5 w-5 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-black text-gray-900 dark:text-white">
                {form.full_name || "المستخدم"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                  {roleLabels[authProfile?.role] || authProfile?.role}
                </span>
                <span>{authProfile?.email}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <Briefcase className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-black text-gray-900 dark:text-white">
                {authProfile?.total_projects || 0}
              </p>
              <p className="text-[11px] text-text-secondary font-medium">
                مشاريع
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <Calendar className="h-5 w-5 text-violet-600 mx-auto mb-1" />
              <p className="text-lg font-black text-gray-900 dark:text-white">
                {authProfile?.total_events || 0}
              </p>
              <p className="text-[11px] text-text-secondary font-medium">
                فعاليات
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <MessageSquare className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-black text-gray-900 dark:text-white">
                {authProfile?.total_chats || 0}
              </p>
              <p className="text-[11px] text-text-secondary font-medium">
                محادثات
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {success && (
          <div className="mx-6 mt-6 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            تم حفظ التغييرات بنجاح!
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              المعلومات الأساسية
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  نبذة تعريفية
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="أخبرنا عن نفسك..."
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              معلومات الاتصال
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="05XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  المدينة
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full h-11 rounded-lg border border-gray-200 pr-10 pl-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="القاهرة"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Section */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              معلومات العمل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  اسم الشركة
                </label>
                <input
                  type="text"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={form.company_name}
                  onChange={(e) =>
                    setForm({ ...form, company_name: e.target.value })
                  }
                  placeholder="اسم شركتك"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  الموقع الإلكتروني
                </label>
                <div className="relative">
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    className="w-full h-11 rounded-lg border border-gray-200 pr-10 pl-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.website_url}
                    onChange={(e) =>
                      setForm({ ...form, website_url: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              المهارات
            </h3>
            <input
              type="text"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="مفصولة بفواصل: تطوير تطبيقات، تسويق، إدارة..."
            />
            {form.skills && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.skills
                  .split(/[,،]/)
                  .filter(Boolean)
                  .map((skill, i) => (
                    <span
                      key={i}
                      className="bg-primary/5 text-primary px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-primary to-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
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
