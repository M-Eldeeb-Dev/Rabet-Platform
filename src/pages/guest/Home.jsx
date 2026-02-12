import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import {
  Rocket,
  Search,
  Banknote,
  Sparkles,
  Link2,
  MapPin,
  Mail,
  Phone,
  Send,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Subscription from "../../components/sections/Subscription";

const Home = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactSent, setContactSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from("contact_messages").insert([contactForm]);
      setContactSent(true);
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setContactSent(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-grow" dir="rtl">
      {/* ====== HERO SECTION ====== */}
      <section className="relative bg-white py-16 md:py-24 dark:bg-bg-dark overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-20 -right-20 size-80 rounded-full bg-purple-500/5 blur-3xl"></div>

        <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
            {/* Text Content */}
            <div className="flex flex-1 flex-col gap-6 text-right lg:max-w-xl animate-fade-in-up">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary dark:border-primary/30 dark:bg-primary/10">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                </span>
                انطلق الآن مع رابط
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                نربط <span className="text-primary">الأفكار</span> بالفرص
                الاستثمارية الحقيقية
              </h1>
              <p className="text-lg leading-relaxed text-text-secondary dark:text-gray-400">
                المنصة الأولى لدعم المبدعين والشركات الناشئة في الوصول
                للمستثمرين والمسابقات وفرص الدعم. ابدأ رحلتك وحول فكرتك إلى
                واقع.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/register"
                  className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-bold text-white transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
                >
                  <Rocket className="h-5 w-5" />
                  <span>ابحث عن تمويل</span>
                </Link>
                <a
                  href="#features"
                  className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 text-base font-bold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Search className="h-5 w-5" />
                  <span>تصفح المشاريع</span>
                </a>
              </div>
              {/* <div className="mt-4 flex items-center gap-4 text-sm text-text-secondary dark:text-gray-500">
                <div className="flex -space-x-2 space-x-reverse">
                  {[
                    { initial: "أ", bg: "bg-blue-500" },
                    { initial: "س", bg: "bg-purple-500" },
                    { initial: "ف", bg: "bg-emerald-500" },
                  ].map((u, i) => (
                    <div
                      key={i}
                      className={`inline-flex size-8 items-center justify-center rounded-full ring-2 ring-white dark:ring-bg-dark ${u.bg} text-white text-xs font-bold`}
                    >
                      {u.initial}
                    </div>
                  ))}
                  <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 ring-2 ring-white dark:bg-gray-700 dark:text-gray-300 dark:ring-bg-dark">
                    +2k
                  </div>
                </div>
                <p>انضم لأكثر من 2000 مبدع ومستثمر</p>
              </div> */}
            </div>

            {/* Hero Image / Cards */}
            <div className="relative flex flex-1 justify-center lg:justify-end">
              <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100 shadow-2xl dark:bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <div
                  className="aspect-[4/3] w-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80')",
                  }}
                ></div>

                {/* Floating Card 1 */}
                <div className="absolute bottom-8 right-8 z-20 max-w-[240px] rounded-xl bg-white p-4 shadow-lg backdrop-blur-sm dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 animate-bounce delay-1000">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary dark:text-gray-400">
                        تمويل ناجح يصل الي
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        500,000 Egy Pound
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-1.5 w-[85%] rounded-full bg-green-500"></div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute top-8 left-8 z-20 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-sm dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 space-x-reverse">
                      <div className="size-6 rounded-full bg-blue-500"></div>
                      <div className="size-6 rounded-full bg-purple-500"></div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      مطابقة ذكية
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== WHAT WE DO (ABOUT) ====== */}
      <section id="about" className="bg-bg-light py-20 dark:bg-bg-dark">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
          <div className="mb-12 flex flex-col items-center text-center">
            <span className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">
              عن رابط
            </span>
            <h2 className="max-w-3xl text-3xl font-black leading-tight text-gray-900 md:text-4xl dark:text-white">
              ماذا يقدم موقع رابط؟
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-text-secondary dark:text-gray-400">
              نعمل كحلقة وصل موثوقة بين جميع أطراف منظومة ريادة الأعمال لتعزيز
              فرص النجاح والنمو المستدام.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 border border-transparent hover:border-primary/10">
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-blue-900/20">
                <Rocket className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                للمبدعين والشركات الناشئة
              </h3>
              <p className="text-text-secondary dark:text-gray-400">
                سهولة الوصول إلى مصادر التمويل والمسابقات المحلية والدولية لعرض
                مشاريعكم على جمهور واسع.
              </p>
            </div>
            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 border border-transparent hover:border-primary/10">
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20">
                <Banknote className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                للمستثمرين وجهات الدعم
              </h3>
              <p className="text-text-secondary dark:text-gray-400">
                الوصول إلى قاعدة بيانات ضخمة ومفلترة من المشاريع الواعدة
                والمواهب المبدعة التي تستحق الاستثمار.
              </p>
            </div>
            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 border border-transparent hover:border-primary/10">
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                <Link2 className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                بيئة تفاعلية متكاملة
              </h3>
              <p className="text-text-secondary dark:text-gray-400">
                أدوات تواصل فعالة، غرف اجتماعات افتراضية، ومساحات لعرض الأعمال
                تضمن تجربة سلسة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="bg-white py-20 dark:bg-bg-dark">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
          <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-primary">
                المميزات
              </span>
              <h2 className="text-3xl font-black leading-tight text-gray-900 md:text-4xl dark:text-white">
                أدوات مصممة لتسريع نموك
              </h2>
            </div>
            <p className="max-w-md text-text-secondary dark:text-gray-400">
              كل ما تحتاجه لإدارة علاقاتك الاستثمارية وعرض مشاريعك باحترافية في
              مكان واحد.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-bg-light p-4 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-200">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform hover:scale-105 duration-500"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')",
                  }}
                ></div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  مطابقة ذكية بالذكاء الاصطناعي
                </h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  خوارزميات متقدمة لترشيح أنسب الفرص الاستثمارية والمشاريع بناءً
                  على اهتماماتك ونوع نشاطك.
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-bg-light p-4 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-200">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform hover:scale-105 duration-500"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1115&q=80')",
                  }}
                ></div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  تنبيهات فورية للمسابقات
                </h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  لا تفوت فرصة! احصل على إشعارات بآخر المسابقات، الهاكاثونات،
                  وجولات التمويل فور إطلاقها.
                </p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-bg-light p-4 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-200">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform hover:scale-105 duration-500"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1579389083078-4e7018379f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')",
                  }}
                ></div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  مشاريع وهوية موثقة
                </h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  نظام تحقق صارم يضمن مصداقية المشاريع المعروضة وجدية المستثمرين
                  لحماية جميع الأطراف.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      {/* <section className="bg-bg-light py-20 dark:bg-bg-dark">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black leading-tight text-gray-900 md:text-4xl dark:text-white">
              قصص نجاح وآراء العملاء
            </h2>
            <p className="mt-4 text-text-secondary dark:text-gray-400">
              نفتخر بكوننا جزءاً من رحلة نجاح العديد من الرواد
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "أحمد المنصور",
                role: "مؤسس شركة تقنية",
                text: "بفضل منصة رابط، تمكنت من إيجاد مستثمر لمشروعي التقني في أقل من أسبوعين. تجربة المستخدم كانت سلسة والدعم ممتاز.",
                initial: "أ",
                bg: "bg-blue-600",
              },
              {
                name: "سارة العلي",
                role: "مستثمرة ملائكية",
                text: "كمستثمر، أجد صعوبة في فلترة المشاريع الجادة. رابط وفرت لي أدوات بحث ومطابقة وفرت عليّ وقتاً طويلاً.",
                initial: "س",
                bg: "bg-purple-600",
              },
              {
                name: "فهد السالم",
                role: "رائد أعمال",
                text: "التنبيهات الفورية للمسابقات ساعدت فريقي في المشاركة والفوز بجائزة قيمة كانت نقطة تحول لمشروعنا.",
                initial: "ف",
                bg: "bg-emerald-600",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800"
              >
                <div className="mb-6">
                  <div className="mb-4 flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="h-5 w-5 fill-current text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-lg leading-relaxed text-gray-900 dark:text-gray-200">
                    "{item.text}"
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full ${item.bg} text-white text-lg font-bold flex-shrink-0`}
                  >
                    {item.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-xs text-text-secondary dark:text-gray-400">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ====== Subscription ====== */}
      <Subscription />

      {/* ====== CONTACT ====== */}
      <section id="contact" className="bg-white py-20 dark:bg-bg-dark">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
          <div className="overflow-hidden rounded-3xl bg-primary dark:bg-blue-900/50">
            <div className="flex flex-col lg:flex-row">
              {/* Contact Info */}
              <div className="flex flex-col justify-between bg-primary p-10 text-white lg:w-2/5 dark:bg-primary/90">
                <div>
                  <h2 className="mb-4 text-3xl font-black">تواصل معنا</h2>
                  <p className="mb-12 text-blue-100">
                    لديك استفسار أو اقتراح؟ فريقنا جاهز للإجابة على جميع أسئلتك
                    ومساعدتك في أي وقت.
                  </p>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="mt-1 h-6 w-6" />
                      <div>
                        <h4 className="font-bold">العنوان</h4>
                        <p className="text-sm text-blue-100">
                          جمهورية مصر العربية - القاهرة
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Mail className="mt-1 h-6 w-6" />
                      <div>
                        <h4 className="font-bold">البريد الإلكتروني</h4>
                        <a href="mailto:mo6942853@gmail.com" className="text-sm text-blue-100">rabet@gmail.com</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="mt-1 h-6 w-6" />
                      <div>
                        <h4 className="font-bold">الهاتف</h4>
                        <a href="https://wa.me/201021325101" className="text-sm text-blue-100">
                          +20 102 132 5101
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="flex-1 bg-white p-10 lg:p-14 dark:bg-gray-800">
                <form onSubmit={handleContact} className="flex flex-col gap-6">
                  {contactSent && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
                      <CheckCircle className="h-4 w-4" />
                      تم إرسال رسالتك بنجاح!
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      الاسم الكامل
                    </label>
                    <input
                      className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="أدخل اسمك"
                      type="text"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      البريد الإلكتروني
                    </label>
                    <input
                      className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="name@example.com"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      الرسالة
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 resize-none"
                      placeholder="كيف يمكننا مساعدتك؟"
                      rows="4"
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
                  >
                    {loading ? "جاري الإرسال..." : "إرسال الرسالة"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
