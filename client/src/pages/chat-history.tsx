import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useApp } from "./home";
import { api } from "../lib/api";

interface ChatWithMessages {
  id: string;
  participants: string[];
  itemDescription: string;
  createdAt: string;
  messages: any[];
  messageCount: number;
  participantsDetails?: { id: string; email: string }[];
}

export function ChatHistory() {
  const [chats, setChats] = useState<ChatWithMessages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useApp();

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;

    try {
      const chatsData = await api.getChatsByUser(user.id);
      setChats(chatsData);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherParticipant = (chat: ChatWithMessages) => {
    const otherParticipantId = chat.participants.find(p => p !== user?.id);
    if (!otherParticipantId) return 'Unknown User';
    
    // Find the participant details
    const participantDetails = chat.participantsDetails?.find((p: { id: string; email: string }) => p.id === otherParticipantId);
    return participantDetails?.email || otherParticipantId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleChatClick = (chatId: string) => {
    setLocation(`/chat/${chatId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border border-border">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Link href="/main-menu">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-2xl font-semibold text-foreground">Previous Chats</h2>
          </div>
          
          {chats.length > 0 ? (
            <div className="space-y-4" data-testid="section-chats-list">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleChatClick(chat.id)}
                  data-testid={`card-chat-${chat.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Chat with {getOtherParticipant(chat)}
                      </h3>
                      {/* <p className="text-sm text-muted-foreground mt-1">
                        {chat.itemDescription}
                      </p> */}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(chat.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${chat.messageCount > 0 ? 'bg-secondary' : 'bg-muted-foreground'}`}></div>
                      <span className="text-xs text-muted-foreground">{chat.messageCount} messages</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12" data-testid="section-no-chats">
              <MessageCircle className="text-muted-foreground text-4xl mb-3 h-12 w-12 mx-auto" />
              <h3 className="text-lg font-medium text-foreground mb-2">No chats yet</h3>
              <p className="text-muted-foreground">Start by reporting lost or found items to connect with others</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
