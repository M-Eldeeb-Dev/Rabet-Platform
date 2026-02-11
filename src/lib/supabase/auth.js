import { supabase } from "./client";

// Sign up a new user
export const signUp = async (email, password, fullName, role) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) throw error;

  // The trigger will auto-create the profile, but as a fallback:
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        full_name: fullName,
        email: email,
        role: role,
      },
      { onConflict: "id" },
    );

    if (profileError)
      console.error("Profile creation fallback error:", profileError);
  }

  return data;
};

// Sign in
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

// Sign out
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get user profile
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Update user profile
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all profiles (admin)
export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Toggle ban status (admin)
export const toggleBan = async (userId, isBanned, banReason = "") => {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_banned: isBanned,
      ban_reason: isBanned ? banReason : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
