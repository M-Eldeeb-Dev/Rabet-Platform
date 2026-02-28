import { supabase } from "./client";

// ─── PROJECT APPLICATIONS ───

// Apply to a project
export const applyToProject = async (projectId, applicantId, message = "") => {
  const { data, error } = await supabase
    .from("project_applications")
    .insert([{ project_id: projectId, applicant_id: applicantId, message }])
    .select()
    .single();

  if (error) throw error;

  // Increment applications count on the project
  await supabase
    .rpc("increment_project_views", { p_id: projectId })
    .catch(() => {});

  return data;
};

// Get applications for a project (project owner)
export const getProjectApplications = async (projectId) => {
  const { data, error } = await supabase
    .from("project_applications")
    .select(
      "*, applicant:applicant_id(id, full_name, avatar_url, role, bio, skills)",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Check if user already applied to a project
export const getUserProjectApplicationStatus = async (projectId, userId) => {
  const { data, error } = await supabase
    .from("project_applications")
    .select("id, status")
    .eq("project_id", projectId)
    .eq("applicant_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data; // null if not applied
};

// Update project application status (approve/reject)
export const updateProjectApplicationStatus = async (
  applicationId,
  status,
  responderId,
) => {
  const { data, error } = await supabase
    .from("project_applications")
    .update({
      status,
      responded_by: responderId,
      responded_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get project applications count
export const getProjectApplicationsCount = async (projectId) => {
  const { count, error } = await supabase
    .from("project_applications")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) throw error;
  return count || 0;
};

// Withdraw (delete) own application
export const withdrawProjectApplication = async (projectId, userId) => {
  const { error } = await supabase
    .from("project_applications")
    .delete()
    .eq("project_id", projectId)
    .eq("applicant_id", userId);

  if (error) throw error;
};

// ─── EVENT APPLICATIONS ───

// Apply to an event
export const applyToEvent = async (eventId, applicantId, message = "") => {
  const { data, error } = await supabase
    .from("event_applications")
    .insert([{ event_id: eventId, applicant_id: applicantId, message }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get applications for an event (event organizer)
export const getEventApplications = async (eventId) => {
  const { data, error } = await supabase
    .from("event_applications")
    .select("*, applicant:applicant_id(id, full_name, avatar_url, role, bio)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Check if user already applied to an event
export const getUserEventApplicationStatus = async (eventId, userId) => {
  const { data, error } = await supabase
    .from("event_applications")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("applicant_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Update event application status (approve/reject)
export const updateEventApplicationStatus = async (
  applicationId,
  status,
  responderId,
) => {
  const { data, error } = await supabase
    .from("event_applications")
    .update({
      status,
      responded_by: responderId,
      responded_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get event applications count
export const getEventApplicationsCount = async (eventId) => {
  const { count, error } = await supabase
    .from("event_applications")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) throw error;
  return count || 0;
};

// Withdraw (delete) own event application
export const withdrawEventApplication = async (eventId, userId) => {
  const { error } = await supabase
    .from("event_applications")
    .delete()
    .eq("event_id", eventId)
    .eq("applicant_id", userId);

  if (error) throw error;
};
