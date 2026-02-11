import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEvent } from "../../lib/supabase/events";
import {
  Calendar,
  MapPin,
  Globe,
  Users,
  Clock,
  ArrowRight,
  Tag,
  Trophy,
  DollarSign,
  User,
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

const locationLabels = {
  physical: "حضوري",
  online: "عن بعد",
  hybrid: "مختلط",
};

const statusLabels = {
  draft: "مسودة",
  upcoming: "قادمة",
  open: "مفتوحة",
  ongoing: "جارية",
  judging: "تحكيم",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const statusColors = {
  draft: "bg-gray-100 text-gray-600 dark:text-gray-400",
  upcoming: "bg-blue-100 text-blue-700",
  open: "bg-emerald-100 text-emerald-700",
  ongoing: "bg-amber-100 text-amber-700",
  judging: "bg-violet-100 text-violet-700",
  completed: "bg-gray-100 text-gray-600 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-700",
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
          to="/entrepreneur/events"
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
        to="/entrepreneur/events"
        className="inline-flex items-center gap-1 text-sm text-primary font-bold hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للفعاليات
      </Link>

      {/* Hero */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-violet-200 flex items-center justify-center">
          <Calendar className="h-16 w-16 text-primary/30" />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
              {typeLabels[event.type] || event.type}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[event.status] || "bg-gray-100 text-gray-600 dark:text-gray-400"}`}
            >
              {statusLabels[event.status] || event.status}
            </span>
            <span className="rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-xs font-bold flex items-center gap-1">
              {event.location_type === "online" ? (
                <Globe className="h-3 w-3" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              {locationLabels[event.location_type]}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {event.title}
          </h1>
          <p className="text-text-secondary leading-relaxed">
            {event.description}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Details Card */}
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-5">
          <h2 className="font-bold text-gray-900 mb-3 text-lg">
            تفاصيل الفعالية
          </h2>
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
                : event.online_link
                  ? "عبر الإنترنت"
                  : null
            }
          />
          <InfoRow
            icon={Users}
            label="الحد الأقصى للمشاركين"
            value={event.max_participants?.toString()}
          />
          <InfoRow
            icon={Trophy}
            label="جوائز"
            value={
              event.prize_pool
                ? `${event.prize_pool} ${event.currency || "جنيه"}`
                : null
            }
          />
          <InfoRow
            icon={DollarSign}
            label="رسوم التسجيل"
            value={
              event.registration_fee > 0
                ? `${event.registration_fee} ${event.currency || "جنيه"}`
                : "مجاني"
            }
          />
          <InfoRow
            icon={Tag}
            label="التصنيف"
            value={event.categories?.display_name}
          />
        </div>

        {/* Organizer Card */}
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-5">
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

          {/* Team Size */}
          {(event.min_team_size > 1 || event.max_team_size > 1) && (
            <div className="mt-4 p-3 rounded-lg bg-violet-50">
              <p className="text-sm font-bold text-violet-700 mb-1">
                حجم الفريق
              </p>
              <p className="text-sm text-violet-600">
                {event.min_team_size} - {event.max_team_size} أعضاء
              </p>
            </div>
          )}

          {/* Online Link */}
          {event.online_link && (
            <div className="mt-4">
              <a
                href={event.online_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <Globe className="h-4 w-4" />
                انضم عبر الإنترنت
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
