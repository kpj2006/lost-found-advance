import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Image, Clock } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "./home";
import { api } from "../lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface FoundItem {
  id: string;
  userId: string;
  prompt: string;
  description?: string;
  imageUrl?: string;
  imageData?: string;
  keywords: string[];
  createdAt: string;
}

export function MyFoundItems() {
  const { user } = useApp();
  const queryClient = useQueryClient();

  const { data: foundItems = [], isLoading } = useQuery({
    queryKey: ['/api/found-items/user', user?.id],
    queryFn: () => api.getFoundItemsByUser(user!.id),
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: api.deleteFoundItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/found-items/user', user?.id] });
    },
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this found item? This action cannot be undone.')) {
      deleteItemMutation.mutate(id);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Please log in to view your found items.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg border border-border">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Link href="/main-menu">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-2xl font-semibold text-foreground">My Found Items</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading your found items...</p>
            </div>
          ) : foundItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't reported any found items yet.</p>
              <Link href="/report-found">
                <Button data-testid="button-report-first-item">
                  Report Your First Found Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                {foundItems.length} found item{foundItems.length === 1 ? '' : 's'} reported
              </div>
              
              {foundItems.map((item: FoundItem) => (
                <Card key={item.id} className="border border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          {item.imageData && (
                            <div className="flex-shrink-0">
                              <img 
                                src={item.imageData} 
                                alt="Found item" 
                                className="w-20 h-20 object-cover rounded-lg border border-border"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-lg mb-2" data-testid={`item-prompt-${item.id}`}>
                              {item.prompt}
                            </h3>
                            
                            {item.description && (
                              <p className="text-muted-foreground text-sm mb-2" data-testid={`item-description-${item.id}`}>
                                Original description: {item.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(item.createdAt)}</span>
                              </div>
                              
                              {item.imageData && (
                                <div className="flex items-center space-x-1">
                                  <Image className="h-3 w-3" />
                                  <span>Photo included</span>
                                </div>
                              )}
                              
                              {item.keywords.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <span>Keywords: {item.keywords.slice(0, 3).join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteItemMutation.isPending}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="pt-6 border-t border-border">
                <div className="text-center">
                  <Link href="/report-found">
                    <Button data-testid="button-report-another">
                      Report Another Found Item
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}