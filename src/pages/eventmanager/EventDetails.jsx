import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getEvent, deleteEvent } from "../../lib/supabase/events";
import {
  ArrowRight,
  Calendar,
  MapPin,
  User,
  Tag,
  Edit,
  Trash2,
} from "lucide-react";
import StorageImage from "../../components/ui/StorageImage";
import Swal from "sweetalert2";

const typeLabels = {
  workshop: "ورشة عمل",
  conference: "مؤتمر",
  meetup: "لقاء",
  webinar: "ندوة إلكترونية",
  hackathon: "هاكاثون",
  competition: "مسابقة",
  other: "أخرى",
  incubator_program: "برنامج حاضنة",
  accelerator_program: "برنامج مسرعة",
};

const locationTypeLabels = {
  physical: "حضوري",
  online: "عن بُعد",
  hybrid: "مختلط",
};

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getEvent(id);
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
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
      Swal.fire("تم الحذف!", "تم حذف الفعالية بنجاح.", "success");
      navigate("/eventmanager/events");
    } catch (err) {
      console.error(err);
      Swal.fire("خطأ", "حدث خطأ أثناء الحذف", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary dark:text-gray-400">
          الفعالية غير موجودة
        </p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getLocationDisplay = () => {
    const parts = [];
    if (event.venue_name) parts.push(event.venue_name);
    if (event.city) parts.push(event.city);
    if (parts.length === 0 && event.location_type === "online")
      return "عن بُعد";
    return parts.join(" - ") || "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <div className="flex items-center justify-between">
        <Link
          to="/eventmanager/events"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/eventmanager/edit-event/${event.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-bold transition-colors"
          >
            <Edit className="h-4 w-4" />
            تعديل
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {/* Banner with StorageImage logic */}
        <div className="h-64 relative bg-gray-100 dark:bg-gray-700">
          {event.image_url ? (
            <StorageImage
              path={event.image_url}
              alt={event.title}
              bucket="event-images"
              className="w-full h-full object-cover"
              fallbackSrc="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-violet-200">
              <Calendar className="h-16 w-16 text-primary/30" />
            </div>
          )}
        </div>

        <div className="p-6 border-b dark:border-gray-700">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-secondary dark:text-gray-400">
            {event.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(event.start_date)}
                {event.end_date && ` — ${formatDate(event.end_date)}`}
              </span>
            )}
            {getLocationDisplay() && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {getLocationDisplay()}
              </span>
            )}
            {event.type && (
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {typeLabels[event.type] || event.type}
              </span>
            )}
            {event.location_type && (
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                {locationTypeLabels[event.location_type] || event.location_type}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2">
              وصف الفعالية
            </h2>
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
              {event.description || "لا يوجد وصف"}
            </p>
          </div>

          {event.categories && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                التصنيف:
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-400">
                {event.categories.display_name}
              </span>
            </div>
          )}

          {event.registration_deadline && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                آخر موعد للتسجيل:
              </span>
              <span className="text-sm text-text-secondary dark:text-gray-400">
                {formatDate(event.registration_deadline)}
              </span>
            </div>
          )}
        </div>
      </div>

      {event.profiles && (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">المنظم</h2>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {event.profiles.full_name?.[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                {event.profiles.full_name}
              </p>
              <p className="text-sm text-text-secondary dark:text-gray-400">
                مدير فعاليات
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
