import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getEvent,
  approveEvent,
  rejectEvent,
  updateEvent,
} from "../../lib/supabase/events";
import { useAuth } from "../../hooks/useAuth";
import {
  Calendar,
  MapPin,
  Globe,
  Users,
  Clock,
  ArrowRight,
  Trophy,
  DollarSign,
  Tag,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";

const typeLabels = {
  competition: "مسابقة",
  hackathon: "هاكاثون",
  workshop: "ورشة عمل",
  meetup: "لقاء",
  conference: "مؤتمر",
  webinar: "ندوة إلكترونية",
  incubator_program: "برنامج حاضنة",
  accelerator_program: "برنامج مسرعة",
};

const locationLabels = { physical: "حضوري", online: "عن بعد", hybrid: "مختلط" };

const statusLabels = {
  draft: "مسودة",
  upcoming: "قادمة",
  open: "مفتوحة",
  ongoing: "جارية",
  judging: "تحكيم",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const approvalLabels = {
  pending: "بانتظار الموافقة",
  approved: "مقبول",
  rejected: "مرفوض",
};

const approvalColors = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const EventDetails = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = await approveEvent(event.id, profile.id);
      setEvent({ ...event, ...updated });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const updated = await rejectEvent(event.id, profile.id);
      setEvent({ ...event, ...updated });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRecommended = async () => {
    setActionLoading(true);
    try {
      const updated = await updateEvent(event.id, {
        is_recommended: !event.is_recommended,
      });
      setEvent({ ...event, ...updated });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
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
      <div className="text-center py-12">
        <p className="text-text-secondary dark:text-gray-400">
          الفعالية غير موجودة
        </p>
        <Link
          to="/admin/events"
          className="text-primary font-bold mt-2 inline-block"
        >
          العودة للفعاليات
        </Link>
      </div>
    );
  }

  const InfoRow = ({ icon: Icon, label, value }) =>
    value ? (
      <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-text-secondary dark:text-gray-400">
            {label}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    ) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <Link
        to="/admin/events"
        className="inline-flex items-center gap-1 text-sm text-primary font-bold hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للفعاليات
      </Link>

      {/* Hero */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center">
          <Calendar className="h-16 w-16 text-violet-400/30" />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
              {typeLabels[event.type] || event.type}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${approvalColors[event.approval_status] || "bg-gray-100 text-gray-600 dark:text-gray-400"}`}
            >
              {approvalLabels[event.approval_status] || event.approval_status}
            </span>
            {event.is_recommended && (
              <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold flex items-center gap-1">
                <Star className="h-3 w-3" />
                موصى بها
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {event.title}
          </h1>
          <p className="text-text-secondary leading-relaxed">
            {event.description}
          </p>

          {/* Admin Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {event.approval_status === "pending" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 min-w-[140px] h-10 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  قبول
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 min-w-[140px] h-10 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  رفض
                </button>
              </>
            )}
            <button
              onClick={handleToggleRecommended}
              disabled={actionLoading}
              className={`flex-1 min-w-[140px] h-10 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                event.is_recommended
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Star className="h-4 w-4" />
              {event.is_recommended ? "إلغاء التوصية" : "توصية بالفعالية"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="font-bold text-gray-900 mb-3 text-lg">التفاصيل</h2>
          <InfoRow
            icon={Calendar}
            label="تاريخ البداية"
            value={new Date(event.start_date).toLocaleDateString("ar-SA", {
              dateStyle: "full",
            })}
          />
          <InfoRow
            icon={Calendar}
            label="تاريخ النهاية"
            value={new Date(event.end_date).toLocaleDateString("ar-SA", {
              dateStyle: "full",
            })}
          />
          <InfoRow
            icon={Clock}
            label="آخر موعد للتسجيل"
            value={new Date(event.registration_deadline).toLocaleDateString(
              "ar-SA",
              { dateStyle: "full" },
            )}
          />
          <InfoRow
            icon={MapPin}
            label="المكان"
            value={
              event.venue_name
                ? `${event.venue_name}${event.city ? ` - ${event.city}` : ""}`
                : locationLabels[event.location_type]
            }
          />
          <InfoRow
            icon={Users}
            label="المشاركون"
            value={`${event.participants_count || 0}${event.max_participants ? ` / ${event.max_participants}` : ""}`}
          />
          <InfoRow
            icon={Trophy}
            label="جوائز"
            value={
              event.prize_pool
                ? `${event.prize_pool} ${event.currency || "Egy Pound"}`
                : null
            }
          />
          <InfoRow
            icon={DollarSign}
            label="رسوم التسجيل"
            value={
              event.registration_fee > 0
                ? `${event.registration_fee} ${event.currency || "Egy Pound"}`
                : "مجاني"
            }
          />
          <InfoRow
            icon={Tag}
            label="التصنيف"
            value={event.categories?.display_name}
          />
        </div>

        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="font-bold text-gray-900 mb-3 text-lg">المنظم</h2>
          {event.profiles && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {event.profiles.full_name?.[0] || "U"}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {event.profiles.full_name}
                </p>
                <p className="text-xs text-text-secondary dark:text-gray-400">
                  منظم الفعالية
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <p className="text-lg font-black text-blue-700">
                {event.views_count || 0}
              </p>
              <p className="text-xs text-blue-600">مشاهدة</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-50">
              <p className="text-lg font-black text-emerald-700">
                {event.participants_count || 0}
              </p>
              <p className="text-xs text-emerald-600">مشارك</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-violet-50">
              <p className="text-lg font-black text-violet-700">
                {event.applications_count || 0}
              </p>
              <p className="text-xs text-violet-600">طلب</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
