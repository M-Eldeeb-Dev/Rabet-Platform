import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../hooks/useAuth";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Send, Upload } from "lucide-react";

const ChatBox = ({ activeChatId }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchMessages = async () => {
    if (!activeChatId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", activeChatId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
    scrollToBottom();
  };

  // ... (useEffect unchanged)
  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${activeChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${activeChatId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new]);
          scrollToBottom();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      // We assume sendMessage from props or context if using hook, BUT this component uses local `supabase` insert in the original code?
      // Wait, the original code used a local `handleSend` with direct `supabase.insert`.
      // I should update it to use the `sendMessage` from `useChat` hook if I want to use the logic I just added to `useChat.js`.
      // However, `ChatBox` seems to be standalone in the file provided or maybe it's not using the hook?
      // Line 3: `import { useAuth } from "../../hooks/useAuth";`
      // It DOES NOT import `useChat`.
      // I need to update this component to use the logic I put in `useChat` OR replicate it here.
      // Since `useChat.js` has the upload logic, I should probably switch to using `useChat` hook or copy the logic.
      // Let's copy/adapt the logic locally here since refactoring to use the hook might break other things if not careful.
      // Actually, looking at `hooks/useChat.js`, it handles uploading.
      // But `ChatBox.jsx` (lines 58-71) has its own `handleSend`.
      // Use the new logic here.

      let attachmentUrl = null;
      let attachmentType = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${activeChatId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("chat-attachments")
          .getPublicUrl(filePath);

        attachmentUrl = data.publicUrl;
        attachmentType = selectedFile.type.startsWith("image/")
          ? "image"
          : "file";
      }

      await supabase.from("messages").insert([
        {
          chat_id: activeChatId,
          sender_id: user.id,
          content: newMessage,
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
        },
      ]);

      setNewMessage("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل إرسال الرسالة",
        confirmButtonText: "حسناً",
      });
    }
  };

  if (!activeChatId) return null;

  return (
    <Card className="flex flex-col h-full bg-white shadow-lg overflow-hidden border border-gray-100">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  isMe
                    ? "bg-gradient-to-l from-primary to-primary/80 text-white rounded-br-none"
                    : "bg-white border text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.attachment_url && msg.attachment_type === "image" && (
                  <img
                    src={msg.attachment_url}
                    alt="attachment"
                    className="max-w-full h-auto rounded-lg mb-2 border border-white/20"
                  />
                )}
                {msg.attachment_url && msg.attachment_type === "file" && (
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 mb-2 underline ${isMe ? "text-blue-100" : "text-primary"}`}
                  >
                    📄 مرفق
                  </a>
                )}
                <p>{msg.content}</p>
                <div
                  className={`text-[10px] mt-1 opacity-70 ${isMe ? "text-blue-100" : "text-gray-400"}`}
                >
                  {new Date(msg.created_at).toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        {selectedFile && (
          <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between text-xs text-gray-500">
            <span>جاري إرسال: {selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              x
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-primary transition-colors"
          >
            <Upload className="h-5 w-5" />
          </button>

          <input
            type="text"
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="اكتب رسالتك..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            dir="rtl"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() && !selectedFile}
            className="p-3 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="h-5 w-5 rotate-180" />
          </button>
        </form>
      </div>
    </Card>
  );
};
export default ChatBox;
