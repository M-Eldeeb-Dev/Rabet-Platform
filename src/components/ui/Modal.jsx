import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils/helpers";

const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg animate-in zoom-in-95 duration-200",
          className,
        )}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-heading dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
