import { create } from "zustand";

const useChatStore = create((set) => ({
  chats: [],
  activeChat: null,
  messages: [],
  typingUsers: [],

  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setTypingUsers: (users) => set({ typingUsers: users }),

  updateChatLastMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message,
              updated_at: new Date().toISOString(),
            }
          : chat,
      ),
    })),
}));

export default useChatStore;
