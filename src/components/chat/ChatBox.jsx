import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import Card from "../ui/Card";
import {
  Send,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import LinkifiedText from "../ui/LinkifiedText";

const ChatBox = ({ activeChatId }) => {
  const { user, profile } = useAuth();
  const { sendMessage, messages, messagesLoading } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, messagesLoading]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(newMessage, selectedFile);
      setNewMessage("");
      setSelectedFile(null);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل إرسال الرسالة",
        confirmButtonText: "حسناً",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!activeChatId)
    return (
      <Card className="flex flex-col h-full bg-white shadow-lg overflow-hidden border border-gray-100 items-center justify-center text-gray-400">
        <p>اختر محادثة للبدء</p>
      </Card>
    );

  return (
    <Card className="flex flex-col h-full bg-white shadow-lg overflow-hidden border border-gray-100">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messagesLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p>لا توجد رسائل بعد. ابدأ المحادثة!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && msg.sender?.avatar_url && (
                  <img
                    src={msg.sender.avatar_url}
                    alt={msg.sender.full_name}
                    className="w-8 h-8 rounded-full ml-2 self-end mb-1"
                  />
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe
                      ? "bg-gradient-to-l from-primary to-primary/80 text-white rounded-br-none"
                      : "bg-white border text-gray-800 rounded-bl-none"
                  }`}
                >
                  {/* Image Attachment */}
                  {msg.attachment_url && msg.attachment_type === "image" && (
                    <div className="mb-2">
                      <a
                        href={msg.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={msg.attachment_url}
                          alt="attachment"
                          className="max-w-full h-auto rounded-lg border border-white/20 hover:opacity-90 transition-opacity cursor-pointer"
                          style={{ maxHeight: "200px", objectFit: "cover" }}
                        />
                      </a>
                    </div>
                  )}

                  {/* File Attachment (fallback for any other type) */}
                  {msg.attachment_url && msg.attachment_type !== "image" && (
                    <a
                      href={msg.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${
                        isMe
                          ? "bg-white/10 hover:bg-white/20"
                          : "bg-gray-100 hover:bg-gray-200"
                      } transition-colors`}
                    >
                      <FileText className="h-5 w-5" />
                      <span className="truncate max-w-[150px] underline">
                        {msg.attachment_type === "file" ? "ملف مرفق" : "مرفق"}
                      </span>
                    </a>
                  )}

                  {msg.content && (
                    <p className="whitespace-pre-wrap">
                      <LinkifiedText text={msg.content} />
                    </p>
                  )}

                  <div
                    className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-400"}`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString("ar-EG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {isMe && profile?.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-8 h-8 rounded-full mr-2 self-end mb-1"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        {selectedFile && (
          <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {selectedFile.type.startsWith("image/") ? (
                  <ImageIcon size={20} />
                ) : (
                  <FileText size={20} />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-700 truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[46px] max-h-[120px] scrollbar-hide"
              placeholder="اكتب رسالتك..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              dir="rtl"
              rows={1}
            />
          </div>

          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              type="button"
              disabled={isSending}
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all disabled:opacity-50"
              title="إرفاق ملف"
            >
              <Upload className="h-5 w-5" />
            </button>

            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || isSending}
              className="p-3 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:shadow-none flex-shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 rotate-180" />
              )}
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
};
export default ChatBox;
