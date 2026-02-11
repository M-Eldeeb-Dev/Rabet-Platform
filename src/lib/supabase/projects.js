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

// Get user's own projects
export const getMyProjects = async (userId) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*, categories:category_id(id, name, display_name)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get all projects (for browsing)
export const getAllProjects = async () => {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "*, profiles:owner_id(id, full_name, role, avatar_url), categories:category_id(id, name, display_name)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (error) throw error;
  return data || [];
};

// Get pending projects (admin)
export const getPendingProjects = async () => {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "*, profiles:owner_id(id, full_name, role, avatar_url), categories:category_id(id, name, display_name)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get single project with owner info
export const getProject = async (id) => {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "*, profiles:owner_id(id, full_name, role, avatar_url, bio, skills), categories:category_id(id, name, display_name)",
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// Create project
export const createProject = async (projectData) => {
  const slug = generateSlug(projectData.title);
  const { data, error } = await supabase
    .from("projects")
    .insert([{ ...projectData, slug }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update project
export const updateProject = async (id, updates) => {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete project
export const deleteProject = async (id) => {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) throw error;
};

// Check project limit for co-founders (2 per 2 weeks)
export const checkProjectLimit = async (userId) => {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const { count, error } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", userId)
    .gte("created_at", twoWeeksAgo.toISOString());

  if (error) throw error;
  return (count || 0) >= 2;
};

// Search and filter projects
export const searchProjects = async (query = "", categoryId = "") => {
  let q = supabase
    .from("projects")
    .select(
      "*, profiles:owner_id(id, full_name, role, avatar_url), categories:category_id(id, name, display_name)",
    )
    .order("created_at", { ascending: false });

  if (query) {
    q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }
  if (categoryId) {
    q = q.eq("category_id", categoryId);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
};

// Get project count for a user
export const getProjectCount = async (userId) => {
  const { count, error } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", userId);

  if (error) throw error;
  return count || 0;
};

// Get total project count (admin)
export const getTotalProjectCount = async () => {
  const { count, error } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
};

// Get all categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data || [];
};

// Approve project (admin)
export const approveProject = async (projectId, adminId, notes = "") => {
  const { data, error } = await supabase
    .from("projects")
    .update({
      status: "approved",
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Reject project (admin)
export const rejectProject = async (projectId, adminId, notes = "") => {
  const { data, error } = await supabase
    .from("projects")
    .update({
      status: "rejected",
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
