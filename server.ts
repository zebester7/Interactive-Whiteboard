import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = 3000;

  // In-memory storage for board states and users
  // In a real app, this would be Redis/MongoDB
  const boards: Record<string, any[]> = {};
  const users: Record<string, any> = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-board", ({ boardId, user }) => {
      socket.join(boardId);
      users[socket.id] = { ...user, boardId, id: socket.id };
      
      // Send current board state to the new user
      socket.emit("board-state", boards[boardId] || []);
      
      // Notify others in the room
      socket.to(boardId).emit("user-joined", users[socket.id]);
      
      // Send list of all users in the room
      const roomUsers = Object.values(users).filter((u: any) => u.boardId === boardId);
      io.to(boardId).emit("users-list", roomUsers);
    });

    socket.on("draw", ({ boardId, object }) => {
      if (!boards[boardId]) boards[boardId] = [];
      
      // Update or add object
      const index = boards[boardId].findIndex((o: any) => o.id === object.id);
      if (index !== -1) {
        boards[boardId][index] = object;
      } else {
        boards[boardId].push(object);
      }
      
      socket.to(boardId).emit("draw", object);
    });

    socket.on("delete-object", ({ boardId, objectId }) => {
      if (boards[boardId]) {
        boards[boardId] = boards[boardId].filter((o: any) => o.id !== objectId);
      }
      socket.to(boardId).emit("delete-object", objectId);
    });

    socket.on("cursor-move", ({ boardId, position }) => {
      if (users[socket.id]) {
        users[socket.id].cursor = position;
        socket.to(boardId).emit("cursor-move", { userId: socket.id, position });
      }
    });

    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (user) {
        const boardId = user.boardId;
        delete users[socket.id];
        socket.to(boardId).emit("user-left", socket.id);
        
        const roomUsers = Object.values(users).filter((u: any) => u.boardId === boardId);
        io.to(boardId).emit("users-list", roomUsers);
      }
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
