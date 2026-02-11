import { supabase } from "./client";

// Get all contact messages (admin)
export const getContactMessages = async () => {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Delete contact message (admin)
export const deleteContactMessage = async (id) => {
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Mark contact message as handled (admin)
export const markAsHandled = async (id, adminId, notes = "") => {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({
      is_handled: true,
      handled_by: adminId,
      handled_at: new Date().toISOString(),
      response_notes: notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get total contact message count (admin)
export const getContactMessageCount = async () => {
  const { count, error } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("is_handled", false);

  if (error) throw error;
  return count || 0;
};
