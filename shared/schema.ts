import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const foundItems = pgTable("found_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  prompt: text("prompt").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  imageData: text("image_data"), // Base64 encoded image for sharing with lost users
  keywords: text("keywords").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lostItems = pgTable("lost_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  prompt: text("prompt").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  imageData: text("image_data"), // Base64 encoded image for sharing with found users
  keywords: text("keywords").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participants: text("participants").array().notNull(),
  itemId: varchar("item_id").notNull(),
  itemType: text("item_type").notNull(), // 'found' or 'lost'
  itemDescription: text("item_description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  imageData: text("image_data"), // Base64 encoded image data
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFoundItemSchema = createInsertSchema(foundItems).omit({
  id: true,
  createdAt: true,
  keywords: true,
});

export const insertLostItemSchema = createInsertSchema(lostItems).omit({
  id: true,
  createdAt: true,
  keywords: true,
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFoundItem = z.infer<typeof insertFoundItemSchema>;
export type FoundItem = typeof foundItems.$inferSelect;

export type InsertLostItem = z.infer<typeof insertLostItemSchema>;
export type LostItem = typeof lostItems.$inferSelect;

export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Extended types for API responses
export type ChatWithMessages = Chat & {
  messages: Message[];
  lastMessage?: Message;
  messageCount: number;
  participantsDetails?: User[];
};

export type ItemMatch = {
  item: FoundItem;
  matchScore: number;
};
