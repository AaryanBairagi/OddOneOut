"use client"

import { io } from "socket.io-client"

let socket

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports : ["websocket"],
      secure : true
    })
  }
  return socket
}

// import { io } from "socket.io-client"

// export const socket = io("http://localhost:5000")