import React from "react";
import { WifiOff, RotateCcw } from "lucide-react";

const Offline = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-light dark:bg-gray-900 p-4 text-center">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
        <WifiOff className="w-16 h-16 text-gray-500 dark:text-gray-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        لا يوجد اتصال بالإنترنت
      </h1>
      <p className="text-text-secondary dark:text-gray-400 text-lg max-w-md mb-8">
        يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.
      </p>
      <button
        onClick={handleRetry}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30"
      >
        <RotateCcw className="w-5 h-5" />
        إعادة المحاولة
      </button>
    </div>
  );
};

export default Offline;
