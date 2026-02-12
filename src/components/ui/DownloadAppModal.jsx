import React, { useState, useEffect } from "react";
import { X, Smartphone, ArrowRight } from "lucide-react";

const DownloadAppModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal after a short delay when the component mounts
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300">
      <div
        className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 dark:bg-bg-dark border border-gray-100 dark:border-gray-800 animate-fade-in-up"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={closeModal}
          className="absolute left-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-bounce">
            <Smartphone size={32} />
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            حمل تطبيق رابط الآن!
          </h2>

          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            احصل على تجربة أفضل واسرع مع تطبيق رابط على هاتفك المحمول. تواصل مع
            المستثمرين ورواد الأعمال في أي وقت وأي مكان.
          </p>

          <div className="flex w-full flex-col gap-3">
            <a
              href="https://rabet-platform-download.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-white transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
            >
              <span>تحميل التطبيق</span>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
            </a>

            <button
              onClick={closeModal}
              className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppModal;
