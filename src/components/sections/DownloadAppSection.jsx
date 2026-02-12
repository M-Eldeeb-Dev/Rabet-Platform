import React from "react";
import { Smartphone, Check, ArrowRight } from "lucide-react";

const DownloadAppSection = () => {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20 dark:from-bg-dark dark:to-gray-900 border-y border-gray-100 dark:border-gray-800">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-between">
          {/* Text Content */}
          <div className="flex flex-1 flex-col gap-6 text-right lg:max-w-lg">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary dark:border-primary/30 dark:bg-primary/10">
              <Smartphone size={14} />
              متوفر الآن
            </div>

            <h2 className="text-3xl font-black leading-tight text-gray-900 md:text-4xl dark:text-white">
              تطبيق رابط.. فرصتك في جيبك
            </h2>

            <p className="text-lg text-text-secondary dark:text-gray-400">
              حمل تطبيق رابط واستمتع بتجربة مستخدم فريدة وسريعة. تابع مشاريعك،
              تواصل مع المستثمرين، واستقبل الإشعارات المهمة مباشرة على هاتفك.
            </p>

            <ul className="flex flex-col gap-3">
              {[
                "تصفح أسرع وأكثر سلاسة للمشاريع",
                "إشعارات فورية بالفرص والرسائل",
                "تواصل مباشر وسهل مع مجتمع رابط",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex size-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <Check size={14} />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <a
                href="https://rabet-platform-download.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
              >
                <span>حمل التطبيق الآن</span>
                <ArrowRight size={20} />
              </a>
            </div>
          </div>

          {/* Image/Mockup */}
          <div className="relative flex flex-1 items-center justify-center lg:justify-end">
            <div className="relative z-10 mx-auto w-64 md:w-80">
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-3xl transform scale-110 rounded-full"></div>
              {/* Simple Phone Mockup using CSS/Divs if no image is available, or use a placeholder image */}
              <div className="relative overflow-hidden rounded-[2.5rem] border-[8px] border-gray-900 bg-gray-900 shadow-2xl dark:border-gray-800">
                <div className="aspect-[9/19] w-full bg-white dark:bg-gray-800 relative">
                  {/* Screen Content Simulation */}
                  <div className="absolute top-0 left-0 right-0 h-full w-full bg-gray-50 dark:bg-gray-900 flex flex-col">
                    {/* App Header */}
                    <div className="bg-primary p-4 pt-10 text-white pb-6 rounded-b-3xl">
                      <div className="flex justify-between items-center mb-4">
                        <div className="h-2 w-20 bg-white/30 rounded-full"></div>
                        <div className="h-8 w-8 bg-white/20 rounded-full"></div>
                      </div>
                      <div className="h-4 w-32 bg-white/40 rounded-full mb-2"></div>
                      <div className="h-4 w-24 bg-white/20 rounded-full"></div>
                    </div>

                    {/* App Body */}
                    <div className="p-4 flex-1 space-y-3 overflow-hidden">
                      <div className="h-32 w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                        <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
                      </div>
                      <div className="h-32 w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                        <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
                      </div>
                      <div className="h-32 w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                        <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
                      </div>
                    </div>

                    {/* App Tab Bar */}
                    <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="h-6 w-6 bg-primary/20 rounded-full"></div>
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-1/2 -right-12 z-20 animate-bounce delay-700 hidden lg:block">
              <div className="rounded-xl bg-white p-3 shadow-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
