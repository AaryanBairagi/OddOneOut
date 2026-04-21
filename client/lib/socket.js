import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false;

export function connectSocket(onConnectCallback) {
  if (stompClient && isConnected) {
    if (onConnectCallback) onConnectCallback();
    return;
  }

  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("Connected to Java WebSocket");
      isConnected = true;

      if (onConnectCallback) {
        onConnectCallback();
      }
    },

    onDisconnect: () => {
      isConnected = false;
    },

    onStompError: (frame) => {
      console.error("STOMP error", frame);
    }
  });

  stompClient.activate();
}

export function subscribeRoom(roomId, callback) {
  if (!stompClient || !isConnected) {
    console.log("⏳ Waiting for connection (room)...");

    setTimeout(() => {
      subscribeRoom(roomId, callback);
    }, 300);

    return;
  }

  console.log("✅ Subscribed to room:", roomId);

  stompClient.subscribe(`/topic/${roomId}`, (msg) => {
    callback(msg.body);
  });
}

export function sendMessage(destination, payload) {
  console.log("📤 Attempt:", destination, payload);

  if (!stompClient || !isConnected) {
    console.error("❌ STOMP not connected yet");
    return;
  }

  console.log("✅ Sending now");

  stompClient.publish({
    destination: `/app/${destination}`,
    body: JSON.stringify(payload),
  });
}

export function subscribePrivate(destination, callback) {
  if (!stompClient || !isConnected) {
    console.log("⏳ Waiting for connection (private)...");

    setTimeout(() => {
      subscribePrivate(destination, callback);
    }, 300);

    return;
  }

  const fullPath = `/topic/${destination}`

  console.log("🔌 SUBSCRIBING TO PRIVATE:", fullPath)

  stompClient.subscribe(fullPath, (msg) => {
    console.log("📩 PRIVATE MESSAGE RAW:", msg.body)
    callback(msg.body)
  })
}

export function subscribePrivateUser(callback) {
  if (!stompClient || !isConnected) {
    console.log("⏳ Waiting for connection (user private)...");

    setTimeout(() => {
      subscribePrivateUser(callback);
    }, 300);

    return;
  }

  const fullPath = `/user/queue/game`;

  console.log("🔐 SUBSCRIBING TO USER PRIVATE:", fullPath);

  stompClient.subscribe(fullPath, (msg) => {
    console.log("📩 USER PRIVATE RAW:", msg.body);
    callback(msg.body);
  });
}