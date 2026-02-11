import { supabase } from "./client";

// Get user's chats with other participant info
export const getUserChats = async (userId) => {
  const { data, error } = await supabase
    .from("chats")
    .select(
      `
      *,
      participant_1_profile:participant1_id(id, full_name, avatar_url, role),
      participant_2_profile:participant2_id(id, full_name, avatar_url, role)
    `,
    )
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .eq("is_active", true)
    .order("last_activity_at", { ascending: false });

  if (error) throw error;

  // Map chats to include otherUser and use built-in fields
  const chatsWithMeta = (data || []).map((chat) => {
    const isP1 = chat.participant1_id === userId;
    const otherUser = isP1
      ? chat.participant_2_profile
      : chat.participant_1_profile;
    const unreadCount = isP1 ? chat.unread_count_p1 : chat.unread_count_p2;

    return {
      ...chat,
      lastMessage: chat.last_message_text
        ? {
            content: chat.last_message_text,
            created_at: chat.last_message_timestamp,
            sender_id: chat.last_message_sender_id,
          }
        : null,
      unreadCount: unreadCount || 0,
      otherUser,
    };
  });

  return chatsWithMeta;
};

// Get or create a chat between two users
export const getOrCreateChat = async (user1Id, user2Id) => {
  // Check if chat already exists (in either order)
  const { data: existing } = await supabase
    .from("chats")
    .select("*")
    .or(
      `and(participant1_id.eq.${user1Id},participant2_id.eq.${user2Id}),and(participant1_id.eq.${user2Id},participant2_id.eq.${user1Id})`,
    )
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0];
  }

  // Create new chat
  const { data, error } = await supabase
    .from("chats")
    .insert([{ participant1_id: user1Id, participant2_id: user2Id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get chat messages
export const getChatMessages = async (chatId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:sender_id(id, full_name, avatar_url)")
    .eq("chat_id", chatId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

// Send a message
export const sendMessage = async (
  chatId,
  senderId,
  content,
  attachmentUrl = null,
  attachmentType = null,
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        chat_id: chatId,
        sender_id: senderId,
        content,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Update chat's last message info and activity
  await supabase
    .from("chats")
    .update({
      last_message_text: content,
      last_message_sender_id: senderId,
      last_message_timestamp: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", chatId);

  return data;
};

// Mark messages as read
export const markAsRead = async (chatId, userId) => {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .neq("sender_id", userId)
    .eq("is_read", false);

  if (error) throw error;
};

// Subscribe to new messages in a chat (realtime)
export const subscribeToMessages = (chatId, callback) => {
  const channel = supabase
    .channel(`chat-messages-${chatId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        callback(payload.new);
      },
    )
    .subscribe();

  return channel;
};

// Typing indicator using Supabase Presence
export const subscribeToTyping = (chatId, userId, onTypingChange) => {
  const channel = supabase.channel(`typing-${chatId}`, {
    config: { presence: { key: userId } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const typingUsers = Object.keys(state).filter((id) => id !== userId);
      onTypingChange(typingUsers);
    })
    .subscribe();

  return channel;
};

// Send typing status
export const sendTypingStatus = async (channel, userId, isTyping) => {
  if (isTyping) {
    await channel.track({ user_id: userId, typing: true });
  } else {
    await channel.untrack();
  }
};

// Get unread message count for user
export const getUnreadMessageCount = async (userId) => {
  // Get all chats for the user
  const { data: chats } = await supabase
    .from("chats")
    .select("id, participant1_id, unread_count_p1, unread_count_p2")
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

  if (!chats || chats.length === 0) return 0;

  return chats.reduce((total, chat) => {
    const isP1 = chat.participant1_id === userId;
    return (
      total + (isP1 ? chat.unread_count_p1 || 0 : chat.unread_count_p2 || 0)
    );
  }, 0);
};
