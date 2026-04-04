const { Server } = require("socket.io");
const { admin } = require("./config/firebaseAdmin");
const LoginModel = require("./model/LoginModel");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      const decodedToken = await admin.auth().verifyIdToken(token);
      socket.userId = decodedToken.uid;
      socket.userEmail = decodedToken.email;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const userEmail = socket.userEmail;
    const token = socket.handshake.auth.token;

    console.log(`Socket connection for: ${userEmail} (ID: ${socket.id})`);

    try {
      // 1. Join a user-specific room
      await socket.join(userEmail);

      // 2. Notify all sockets from DIFFERENT devices in this room to logout
      const otherSockets = await io.in(userEmail).fetchSockets();
      otherSockets.forEach((s) => {
        // Only force logout if it's a different device AND not the current socket
        if (
          s.id !== socket.id &&
          s.handshake.auth.deviceId !== socket.handshake.auth.deviceId
        ) {
          s.emit("forceLogout", {
            message:
              "You have been logged out because your account was used on another device.",
          });
          console.log(
            `Sent forceLogout to socket ${s.id} for user ${userEmail} (Different Device: ${s.handshake.auth.deviceId})`,
          );
        }
      });

      // 3. Update MySQL with the latest active session details
      // This keeps the DB in sync for API validation and single-session tracking
      await LoginModel.updateActiveSession(userEmail, token, socket.id);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${userEmail} (ID: ${socket.id})`);
      });
    } catch (error) {
      console.error("Error in socket connection handler:", error);
    }
  });

  return io;
};

module.exports = initSocket;
