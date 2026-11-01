# Fullstack Blog Application — Frontend UI

A modern, responsive blogging platform built with **React 19**, **Vite**, **Tailwind CSS**, and **Firebase Authentication**.

## Features

- 🔐 **Firebase Authentication**: Email/Password and Google One-Click OAuth sign-in.
- ✍️ **Rich Text Editor**: Powered by Tiptap with formatting, blockquotes, code blocks, and links.
- 🖼️ **Direct Cloudinary Uploads**: Instant, client-side unsigned image uploads for post covers and rich-text content.
- 🌓 **Dark & Light Mode**: Smooth theme toggling with persistent user preference.
- 📱 **Fully Responsive**: Mobile-first design with drawer menus, responsive cards, and clean typography.
- ⚡ **React Query**: Fast server state management, caching, and optimistic updates.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase and Cloudinary credentials:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
