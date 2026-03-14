# AI Architecture Map

This file explains the architecture of the project so AI tools (Codex, GPT, etc.) can safely modify the codebase.

---

# Project Type

Next.js App Router application with a character-driven navigation system.

Main concepts:

- sections
- navigation characters
- section registry
- drawer interface
- dynamic section routing

---

# Core Navigation System

Navigation is driven by **sections**.

Each section has:

- icon
- character portrait
- section component
- preview component

Sections include:

- home
- blog
- photo
- music
- video
- projects

---

# Section Rendering

Dynamic routing is handled by:

app/(sections)/[section]/page.tsx

The section content is rendered using section components.

---

# Character Navigation

Character navigation components are located in:

components/home/

Examples:

- BlogNavCharacter.tsx
- PhotoNavCharacter.tsx
- MusicNavCharacter.tsx
- DroneNavCharacter.tsx

---

# Section Components

Section components are located in:

components/section/

Examples:

- HomeSection.tsx
- BlogSection.tsx
- PhotoSection.tsx
- MusicSection.tsx

---

# Icons

Navigation icons are located in:

components/icons/

---

# Drawer System

The drawer UI is located in:

components/drawer/

Key file:

DrawerContent.tsx

---

# Files that should NOT be modified by AI

AI tools must not modify:

- admin/*
- api/*
- authentication logic
- database logic

These systems are considered stable infrastructure.

---

# Safe Extension Pattern

When adding a new section:

1. Add entry to `sectionRegistry`
2. Add section component
3. Add icon
4. Add navigation character

Avoid modifying core navigation logic.

---

# Coding Guidelines

AI should follow existing patterns.

Do not introduce new architecture.

Prefer minimal changes.

Avoid refactoring unrelated files.