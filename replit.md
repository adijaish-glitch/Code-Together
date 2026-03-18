# 2gether Programming

## Overview

A real-time pair programming platform where developers can collaborate using a shared Monaco Editor, live chat, AI assistant, file system, and code execution — all running in the browser.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + Socket.io
- **Database**: PostgreSQL + Drizzle ORM (provisioned)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Real-time**: Socket.io
- **AI**: OpenAI via Replit AI Integrations (gpt-5-mini)

## Structure

```text
artifacts/
├── 2gether/              # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx              # Landing page (Framer-style)
│       │   └── Room.tsx              # Pair programming room
│       ├── components/
│       │   ├── UsernameModal.tsx     # Username picker modal
│       │   └── IDE/
│       │       ├── TopNav.tsx        # Header (room ID, roles, status)
│       │       ├── Editor.tsx        # Monaco Editor wrapper
│       │       ├── Console.tsx       # Code execution output panel
│       │       ├── ChatPanel.tsx     # Team chat + AI assistant tabs
│       │       ├── FileTree.tsx      # File/folder explorer panel
│       │       └── RolePanel.tsx     # Driver/Navigator role assignment
│       └── hooks/
│           ├── use-socket.ts         # All real-time state (files, chat, roles)
│           └── use-run-code.ts       # POST /api/run-code mutation
└── api-server/           # Express API server
    └── src/
        ├── socket.ts               # Socket.io: rooms, files, code sync, chat, roles
        └── routes/
            ├── rooms.ts            # REST room management
            ├── run-code.ts         # JavaScript execution (vm2)
            └── ai-chat.ts          # AI coding assistant (streaming SSE)
```

## Key Features

1. **Username selection** — Modal on first visit, stored in localStorage
2. **File system** — Create/rename/delete files and folders, synced in real-time
3. **Multi-language editor** — Monaco with proper syntax for JS, TS, Python, Java, C++, HTML, CSS, Rust, Go
4. **Real-time code sync** — Per-file content synced to all room members
5. **JavaScript execution** — Run JS files in sandboxed vm2, see console output
6. **Team Chat** — Real-time chat with usernames and timestamps
7. **AI Assistant** — Streaming GPT assistant aware of your current code and language
8. **Driver/Navigator roles** — Host assigns roles; navigator gets read-only editor
9. **Landing page** — Framer-style dark SaaS landing page at `/`

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client→Server | Join room with username |
| `room-joined` | Server→Client | Initial state (files, roles, users) |
| `file-content-change` | Client→Server | Edit a file |
| `file-content-updated` | Server→Client | Broadcast file edit to others |
| `create-item` | Client→Server | Create file or folder |
| `delete-item` | Client→Server | Delete file/folder (recursive) |
| `rename-item` | Client→Server | Rename file/folder |
| `fs-updated` | Server→Client | Broadcast updated file tree |
| `send-message` | Client→Server | Send chat message |
| `chat-message` | Server→Client | Receive chat message |
| `assign-role` | Client→Server | Host assigns driver/navigator |
| `roles-updated` | Server→Client | Broadcast role changes |
| `user-joined/left/count` | Server→Client | Presence events |
| `host-transferred` | Server→Client | New host on old host disconnect |

## API Routes

- `POST /api/run-code` — Execute JavaScript, returns `{ output, error }`
- `POST /api/ai-chat` — Streaming AI response (SSE), takes `{ message, code, language, history }`
- `POST /api/rooms` — Create/register a room
- `GET /api/rooms/:roomId` — Get room info

## Services

- Frontend: port 23341 (proxied at `/`)
- API Server: port 8080 (proxied at `/api` and Socket.io at `/api/socket.io`)
