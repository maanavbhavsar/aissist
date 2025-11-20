# AIssist

AIssist is a full-stack SaaS platform that brings AI meeting assistants into real-time video calls. Users can create custom AI agents with specific behaviors, host video meetings with them, and automatically receive transcriptions, GPT-4o summaries, and post-meeting chat. Built with Next.js, TypeScript, Stream.io, OpenAI Realtime API, and Inngest, AIssist is production-ready and deployed on Vercel—demonstrating scalable AI integration for modern enterprise workflows.

🌐 **Live Demo**: [https://aissist-iota.vercel.app/](https://aissist-iota.vercel.app/)

## 🚀 Features

- **AI Agent Management**: Create and customize AI agents with specific instructions and behaviors
- **Video Meetings**: Conduct real-time video meetings with AI agents using Stream.io
- **Real-time AI Interaction**: AI agents powered by OpenAI Realtime API that can speak and respond naturally
- **Automatic Transcription**: Meetings are automatically transcribed when they end
- **AI-Powered Summaries**: Transcripts are processed and summarized using GPT-4o
- **Post-Meeting Chat**: Continue conversations with AI agents after meetings end
- **Meeting Recordings**: Access recordings of completed meetings
- **Time Management**: Automatic time limits for meetings (configurable)
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Radix UI

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Better Auth (email/password, GitHub, Google OAuth)
- **Video & Chat**: Stream.io SDK
- **AI**: OpenAI (GPT-4o, GPT-4o Realtime)
- **Background Jobs**: Inngest
- **API**: tRPC
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- OpenAI API key
- Stream.io account (for video and chat)
- Inngest account (for background jobs)
- GitHub/Google OAuth credentials (optional, for social login)

## 🔧 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd aissist
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stream.io Video
NEXT_PUBLIC_STREAM_VIDEO_API_KEY=your_stream_video_api_key
STREAM_VIDEO_SECRET_KEY=your_stream_video_secret_key

# Stream.io Chat
NEXT_PUBLIC_STREAM_CHAT_API_KEY=your_stream_chat_api_key
STREAM_CHAT_SECRET_KEY=your_stream_chat_secret_key

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Better Auth
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# OAuth (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Unrestricted Emails (Optional)
# Add comma-separated list of emails that bypass time limits
UNRESTRICTED_EMAILS=admin@example.com,test@example.com
```

4. **Set up the database**

```bash
# Push schema to database
npm run db:push
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
aissist/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── api/               # API routes (webhooks, tRPC, Inngest)
│   │   ├── call/              # Video call pages
│   │   └── dashboard/         # Dashboard pages
│   ├── components/            # Shared UI components
│   ├── db/                    # Database schema and connection
│   ├── hooks/                 # React hooks
│   ├── inngest/               # Inngest background jobs
│   ├── lib/                   # Utility libraries
│   ├── modules/               # Feature modules
│   │   ├── agents/           # AI agent management
│   │   ├── auth/             # Authentication
│   │   ├── call/             # Video call functionality
│   │   ├── home/             # Home page
│   │   └── meetings/         # Meeting management
│   ├── trpc/                  # tRPC setup and routers
│   └── types/                 # TypeScript types
├── drizzle/                   # Database migrations
├── public/                    # Static assets
└── package.json
```

## 🔄 How It Works

### Meeting Lifecycle

1. **Creation**: User creates a meeting and selects an AI agent
2. **Start**: When the meeting starts, the system:
   - Updates meeting status to "active"
   - Connects the AI agent to the video call using OpenAI Realtime API
   - Sets agent instructions and behavior
3. **During Meeting**:
   - Real-time video and audio interaction
   - AI agent responds naturally using OpenAI Realtime API
   - Time limits enforced (10 minutes default, configurable)
4. **End**: When the meeting ends:
   - Status changes to "processing"
   - Transcription becomes available
   - Background job processes the transcript
5. **Processing**:
   - Inngest job fetches transcript
   - Adds speaker names to transcript items
   - Generates AI summary using GPT-4o
   - Updates meeting status to "completed"
6. **Post-Meeting**:
   - Users can view transcript and summary
   - Chat with AI agent about the meeting
   - Access recording (when available)

### Webhook Events

The application handles the following Stream.io webhook events:

- `call.session_started`: Connects AI agent to the call
- `call.session_ended` / `call.ended`: Marks meeting as processing
- `call.transcription_ready`: Triggers transcript processing
- `call.recording_ready`: Saves recording URL
- `message.new`: Handles post-meeting chat messages

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Database Management

```bash
# Push schema changes directly to database
npm run db:push

# Generate migration files
npm run db:generate

# Open database GUI
npm run db:studio
```

## 🚢 Deployment

### Deploy to Vercel

This project is optimized for deployment on [Vercel](https://vercel.com/), the platform created by the Next.js team.

1. **Push your code to GitHub**

2. **Import your repository to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Configure Environment Variables**
   Add all required environment variables in the Vercel dashboard:
   - Go to your project settings → Environment Variables
   - Add all variables from the `.env.local` example above
   - Update `BETTER_AUTH_URL` to your Vercel deployment URL
   - Update `BETTER_AUTH_TRUSTED_ORIGINS` to include your Vercel domain

4. **Deploy**
   - Vercel will automatically deploy on every push to your main branch
   - Preview deployments are created for pull requests

### Environment Setup

1. Set up your production database (Neon recommended)
2. Configure all environment variables in your hosting platform
3. Set up Inngest webhook endpoint
4. Configure Stream.io webhook URL to point to your deployment

### Webhook Configuration

Configure Stream.io webhooks to point to:

```
https://your-domain.com/api/webhook
```

For Vercel deployments, use:

```
https://your-project.vercel.app/api/webhook
```

Required headers:
- `x-signature`: Stream.io webhook signature
- `x-api-key`: Stream.io API key

### Inngest Setup

1. Deploy your application
2. Configure Inngest to connect to your deployment
3. Ensure `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` are set
4. Add your Vercel deployment URL to Inngest's allowed origins

### Vercel-Specific Notes

- **Serverless Functions**: API routes and webhooks run as serverless functions
- **Edge Runtime**: Consider using Edge Runtime for better performance on API routes
- **Environment Variables**: Use Vercel's environment variable management for different environments (production, preview, development)
- **Database Connections**: Ensure your database allows connections from Vercel's IP ranges (Neon handles this automatically)

## 🔐 Security

- Webhook signature verification for Stream.io events
- Rate limiting on webhook endpoints
- Message deduplication to prevent duplicate processing
- Secure authentication with Better Auth
- Environment variable validation

## 📝 License

MIT License - feel free to use this project for learning and inspiration.
