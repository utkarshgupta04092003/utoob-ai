# uToob AI

A full-stack, config-driven SaaS web application that turns YouTube videos into structured content, summaries, notes, quizzes, interactive chat, and viral social media posts using the power of AI.

## Features

- **Multi-Model Support:** Choose between OpenAI (GPT-4o Mini) and Google Gemini (1.5 Flash).
- **Interactive AI Chat:** Ask questions and chat directly with any video to extract deep insights instantly.
- **Local API Keys:** API keys are stored securely in your browser's `localStorage` and never saved to the database.
- **YouTube Ingestion:** Paste a YouTube URL to automatically extract its transcript.
- **Dynamic Generation:** Generate detailed summaries, structured notes, and multiple-choice quizzes on demand.
- **Social Media Engine:** Automatically generate highly engaging, hook-driven content formatted for LinkedIn and Twitter.
- **Premium Design System:** Modern, theme-aware UI (Light/Dark Mode) with glassmorphism and custom responsive mockups.
- **Config-Driven Branding:** Centralized application name and global configuration in `lib/config.ts` for easy customization.
- **Auth-Aware UX:** Intelligent landing page that dynamically toggles between Dashboard and Sign-In actions based on authentication status.
- **Secure Authentication:** Managed via NextAuth.js (Credentials Provider).

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion, Radix UI
- **Database:** MongoDB
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **AI SDKs:** OpenAI API, `@google/generative-ai`

## Getting Started

### 1. Clone & Install

Ensure you have Node.js installed, then install the project dependencies:
\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables

Create a \`.env\` file in the root directory and add the following keys:
\`\`\`env

# Your MongoDB connection string

DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/utube-ai?retryWrites=true&w=majority"

# NextAuth configuration

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-me-in-production"

# Supadata API (for YouTube transcripts)

# Sign up at: https://dash.supadata.ai

SUPADATA_API_KEY="your_supadata_api_key_here"
\`\`\`

### 3. Database Setup

Push the Prisma schema to your MongoDB instance and generate the Prisma Client:
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

### 4. Run the Development Server

Start the Next.js local development server:
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

All core configurations (prompts, model names, and limits) are centralized in \`lib/config.ts\`. You can easily tweak the AI output style or swap models without digging through the API routes.
