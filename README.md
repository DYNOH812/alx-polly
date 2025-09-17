📍 Capstone Part 1: Planning with AI
🎯 Project Idea

Project Title: Alx Polly – Realtime Polling App

Description:
Alx Polly is a Next.js + Supabase application that allows users to create polls, vote in real-time, and share results via links or QR codes. The goal is to make decision-making transparent, interactive, and engaging for teams, classrooms, and communities.

This project matters because it provides a simple way to capture group sentiment instantly, making collaboration and participation more meaningful.

🛠️ Tech Stack

Languages: TypeScript, JavaScript

Frameworks/Libraries: Next.js (App Router), React, Tailwind CSS, ShadCN UI

Backend/Database: Supabase (Postgres, Auth, Realtime, Storage)

Deployment: Vercel (frontend) + Supabase cloud backend

Dev Tools: GitHub, ESLint, Prettier, Husky

🧠 AI Integration Plan
🧱 1. Code or Feature Generation

AI will scaffold and accelerate repetitive coding tasks:

Generate React components (poll forms, result charts, modal dialogs).

Scaffold Next.js routes and layouts.

Draft Supabase client queries for CRUD operations.

Suggest UI refinements (responsive design, accessibility).

Sample Prompt:

“Generate a Next.js server action that inserts a new poll with a question and options into Supabase, validating that at least two options exist.”

🧪 2. Testing Support

AI will help generate test cases and edge scenarios:

Unit tests: Supabase queries and data validation.

Integration tests: Poll creation → voting → real-time update.

End-to-end tests: Using Playwright to simulate user interactions.

Sample Prompt:

“Write Playwright e2e tests for creating a poll, submitting votes, and verifying live updates on the results page.”

📡 3. Schema-Aware / API-Aware Generation

AI will be fed project schema and API details:

Supabase schema (polls, options, votes tables).

Generate SQL queries and TypeScript types based on schema.

Help build API routes by referencing the Supabase schema.

Assist with migrations and schema evolution.

Sample Prompt:

“Given this Supabase schema with tables polls, options, and votes, generate a TypeScript function to fetch poll results grouped by option.”

🛠️ In-Editor / PR Review Tooling

Tool: Cursor (AI-enhanced IDE) + GitHub PR AI reviewers like CodeRabbit.

Usage:

Draft commit messages automatically.

Summarize and explain diffs in PRs.

Suggest improvements for readability and maintainability.

Catch missing documentation/tests during reviews.

📝 Prompting Strategy

For feature scaffolding:

“Create a responsive poll creation form in React with Tailwind CSS. Validate that users can’t submit without a question and at least two options.”

For testing:

“Generate Jest unit tests for the Supabase insertPoll function, including edge cases for empty questions and fewer than 2 options.”
