import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../lib/supabase/events";
import { getCategories } from "../../lib/supabase/projects";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  Users,
  Globe,
  Tag,
  Eye,
  Star,
  Clock,
} from "lucide-react";
import StorageImage from "../../components/ui/StorageImage";
import useScrollAnimation from "../../hooks/useScrollAnimation";

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

const Events = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { reObserve } = useScrollAnimation();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [evData, catData] = await Promise.all([
          getEvents(),
          getCategories(),
        ]);
        setEvents(evData.filter((e) => e.approval_status === "approved"));
        setCategories(catData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => reObserve(), 100);
    }
  }, [loading, reObserve]);

  const filtered = events
    .filter(
      (e) =>
        !search ||
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((e) => !typeFilter || e.type === typeFilter)
    .filter((e) => !categoryFilter || e.category_id === categoryFilter);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString("ar-SA", { month: "short" });
    return { day, month };
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
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <div className="h-8 w-1 rounded-full bg-primary" />
          الفعاليات
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          تصفح الفعاليات المتاحة وشارك فيها
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن فعالية..."
            className="w-full h-11 rounded-xl border border-gray-200 bg-white pr-10 pl-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">كل الأنواع</option>
          {Object.entries(typeLabels).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">كل التصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_name}
            </option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => {
            const { day, month } = formatDate(event.start_date);
            return (
              <Link
                key={event.id}
                to={`/entrepreneur/events/${event.id}`}
                className="scroll-animate card-glow group block rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
              >
                {/* Image with date badge */}
                <div className="h-44 relative overflow-hidden">
                  {event.image_url ? (
                    <StorageImage
                      path={event.image_url}
                      alt={event.title}
                      bucket="event-images"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      fallbackSrc="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 via-violet-200/50 to-sky-100/30 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-primary/30" />
                    </div>
                  )}

                  {/* Date badge */}
                  <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg px-3 py-2 text-center min-w-[50px]">
                    <p className="text-lg font-black text-primary leading-none">
                      {day}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                      {month}
                    </p>
                  </div>

                  {/* Stats overlay */}
                  <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                    <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <Eye className="h-3 w-3" />
                      {event.views_count || 0}
                    </span>
                    {event.is_recommended && (
                      <span className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Star className="h-3 w-3" />
                        مُوصى
                      </span>
                    )}
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 text-[10px] font-bold">
                      {typeLabels[event.type] || event.type}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Info chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2.5 py-0.5 text-[11px] font-bold flex items-center gap-1">
                      {event.location_type === "online" ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      {locationLabels[event.location_type]}
                    </span>
                    {event.registration_fee > 0 ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {event.registration_fee} {event.currency || "EGP"}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        مجاني
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.registration_deadline) > new Date()
                        ? `يغلق ${new Date(event.registration_deadline).toLocaleDateString("ar-SA")}`
                        : "انتهى التسجيل"}
                    </span>
                    {event.max_participants && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.participants_count || 0}/{event.max_participants}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-text-secondary dark:text-gray-400">
            لا توجد فعاليات متاحة
          </p>
        </div>
      )}
    </div>
  );
};

export default Events;
