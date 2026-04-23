"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { connectSocket, subscribeRoom, sendMessage, subscribePrivateUser } from "@/lib/socket"
import { subscribeMe } from "@/lib/socket"

export default function LobbyInner() {

  const params = useSearchParams()
  const room = params.get("room")
  const name = params.get("name")

  const [players, setPlayers] = useState([])
  const router = useRouter()

  useEffect(() => {

  if (!room || !name) return

  connectSocket(() => {
    console.log("✅ CONNECTED")

    // ✅ 1. SUBSCRIBE FIRST
    subscribeMe((data) => {
      let parsed
      try { parsed = JSON.parse(data) } catch { parsed = data }

      if (parsed?.yourId) {
        console.log("✅ GOT ID:", parsed.yourId)
        sessionStorage.setItem("playerId", parsed.yourId)
      }
    })

   subscribePrivateUser((data) => {
  let parsed
  try { parsed = JSON.parse(data) } catch { parsed = data }

  if (parsed?.playerId) {
    console.log("✅ GOT ID IN GAME:", parsed.playerId)
    sessionStorage.setItem("playerId", parsed.playerId)
  }

  // setQuestion(parsed.text)
  })

    subscribeRoom(room, (data) => {
      let parsed
      try { parsed = JSON.parse(data) } catch { parsed = data }

      if (parsed?.type === "players") {
        setPlayers(parsed.players)
      }

      if (parsed === "start-game" || parsed?.type === "game-started") {
        console.log("🧠 START RECEIVED")
          // waitForIdAndNavigate()
         router.push(`/game?room=${room}`) 
      }
    })


    // ✅ 2. THEN JOIN (VERY IMPORTANT)
    sendMessage("join-room", { roomId: room, username: name })
  })

  }, [])


  function start() {
    console.log("START BUTTON CLICKED")
    sendMessage("start-game", { roomId: room })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1D3A] via-[#081224] to-black flex items-center justify-center">

      <div className="w-full max-w-md px-6">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col gap-6">

          <h1 className="text-3xl font-bold text-center bg-gradient-to-r  bg-blue-400 text-transparent bg-clip-text">
            Lobby
          </h1>

          <p className="text-center text-white/60">
            Room Code: <span className="font-bold">{room}</span>
          </p>

          <div className="flex flex-col gap-3">

            {players.map((p, i) => (
              <div key={i} className="bg-black/40 border border-white/10 p-3 rounded-lg flex justify-between">
                <span>{p.name}</span>
                <span className="text-white/40">ready</span>
              </div>
            ))}

          </div>

          <button
            onClick={start}
            className="w-full py-3 rounded-lg font-semibold text-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-colors duration-300"
          >
            Start Game
          </button>

        </div>

      </div>

    </div>
  )
}

