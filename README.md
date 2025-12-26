AREFEVPRODUCTION

AREFEVPRODUCTION — это современный веб-проект студийного формата, объединяющий портфолио, блог и медиа-контент (фото, видео, проекты) в едином интерактивном пространстве.
Проект развивается как личная студия AREFEVPRODUCTION, ориентированная на клиентов, заказчиков и творческое самовыражение.

## Локальный запуск

1. `cp .env.example .env` и укажи `DATABASE_URL` + `JWT_SECRET`.
2. Если база ещё не создана (ошибка `database does not exist`), создай её и примени миграции:
   - `createdb -h localhost -p 5433 -U postgres arefevpro`
   - `npx prisma migrate deploy`
3. Запуск:
   - dev: `npm run dev`
   - prod: `npm run build && npm run start`

`npm run dev` и `npm run start` дополнительно делают best-effort `prisma migrate deploy` через `scripts/ensure-db.mjs` и не падают, если база недоступна.

Идея проекта

Сайт задуман как:

Портфолио для демонстрации веб-проектов

Блог о разработке, росте и процессе создания сайтов

Медиа-платформа для фото- и видеоконтента (в том числе съёмка с дрона)

Будущая студийная витрина, формирующая доверие к автору как к профессионалу

Первое впечатление играет ключевую роль — поэтому сайт начинается с выразительного интро AREFEVPRODUCTION, задающего атмосферу и стиль проекта.

✨ Как работает проект сейчас
🔹 Вход на сайт

При первом заходе пользователь видит чистое интро AREFEVPRODUCTION

Интро анимировано:

плавное появление базового слова AREFEVPRO

эффект свечения

затем «печатная» анимация DUCTION с курсором

Интро используется как входная группа, формируя ощущение студийного продукта

🔹 Основная часть сайта

После интро открывается главная страница с динамическим фоном

Навигация реализована через боковое меню

Контент разделён на логические секции:

Projects

Photo

Video

Music

Blog

🔹 Админка

Закрытая административная панель

Управление контентом (посты, типы, публикация)

Встроенная внутренняя аналитика посещений:

общее количество посетителей

общее количество визитов

уникальные посетители за день

Аналитика доступна только супер-админу

🧩 Используемые технологии
Frontend

Next.js (App Router) — основа приложения

React 18

TypeScript

Tailwind CSS — стилизация и анимации

Framer Motion — плавные переходы и интро-анимации

CSS animations — печатный эффект, свечение, курсор

Backend

Next.js API Routes

Prisma ORM

PostgreSQL

JWT-аутентификация (httpOnly cookies)

Middleware для защиты админских маршрутов

Хранилище данных

Users (роли, авторизация)

Posts (контент)

Visitors / Visits (внутренняя аналитика)

🔐 Безопасность и доступ

Авторизация через JWT

Админка доступна только пользователям с ролью ADMIN

Расширенные права для супер-админа (user.id === 1)

Аналитика и системные данные скрыты от публичных пользователей

🛠 Текущее состояние проекта

✅ Реализовано:

Архитектура проекта

Интро-анимация AREFEVPRODUCTION

Навигация и layout

Админка и управление контентом

Внутренняя аналитика посещений

🚧 В разработке / планируется:

Адаптация под мобильные устройства

Three.js-сцены и интерактив

Медиа-галереи (фото / видео)

Улучшение визуального языка сайта

Расширение студийного позиционирования

🎯 Цель проекта



                     
                     ┌───────────────────────────┐
                     │        Пользователи        │
                     │  (Браузер / Мобильный)     │
                     └─────────────┬─────────────┘
                                   │ HTTPS
                                   ▼
                      ┌────────────────────────┐
                      │       Cloudflare        │
                      │  DNS + CDN + SSL Proxy  │
                      └─────────────┬───────────┘
                                    │
                        https://crazylife.com
                                    │
                                    ▼
                 ┌──────────────────────────────────┐
                 │              VPS                  │
                 │      (Ubuntu / Docker / PM2)      │
                 └─────────────────┬────────────────┘
                                   │
                     ┌─────────────┼─────────────┐
                     │                             │
                     ▼                             ▼
        ┌──────────────────────┐        ┌────────────────────────┐
        │      Next.js App     │        │     PostgreSQL DB      │
        │  Frontend + Backend  │        │   posts, users, media  │
        │    /app, /api        │        │ URLs, comments, likes  │
        └──────────────────────┘        └────────────────────────┘
                     │
                     │ API (upload, create post)
                     ▼
       ┌────────────────────────────────────────────┐
       │                Cloudflare R2               │
       │     Объектное хранилище медиа-файлов       │
       │     (Photos / Videos / Music / Covers)     │
       └────────────────────────────────────────────┘
                     │
                     │ CDN delivery (super fast)
                     ▼
        
Финальная архитектура проекта

            Пользователь (СНГ)
                   │
                   ▼
         ┌─────────────────────┐
         │  Российский VPS   │  ← тут сайт + бот
         │  (Backend + Next.js)│
         └─────────────────────┘
                   │
       Запросы к OpenAI API — работают!
                   │
                   ▼
            OpenAI (США/Европа)
                   
                   ▲
                   │  ссылки на медиа
                   │
        ┌─────────────────────────┐
        │   Российское облако     │ ← Яндекс / VK / Selectel
        │ (фото, видео, музыка)  │
        └─────────────────────────┘

                 Пользователь (СНГ)
                          │
                          ▼
         ┌────────────────────────────────┐
         │        Российский VPS          │
         │ ───────────────────────────────│
         │  • Next.js сайт (Frontend+SSR) │
         │  • Backend API (Node.js)       │
         │  • Telegram/Discord бот        │
         │  • Авторизация / БД / логика   │
         └────────────────────────────────┘
             │                  │
             │                  │ ссылки на файлы
             ▼                  ▼
       OpenAI API        Яндекс Object Storage
  (генерация текста,     (фото, видео, музыка,
   функции бота)           документы, архивы)


-----------------------------------------------------

Архитектура сайта в 2005–2010 (до эпохи облаков)

Пользователь
     │
     ▼
 ┌──────────┐
 │   Nginx  │  ← отдаёт HTML, CSS, изображения, видео
 └──────────┘
       │
       ▼
 ┌──────────┐
 │ Backend  │  ← PHP, Perl, Python, позже NodeJS
 └──────────┘
       │
       ├─────────────►  /var/www/uploads/   (файлы прямо на диске)
       │
       └─────────────►  MySQL / PostgreSQL  (только текстовые данные)


26.12.25

спасибо codex всё сделал, надеюсь что он ничего лишнего не добавил))
app/
├── (sections)/
│   └── [section]/
│       └── page.tsx
├── admin/
│   ├── blog/
│   │   ├── [id]/
│   │   │   └── edit/
│   │   │       └── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── BlogEditor.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── StatusBadge.tsx
│   ├── create-post/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── posts/
│   │   ├── [id]/
│   │   │   └── edit/
│   │   │       └── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── DeletePostButton.tsx
│   │   ├── page.tsx
│   │   └── PostForm.tsx
│   ├── .DS_Store
│   ├── layout.tsx
│   ├── LogoutButton.tsx
│   ├── page.tsx
│   └── VisitorStats.tsx
├── api/
│   ├── admin/
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── stats/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── auth/
│   │   ├── guest/
│   │   │   └── route.ts
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── logout/
│   │   │   └── route.ts
│   │   └── register/
│   │       └── route.ts
│   ├── comments/
│   │   └── [id]/
│   │       └── route.ts
│   ├── health/
│   │   └── route.ts
│   ├── login/
│   │   └── route.ts
│   ├── logout/
│   │   └── route.ts
│   ├── me/
│   │   └── route.ts
│   ├── posts/
│   │   ├── [slug]/
│   │   │   ├── comments/
│   │   │   │   └── route.ts
│   │   │   ├── like/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── route.ts
│   ├── profile/
│   │   └── route.ts
│   ├── upload/
│   │   └── route.ts
│   ├── visit/
│   │   └── route.ts
│   └── .DS_Store
├── blog/
│   ├── [slug]/
│   │   └── page.tsx
│   ├── AnimatedContent.tsx
│   ├── BlogSection.tsx
│   ├── BlogShell.tsx
│   ├── BlogSidebar.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── template.tsx
├── components/
│   ├── buttons/
│   │   └── LikeButton.tsx
│   ├── comments/
│   │   └── CommentsPanel.tsx
│   ├── navigation/
│   │   └── NavigationOverlay.tsx
│   ├── panel/
│   │   ├── content/
│   │   │   ├── PhotoContent.tsx
│   │   │   ├── PlaceholderContent.tsx
│   │   │   └── ProjectsContent.tsx
│   │   └── RightSidePanel.tsx
│   ├── section/
│   │   └── SectionLayout.tsx
│   ├── .DS_Store
│   ├── AboutSection.tsx
│   ├── AnimatedSection.tsx
│   ├── EntranceScreen.tsx
│   ├── FacesSection.tsx
│   ├── GuestLoginModal.tsx
│   ├── Hero.tsx
│   ├── HeroSection.tsx
│   ├── HeroText.tsx
│   ├── Intro.tsx
│   ├── IntroStrip.tsx
│   ├── MainHeader.tsx
│   ├── MainSection.tsx
│   ├── Navbar.tsx
│   ├── PageContainer.tsx
│   ├── PostCard.tsx
│   ├── PostsSection.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectsGrid.tsx
│   ├── SecretAdmin.tsx
│   ├── SidebarNav.tsx
│   └── SoftBackground.tsx
├── login/
│   ├── LoginForm.tsx
│   └── page.tsx
├── music/
│   └── page.tsx
├── photo/
│   └── page.tsx
├── post/
│   ├── [slug]/
│   │   └── page.tsx
│   └── PostMedia.tsx
├── profile/
│   └── page.tsx
├── projects/
│   └── page.tsx
├── register/
│   └── page.tsx
├── video/
│   └── page.tsx
├── .DS_Store
├── favicon.ico
├── globals.css
├── layout.tsx
├── page.tsx
├── providers.tsx
└── types.ts
