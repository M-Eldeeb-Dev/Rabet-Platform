import React from "react";
import { Link } from "react-router-dom";
import { Link2, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="bg-white pt-16 pb-8 border-t border-gray-100 dark:bg-bg-dark dark:border-gray-800"
      dir="rtl"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Link2 className="h-8 w-8" />
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                رابط
              </span>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary dark:text-gray-400">
              منصتك الأولى للربط بين الأفكار الواعدة والفرص الاستثمارية الحقيقية
              في بيئة آمنة وفعالة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              روابط سريعة
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-text-secondary hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-sm text-text-secondary hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary"
                >
                  عن المنصة
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-sm text-text-secondary hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary"
                >
                  المميزات
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-sm text-text-secondary hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary"
                >
                  تواصل معنا
                </a>
              </li>
            </ul>
          </div>

          {/* User Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              للمستخدمين
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-text-secondary hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary"
                >
                  تسجيل دخول
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-text-secondary hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary"
                >
                  إنشاء حساب
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              اشترك في النشرة
            </h3>
            <p className="mb-4 text-sm text-text-secondary dark:text-gray-400">
              احصل على آخر الأخبار والفرص مباشرة في بريدك.
            </p>
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                className="h-10 w-full rounded-lg border border-gray-200 bg-bg-light px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="بريدك الإلكتروني"
                type="email"
              />
              <button className="h-10 w-full rounded-lg bg-gray-900 text-sm font-bold text-white hover:bg-black transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
                اشترك
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row dark:border-gray-800">
          <p className="text-sm text-text-secondary dark:text-gray-500">
            © {new Date().getFullYear()} منصة رابط. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-text-secondary hover:text-primary transition-colors dark:text-gray-500 dark:hover:text-primary"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-text-secondary hover:text-primary transition-colors dark:text-gray-500 dark:hover:text-primary"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-text-secondary hover:text-primary transition-colors dark:text-gray-500 dark:hover:text-primary"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
