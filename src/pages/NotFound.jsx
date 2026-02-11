import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-light dark:bg-gray-900 p-4 text-center">
      <div className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-full mb-6">
        <AlertTriangle className="w-16 h-16 text-amber-600 dark:text-amber-500" />
      </div>
      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
        404
      </h1>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        الصفحة غير موجودة
      </h2>
      <p className="text-text-secondary dark:text-gray-400 text-lg max-w-md mb-8">
        عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30"
      >
        <Home className="w-5 h-5" />
        العودة للرئيسية
      </Link>
    </div>
  );
};

export default NotFound;
