import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth";
import {
  getEvents,
  deleteEvent,
  approveEvent,
  rejectEvent,
} from "../../lib/supabase/events";
import {
  Search,
  Trash2,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";

const approvalColors = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

const approvalLabels = {
  approved: "مقبول",
  pending: "قيد المراجعة",
  rejected: "مرفوض",
};

const Events = () => {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد حذف هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveEvent(id, profile.id);
      fetchEvents();
    } catch (err) {
      console.error("Error approving event:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectEvent(id, profile.id);
      fetchEvents();
    } catch (err) {
      console.error("Error rejecting event:", err);
    }
  };

  const filtered = events.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (e.approval_status || "pending") === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          إدارة الفعاليات
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {events.length} فعالية
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن فعالية..."
            className="w-full h-10 rounded-lg border border-gray-200 bg-white pr-10 pl-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">كل الحالات</option>
          {Object.entries(approvalLabels).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 text-right">
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  الفعالية
                </th>
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  المنظم
                </th>
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  التاريخ
                </th>
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  الحالة
                </th>
                <th className="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => {
                const status = event.approval_status || "pending";
                return (
                  <tr
                    key={event.id}
                    className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-bold text-gray-900 dark:text-white">
                      {event.title}
                    </td>
                    <td className="px-5 py-3 text-text-secondary dark:text-gray-400">
                      {event.profiles?.full_name || "—"}
                    </td>
                    <td className="px-5 py-3 text-text-secondary dark:text-gray-400">
                      {event.start_date
                        ? new Date(event.start_date).toLocaleDateString("ar-SA")
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${approvalColors[status] || "bg-gray-100 text-gray-600 dark:text-gray-400"}`}
                      >
                        {approvalLabels[status] || status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(event.id)}
                              className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                              title="قبول"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(event.id)}
                              className="h-8 w-8 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors flex items-center justify-center"
                              title="رفض"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="h-8 w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-text-secondary dark:text-gray-400">
            لا توجد فعاليات
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
