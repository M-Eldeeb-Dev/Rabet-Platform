import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createEvent, getEvent, updateEvent } from "../../lib/supabase/events";
import { uploadEventImage } from "../../lib/supabase/storage";
import { CheckCircle, AlertTriangle } from "lucide-react";
import EventForm from "../../components/events/EventForm";
import { useParams, useNavigate } from "react-router-dom";

const AddEvent = () => {
  const { id } = useParams(); // If id exists, it's edit mode
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (id) {
      getEvent(id)
        .then((data) => {
          setInitialData(data);
        })
        .catch((err) => {
          console.error(err);
          setError("لم يتم العثور على الفعالية");
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [id]);

  const handleSubmit = async (form, imageFile) => {
    setError("");
    setLoading(true);

    try {
      const eventData = {
        organizer_id: profile.id,
        title: form.title,
        description: form.description,
        type: form.type,
        category_id: form.category_id,
        location_type: form.location_type,
        venue_name: form.venue_name || null,
        city: form.city || null,
        online_link: form.online_link || null,
        registration_fee: form.registration_fee
          ? parseFloat(form.registration_fee)
          : 0,
        prize_pool: form.prize_pool ? parseFloat(form.prize_pool) : null,
        max_participants: form.max_participants
          ? parseInt(form.max_participants)
          : null,
        start_date: form.start_date
          ? new Date(form.start_date).toISOString()
          : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        registration_deadline: form.registration_deadline
          ? new Date(form.registration_deadline).toISOString()
          : null,
      };

      let eventId = id;

      if (id) {
        // Update
        await updateEvent(id, eventData);
      } else {
        // Create
        const created = await createEvent(eventData);
        eventId = created.id;
      }

      // Upload image if selected
      if (imageFile && eventId) {
        try {
          const imageUrl = await uploadEventImage(imageFile, eventId);
          await updateEvent(eventId, { image_url: imageUrl });
        } catch (imgErr) {
          console.warn("Image upload failed:", imgErr);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (id) {
          navigate("/eventmanager/events/" + id);
        } else {
          // Reset (handled by unmount/remount usually, or we can just navigate)
          navigate("/eventmanager/events");
        }
      }, 1500);
    } catch (err) {
      setError(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          {id ? "تعديل الفعالية" : "إضافة فعالية جديدة"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {id
            ? "قم بتعديل تفاصيل الفعالية"
            : "أنشئ فعالية جديدة ليراها المستخدمون"}
        </p>
      </div>

      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {id ? "تم التعديل بنجاح!" : "تم إنشاء الفعالية بنجاح!"}
        </div>
      )}

      <EventForm
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel={id ? "حفظ التعديلات" : "إنشاء الفعالية"}
      />
    </div>
  );
};

export default AddEvent;
