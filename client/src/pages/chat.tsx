import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Image as ImageIcon, Paperclip } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "./home";
import { api } from "../lib/api";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  imageData?: string | null;
}

interface ChatData {
  id: string;
  participants: string[];
  itemDescription: string;
  createdAt: string;
  messages: Message[];
  participantsDetails?: { id: string; email: string }[];
}

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

export function ChatPage({ params }: ChatPageProps) {
  const [chat, setChat] = useState<ChatData | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useApp();

  useEffect(() => {
    if (params.chatId) {
      loadChat();
    }
  }, [params.chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  useEffect(() => {
    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      if (params.chatId && !isSending) {
        loadChat();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [params.chatId, isSending]);

  const loadChat = async () => {
    try {
      const chatData = await api.getChat(params.chatId);
      setChat(chatData);
    } catch (error) {
      console.error("Failed to load chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && !selectedImage) || !user || !chat) return;

    setIsSending(true);
    try {
      if (selectedImage) {
        await api.sendImageMessage(chat.id, user.id, selectedImage);
        setSelectedImage(null);
      } else {
        await api.sendMessage({
          chatId: chat.id,
          senderId: user.id,
          content: message.trim(),
        });
      }

      setMessage("");
      // Reload chat to get the new message
      await loadChat();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getOtherParticipant = () => {
    if (!chat || !user) return 'Unknown User';
    
    const otherParticipantId = chat.participants.find(p => p !== user.id);
    if (!otherParticipantId) return 'Unknown User';
    
    // Find the participant details
    const participantDetails = chat.participantsDetails?.find((p: { id: string; email: string }) => p.id === otherParticipantId);
    return participantDetails?.email || otherParticipantId;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">Loading chat...</div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Chat not found</h3>
          <p className="text-muted-foreground mb-4">The chat you're looking for doesn't exist.</p>
          <Link href="/chat-history">
            <Button>Back to Chat History</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border border-border overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="flex items-center space-x-3">
            <Link href="/chat-history">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground" data-testid="text-chat-participant">
                {getOtherParticipant()}
              </h2>
              {/* <p className="text-sm text-muted-foreground" data-testid="text-chat-item">
                {chat.itemDescription}
              </p> */}
            </div>
            <div className="text-xs text-muted-foreground" data-testid="text-chat-date">
              {formatDate(chat.createdAt)}
            </div>
          </div>
        </div>
        
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-muted/10" data-testid="section-chat-messages">
          {chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderId === user?.id
                    ? 'bg-primary text-primary-foreground ml-8'
                    : 'bg-muted text-muted-foreground mr-8'
                }`}
                data-testid={`message-${msg.id}`}
              >
                {msg.imageData && (
                  <div className="mb-2">
                    <img 
                      src={msg.imageData} 
                      alt="Shared image" 
                      className="max-w-full h-auto rounded border max-h-48 object-cover"
                    />
                  </div>
                )}
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-border p-4">
          {selectedImage && (
            <div className="mb-3 p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{selectedImage.name}</span>
                  <span className="text-xs text-muted-foreground">({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <Button variant="ghost" size="sm" onClick={removeSelectedImage}>
                  ×
                </Button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              data-testid="button-attach-image"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={selectedImage ? "Send image..." : "Type your message..."}
              className="flex-1"
              disabled={isSending}
              data-testid="input-chat-message"
            />
            <Button
              type="submit"
              disabled={isSending || (!message.trim() && !selectedImage)}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-2 text-center">
            <Link href="/main-menu">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-exit-chat">
                Exit Chat
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
