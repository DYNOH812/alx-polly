🗳️ ALX Polly

A modern poll creation and voting application built with Next.js 13, Supabase, and Tailwind CSS.
ALX Polly allows users to create polls, share them, and vote in real time, with authentication handled via Supabase (email/password & Google OAuth).

📌 Features

🔐 Authentication (Email/Password + Google OAuth via Supabase)

📊 Create and manage polls (with at least two options)

✅ Secure voting system (1 vote per user per poll)

🖥️ User dashboard to view and manage polls

⚡ Real-time updates with Supabase revalidation

🛠️ Tech Stack

Framework: Next.js 13
 (App Router)

Auth & Database: Supabase

Styling: Tailwind CSS
 + Shadcn UI

Deployment: Vercel / Supabase Hosting

⚙️ Setup & Installation
1. Clone the repo
git clone https://github.com/DYNOH812/alx-polly.git
cd alx-polly

2. Install dependencies
npm install

3. Configure Supabase

Create a Supabase project
.

Enable Email/Password and Google OAuth in Authentication settings.

Create the following tables in your Supabase database:

-- Polls table
create table polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  option1 text not null,
  option2 text not null,
  user_id uuid references auth.users(id),
  created_at timestamp default now()
);

-- Votes table
create table votes (
  poll_id uuid references polls(id),
  user_id uuid references auth.users(id),
  option int not null check (option in (1,2)),
  primary key (poll_id, user_id)
);

4. Environment Variables

Create a .env.local file in your project root with:

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

5. Run the app locally
npm run dev


Visit http://localhost:3000
.

🚀 Usage Examples
🔑 Sign In / Sign Up

Email + Password

Continue with Google

🗳️ Create a Poll

Go to /polls/new

Enter a question and at least 2 options

Submit → redirect to poll list

✅ Vote on a Poll

Visit a poll page (/polls/[id])

Choose option 1 or 2

Vote is recorded (only once per user)

🧑‍💼 Dashboard

View your created polls

Edit or delete polls you own

🧪 Testing

Use multiple accounts to verify one-vote-per-user logic.

Try invalid inputs (missing_fields, weak passwords, etc.) and confirm redirects work.

📄 License

MIT License © 2025 Dennis Thuranira

👉 This README now reflects:

Project overview

Setup steps (Supabase config, env vars)

Usage flows (create poll, vote, auth)

How to run/test
