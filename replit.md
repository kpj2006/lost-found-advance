# Overview

A Lost and Found Portal web application that enables users to report lost and found items, generate AI-powered item descriptions, match items automatically, and communicate through an integrated chat system. The application follows a text-based interface design with modern web technologies.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built as a React SPA using Vite for development and bundling. The architecture follows a component-based approach with:
- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context for user authentication state and TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod for validation

## Backend Architecture
The server implements a REST API using Express.js with:
- **Framework**: Express.js with TypeScript for the API layer
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Storage Layer**: Abstract storage interface with in-memory implementation for development
- **Session Management**: Express sessions with PostgreSQL session store
- **Development Setup**: Vite middleware integration for hot reloading

## Data Storage Solutions
- **Primary Database**: PostgreSQL configured through Drizzle ORM
- **Schema Design**: Five main entities - users, found items, lost items, chats, and messages
- **Development Storage**: In-memory storage implementation for rapid development and testing
- **Database Migrations**: Drizzle Kit for schema management and migrations

## Authentication and Authorization
- **Authentication**: Simple email/password login with demo mode accepting any credentials
- **Session Management**: Express sessions for maintaining user state
- **Authorization**: User-based access control for items and chats
- **Demo Implementation**: Automatic user creation for non-existent accounts in development

## Core Features Architecture

### Item Management System
- **Dual Item Types**: Separate entities for found and lost items with shared schema patterns
- **AI Integration**: Placeholder endpoints for AI-powered prompt generation from descriptions and images
- **Keyword System**: Array-based keyword storage for search and matching capabilities
- **Image Support**: URL-based image storage with optional image descriptions

### Matching Algorithm
- **Smart Matching**: Backend logic to find potential matches between lost and found items
- **Match Scoring**: Configurable scoring system for ranking match quality
- **Automatic Suggestions**: Real-time matching when users report lost items

### Chat System
- **Real-time Messaging**: Chat interface for users to coordinate item exchanges
- **Chat History**: Persistent message storage with user-based chat retrieval
- **Chat Initialization**: Automatic chat creation when users select item matches
- **Message Polling**: Client-side polling for new messages (ready for WebSocket upgrade)

## External Dependencies

- **Database**: Neon PostgreSQL serverless database for production data storage
- **UI Components**: Radix UI primitives through shadcn/ui for accessible component library
- **Development Tools**: Replit integration with cartographer plugin for development environment
- **Build System**: Vite for fast development builds and esbuild for production bundling
- **Type Safety**: Drizzle Zod for runtime schema validation from database schemas