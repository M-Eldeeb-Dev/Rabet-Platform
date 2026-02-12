import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import ChatBox from "../../components/chat/ChatBox";
import { Search, MessageSquare } from "lucide-react";

const Chat = () => {
  const { profile } = useAuth();
  const { chats, activeChat, loading, selectChat } = useChat();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.otherUser?.full_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="flex h-[calc(100vh-120px)] rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
      dir="rtl"
    >
      {/* Sidebar */}
      <div
        className={`w-full sm:w-80 border-l border-gray-100 flex flex-col ${activeChat ? "hidden sm:flex" : "flex"}`}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-black text-gray-900 mb-3">المحادثات</h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن محادثة..."
              className="w-full h-9 rounded-lg border border-gray-200 pr-9 pl-3 text-sm focus:border-primary outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-right ${
                  activeChat?.id === chat.id
                    ? "bg-primary/5 border-r-2 border-r-primary"
                    : ""
                }`}
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {chat.otherUser?.full_name?.[0] || "U"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-gray-900 truncate">
                      {chat.otherUser?.full_name || "مستخدم"}
                    </p>
                    {chat.lastMessage && (
                      <span className="text-[10px] text-text-secondary shrink-0">
                        {formatTime(chat.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-text-secondary truncate">
                      {chat.lastMessage?.content || "ابدأ المحادثة"}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="shrink-0 h-5 min-w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-text-secondary dark:text-gray-400">
                لا توجد محادثات
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${!activeChat ? "hidden sm:flex" : "flex"}`}
      >
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center gap-3">
              <button
                onClick={() => selectChat(null)}
                className="sm:hidden p-1 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {activeChat.otherUser?.full_name?.[0] || "U"}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {activeChat.otherUser?.full_name || "مستخدم"}
                </p>
                <p className="text-xs text-text-secondary dark:text-gray-400">
                  {activeChat.otherUser?.role === "entrepreneur"
                    ? "رائد أعمال"
                    : activeChat.otherUser?.role === "co_founder"
                      ? "شريك مؤسس"
                      : "مستخدم"}
                </p>
              </div>
            </div>

            {/* Chat Content using ChatBox component */}
            <div className="flex-1 overflow-hidden relative">
              <ChatBox activeChatId={activeChat.id} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-gray-700 mb-1">اختر محادثة</h3>
              <p className="text-sm text-text-secondary dark:text-gray-400">
                اختر من القائمة لبدء المحادثة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
