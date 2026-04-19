"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { connectSocket, subscribeRoom, sendMessage } from "@/lib/socket"

export default function LobbyInner() {

  const params = useSearchParams()
  const room = params.get("room")
  const name = params.get("name")

  const [players, setPlayers] = useState([])
  const router = useRouter()

  useEffect(() => {

    if (!room || !name) return

    connectSocket(() => {
      console.log("Lobby socket connected")

      // ✅ FIXED SUBSCRIBE
      subscribeRoom(room, (data) => {

        console.log("RAW DATA:", data)

        let parsed
        try {
          parsed = JSON.parse(data)
        } catch {
          parsed = data
        }

        console.log("PARSED:", parsed)

        // 🔥 JOIN EVENT (SET MY ID)
        if (parsed && parsed.type === "joined") {
          console.log("JOIN EVENT:", parsed)

          if (parsed.username === name && !localStorage.getItem("playerId")) {
            console.log("✅ SETTING MY ID:", parsed.yourId)
            localStorage.setItem("playerId", parsed.yourId)
          }
        }

        // 🔥 START GAME NAVIGATION
        if (parsed === "start-game") {
          console.log("Navigating to game...")
          router.push(`/game?room=${room}`)
        }

      })

      // ✅ SEND JOIN
      sendMessage("join-room", { roomId: room, username: name })
    })

  }, [room, name])

  function start() {
    console.log("START BUTTON CLICKED")

    connectSocket(() => {
      console.log("🚀 ENSURED CONNECTION BEFORE START")

      setTimeout(() => {
        sendMessage("start-game", { roomId: room })
      }, 200)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">

      <div className="w-full max-w-md px-6">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col gap-6">

          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
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
            className="w-full py-3 rounded-lg font-semibold text-lg bg-gradient-to-r from-purple-500 to-blue-500"
          >
            Start Game
          </button>

        </div>

      </div>

    </div>
  )
}








// "use client"

// import { useEffect, useState } from "react"
// import { useSearchParams, useRouter } from "next/navigation"
// import { connectSocket, subscribeRoom, sendMessage } from "@/lib/socket"
// import { subscribePrivate } from "@/lib/socket"

// export default function LobbyInner() {

//   const params = useSearchParams()
//   const room = params.get("room")
//   const name = params.get("name")

//   const [players, setPlayers] = useState([])
//   const router = useRouter()

//   useEffect(() => {

//   if (!room || !name) return

//   connectSocket(() => {
//     console.log("Lobby socket connected")

//     // 🔥 ADD THIS (VERY IMPORTANT)
//     subscribePrivate("/queue/me", (data) => {
//       console.log("✅ MY ID RECEIVED:", data.yourId)
//       localStorage.setItem("playerId", data.yourId)
//     })

//     // ✅ 1. SUBSCRIBE FIRST
//     subscribeRoom(room, (data) => {
//     console.log("RAW DATA:", data, typeof data) // 👈 ADD THIS LINE

//     console.log("Lobby data:", data)

//     if (Array.isArray(data)) {
//       setPlayers(data)
//     }

//     // 🔥 FIX CONDITION
//     const clean = typeof data === "string" ? data.replace(/"/g, "") : data

//     if (clean === "start-game") {
//       console.log("Navigating to game...")
//       router.push(`/game?room=${room}`)
//     }

//     if (parsed && parsed.type === "joined") {
//   console.log("JOIN EVENT:", parsed)

//     // only set if it's YOU
//     if (parsed.username === name && !localStorage.getItem("playerId")) {
//       console.log("✅ SETTING MY ID:", parsed.yourId)
//       localStorage.setItem("playerId", parsed.yourId)
//     }
//     }
//     })

//     // ✅ 2. THEN SEND JOIN
//     sendMessage("join-room", { roomId: room, username: name })
//   })

// }, [room, name])

// function start() {
//   console.log("START BUTTON CLICKED")

//   connectSocket(() => {
//     console.log("🚀 ENSURED CONNECTION BEFORE START")

//     setTimeout(() => {
//       sendMessage("start-game", { roomId: room })
//     }, 200) // small delay = stability
//   })
// }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">

//       <div className="w-full max-w-md px-6">

//         <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col gap-6">

//           <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
//             Lobby
//           </h1>

//           <p className="text-center text-white/60">
//             Room Code: <span className="font-bold">{room}</span>
//           </p>

//           <div className="flex flex-col gap-3">

//             {players.map((p, i) => (
//               <div key={i} className="bg-black/40 border border-white/10 p-3 rounded-lg flex justify-between">
//                 <span>{p.name}</span>
//                 <span className="text-white/40">ready</span>
//               </div>
//             ))}

//           </div>

//           <button
//             onClick={start}
//             className="w-full py-3 rounded-lg font-semibold text-lg bg-gradient-to-r from-purple-500 to-blue-500"
//           >
//             Start Game
//           </button>

//         </div>

//       </div>

//     </div>
//   )
// }