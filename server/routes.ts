import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { analyzeImageForPrompt, analyzeImageForChat } from "./gemini";
import {
  insertUserSchema,
  insertFoundItemSchema,
  insertLostItemSchema,
  insertChatSchema,
  insertMessageSchema,
} from "@shared/schema";
import { z } from "zod";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Demo mode - accept any credentials, create user if doesn't exist
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({ email, password });
      }

      res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Found items routes
  app.post("/api/found-items", async (req, res) => {
    try {
      const data = insertFoundItemSchema.parse(req.body);
      const foundItem = await storage.createFoundItem(data);
      res.json(foundItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create found item" });
    }
  });

  app.get("/api/found-items", async (req, res) => {
    try {
      const items = await storage.getFoundItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch found items" });
    }
  });

  app.get("/api/found-items/user/:userId", async (req, res) => {
    try {
      const items = await storage.getFoundItemsByUser(req.params.userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user's found items" });
    }
  });

  app.delete("/api/found-items/:id", async (req, res) => {
    try {
      await storage.deleteFoundItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete found item" });
    }
  });

  app.get("/api/found-items/user/:userId", async (req, res) => {
    try {
      const items = await storage.getFoundItemsByUser(req.params.userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user's found items" });
    }
  });

  // Lost items routes
  app.post("/api/lost-items", async (req, res) => {
    try {
      const data = insertLostItemSchema.parse(req.body);
      const lostItem = await storage.createLostItem(data);
      
      // Find matches
      const matches = await storage.findMatches(lostItem);
      
      res.json({ lostItem, matches });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lost item" });
    }
  });

  app.get("/api/lost-items", async (req, res) => {
    try {
      const items = await storage.getLostItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lost items" });
    }
  });

  app.get("/api/lost-items/user/:userId", async (req, res) => {
    try {
      const items = await storage.getLostItemsByUser(req.params.userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user's lost items" });
    }
  });

  // AI prompt generation from image
  app.post("/api/analyze-image", upload.single('image'), async (req, res) => {
    try {
      const { type } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      if (type !== "found" && type !== "lost") {
        return res.status(400).json({ message: "Type must be 'found' or 'lost'" });
      }

      const prompt = await analyzeImageForPrompt(req.file.buffer, req.file.mimetype, type);
      
      // Store the image temporarily in base64 for the session
      const imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      res.json({ prompt, imageData });
    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // AI prompt generation (legacy text/URL version)
  app.post("/api/generate-prompt", async (req, res) => {
    try {
      const { description, imageUrl, type } = req.body;
      
      if (!description && !imageUrl) {
        return res.status(400).json({ message: "Description or image URL is required" });
      }

      let prompt = "";
      
      if (type === "found") {
        // Detailed prompt for found items (3-5 sentences) - found user has the actual item
        const date = new Date().toLocaleDateString();
        if (description) {
          prompt = `${description.charAt(0).toUpperCase() + description.slice(1)} found on ${date}. This item was discovered and reported to the lost & found system. The finder has taken possession of the item and is willing to return it to the rightful owner. Please contact immediately if this matches something you have lost. The item appears to be in good condition and is being safely stored.`;
        } else {
          prompt = `Item found on ${date} from uploaded image. The finder has taken possession of this item and reported it to the lost & found system. Please contact immediately if this matches something you have lost. The item is being safely stored and the finder is willing to return it to the rightful owner.`;
        }
      } else {
        // Detailed prompt for lost items (3-5 sentences)
        const date = new Date().toLocaleDateString();
        if (description) {
          prompt = `${description.charAt(0).toUpperCase() + description.slice(1)} lost on ${date}. This item contains important personal belongings and has significant value to the owner. Last seen in the general area where it was reported missing. The owner is actively searching for this item and would greatly appreciate any assistance in locating it. Please contact immediately if found.`;
        } else {
          prompt = `Item lost on ${date} from uploaded image. Contains important personal belongings with significant value to the owner. The item was last seen in the general area where it was reported missing. Owner is actively searching and would greatly appreciate any assistance. Please contact immediately if found.`;
        }
      }

      res.json({ prompt });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate prompt" });
    }
  });

  // Chat routes
  app.post("/api/chats", async (req, res) => {
    try {
      const data = insertChatSchema.parse(req.body);
      
      // Check if chat already exists between participants
      const existingChat = await storage.getChatByParticipants(data.participants);
      if (existingChat) {
        return res.json(existingChat);
      }

      const chat = await storage.createChat(data);
      
      // Auto-share lost user's image when starting a chat
      try {
        const lostUser = data.participants[0]; // Lost item user
        const foundUser = data.participants[1]; // Found item user
        
        // If lost item image data was passed, send it to the found user
        if (req.body.lostItemImageData) {
          await storage.createMessage({
            chatId: chat.id,
            senderId: lostUser,
            content: `[Lost Item Details] I lost this item and here are the details: ${req.body.itemDescription}`,
            imageData: req.body.lostItemImageData,
          });
        }
        
        // Don't auto-share found user's image - they can share it manually if needed
      } catch (imageShareError) {
        console.log('Could not auto-share images:', imageShareError);
        // Continue without image sharing if it fails
      }
      
      res.json(chat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.get("/api/chats/user/:userId", async (req, res) => {
    try {
      const chats = await storage.getChatsByUser(req.params.userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.get("/api/chats/:chatId", async (req, res) => {
    try {
      const chat = await storage.getChat(req.params.chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  // Message routes
  app.post("/api/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Send image message
  app.post("/api/messages/image", upload.single('image'), async (req, res) => {
    try {
      const { chatId, senderId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // Convert image to base64 for storage
      const imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Analyze image for description
      const imageDescription = await analyzeImageForChat(req.file.buffer, req.file.mimetype);
      
      const message = await storage.createMessage({
        chatId,
        senderId,
        content: `[Image] ${imageDescription}`,
        imageData,
      });

      res.json(message);
    } catch (error) {
      console.error("Failed to send image message:", error);
      res.status(500).json({ message: "Failed to send image message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
