# AREFEVPRO — AI Project Context

This document provides context for AI assistants working with this repository.

The goal is to help the AI understand the architecture, conventions, and core concepts of the project so it can generate correct code and modifications.

---

# Project Overview

AREFEVPRO is a full-stack personal media platform built with **Next.js (App Router)**.

The platform combines:

- portfolio
- photo galleries
- video content
- music content
- blogging
- social interaction (likes, comments, notifications)
- admin CMS

The site is designed as a **cinematic interactive interface** where navigation is character-driven.

Users interact with characters on a stage rather than traditional navigation menus.

---

# Core Concept

The homepage works as a **character selection screen**.

Each section of the website is represented by a **character** placed on a cinematic stage.

Interaction model:

hover → character activates  
click → navigate to section

Characters represent site sections.

Example mapping:

Start → home scene  
Photo → photo gallery  
Drone → drone footage  
Music → audio content  
Blog → blog articles  

---

# Technology Stack

Frontend

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- Framer Motion

Backend

- Next.js API routes
- Prisma ORM
- PostgreSQL

Infrastructure

- Nginx reverse proxy
- PM2 process manager
- Yandex Cloud VPS
- Yandex Object Storage (S3 compatible)

---

# Repository Structure

Main folders:


app/ → UI pages and components
app/api/ → server API routes
app/admin/ → admin panel
components/ → reusable UI components
lib/ → domain logic and utilities
store/ → global client state
prisma/ → database schema and migrations
scripts/ → infrastructure scripts
public/ → static assets


---

# UI Architecture

The interface uses a **scene-driven structure**.

The homepage contains a stage with interactive characters.

Structure:


Stage
├ Character
├ Character
├ Character
└ Character


Each character includes:

- idle image
- action image
- hover animation
- sound trigger
- motion behavior

Base component:


LayeredNavCharacter


---

# Motion System

Animations are implemented using:

- requestAnimationFrame
- Framer Motion
- motion values
- spring smoothing

Motion features:

- hover progress
- intent delay
- depth movement
- proximity interaction
- smooth spring transitions

---

# Audio System

Characters trigger sounds when activated.

Examples:

Photo → camera shutter  
Drone → drone sound  
Music → music cue  
Blog → drawing sound  

Sounds are synchronized with hover animation progress.

---

# Layout

Homepage layout rules:

- height: 100vh
- overflow: hidden
- no vertical scroll

Characters use responsive sizing:


width: clamp(210px, 18vw, 320px)


---

# Media Platform

The platform supports multiple media types:

- photos
- videos
- audio
- blog media

Media files are stored in **Yandex Object Storage**.

Uploads use **presigned URLs**.

Upload flow:


Client → request presigned URL
Backend → generate presigned PUT
Client → upload directly to storage
Backend → store public URL


---

# Photo System

Photo pages:


/photo
/photo/[slug]
/photo/[slug]/[photoId]


Features:

- album structure
- grid gallery
- fullscreen viewer
- thumbnail strip
- likes
- comments

Viewer is implemented as an immersive viewing mode.

---

# Video System

Video section supports:

- uploaded videos
- embedded videos
- thumbnails

Large files are uploaded directly to Object Storage via presigned URLs.

---

# Comment System

Comments support:

- threaded replies
- likes
- author deletion

Used in:

- blog posts
- photos
- videos

---

# Notifications

Users receive notifications when someone replies to their comments.

Features:

- notification list
- unread indicator
- navigation to original content

---

# Authentication

Authentication system:

- JWT
- auth cookies

Endpoints:


/api/auth/login
/api/auth/logout
/api/auth/register
/api/me


---

# Admin Panel

Admin panel is located at:


/admin


Admin capabilities:

- create/edit posts
- manage photo albums
- upload media
- manage videos
- manage users
- view statistics

---

# Database

Database: PostgreSQL

ORM: Prisma

Location:


prisma/schema.prisma


Migrations:


prisma/migrations


---

# Deployment

Production server:

Yandex Cloud VPS

Server specs:

- 2 vCPU
- 4 GB RAM
- 20 GB disk

Network architecture:


Domain
↓
Nginx
↓
Next.js (port 3000)
↓
PostgreSQL (local)


Media storage:

Yandex Object Storage.

---

# Development Guidelines for AI

When modifying the project:

1. Follow existing folder structure.
2. Use TypeScript.
3. Keep UI components modular.
4. Avoid breaking existing API routes.
5. Prefer reusable components.
6. Respect existing naming conventions.
7. Do not introduce heavy dependencies without reason.

---

# Current Development Stage

Project status:

Cinematic Interaction Polish

Core systems already implemented:

- navigation characters
- motion engine
- audio system
- media platform
- admin CMS
- API layer

Remaining work focuses on UX polish and motion improvements.