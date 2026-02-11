import { useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../lib/supabase/client";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "../lib/supabase/notifications";
import useNotificationStore from "../store/notificationStore";

export const useNotifications = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [user, setNotifications, setUnreadCount]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      markAsRead(id);
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsRead(user.id);
      markAllAsRead();
    } catch (err) {
      console.error("Error marking all notifications read:", err);
    }
  };

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    let channel;
    try {
      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            addNotification(payload.new);
          },
        )
        .subscribe((status, err) => {
          if (err) {
            console.warn("Notification subscription error:", err);
          }
        });
    } catch (err) {
      console.warn("Failed to create notification channel:", err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, fetchNotifications, addNotification]);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    handleMarkRead,
    handleMarkAllRead,
  };
};
