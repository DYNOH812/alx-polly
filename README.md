ALX Polly

ALX Polly is a modern polling application built for learning, collaboration, and experimentation. It enables users to create polls, share them, vote in real time, and visualize results. The project is part of the ALX Software Engineering journey, showcasing integration of authentication, data persistence, and interactive UI.

📌 Project Overview

ALX Polly provides:

Authentication: User sign-up, login, and session management.

Poll Management: Create, update, and manage polls.

Voting System: Secure and real-time voting with result tracking.

Dashboard: Personalized dashboard for users to view and interact with polls.

⚙️ Tech Stack

Frontend: Next.js / React, Tailwind CSS

Backend: Supabase (Postgres + Authentication)

Database: Supabase PostgreSQL

Styling: TailwindCSS / NativeWind (if used)

Deployment: Vercel (or similar)

🔧 Setup
1. Clone the Repository
git clone https://github.com/DYNOH812/alx-polly.git
cd alx-polly

2. Install Dependencies
npm install
# or
yarn install

3. Configure Supabase

Create a Supabase project at https://supabase.com
.

Copy your project’s API keys and URL.

Add them to a .env.local file in your project root:

NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

4. Run the Development Server
npm run dev


Your app will be available at: http://localhost:3000

🚀 Usage Examples
Create a Poll

Login to your account.

Go to Create Poll.

Enter a title, description, and choices.

Submit — the poll will appear in your dashboard.

Vote in a Poll

Select a poll from the dashboard.

Pick your choice.

Submit your vote and view updated results in real time.

🧪 Testing

Run tests with:

npm run test


Check linting and formatting:

npm run lint
npm run format

📖 Contributing

Contributions are welcome!

Fork the repository.

Create a new branch (feature/my-feature).

Commit your changes.

Push and open a Pull Request.

📜 License

This project is licensed under the MIT License.

## Environment variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these in your Supabase project settings under API.
