import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false;
let isConnecting = false; // 🔥 ADD THIS

export function connectSocket(onConnectCallback) {

  // ✅ already connected
  if (stompClient && isConnected) {
    onConnectCallback?.()
    return
  }

  // ❗ PREVENT DOUBLE CONNECT
  if (isConnecting) {
    console.log("⚠️ Already connecting, skipping...")
    return
  }

  isConnecting = true

  const socket = new SockJS("http://localhost:8080/ws")

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("Connected to Java WebSocket")
      isConnected = true
      isConnecting = false

      onConnectCallback?.()
    },

    onDisconnect: () => {
      isConnected = false
      isConnecting = false
    }
  })

  stompClient.activate()
}

// export function connectSocket(onConnectCallback) {
//   if (stompClient && isConnected) {
//     if (onConnectCallback) onConnectCallback();
//     return;
//   }

//   const socket = new SockJS("http://localhost:8080/ws");

//   stompClient = new Client({
//     webSocketFactory: () => socket,
//     reconnectDelay: 5000,

//     onConnect: () => {
//       console.log("Connected to Java WebSocket");
//       isConnected = true;

//       if (onConnectCallback) {
//         onConnectCallback();
//       }
//     },

//     onDisconnect: () => {
//       isConnected = false;
//     },

//     onStompError: (frame) => {
//       console.error("STOMP error", frame);
//     }
//   });

//   stompClient.activate();
// }

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
  const trySubscribe = () => {
    if (!stompClient || !isConnected) {
      console.log("⏳ Waiting for connection (user private)...");
      setTimeout(trySubscribe, 200); // retry until ready
      return;
    }

    const fullPath = `/user/queue/game`;

    console.log("🔐 SUBSCRIBING TO USER PRIVATE:", fullPath);

    stompClient.subscribe(fullPath, (msg) => {
      console.log("📩 USER PRIVATE RAW:", msg.body);
      callback(msg.body);
    });
  };

  trySubscribe();
}

export function subscribeMe(callback) {
  const trySubscribe = () => {
    if (!stompClient || !isConnected) {
      setTimeout(trySubscribe, 200)
      return
    }

    const path = "/user/queue/me"

    console.log("🔐 SUBSCRIBING TO:", path)

    stompClient.subscribe(path, (msg) => {
      console.log("📩 ME RAW:", msg.body)
      callback(msg.body)
    })
  }

  trySubscribe()
}