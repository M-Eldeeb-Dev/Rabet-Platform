import { supabase } from "./client";

// ─── EVENT IMAGES ────────────────────────────────────
export const uploadEventImage = async (file, eventId) => {
  const ext = file.name.split(".").pop();
  // Sanitize: Use timestamp + random string + extension
  const sanitizedName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const path = `${eventId}/${sanitizedName}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("event-images").getPublicUrl(path);

  return publicUrl;
};

export const deleteEventImage = async (path) => {
  const { error } = await supabase.storage.from("event-images").remove([path]);
  if (error) throw error;
};

// ─── PROJECT FILES (images, pdf, pptx) ───────────────
export const uploadProjectFile = async (file, projectId) => {
  const ext = file.name.split(".").pop();
  // Sanitize: Use timestamp + random string + extension to avoid invalid characters (like Arabic) in the key
  const sanitizedName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const path = `${projectId}/${sanitizedName}`;

  const { error } = await supabase.storage
    .from("project-files")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("project-files").getPublicUrl(path);

  return { url: publicUrl, name: file.name, type: ext, size: file.size };
};

export const deleteProjectFile = async (path) => {
  const { error } = await supabase.storage.from("project-files").remove([path]);
  if (error) throw error;
};

// ─── GENERIC URL GETTER ──────────────────────────────
export const getPublicUrl = (bucket, path) => {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
};
