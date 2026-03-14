# Section System

This document explains how the section navigation system works.

The project uses a **section-based architecture** where each main part of the site is represented as a section.

Examples of sections:

- home
- blog
- photo
- music
- video
- projects

Each section corresponds to a navigation icon, character view, and content panel.

---

# Section Architecture

Every section consists of the following parts:

1. Section component
2. Navigation icon
3. Navigation character
4. Section registry entry

---

# 1. Section Component

Section components are located in:

components/section/

Examples:

components/section/HomeSection.tsx  
components/section/BlogSection.tsx  
components/section/PhotoSection.tsx  

A section component is responsible for rendering the main content.

Example structure:

```tsx
export default function HomeSection() {
  return (
    <div>
      <h1>Home</h1>
    </div>
  )
}