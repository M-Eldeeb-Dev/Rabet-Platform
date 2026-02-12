import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import { signUp, getProfile } from "../../lib/supabase/auth";
import useAuthStore from "../../store/authStore";
import {
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle,
  Mail,
  Lock,
  User,
} from "lucide-react";
import logo from "../../assets/logo.png";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "entrepreneur",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();

  const roles = [
    { value: "entrepreneur", label: "رائد أعمال" },
    { value: "co_founder", label: "شريك مؤسس" },
    { value: "event_manager", label: "مدير فعاليات" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: "https://rabet-platform.vercel.app/auth/callback",
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const data = await signUp(
        form.email,
        form.password,
        form.fullName,
        form.role,
      );
      // If session exists, email confirm is disabled — set auth state and redirect
      if (data?.session && data?.user) {
        const profile = await getProfile(data.user.id);
        setUser(data.user);
        setProfile(profile);
        const routes = {
          entrepreneur: "/entrepreneur/dashboard",
          co_founder: "/cofounder/dashboard",
          event_manager: "/eventmanager/add-event",
          admin: "/admin/dashboard",
        };
        navigate(routes[profile?.role] || "/");
      } else {
        // Email confirmation required — show success message
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-12 bg-bg-light dark:bg-bg-dark"
        dir="rtl"
      >
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-growth/10 text-growth mb-6 animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
              تم إنشاء الحساب بنجاح!
            </h1>
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-8 leading-relaxed">
              تم إرسال رابط التأكيد إلى بريدك الإلكتروني. <br />
              يرجى تأكيد بريدك الإلكتروني ثم تسجيل الدخول.
            </p>
            <Link
              to="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-md hover:shadow-lg"
            >
              الذهاب لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-bg-dark" dir="rtl">
      <Helmet>
        <title>إنشاء حساب جديد | منصة رابط</title>
        <meta
          name="description"
          content="انضم إلى منصة رابط، المجتمع الرائد لرواد الأعمال والمستثمرين في الوطن العربي."
        />
      </Helmet>
      {/* Right Side (Form) */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white dark:bg-bg-dark relative z-10 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-8 flex justify-center md:justify-start">
            <img src={logo} alt="Rabet Logo" className="h-12 w-auto" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              إنشاء حساب جديد
            </h1>
            <p className="text-text-secondary dark:text-gray-400 text-base leading-relaxed">
              انضم إلى مجتمع رابط وابدأ رحلتك في عالم ريادة الأعمال.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                الاسم الكامل
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  required
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 pl-11 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="أدخل اسمك الكامل"
                  value={form.fullName}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <User className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 pl-11 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                نوع الحساب
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`h-11 rounded-lg border text-sm font-bold transition-all ${
                      form.role === r.value
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 pl-11 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="6 أحرف على الأقل"
                  value={form.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 pl-11 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="أعد كتابة كلمة المرور"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-bg-dark px-2 text-text-secondary dark:text-gray-400">
                  أو التسجيل باستخدام
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>جوجل</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("linkedin_oidc")}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "#0077b5" }}
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>لينكد إن</span>
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <p className="mt-8 text-center text-sm text-text-secondary dark:text-gray-400">
            لديك حساب بالفعل؟{" "}
            <Link
              to="/login"
              className="font-bold text-primary hover:text-primary-dark transition-colors"
            >
              سجل دخول
            </Link>
          </p>
        </div>
      </div>

      {/* Left Side (Image Panel) - Hidden on mobile */}
      <div className="hidden md:block md:w-1/2 lg:w-[55%] relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
          }}
        ></div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-[#2463eb]/80 to-creativity/90 mix-blend-multiply"></div>
        {/* Pattern Overlay (CSS-only, no external URL) */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 lg:p-20 text-white z-20">
          <div className="flex justify-end">
            {/* Logo placeholder if needed */}
          </div>
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-growth"></span>
              بداية جديدة
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              ابنِ فريقك، <br />
              <span className="text-growth">شارك رؤيتك</span>
            </h2>
            <p className="text-lg text-white/90 leading-relaxed mb-8 max-w-lg">
              سواء كنت تبحث عن شريك مؤسس، مستثمر، أو تريد عرض مشروعك للعالم.
              رابط هو المكان الأنسب للبدء.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl font-bold text-white">+200</p>
                <p className="text-sm text-white/70">شراكة ناجحة</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">50</p>
                <p className="text-sm text-white/70">حاضنة أعمال</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-sm text-white/70">دعم متواصل</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
