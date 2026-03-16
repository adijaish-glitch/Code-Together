import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { setupSocketHandlers } from "./socket";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  path: "/api/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupSocketHandlers(io);

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
