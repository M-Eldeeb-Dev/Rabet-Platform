import React from "react";
import { X, Clock, Bell } from "lucide-react";

const ComingSoonModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300">
      <div
        className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 dark:bg-bg-dark border border-gray-100 dark:border-gray-800 animate-fade-in-up"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse">
            <Clock size={32} />
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            قريباً جداً!
          </h2>

          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            نعمل بجد لإطلاق هذه الميزة في أقرب وقت. كن مستعداً لتجربة استثنائية!
          </p>

          <button
            onClick={onClose}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-white transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25"
          >
            <Bell size={18} />
            <span>ذكرني لاحقاً</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonModal;
