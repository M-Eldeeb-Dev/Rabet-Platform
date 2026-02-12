import { supabase } from "./client";

// Helper: generate slug from title
const generateSlug = (title) => {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() +
    "-" +
    Date.now().toString(36)
  );
};

// Get all events
export const getEvents = async () => {
  const { data, error } = await supabase
    .from("events")
    .select("*, profiles:organizer_id(id, full_name, avatar_url)")
    .order("start_date", { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get single event
export const getEvent = async (id) => {
  const { data, error } = await supabase
    .from("events")
    .select(
      "*, profiles:organizer_id(id, full_name, avatar_url, role), categories:category_id(id, name, display_name)",
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// Get events by organizer
export const getMyEvents = async (organizerId) => {
  const { data, error } = await supabase
    .from("events")
    .select("*, categories:category_id(id, name, display_name)")
    .eq("organizer_id", organizerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Create event
export const createEvent = async (eventData) => {
  const slug = generateSlug(eventData.title);
  const { data, error } = await supabase
    .from("events")
    .insert([{ ...eventData, slug }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update event
export const updateEvent = async (id, updates) => {
  const { data, error } = await supabase
    .from("events")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete event
export const deleteEvent = async (id) => {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) throw error;
};

// Get total event count (admin)
export const getTotalEventCount = async () => {
  const { count, error } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
};

// Approve event (admin)
export const approveEvent = async (eventId, adminId) => {
  const { data, error } = await supabase
    .from("events")
    .update({
      approval_status: "approved",
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Reject event (admin)
export const rejectEvent = async (eventId, adminId) => {
  const { data, error } = await supabase
    .from("events")
    .update({
      approval_status: "rejected",
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
