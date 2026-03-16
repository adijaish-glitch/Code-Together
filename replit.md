# 2gether Programming

## Overview

A real-time pair programming platform where two developers can collaborate using a shared Monaco Editor, live chat, and code execution — all running in the browser.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + Socket.io
- **Database**: PostgreSQL + Drizzle ORM (provisioned but not used yet)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Real-time**: Socket.io

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── 2gether/          # React + Vite frontend (pair programming UI)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx        # Landing page with room join/create
│   │   │   │   └── Room.tsx        # Pair programming room
│   │   │   ├── components/IDE/
│   │   │   │   ├── TopNav.tsx      # Header with room ID and status
│   │   │   │   ├── Editor.tsx      # Monaco Editor wrapper
│   │   │   │   ├── Console.tsx     # Code output panel
│   │   │   │   └── ChatPanel.tsx   # Real-time chat sidebar
│   │   │   └── hooks/
│   │   │       ├── use-socket.ts   # Socket.io integration
│   │   │       └── use-run-code.ts # Code execution via API
│   └── api-server/       # Express API server with Socket.io
│       └── src/
│           ├── socket.ts           # Socket.io handlers (rooms, code sync, chat)
│           └── routes/
│               ├── rooms.ts        # REST room management
│               └── run-code.ts     # JavaScript code execution (vm2)
├── lib/
│   ├── api-spec/         # OpenAPI spec + Orval codegen
│   ├── api-client-react/ # Generated React Query hooks
│   ├── api-zod/          # Generated Zod schemas
│   └── db/               # Drizzle ORM schema + DB connection
└── package.json
```

## Key Features

1. **Homepage** (`/`) — Enter or generate a Room ID, click "Join Room"
2. **Room** (`/room/:roomId`) — Full IDE environment:
   - Monaco Editor with VS Code dark theme
   - Real-time code sync via Socket.io (`/api/socket.io`)
   - Run Code button → executes JavaScript in sandboxed vm2
   - Console output panel
   - Team chat sidebar

## Socket.io Events

- `join-room` → assigns username (User1/User2), syncs initial code
- `code-change` / `code-update` → bidirectional code sync
- `send-message` / `chat-message` → chat
- `user-joined` / `user-left` / `user-count` → presence

## API Routes

- `POST /api/run-code` — execute JavaScript, returns `{ output, error }`
- `POST /api/rooms` — create/register a room
- `GET /api/rooms/:roomId` — get room info

## Services

- Frontend: port 23341 (proxied at `/`)
- API Server: port 8080 (proxied at `/api` and Socket.io at `/api/socket.io`)
