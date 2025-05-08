# Meditation Timer App

A mindful meditation timer built with modern web technologies to help you maintain a consistent meditation practice.

## Features

- ⏱️ **Customizable Timer**: Set your meditation duration and preparation countdown
- 🔊 **Ambient Sounds**: Choose from various white noise and nature sounds
- 📊 **Meditation Tracking**: Track your daily and weekly meditation progress
- 🏆 **Goals**: Set personal meditation goals and track your progress
- 📅 **Scheduling**: Plan future meditation sessions with reminders
- 🖼️ **Visual Customization**: Choose different background images for your meditation
- 🔒 **User Accounts**: Save your preferences and track your progress across devices

## Technology Stack

This project uses the [T3 Stack](https://create.t3.gg/):

- **Framework**: [Next.js 15](https://nextjs.org)
- **Authentication**: [Auth.js](https://authjs.dev) with Google OAuth
- **API**: [tRPC](https://trpc.io) for type-safe API endpoints
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team) for type-safe queries
- **Styling**: [Tailwind CSS](https://tailwindcss.com) for responsive design
- **Deployment**: [Vercel](https://vercel.com) for hosting and serverless functions

## Getting Started

### For Users
Visit the live app at [https://meditation-timer-eta.vercel.app/](https://meditation-timer-dashs-projects-1fd18fea.vercel.app/)

### For Developers
Follow these steps to set up the project locally:

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/meditation-timer.git
   cd meditation-timer

2. Install dependencies:
    ```npm install


3. Create a .env file based on .env.example and add your credentials:

# Database URL for your local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/meditation_timer"

# Auth
AUTH_SECRET="your-secret-here"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

4. Push the database schema:
    ```npm run db:push


5. Start the development server:
    ```npm run dev


6. Open http://localhost:3000 in your browser.


Database Schema

The app uses a relational database with the following main tables:

users: User accounts and authentication
userPreferences: User-specific app settings
meditationSessions: Records of completed meditation sessions
scheduledMeditations: Planned future meditation sessions
sounds: Available ambient and bell sounds
backgroundImages: Available background images for the timer
Deployment
This app is configured for deployment on Vercel. Connect your GitHub repository to Vercel and set the required environment variables in the Vercel dashboard.


License

MIT