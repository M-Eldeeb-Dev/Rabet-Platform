import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAllProfiles, toggleBan } from "../../lib/supabase/auth";
import {
  Search,
  Shield,
  ShieldOff,
  Users as UsersIcon,
  Mail,
  Briefcase,
  UserCheck,
  Mic,
  MessageSquare,
} from "lucide-react";
import { supabase } from "../../lib/supabase/client";

const roleLabels = {
  entrepreneur: "رائد أعمال",
  co_founder: "شريك مؤسس",
  event_manager: "مدير فعاليات",
  admin: "مسؤول",
};

const roleFilters = [
  "الكل",
  "entrepreneur",
  "co_founder",
  "event_manager",
  "admin",
];
const roleFilterLabels = { الكل: "الكل", ...roleLabels };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [totalChats, setTotalChats] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAllProfiles();
        setUsers(data);
        // Get total chats
        try {
          const { count } = await supabase
            .from("chats")
            .select("*", { count: "exact", head: true });
          setTotalChats(count || 0);
        } catch (e) {
          console.warn(e);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleToggleBan = async (userId, currentBanned) => {
    const action = currentBanned ? "إلغاء حظر" : "حظر";
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: `هل تريد ${action} هذا المستخدم؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "حذف" ? "#d33" : "#3085d6",
      cancelButtonColor: "#gray",
      confirmButtonText: "نعم، نفذ الإجراء",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;
    try {
      await toggleBan(userId, !currentBanned);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_banned: !currentBanned } : u,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users
    .filter((u) => activeFilter === "الكل" || u.role === activeFilter)
    .filter(
      (u) =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.includes(searchQuery),
    );

  const entrepreneurs = users.filter((u) => u.role === "entrepreneur").length;
  const coFounders = users.filter((u) => u.role === "co_founder").length;
  const eventManagers = users.filter((u) => u.role === "event_manager").length;

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
          إدارة المستخدمين
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {users.length} مستخدم مسجل
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
          <p className="text-lg font-black text-primary">{users.length}</p>
          <p className="text-xs text-text-secondary dark:text-gray-400">
            إجمالي
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
          <p className="text-lg font-black text-blue-700">{entrepreneurs}</p>
          <p className="text-xs text-text-secondary dark:text-gray-400">
            رواد أعمال
          </p>
        </div>
        <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 text-center">
          <p className="text-lg font-black text-teal-700">{coFounders}</p>
          <p className="text-xs text-text-secondary dark:text-gray-400">
            شركاء مشاريع
          </p>
        </div>
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-center">
          <p className="text-lg font-black text-rose-700">{eventManagers}</p>
          <p className="text-xs text-text-secondary dark:text-gray-400">
            مديرو فعاليات
          </p>
        </div>
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-center">
          <p className="text-lg font-black text-indigo-700">{totalChats}</p>
          <p className="text-xs text-text-secondary dark:text-gray-400">
            محادثات
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث بالاسم أو البريد..."
          className="w-full h-10 rounded-lg border border-gray-200 bg-white pr-10 pl-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2">
        {roleFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              activeFilter === filter
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {roleFilterLabels[filter]}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-900">
                <th className="text-right font-bold text-gray-700 px-4 py-3">
                  المستخدم
                </th>
                <th className="text-right font-bold text-gray-700 px-4 py-3">
                  البريد
                </th>
                <th className="text-right font-bold text-gray-700 px-4 py-3">
                  الدور
                </th>
                <th className="text-right font-bold text-gray-700 px-4 py-3">
                  تاريخ التسجيل
                </th>
                <th className="text-right font-bold text-gray-700 px-4 py-3">
                  الحالة
                </th>
                <th className="text-right font-bold text-gray-700 px-4 py-3">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {user.full_name?.[0] || "U"}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.full_name || "بدون اسم"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    {user.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary dark:text-gray-400">
                    {roleLabels[user.role] || user.role}
                  </td>
                  <td className="px-4 py-3 text-text-secondary dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.is_banned ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      {user.is_banned ? "محظور" : "نشط"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => handleToggleBan(user.id, user.is_banned)}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          user.is_banned
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {user.is_banned ? (
                          <>
                            <Shield className="h-3 w-3" /> إلغاء الحظر
                          </>
                        ) : (
                          <>
                            <ShieldOff className="h-3 w-3" /> حظر
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <UsersIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-text-secondary dark:text-gray-400">
              لا توجد نتائج
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
