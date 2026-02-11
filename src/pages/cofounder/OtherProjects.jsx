import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import { useAuth } from "../../hooks/useAuth";
import { getCategories } from "../../lib/supabase/projects";
import { Search, FolderOpen } from "lucide-react";

const statusColors = {
  approved: "bg-emerald-100 text-emerald-700",
  pending_review: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-600 dark:text-gray-400",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-blue-100 text-blue-700",
};

const statusLabels = {
  approved: "مقبول",
  pending_review: "قيد المراجعة",
  draft: "مسودة",
  rejected: "مرفوض",
  closed: "مغلق",
};

const OtherProjects = () => {
  const { projects, loading, search } = useProjects("all");
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    search(e.target.value, activeCategory === "all" ? "" : activeCategory);
  };

  const handleCategoryFilter = (catId) => {
    setActiveCategory(catId);
    search(searchQuery, catId === "all" ? "" : catId);
  };

  // Filter out own projects
  const filteredProjects = projects.filter((p) => p.owner_id !== profile?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">مشاريع الآخرين</h1>
        <p className="text-sm text-text-secondary mt-1">
          تصفح المشاريع المتاحة وتواصل مع أصحابها
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث عن مشروع..."
          className="w-full h-10 rounded-lg border border-gray-200 bg-white pr-10 pl-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryFilter("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            activeCategory === "all"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          الكل
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryFilter(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              activeCategory === cat.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.display_name}
          </button>
        ))}
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/cofounder/projects/${project.id}`}
              className="block rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">{project.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusColors[project.status] || "bg-gray-100 text-gray-600 dark:text-gray-400"}`}
                  >
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2">
                  {project.description || "بدون وصف"}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-gray-400">
                  {project.categories && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {project.categories.display_name}
                    </span>
                  )}
                </div>
                {project.profiles && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {project.profiles.full_name?.[0]}
                    </div>
                    <span className="text-xs text-text-secondary dark:text-gray-400">
                      {project.profiles.full_name}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-12 text-center">
          <FolderOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 mb-1">لا توجد مشاريع</h3>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            لم يتم العثور على مشاريع تطابق البحث
          </p>
        </div>
      )}
    </div>
  );
};

export default OtherProjects;
