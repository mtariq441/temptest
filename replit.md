# Overview

This is a full-stack web application for a premium website template marketplace called "TemplateHub". The platform allows users to browse, purchase, and download professional website templates. It features user authentication through Replit's OAuth system, payment processing via Stripe, template management, reviews, and an admin dashboard for managing templates and categories.

The application is built as a monorepo with a React frontend and Express.js backend, using PostgreSQL for data persistence and modern web technologies throughout.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with conditional rendering based on authentication state
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation schemas
- **Payment Integration**: Stripe Elements for secure payment processing

The frontend follows a page-based architecture with shared components and hooks. Authentication state drives the routing logic, showing a landing page for unauthenticated users and the full application for authenticated users.

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth using OpenID Connect with Passport.js
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Multer for handling template file uploads
- **Payment Processing**: Stripe server-side integration
- **Development**: Vite middleware integration for hot reloading

The backend uses a layered architecture with:
- Route handlers for API endpoints
- Storage layer abstraction for database operations
- Authentication middleware for protected routes
- Error handling middleware

## Data Storage
- **Primary Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Well-defined relational schema with proper foreign key relationships
- **Session Storage**: PostgreSQL table for session persistence
- **File Storage**: Local file system for uploaded templates (configurable)

Key entities include users, categories, templates, orders, order items, and reviews with proper relationships and constraints.

## Authentication & Authorization
- **Provider**: Replit Auth (OpenID Connect)
- **Session Management**: Server-side sessions with PostgreSQL persistence
- **Authorization**: Role-based access control with admin flag
- **Security**: HTTPS-only cookies, CSRF protection, and secure session configuration

The system distinguishes between regular users and administrators, with different access levels to various features.

# External Dependencies

## Third-Party Services
- **Replit Auth**: OpenID Connect authentication provider
- **Stripe**: Payment processing for template purchases
- **Neon Database**: Serverless PostgreSQL hosting

## Key Libraries & Frameworks
- **Frontend**: React, Wouter, TanStack React Query, shadcn/ui, Tailwind CSS, React Hook Form, Zod
- **Backend**: Express.js, Drizzle ORM, Passport.js, Multer, Stripe SDK
- **Development**: Vite, TypeScript, ESBuild
- **UI Components**: Radix UI primitives with custom styling

## Build & Deployment
- **Build System**: Vite for frontend, ESBuild for backend
- **Development**: Integrated Vite dev server with Express
- **Environment**: Node.js with ES modules
- **Database Migrations**: Drizzle Kit for schema management

The application is designed to run on Replit's platform with specific integrations for their authentication system and development environment.