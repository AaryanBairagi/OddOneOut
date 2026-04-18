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
  if (!stompClient) return;

  stompClient.subscribe(`/topic/${roomId}`, (msg) => {
    const data = msg.body;
    callback(data);
  });
}

// 🔥 THIS IS NEW (IMPORTANT)
export function subscribePrivate(destination, callback) {
  if (!stompClient) return;

  console.log("SUBSCRIBING TO:", `/user${destination}`)

  stompClient.subscribe(`/user${destination}`, (msg) => {
    console.log("PRIVATE MSG RECEIVED:", msg.body)
    const data = JSON.parse(msg.body)
    callback(data)
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
