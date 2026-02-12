import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth";
import {
  getContactMessages,
  deleteContactMessage,
  markAsHandled,
} from "../../lib/supabase/contactMessages";
import { sendBulkNotification } from "../../lib/supabase/notifications";
import { Mail, Trash2, CheckCircle, Search, Filter, Clock } from "lucide-react";

const ContactMessages = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unhandled, handled
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getContactMessages();
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد حذف هذه الرسالة؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkHandled = async (id) => {
    try {
      const updated = await markAsHandled(id, profile.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updated } : m)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = messages
    .filter((m) => {
      if (filter === "unhandled") return !m.is_handled;
      if (filter === "handled") return m.is_handled;
      return true;
    })
    .filter(
      (m) =>
        !search ||
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.toLowerCase().includes(search.toLowerCase()) ||
        m.message?.toLowerCase().includes(search.toLowerCase()),
    );

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
          رسائل التواصل
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {messages.length} رسالة —{" "}
          {messages.filter((m) => !m.is_handled).length} لم تتم معالجتها
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث في الرسائل..."
            className="w-full h-10 rounded-lg border border-gray-200 bg-white pr-10 pl-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[
            { v: "all", l: "الكل" },
            { v: "unhandled", l: "لم تُعالج" },
            { v: "handled", l: "تمت المعالجة" },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                filter === f.v
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filtered.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl border bg-white dark:bg-gray-800 p-5 transition-all ${
              msg.is_handled
                ? "border-gray-100"
                : "border-amber-200 bg-amber-50/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {msg.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {msg.name}
                    </p>
                    <p className="text-xs text-text-secondary dark:text-gray-400">
                      {msg.email}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      msg.is_handled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {msg.is_handled ? "تمت المعالجة" : "بانتظار المعالجة"}
                  </span>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {msg.subject}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {msg.message}
                </p>
                {msg.response_notes && (
                  <div className="mt-2 p-3 rounded-lg bg-emerald-50 text-sm text-emerald-700">
                    <strong>الرد:</strong> {msg.response_notes}
                  </div>
                )}
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(msg.created_at).toLocaleDateString("ar-SA")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!msg.is_handled && (
                  <button
                    onClick={() => handleMarkHandled(msg.id)}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="تمت المعالجة"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
            <Mail className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-text-secondary dark:text-gray-400">
              لا توجد رسائل
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMessages;
