import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export function connectSocket(onMessage) {
  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("Connected to Java WebSocket");

      // subscribe to room messages (we'll set room dynamically later)
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
    const data = JSON.parse(msg.body);
    callback(data);
  });
}

export function sendMessage(destination, payload) {
  if (!stompClient) return;

  stompClient.publish({
    destination: `/app/${destination}`,
    body: JSON.stringify(payload),
  });
}








// "use client"

// import { io } from "socket.io-client"

// let socket

// export function getSocket() {
//   if (!socket) {
//     socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
//       transports : ["websocket"],
//       secure : true
//     })
//   }
//   return socket
// }

// // import { io } from "socket.io-client"

// // export const socket = io("http://localhost:5000")