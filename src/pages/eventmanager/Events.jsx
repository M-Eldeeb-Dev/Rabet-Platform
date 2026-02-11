import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMyEvents, deleteEvent } from "../../lib/supabase/events";
import { Calendar, Trash2, MapPin, Plus } from "lucide-react";

const Events = () => {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!profile) return;
      try {
        const data = await getMyEvents(profile.id);
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [profile]);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLocationDisplay = (event) => {
    const parts = [];
    if (event.venue_name) parts.push(event.venue_name);
    if (event.city) parts.push(event.city);
    if (parts.length === 0 && event.location_type === "online")
      return "عن بُعد";
    return parts.join(" - ") || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            فعالياتي
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {events.length} فعالية
          </p>
        </div>
        <Link
          to="/eventmanager/add-event"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          فعالية جديدة
        </Link>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {event.title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2">
                  {event.description || "بدون وصف"}
                </p>
                <div className="space-y-2 text-sm text-text-secondary dark:text-gray-400">
                  {event.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.start_date)}
                      {event.end_date && ` - ${formatDate(event.end_date)}`}
                    </div>
                  )}
                  {getLocationDisplay(event) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {getLocationDisplay(event)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Link
                    to={`/eventmanager/events/${event.id}`}
                    className="flex-1 h-9 rounded-lg bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors flex items-center justify-center"
                  >
                    تفاصيل
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="h-9 w-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 mb-1">لا توجد فعاليات</h3>
          <p className="text-sm text-text-secondary mb-4">
            ابدأ بإنشاء فعاليتك الأولى
          </p>
          <Link
            to="/eventmanager/add-event"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            أضف فعالية
          </Link>
        </div>
      )}
    </div>
  );
};

export default Events;
