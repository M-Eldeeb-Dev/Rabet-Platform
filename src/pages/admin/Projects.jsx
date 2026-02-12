import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { approveProject, rejectProject } from "../../lib/supabase/projects";
import { Search, Trash2, CheckCircle, XCircle } from "lucide-react";

const statusColors = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-600 dark:text-gray-400",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-blue-100 text-blue-700",
};

const statusLabels = {
  approved: "مقبول",
  pending: "قيد المراجعة",
  draft: "مسودة",
  rejected: "مرفوض",
  closed: "مغلق",
};

const Projects = () => {
  const { profile } = useAuth();
  const { projects, loading, fetchProjects, deleteProject, search } =
    useProjects("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    search(e.target.value);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;
    try {
      await deleteProject(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد قبول هذا المشروع؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، قبول",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    try {
      await approveProject(id, profile.id);
      fetchProjects();
      Swal.fire({
        icon: "success",
        title: "تم القبول",
        text: "تم قبول المشروع بنجاح",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error approving project:", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء قبول المشروع",
      });
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد رفض هذا المشروع؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، رفض",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    try {
      await rejectProject(id, profile.id);
      fetchProjects();
      Swal.fire({
        icon: "success",
        title: "تم الرفض",
        text: "تم رفض المشروع بنجاح",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error rejecting project:", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء رفض المشروع",
      });
    }
  };

  const filteredProjects =
    statusFilter === "all"
      ? projects
      : projects.filter((p) => p.status === statusFilter);

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
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          إدارة المشاريع
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {projects.length} مشروع
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن مشروع..."
            className="w-full h-10 rounded-lg border border-gray-200 bg-white pr-10 pl-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <select
          className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">كل الحالات</option>
          {Object.entries(statusLabels).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 text-right">
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  المشروع
                </th>
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  صاحب المشروع
                </th>
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  الحالة
                </th>
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  التاريخ
                </th>
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3 font-bold text-gray-900 dark:text-white">
                    {project.title}
                  </td>
                  <td className="px-5 py-3 text-text-secondary dark:text-gray-400">
                    {project.profiles?.full_name || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusColors[project.status] || "bg-gray-100 text-gray-600 dark:text-gray-400"}`}
                    >
                      {statusLabels[project.status] || project.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-secondary dark:text-gray-400">
                    {new Date(project.created_at).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {(project.status === "pending" ||
                        project.status === "rejected" ||
                        project.status === "draft") && (
                        <button
                          onClick={() => handleApprove(project.id)}
                          className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                          title="قبول"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {(project.status === "pending" ||
                        project.status === "approved" ||
                        project.status === "draft") && (
                        <button
                          onClick={() => handleReject(project.id)}
                          className="h-8 w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                          title="رفض"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="h-8 w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProjects.length === 0 && (
          <div className="py-12 text-center text-sm text-text-secondary dark:text-gray-400">
            لا توجد مشاريع
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
