# Crashout

A modern data analysis application that enables users to upload datasets, ask questions about them in natural language, and receive AI-generated insights with interactive visualizations.

## Features

- **Email-based Authentication** - Secure OTP-based login system powered by Supabase
- **Dataset Management** - Upload and manage multiple CSV/Parquet datasets
- **Infinite Scroll Sessions** - Browse through previous analysis sessions with pagination
- **Conversational Analytics** - Chat interface to ask questions about your data
- **Smart Visualizations** - Automatic chart generation based on data insights
- **Real-time Streaming** - Stream responses for a more interactive experience
- **Dark Theme UI** - Modern, sleek interface optimized for data analysis

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **UI Components**: Lucide React icons
- **Charts**: Recharts
- **Authentication**: Supabase
- **HTTP Client**: Fetch API with streaming support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crashout-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Configure the following in `.env`:
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Install additional dependencies:
```bash
npm install react-router-dom
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── chat/              # Chat interface components
│   │   ├── ChatThread.tsx
│   │   ├── ChatInput.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChartBlock.tsx
│   │   └── ProfileCard.tsx
│   ├── layout/
│   │   └── Sidebar.tsx    # Session sidebar with pagination
│   ├── ProtectedRoute.tsx # Auth-protected routes
│   └── ...
├── context/
│   └── AuthContext.tsx    # Authentication state management
├── hooks/
│   └── useChat.ts         # Chat functionality hook
├── lib/
│   ├── api.ts             # API client functions
│   └── utils.ts           # Utility functions
├── pages/
│   └── Login.tsx           # OTP login page
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles
```

## Key Components

### Authentication (`AuthContext.tsx`)
- Email-based OTP authentication
- Session persistence via Supabase
- Token management for API requests

### Protected Routes (`ProtectedRoute.tsx`)
- Guards the main app behind authentication
- Redirects unauthenticated users to login page
- Shows loading state during auth check

### Chat System (`useChat.ts`)
- Manages chat messages and state
- Streams responses from backend
- Handles chart configurations from AI

### Session Management (`Sidebar.tsx`)
- Displays user's previous analysis sessions
- Infinite scroll pagination (100px threshold)
- Active session highlighting

## API Integration

The app communicates with a backend API for:

- **Authentication**: `/api/auth/me`, `/api/auth/signIn`
- **File Upload**: `POST /api/upload`
- **Sessions**: `GET /api/v1/sessions?page=1`
- **Session Profile**: `GET /api/sessions/{id}/profile`
- **Messages**: `GET /api/sessions/{id}/messages`
- **Chat**: `POST /api/chat` (Server-Sent Events)
- **Reports**: `GET /api/sessions/{id}/report`

## Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Authentication Flow

1. User enters email on login page
2. OTP is sent via email
3. User enters OTP to verify
4. Session token is stored locally
5. User is redirected to main app
6. Logout clears session and redirects to login

## Data Flow

1. User uploads a dataset (CSV/Parquet)
2. Backend processes file and returns session ID
3. Session appears in sidebar
4. User can select session and start chatting
5. Questions are sent to backend for processing
6. AI generates response with optional charts
7. Response streams back to frontend
8. Charts are rendered using Recharts

## Deployment

The app includes a `vercel.json` configuration for Vercel deployment. To deploy:

1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## Contributing

Contributions are welcome! Please ensure:

- Code follows the existing style
- TypeScript types are properly defined
- Components are reusable and well-documented

## License

MIT
