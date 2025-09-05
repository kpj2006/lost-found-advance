import { apiRequest } from "./queryClient";
import type { AuthUser } from "../types";

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ user: AuthUser }> => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    return response.json();
  },

  // AI prompt generation from image
  analyzeImage: async (imageFile: File, type: "found" | "lost"): Promise<{ prompt: string; imageData: string }> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('type', type);
    
    const response = await fetch("/api/analyze-image", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // AI prompt generation (legacy)
  generatePrompt: async (description: string, imageUrl: string, type: "found" | "lost"): Promise<{ prompt: string }> => {
    const response = await apiRequest("POST", "/api/generate-prompt", { description, imageUrl, type });
    return response.json();
  },

  // Found items
  createFoundItem: async (data: any) => {
    const response = await apiRequest("POST", "/api/found-items", data);
    return response.json();
  },

  getFoundItems: async () => {
    const response = await apiRequest("GET", "/api/found-items");
    return response.json();
  },

  getFoundItemsByUser: async (userId: string) => {
    const response = await apiRequest("GET", `/api/found-items/user/${userId}`);
    return response.json();
  },

  deleteFoundItem: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/found-items/${id}`);
    return response.json();
  },

  // Lost items
  createLostItem: async (data: any) => {
    const response = await apiRequest("POST", "/api/lost-items", data);
    return response.json();
  },

  getLostItems: async () => {
    const response = await apiRequest("GET", "/api/lost-items");
    return response.json();
  },

  // Chats
  createChat: async (data: any) => {
    const response = await apiRequest("POST", "/api/chats", data);
    return response.json();
  },

  getChatsByUser: async (userId: string) => {
    const response = await apiRequest("GET", `/api/chats/user/${userId}`);
    return response.json();
  },

  getChat: async (chatId: string) => {
    const response = await apiRequest("GET", `/api/chats/${chatId}`);
    return response.json();
  },

  // Messages
  sendMessage: async (data: any) => {
    const response = await apiRequest("POST", "/api/messages", data);
    return response.json();
  },

  // Send image message
  sendImageMessage: async (chatId: string, senderId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('chatId', chatId);
    formData.append('senderId', senderId);
    
    const response = await fetch("/api/messages/image", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};
