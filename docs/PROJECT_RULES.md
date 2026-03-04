# AREFEVPRO — Project Development Rules

This file defines coding and architecture rules for AI assistants working with this repository.

AI tools (Codex, ChatGPT, Cursor, etc.) must follow these rules when generating or modifying code.

---

# General Principles

1. Do not change the architecture of the project.
2. Follow the existing folder structure.
3. Prefer extending existing systems rather than creating new ones.
4. Keep components reusable and modular.
5. Avoid introducing unnecessary dependencies.

---

# Technology Stack

Frontend:

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- Framer Motion

Backend:

- Next.js API routes
- Prisma ORM
- PostgreSQL

Infrastructure:

- Nginx
- PM2
- Yandex Cloud
- Yandex Object Storage

AI must not introduce frameworks outside this stack.

---

# File Structure Rules

Main directories:

app/ → pages and layouts  
app/api/ → backend API routes  
app/admin/ → admin panel  
components/ → reusable UI components  
lib/ → domain logic and utilities  
store/ → client state management  
prisma/ → database schema and migrations  
scripts/ → infrastructure scripts  

AI must respect this structure.

---

# Component Rules

All React components must:

- be written in TypeScript
- be functional components
- follow the existing naming conventions

Example:


LayeredNavCharacter.tsx
PhotoViewer.tsx
CommentsPanel.tsx


Do not introduce class components.

---

# UI Design Rules

The UI follows a **cinematic interface style**.

Key rules:

- minimal UI clutter
- focus on motion and interaction
- subtle animations
- no heavy visual effects

Homepage must remain **100vh stage layout with no vertical scroll**.

---

# Motion Rules

Animations must use existing systems:

- Framer Motion
- requestAnimationFrame motion loops
- motion values

Avoid adding animation libraries such as:

- GSAP
- anime.js

unless explicitly required.

---

# Character Navigation Rules

The homepage navigation is **character-driven**.

Characters represent site sections.

Each character must support:

- idle state
- hover activation
- click navigation
- sound playback
- motion amplification

New navigation elements must follow this model.

---

# Media Upload Rules

Media files must not be uploaded through the main server.

Uploads must use **presigned URLs** and direct upload to Object Storage.

Flow:

Client → request presigned URL  
Client → upload directly to storage  
Backend → store public URL in database

AI must not introduce server-side streaming uploads.

---

# API Rules

All backend logic must be implemented using **Next.js API routes**.

Endpoints must follow REST conventions.

Example:


GET /api/posts
GET /api/posts/[slug]
POST /api/posts/[slug]/comments
POST /api/posts/[slug]/like


Do not create GraphQL or other API systems.

---

# Database Rules

Database access must use **Prisma**.

Do not write raw SQL unless necessary.

Schema location:


prisma/schema.prisma


Any schema change must include a Prisma migration.

---

# State Management Rules

Client state must use the existing store system.

Current stores include:


store/appStore.ts
store/navigationStore.ts
store/useSectionDrawerStore.ts


Do not introduce Redux or other state libraries.

---

# Performance Rules

The project prioritizes performance.

Avoid:

- large client bundles
- unnecessary rerenders
- blocking animations

Prefer:

- requestAnimationFrame loops
- motion values
- lightweight components

---

# Admin Panel Rules

Admin features must remain inside:


/app/admin


Admin API endpoints must be inside:


/api/admin


Admin functionality must not leak into the public API.

---

# Security Rules

Never expose:

- database credentials
- storage keys
- internal server logic

All secrets must come from environment variables.

---

# Code Style Rules

Follow existing style conventions:

- clear variable names
- small reusable functions
- minimal nesting
- readable code

Avoid overly complex abstractions.

---

# When Adding Features

When implementing a new feature:

1. Identify existing components that can be reused.
2. Extend current systems instead of creating parallel ones.
3. Keep UI consistent with the cinematic design.
4. Avoid breaking existing API endpoints.

---

# If Uncertain

If a change could break architecture:

- do not implement automatically
- propose a solution instead