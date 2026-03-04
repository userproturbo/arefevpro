# AI Task Template

Use this template when asking an AI assistant (Codex, ChatGPT, Cursor, Claude) to implement features in the AREFEVPRO project.

Always include enough context so the AI understands the architecture and does not break existing systems.

---

# Task

Describe clearly what needs to be implemented.

Example:

Implement hover-based ambient glow for characters on the homepage stage.

---

# Project Context

This project is AREFEVPRO, a full-stack media platform built with:

- Next.js App Router
- TypeScript
- Prisma + PostgreSQL
- TailwindCSS
- Framer Motion
- Yandex Object Storage

Navigation is **character-driven** and the homepage is a **cinematic stage** with interactive characters.

The codebase uses modular UI components and a scene-driven interface.

---

# Relevant Files

List files that the AI should read or modify.

Example:

app/page.tsx  
components/character/LayeredNavCharacter.tsx  
components/navigation/NavImages.tsx  
hooks/useHoverSound.ts  

---

# Existing Behavior

Describe how the system currently works.

Example:

Characters have two visual layers:

idle image  
action image

When hovering:

- action image fades in
- sound plays
- motion amplitude increases

When hover ends:

- action image fades out
- motion returns to idle state

---

# Desired Behavior

Describe what the new feature should do.

Example:

Add a subtle glow effect behind the character when hovered.

Glow should:

- fade in smoothly
- follow hover progress
- disappear when hover ends
- not affect layout
- remain performant

---

# Constraints

Important rules the AI must respect.

Example:

- Do not break existing hover logic.
- Do not introduce new heavy dependencies.
- Use existing motion system (Framer Motion or rAF).
- Keep the component reusable.

---

# Expected Output

Describe what the AI should produce.

Example:

Provide:

1. Updated component code
2. Explanation of the change
3. Any new helper functions if needed

---

# Notes

Add any additional notes for the AI.

Example:

The animation should feel cinematic but subtle.
Avoid flashy effects.