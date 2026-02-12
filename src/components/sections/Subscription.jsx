import React from "react";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "الباقة الأساسية",
    id: "tier-basic",
    href: "#",
    price: "0",
    description: "كل ما تحتاجه للبدء في رحلة ريادة الأعمال.",
    features: [
      "إضافة مشروع واحد",
      "الوصول للفعاليات العامة",
      "دعم فني عبر البريد الإلكتروني",
      "تصميم ملف شخصي أساسي",
    ],
    featured: false,
  },
  {
    name: "باقة المحترفين",
    id: "tier-pro",
    href: "#",
    price: "499",
    description: "أدوات متقدمة للشركات الناشئة الجادة في النمو.",
    features: [
      "إضافة 3 مشاريع",
      "أولوية الظهور للمستثمرين",
      "تحليلات متقدمة للأداء",
      "الوصول للفعاليات الحصرية",
      "دعم فني مباشر",
    ],
    featured: true,
  },
  {
    name: "باقة المؤسسات",
    id: "tier-enterprise",
    href: "#",
    price: "999",
    description: "حلول مخصصة للمسرعات وحاضنات الأعمال.",
    features: [
      "عدد غير محدود من المشاريع",
      "لوحة تحكم إدارية متكاملة",
      "واجهة برمجة تطبيقات خاصة (API)",
      "مدير حساب مخصص",
      "تدريب وتوجيه استراتيجي",
    ],
    featured: false,
  },
];

const Subscription = () => {
  return (
    <section className="py-24 bg-bg-light dark:bg-bg-dark transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            الأسعار
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            اختر الخطة المناسبة لطموحك
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-text-secondary dark:text-gray-400">
          سواء كنت تبدأ للتو أو تتوسع بسرعة، لدينا باقة تناسب احتياجاتك وتساعدك
          على الوصول لأهدافك.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 dark:bg-gray-800 dark:ring-gray-700 transition-all hover:scale-105 duration-300 ${
                tier.featured ? "ring-2 ring-primary shadow-xl scale-105" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={`text-lg font-semibold leading-8 ${
                      tier.featured
                        ? "text-primary"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {tier.name}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-text-secondary dark:text-gray-400">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-text-secondary dark:text-gray-400">
                    Egy Pound / شهرياً
                  </span>
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-text-secondary dark:text-gray-400"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-primary"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? "bg-primary text-white shadow-sm hover:bg-primary/90 focus-visible:outline-primary"
                    : "text-primary ring-1 ring-inset ring-primary/20 hover:ring-primary/30 dark:ring-primary/50"
                }`}
              >
                اشترك الآن
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Subscription;
