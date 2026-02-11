import React from "react";
import { CreditCard } from "lucide-react";

const Subscriptions = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <CreditCard className="w-16 h-16 text-primary" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
        الاشتراكات
      </h1>
      <p className="text-text-secondary dark:text-gray-400 text-lg max-w-md">
        هذه الميزة قيد التطوير وستكون متاحة قريباً.
      </p>
    </div>
  );
};

export default Subscriptions;
