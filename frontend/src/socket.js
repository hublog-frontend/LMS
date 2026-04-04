import { io } from "socket.io-client";
import { auth } from "./firebase";
import { CommonMessage } from "./features/Common/CommonMessage";

const SOCKET_URL = import.meta.env.VITE_API_URL; // Uses the dynamic API URL

let socket = null;
let currentToken = null;

export const initiateSocket = (token, deviceId) => {
  // If socket already exists and token is the same, don't reconnect
  if (socket && currentToken === token && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket.off(); // Remove all listeners
  }

  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: {
      token,
      deviceId,
      deviceInfo: navigator.userAgent,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  console.log("Socket connection initiated...");

  // Register listener ONLY ONCE per socket instance
  socket.on("forceLogout", (data) => {
    console.warn("Force Logout received:", data.message);

    // 1. Show the message immediately in the current tab
    CommonMessage("warning", data.message);

    // 2. Prepare for redirect after a 2-second delay
    setTimeout(() => {
      // Clear auth but keep deviceId for session stability across tabs
      Object.keys(localStorage).forEach((key) => {
        if (key !== "deviceId") localStorage.removeItem(key);
      });
      auth.signOut().then(() => {
        window.location.replace("/login");
      });
    }, 2000);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
