"use client"

import { getSocket } from "@/lib/socket"
import { useState, useEffect, useRef } from "react"

export default function ChatBox({ room }) {
  const socket = getSocket()
  const [msg, setMsg] = useState("")
  const [messages, setMessages] = useState([])
  const bottomRef = useRef()

  useEffect(() => {

    function handleChat(m) {
      setMessages(prev => [...prev, m])
    }

    socket.on("chat", handleChat)

    return () => {
      socket.off("chat", handleChat)
    }

  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function send() {

    if (!msg.trim()) return

    socket.emit("chat", {
      room,
      msg,
    })

    setMsg("")
  }

  return (
    <div className="bg-gray-900 p-3 rounded">

      <div className="h-32 overflow-y-auto mb-2 text-sm">

        {messages.map((m, i) => (
          <div key={i}>
            <span className="text-purple-400">{m.sender || "Anon"}:</span> {m.msg || m}
          </div>
        ))}

        <div ref={bottomRef} />

      </div>

      <div className="flex gap-2">

        <input
          className="flex-1 bg-black p-2 rounded"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />

        <button
          className="bg-blue-500 px-3 rounded"
          onClick={send}
        >
          Send
        </button>

      </div>

    </div>
  )
}