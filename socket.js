import { Server } from "socket.io";
let io;
const userSockets = new Map();

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    // console.log("A user connected: " + socket.id);

    socket.on("registerUser", (userId) => {
      userSockets.set(userId, socket.id);
      //   console.log(
      //     `User ${userId} registered with socket ${userSockets.get(userId)}`
      //   );
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          // console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });
}

export function getIo() {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
}

export function getSocketIdOfUser(userId) {
  return userSockets.has(userId) ? userSockets.get(userId) : null;
}
