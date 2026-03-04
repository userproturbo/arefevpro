# AREFEVPRO — Architecture Overview

This document explains the high-level architecture of the AREFEVPRO project.

It is intended for developers and AI assistants working with this repository.

For general project information see:

- AI_CONTEXT.md
- PROJECT_CONTEXT.md
- PROJECT_RULES.md

---

# High-Level Architecture

AREFEVPRO is a **full-stack monolithic application** built with Next.js.

The project contains:

- public media platform
- interactive UI system
- admin CMS
- REST API
- media storage integration

Architecture layers:

Client (Browser)
↓
Next.js UI (React)
↓
Next.js API Routes
↓
Domain Services
↓
Prisma ORM
↓
PostgreSQL

External services:

Object Storage (Yandex Cloud)

---

# System Layers

## 1. UI Layer

Location:

app/
components/

This layer contains all user-facing interfaces.

Responsibilities:

- rendering pages
- navigation
- user interaction
- animations
- media viewing

Key technologies:

- React
- TypeScript
- TailwindCSS
- Framer Motion

---

## 2. Scene Navigation System

The homepage uses a **character-driven cinematic navigation system**.

Instead of traditional menus, users interact with characters placed on a stage.

Structure:

Stage
 ├ Character
 ├ Character
 ├ Character
 └ Character

Each character represents a section of the website.

Example mapping:

Home → landing page  
Photo → photo galleries  
Drone → aerial video/media  
Music → audio content  
Blog → blog posts  

Characters support:

- idle state
- hover activation
- click navigation
- sound effects
- motion amplification

Primary components:

components/character/
components/navigation/

---

## 3. Motion System

Animations are implemented using a hybrid motion system.

Technologies:

- Framer Motion
- requestAnimationFrame loops
- motion values
- spring interpolation

Features:

- hover progress animation
- depth motion
- intent delay
- proximity reactions
- cinematic transitions

The motion system prioritizes **smooth interaction and performance**.

---

## 4. Media Platform

The platform supports multiple media types:

- photos
- videos
- audio
- blog media

Media files are **not stored on the main server**.

Instead they are stored in:

Yandex Cloud Object Storage.

Upload flow:

Client → request presigned URL  
Backend → generate presigned PUT URL  
Client → upload directly to storage  
Backend → store public URL in database

Benefits:

- reduced server load
- scalable storage
- large file support

---

## 5. Content Systems

The platform includes several content modules.

### Photo System

Routes:

/photo  
/photo/[slug]  
/photo/[slug]/[photoId]

Features:

- albums
- responsive grid gallery
- fullscreen viewer
- thumbnail navigation
- likes
- comments

---

### Video System

Supports:

- uploaded video files
- embedded videos
- preview thumbnails

Large files are uploaded directly to Object Storage.

---

### Blog System

Routes:

/blog  
/blog/[slug]

Blog posts support:

- structured content blocks
- embedded media
- comments
- likes

---

### Music System

Supports audio content such as:

- tracks
- radio recordings
- audio posts

Audio can be attached to blog posts or standalone entries.

---

## 6. Social Interaction System

Users can interact with content via:

- likes
- comments
- replies
- notifications

Comments support:

- threaded replies
- comment likes
- deletion by author

Notifications are triggered when someone replies to a user’s comment.

---

## 7. Authentication System

Authentication uses:

- JWT tokens
- HTTP cookies

Endpoints:

/api/auth/login  
/api/auth/logout  
/api/auth/register  
/api/me  

Users can:

- create accounts
- log in
- interact with content

---

## 8. Admin CMS

Admin interface located at:

/admin

Responsibilities:

- create and edit posts
- manage photo albums
- upload media
- manage videos
- moderate users
- view site statistics

Admin API endpoints are separated:

/api/admin/*

This ensures admin functionality is isolated from the public API.

---

## 9. Backend API Layer

Backend logic is implemented using **Next.js API Routes**.

Location:

app/api/

Main API modules:

auth  
posts  
photos  
videos  
comments  
notifications  
admin  
upload  
presence  
visit  

All endpoints follow REST conventions.

---

## 10. Domain Services

Domain logic is located in:

lib/

Examples:

auth.ts  
media.ts  
slug.ts  
rateLimit.ts  
youtube.ts  

Responsibilities:

- business logic
- helper utilities
- shared services

---

## 11. Database Layer

Database:

PostgreSQL

ORM:

Prisma

Schema location:

prisma/schema.prisma

Database responsibilities:

- users
- posts
- media
- comments
- likes
- notifications
- albums
- videos

All schema changes must use Prisma migrations.

---

## 12. Client State Management

Global UI state is managed through local stores.

Location:

store/

Examples:

appStore.ts  
navigationStore.ts  
useSectionDrawerStore.ts  

These stores manage UI behavior such as navigation state and drawers.

---

## 13. Infrastructure

Production environment:

Yandex Cloud VPS

Server specs:

2 vCPU  
4 GB RAM  
20 GB disk  

Network architecture:

Domain
↓
Nginx (reverse proxy)
↓
Next.js application (port 3000)
↓
PostgreSQL (local)

Media files are stored in Object Storage.

---

## 14. Deployment

Deployment pipeline:

GitHub → CI workflow → SSH deployment → PM2 restart

Tools:

GitHub Actions  
PM2  
Nginx  

Application runs as a PM2 process.

---

# Architectural Principles

The project follows several architectural principles:

1. Modular component structure
2. Scene-based UI navigation
3. Media-first content platform
4. Separation of public and admin APIs
5. Externalized media storage
6. Performance-focused motion system

---

# Current Project State

Current development stage:

Cinematic Interaction Polish

Core systems are already implemented.

Remaining work mainly involves:

- motion polish
- visual improvements
- interaction refinements