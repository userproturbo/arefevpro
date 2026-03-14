# AI Coding Rules

These rules define how AI tools (Codex, GPT, etc.) should modify this repository.

The goal is to keep the architecture stable and prevent breaking builds.

---

# General Principles

AI must:

- follow existing patterns
- reuse existing components
- make the smallest possible change
- avoid refactoring unrelated code

Prefer extension over modification.

---

# Project Architecture

This project is a **Next.js App Router application** with a **character-driven navigation system**.

Main systems:

- section navigation
- navigation characters
- section registry
- drawer UI
- dynamic section routing

---

# Allowed Modifications

AI may modify:

components/
hooks/
sections/
icons/

AI may create new components inside these folders if necessary.

---

# Restricted Areas

AI must NOT modify the following systems unless explicitly instructed:

admin/
api/
auth logic
database logic
upload system

These systems are considered stable infrastructure.

---

# Section System

Sections represent top-level navigation destinations.

Examples:

- home
- blog
- photo
- music
- video
- projects

New sections should follow the existing section architecture.

---

# Section Implementation Pattern

When creating a new section:

1. create section component
2. create navigation character
3. add icon
4. register section

Follow the same structure used by existing sections.

---

# Navigation Rules

Navigation icons must remain consistent.

Icons should be located in:

components/icons/

Navigation layout should not be refactored unless necessary.

---

# Character System

Navigation characters are responsible for:

- displaying character portraits
- hover interactions
- sound triggers

Existing character logic should not be rewritten.

Reuse the existing system.

---

# TypeScript Rules

Avoid unsafe assertions like:

value!

Prefer safe fallbacks:

value ?? ""

or

value ?? []

If a prop may be undefined, provide a default value.

---

# Safe Component Patterns

Prefer safe props:

title={title ?? ""}
items={items ?? []}

Avoid passing undefined values into components expecting strict types.

---

# File Creation Rules

Before creating a new file, check if a similar file already exists.

Prefer extending existing components rather than duplicating logic.

---

# Performance Guidelines

Avoid unnecessary re-renders.

Avoid heavy logic in components.

Prefer hooks for reusable behavior.

---

# Deployment Safety

Code must compile with TypeScript.

Build errors must always be resolved before committing.

Do not introduce changes that break production builds.

---

# Change Scope

AI should only modify files directly related to the task.

Avoid touching unrelated files.

Large refactors are not allowed unless explicitly requested.

---

# Commit Style

Use descriptive commit messages:

feat:
fix:
refactor:
docs:

Example:

feat: add Home navigation section

fix: resolve TypeScript error in DrawerContent