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

const Events = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

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

  const filtered = events
    .filter(
      (e) =>
        !search ||
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((e) => !typeFilter || e.type === typeFilter)
    .filter((e) => !categoryFilter || e.category_id === categoryFilter);

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
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">الفعاليات</h1>
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
            className="w-full h-10 rounded-lg border border-gray-200 bg-white pr-10 pl-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
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
          className="h-10 rounded-lg border border-gray-200 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <Link
              key={event.id}
              to={`/entrepreneur/events/${event.id}`}
              className="group block rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-primary/20 to-violet-200 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-primary/40" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-bold">
                    {typeLabels[event.type] || event.type}
                  </span>
                  <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                    {event.location_type === "online" ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    {locationLabels[event.location_type]}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.start_date).toLocaleDateString("ar-SA")}
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
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-text-secondary dark:text-gray-400">لا توجد فعاليات متاحة</p>
        </div>
      )}
    </div>
  );
};

export default Events;
