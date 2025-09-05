import {
  type User,
  type InsertUser,
  type FoundItem,
  type InsertFoundItem,
  type LostItem,
  type InsertLostItem,
  type Chat,
  type InsertChat,
  type Message,
  type InsertMessage,
  type ChatWithMessages,
  type ItemMatch
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Found item methods
  createFoundItem(item: InsertFoundItem): Promise<FoundItem>;
  getFoundItems(): Promise<FoundItem[]>;
  getFoundItemsByUser(userId: string): Promise<FoundItem[]>;
  getFoundItem(id: string): Promise<FoundItem | undefined>;
  deleteFoundItem(id: string): Promise<void>;

  // Lost item methods
  createLostItem(item: InsertLostItem): Promise<LostItem>;
  getLostItems(): Promise<LostItem[]>;
  getLostItemsByUser(userId: string): Promise<LostItem[]>;
  getLostItem(id: string): Promise<LostItem | undefined>;

  // Chat methods
  createChat(chat: InsertChat): Promise<Chat>;
  getChatsByUser(userId: string): Promise<ChatWithMessages[]>;
  getChat(id: string): Promise<ChatWithMessages | undefined>;
  getChatByParticipants(participants: string[]): Promise<Chat | undefined>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChat(chatId: string): Promise<Message[]>;

  // Matching methods
  findMatches(lostItem: LostItem): Promise<ItemMatch[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private foundItems: Map<string, FoundItem>;
  private lostItems: Map<string, LostItem>;
  private chats: Map<string, Chat>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.foundItems = new Map();
    this.lostItems = new Map();
    this.chats = new Map();
    this.messages = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Found item methods
  async createFoundItem(insertItem: InsertFoundItem): Promise<FoundItem> {
    const id = randomUUID();
    const keywords = this.extractKeywords(insertItem.prompt || insertItem.description || '');
    const foundItem: FoundItem = {
      ...insertItem,
      id,
      keywords,
      createdAt: new Date(),
      description: insertItem.description || null,
      imageUrl: insertItem.imageUrl || null,
      imageData: insertItem.imageData || null,
    };
    this.foundItems.set(id, foundItem);
    return foundItem;
  }

  async getFoundItems(): Promise<FoundItem[]> {
    return Array.from(this.foundItems.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getFoundItemsByUser(userId: string): Promise<FoundItem[]> {
    return Array.from(this.foundItems.values())
      .filter((item) => item.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getFoundItem(id: string): Promise<FoundItem | undefined> {
    return this.foundItems.get(id);
  }

  async deleteFoundItem(id: string): Promise<void> {
    this.foundItems.delete(id);
  }

  // Lost item methods
  async createLostItem(insertItem: InsertLostItem): Promise<LostItem> {
    const id = randomUUID();
    const keywords = this.extractKeywords(insertItem.prompt || insertItem.description || '');
    const lostItem: LostItem = {
      ...insertItem,
      id,
      keywords,
      createdAt: new Date(),
      description: insertItem.description || null,
      imageUrl: insertItem.imageUrl || null,
      imageData: insertItem.imageData || null,
    };
    this.lostItems.set(id, lostItem);
    return lostItem;
  }

  async getLostItems(): Promise<LostItem[]> {
    return Array.from(this.lostItems.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getLostItemsByUser(userId: string): Promise<LostItem[]> {
    return Array.from(this.lostItems.values())
      .filter((item) => item.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getLostItem(id: string): Promise<LostItem | undefined> {
    return this.lostItems.get(id);
  }

  // Chat methods
  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = randomUUID();
    const chat: Chat = {
      ...insertChat,
      id,
      createdAt: new Date(),
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChatsByUser(userId: string): Promise<ChatWithMessages[]> {
    const userChats = Array.from(this.chats.values())
      .filter((chat) => chat.participants.includes(userId))
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

    const chatsWithMessages = await Promise.all(
      userChats.map(async (chat) => {
        const messages = await this.getMessagesByChat(chat.id);
        const lastMessage = messages[messages.length - 1];
        
        // Get participant user details
        const participantsDetails = chat.participants
          .map(participantId => this.users.get(participantId))
          .filter(user => user !== undefined) as User[];
        
        return {
          ...chat,
          messages,
          lastMessage,
          messageCount: messages.length,
          participantsDetails,
        };
      })
    );

    return chatsWithMessages;
  }

  async getChat(id: string): Promise<ChatWithMessages | undefined> {
    const chat = this.chats.get(id);
    if (!chat) return undefined;

    const messages = await this.getMessagesByChat(id);
    const lastMessage = messages[messages.length - 1];
    
    // Get participant user details
    const participantsDetails = chat.participants
      .map(participantId => this.users.get(participantId))
      .filter(user => user !== undefined) as User[];
    
    return {
      ...chat,
      messages,
      lastMessage,
      messageCount: messages.length,
      participantsDetails,
    };
  }

  async getChatByParticipants(participants: string[]): Promise<Chat | undefined> {
    return Array.from(this.chats.values()).find((chat) => {
      const sorted1 = [...chat.participants].sort();
      const sorted2 = [...participants].sort();
      return JSON.stringify(sorted1) === JSON.stringify(sorted2);
    });
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      imageData: insertMessage.imageData || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByChat(chatId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.chatId === chatId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  // Matching methods
  async findMatches(lostItem: LostItem): Promise<ItemMatch[]> {
    const foundItems = await this.getFoundItems();
    
    const matches = foundItems
      .filter((foundItem) => foundItem.userId !== lostItem.userId)
      .map((foundItem) => {
        const matchScore = this.calculateMatchScore(lostItem.keywords, foundItem.keywords);
        return { item: foundItem, matchScore };
      })
      .filter((match) => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    return matches;
  }

  // Helper methods
  private extractKeywords(text: string): string[] {
    const commonWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
      'with', 'by', 'found', 'lost', 'item', 'has', 'have', 'is', 'was', 'were',
      'been', 'be', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.includes(word))
      .slice(0, 10);
  }

  private calculateMatchScore(keywords1: string[], keywords2: string[]): number {
    const commonKeywords = keywords1.filter((keyword) => keywords2.includes(keyword));
    return commonKeywords.length;
  }
}

export const storage = new MemStorage();
