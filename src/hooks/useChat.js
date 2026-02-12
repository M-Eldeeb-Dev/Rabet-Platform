import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../lib/supabase/client";
import {
  getUserChats,
  getChatMessages,
  sendMessage as sendChatMessage,
  markAsRead,
  getOrCreateChat,
} from "../lib/supabase/chats";
import useChatStore from "../store/chatStore";

export const useChat = () => {
  const { user } = useAuth();
  const {
    chats,
    activeChat,
    messages,
    typingUsers,
    setChats,
    setActiveChat,
    setMessages,
    addMessage,
    setTypingUsers,
    updateChatLastMessage,
  } = useChatStore();

  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const channelRef = useRef(null);
  const typingChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch user's chats
  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserChats(user.id);
      setChats(data);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  }, [user, setChats]);

  // Fetch messages for active chat
  const fetchMessages = useCallback(
    async (chatId) => {
      if (!chatId) return;
      setMessagesLoading(true);
      try {
        const data = await getChatMessages(chatId);
        setMessages(data);
        if (user) await markAsRead(chatId, user.id);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    },
    [user, setMessages],
  );

  // Select a chat
  const selectChat = useCallback(
    async (chat) => {
      setActiveChat(chat);
      await fetchMessages(chat.id);
    },
    [setActiveChat, fetchMessages],
  );

  // Start a new chat with a user
  const startChat = useCallback(
    async (otherUserId) => {
      if (!user) return;
      try {
        const chat = await getOrCreateChat(user.id, otherUserId);
        await fetchChats();
        return chat;
      } catch (err) {
        console.error("Error starting chat:", err);
      }
    },
    [user, fetchChats],
  );

  // Send a message
  const sendMessage = useCallback(
    async (content, file = null) => {
      if (!activeChat || !user) return;
      try {
        let attachmentUrl = null;
        let attachmentType = null;

        if (file) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `${activeChat.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("chat-attachments")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("chat-attachments")
            .getPublicUrl(filePath);

          attachmentUrl = data.publicUrl;
          attachmentType = file.type.startsWith("image/") ? "image" : "file";
        }

        const sentMessage = await sendChatMessage(
          activeChat.id,
          user.id,
          content,
          attachmentUrl,
          attachmentType,
        );

        // Immediately add to state (optimistic-like, but with real ID)
        if (sentMessage) {
          addMessage({
            ...sentMessage,
            sender: {
              id: user.id,
              full_name: user.user_metadata?.full_name || "Unknown",
              avatar_url: user.user_metadata?.avatar_url || null,
            },
          });
          updateChatLastMessage(activeChat.id, sentMessage);
        }

        // Stop typing indicator
        if (typingChannelRef.current) {
          await typingChannelRef.current.untrack();
        }
      } catch (err) {
        console.error("Error sending message:", err);
        throw err; // Re-throw to handle in UI
      }
    },
    [activeChat, user, addMessage, updateChatLastMessage],
  );

  // Handle typing
  const handleTyping = useCallback(() => {
    if (!typingChannelRef.current || !user) return;

    typingChannelRef.current.track({ user_id: user.id, typing: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (typingChannelRef.current) {
        typingChannelRef.current.untrack();
      }
    }, 2000);
  }, [user]);

  // Subscribe to realtime messages when active chat changes
  useEffect(() => {
    if (!activeChat?.id) return;

    // Cleanup previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat-messages-${activeChat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${activeChat.id}`,
        },
        async (payload) => {
          // Only add if not already in messages (avoid duplicates from own sends)
          const newMsg = payload.new;
          // Fetch sender info
          const { data: sender } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", newMsg.sender_id)
            .single();

          addMessage({ ...newMsg, sender });
          updateChatLastMessage(activeChat.id, newMsg);

          // Mark as read if it's not from us
          if (user && newMsg.sender_id !== user.id) {
            await markAsRead(activeChat.id, user.id);
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    // Typing presence channel
    if (typingChannelRef.current) {
      supabase.removeChannel(typingChannelRef.current);
    }

    const typingChannel = supabase.channel(`typing-${activeChat.id}`, {
      config: { presence: { key: user?.id || "anon" } },
    });

    typingChannel
      .on("presence", { event: "sync" }, () => {
        const state = typingChannel.presenceState();
        const typing = Object.keys(state).filter((id) => id !== user?.id);
        setTypingUsers(typing);
      })
      .subscribe();

    typingChannelRef.current = typingChannel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
    };
  }, [
    activeChat?.id,
    user?.id,
    addMessage,
    setTypingUsers,
    updateChatLastMessage,
  ]);

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    activeChat,
    messages,
    typingUsers,
    loading,
    messagesLoading,
    fetchChats,
    selectChat,
    sendMessage,
    startChat,
    handleTyping,
  };
};
