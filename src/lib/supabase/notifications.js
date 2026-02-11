import { supabase } from "./client";

// Get user notifications
export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Mark notification as read
export const markNotificationRead = async (id) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
};

// Mark all notifications as read
export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
};

// Send notification to a single user
export const sendNotification = async (
  userId,
  title,
  message,
  type = "admin_broadcast",
) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert([{ user_id: userId, title, message, type }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Send bulk notification (admin) - to all users or by role
export const sendBulkNotification = async (
  title,
  message,
  type = "admin_broadcast",
  role = null,
) => {
  // Get target users
  let query = supabase.from("profiles").select("id");
  if (role && role !== "all") {
    query = query.eq("role", role);
  }

  const { data: users, error: usersError } = await query;
  if (usersError) throw usersError;

  if (!users || users.length === 0) return;

  const notifications = users.map((user) => ({
    user_id: user.id,
    title,
    message,
    type,
  }));

  const { error } = await supabase.from("notifications").insert(notifications);
  if (error) throw error;

  return notifications.length;
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count || 0;
};

// Subscribe to notifications (realtime)
export const subscribeToNotifications = (userId, callback) => {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      },
    )
    .subscribe();

  return channel;
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) throw error;
};
