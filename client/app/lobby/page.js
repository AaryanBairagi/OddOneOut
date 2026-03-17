"use client"

import { Suspense } from "react"
import LobbyInner from "./LobbyInner"

export default function Lobby() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
      <LobbyInner />
    </Suspense>
  )
}


// "use client"

// import { useEffect,useState } from "react"
// import { useSearchParams,useRouter } from "next/navigation"
// import { getSocket } from "@/lib/socket"
// import { Suspense } from "react"

// export default function Lobby(){

// const params = useSearchParams()
// const room = params.get("room")
// const name = params.get("name")
// const socket = getSocket()

// const [players,setPlayers] = useState([])

// const router = useRouter()

// useEffect(()=>{

// socket.emit("join-room",{roomId:room,username:name})

// socket.on("players",(p)=>{
// setPlayers(p)
// })

// socket.on("question",()=>{
// router.push(`/game?room=${room}`)
// })

// },[])

// function start(){
// socket.emit("start-game",room)
// }

// return(

// <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">

// <div className="w-full max-w-md px-6">

// <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col gap-6">

// <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">

// Lobby

// </h1>

// <p className="text-center text-white/60">

// Room Code: <span className="font-bold">{room}</span>

// </p>

// <div className="flex flex-col gap-3">

// {players.map((p,i)=>(

// <div
// key={i}
// className="bg-black/40 border border-white/10 p-3 rounded-lg flex justify-between"
// >

// <span>{p.name}</span>

// <span className="text-white/40">ready</span>

// </div>

// ))}

// </div>

// <button
// onClick={start}
// className="w-full py-3 rounded-lg font-semibold text-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-[1.02] active:scale-95 transition"
// >

// Start Game

// </button>

// </div>

// </div>

// </div>

// )

// }