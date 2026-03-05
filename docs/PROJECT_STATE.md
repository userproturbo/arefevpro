AREFEVPRO — Project Context
Overview

AREFEVPRO is a full-stack personal media platform built with Next.js (App Router).

The project combines:

portfolio

media publishing

blogging

photo galleries

video hosting

music content

user interaction (likes, comments, notifications)

The site is designed as an interactive cinematic interface, where navigation is performed through characters on a stage rather than traditional menus.

The application contains:

public media platform

user interaction system

admin CMS

media storage system

interactive scene-based UI

Core Concept

The UI is built around a scene-driven navigation system.

The homepage works like a character selection screen, where each section of the site is represented by an interactive character.

Characters react to hover and click interactions and lead to different sections of the site.

Navigation is character-driven, not menu-driven.

Main Sections

Public sections of the site:

Home

Photo

Drone

Music

Blog

Projects

Video

Each section corresponds to a page inside the Next.js App Router.

Examples:

/photo
/photo/[slug]
/photo/[slug]/[photoId]

/blog
/blog/[slug]

/video
/music
/drone
Scene Architecture

The UI is built around a stage system.

The stage contains characters representing sections of the site.

Stage
 ├ Character (Start)
 ├ Character (Photo)
 ├ Character (Drone)
 ├ Character (Music)
 └ Character (Blog)

Each character has:

idle state

action state

hover animation

sound trigger

motion amplification

Interaction logic:

hover → character activates
hover leave → character returns to idle
click → navigation to section
Scene Engine

A lightweight Scene Engine was introduced to support scene-driven UI.

Location:

engine/
 ├ SceneEngine.tsx
 ├ ActorRenderer.tsx
 └ sceneTypes.ts

Scenes are defined declaratively:

scenes/
 └ homeScene.ts

Scene structure:

Scene
 └ Actors
      ├ component
      ├ position
      └ props

Actors are rendered through a generic ActorRenderer with absolute positioning.

This architecture allows scenes to evolve toward game-like UI composition.

Character Navigation System

Navigation between sections is character-based.

When a character is clicked:

/music?character=music
/photo?character=photo
/blog?character=blog

This enables character state transfer between pages.

A shared navigation store persists the selected character:

store/navigationStore.ts

This system enables cinematic transitions between scenes.

Hero Transition System

Each section has a hero character component:

MusicSceneHero
PhotoSceneHero
DroneSceneHero
BlogSceneHero

A shared hook manages hero entry animation:

hooks/useHeroTransition.ts

Responsibilities:

detect character-based navigation

trigger cinematic entry animation

clear navigation state after animation

Hero entry animation includes:

scale animation

opacity transition

blur fade-out

background reveal

Cinematic Content Reveal

Section content appears after the hero animation.

A reusable component manages this behavior:

SectionContentReveal.tsx

Content reveal animation:

initial:
opacity: 0
y: 20px

animate:
opacity: 1
y: 0

Content is delayed slightly to create a staged cinematic reveal.

Visual sequence:

hero character appears
↓
short pause
↓
content fades in
Motion System

Animations use:

requestAnimationFrame

Framer Motion

motion values

spring smoothing

The motion system supports:

hover progress

intent delay

enter/leave velocity

depth motion

proximity reactions

Character System

Base component:

LayeredNavCharacter

Features:

idle image

action image

hover motion

sound playback

depth animation

Characters are rendered inside the navigation stage.

Audio System

Each character has its own sound effect.

Example mapping:

Photo → camera shutter
Drone → drone sound
Music → music cue
Blog → drawing sound

Hover sound behavior:

hover enter → sound plays
hover leave → sound stops and resets

Audio playback uses a single reusable audio instance to prevent stacking.

Audio assets are stored in:

public/audio/

Example files:

Phew-action.mp3
Phew-idle.mp3
Layout

Homepage layout:

height: 100vh
overflow: hidden
flex stage layout

Characters use responsive sizing:

width: clamp(210px, 18vw, 320px)
gap: clamp(0px, 0.8vw, 10px)

There is no vertical scroll on the homepage.

Backend Architecture

Backend is implemented using Next.js API routes.

Structure:

app/api/

Major API groups:

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

Authentication

Authentication uses:

JWT

auth cookies

Endpoints:

/api/auth/login
/api/auth/logout
/api/auth/register
/api/me
Media Platform

The site supports multiple media types:

photos

videos

audio

blog media

Media files are stored in:

Yandex Cloud Object Storage

Uploads use presigned URLs.

Upload flow:

Client → request presign URL
Backend → generate presigned PUT
Client → upload directly to storage
Backend → store public URL
Photo System

Photo section structure:

/photo
/photo/[slug]
/photo/[slug]/[photoId]

Features:

album system

grid view

viewer/lightbox

likes

comments

Viewer supports fast navigation between images.

Video System

Video section supports:

embed videos

uploaded videos

thumbnails

Admin panel supports:

upload

embed links

publish toggle

Large files upload directly to Object Storage via presigned URLs.

Comment System

Comments support:

threaded replies

likes

deletion by author

Endpoints:

/api/posts/[slug]/comments
/api/photos/[photoId]/comments
/api/videos/[videoId]/comments
Notification System

Users receive notifications when someone replies to their comment.

Features:

notification list

unread indicator

link to content

Endpoints:

/api/notifications
/api/notifications/[id]/read
Admin System

Admin panel located at:

/admin

Admin capabilities:

create/edit posts

manage blog

manage photo albums

upload media

manage videos

view statistics

ban/unban users

Admin API endpoints:

/api/admin/posts
/api/admin/albums
/api/admin/photos
/api/admin/videos
/api/admin/users
Database

Database:

PostgreSQL

ORM:

Prisma

Located in:

prisma/schema.prisma

Migrations stored in:

prisma/migrations
Infrastructure

Production environment:

Yandex Cloud VPS

Server specs:

2 vCPU
4 GB RAM
20 GB disk

Architecture:

Domain → Nginx → Next.js (3000)
                ↓
             PostgreSQL

Media files stored in:

Yandex Object Storage
Deployment

Deployment uses:

GitHub Actions

PM2

Nginx

Process:

push → GitHub
CI → SSH to server
build → restart PM2
Security

Server security includes:

SSH key authentication

Fail2Ban

UFW firewall

HTTPS via Let's Encrypt

security headers

Current Development Stage

The project is currently in the stage:

Cinematic Interaction Polish

Core systems implemented:

scene-driven navigation

character interaction system

scene engine architecture

hero transition system

cinematic content reveal

audio interaction system

media platform

admin CMS

API infrastructure

Current work focuses on:

interaction polish

animation refinement

scene realism