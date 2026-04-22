"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { connectSocket, sendMessage, subscribeUserQueue , subscribeRoom} from "../lib/socket"

export default function Home(){

  const [name,setName] = useState("")
  const [room,setRoom] = useState("")
  const router = useRouter()

  function create(){
    if(!name) return

    console.log("Create clicked")

    // 🔥 CONNECT + FLOW INSIDE CALLBACK
    connectSocket(() => {
      console.log("Socket connected")

      // ✅ STEP 1: SUBSCRIBE FIRST
      // subscribeUserQueue((roomId)=>{
      //   console.log("Room created:", roomId)

      //   router.push(`/lobby?room=${roomId}&name=${name}`)
      // })
      subscribeRoom("global", (roomId) => {
      console.log("Room created:", roomId)

      router.push(`/lobby?room=${roomId}&name=${name}`)
    })

      console.log("Subscribed to room-created")

      // ✅ STEP 2: THEN SEND
      sendMessage("create-room",{username:name})
    })
  }

  function join(){
    router.push(`/lobby?room=${room}&name=${name}`)
  }

  return(

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1D3A] via-[#081224] to-black">

      <div className="w-full max-w-md px-6">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl">

          <h1 className="text-5xl font-bold text-center bg-gradient-to-r bg-blue-400  text-transparent bg-clip-text">
            OddOneOut
          </h1>

          <p className="text-center text-white/60 text-sm">
            Find the impostor before they fool everyone.
          </p>

          <input
            placeholder="Your Name"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white"
            onChange={(e)=>setName(e.target.value)}
          />

          <button
            onClick={create}
            className="w-full py-3 rounded-lg text-lg font-semibold bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white"
          >
            Create Room
          </button>

          <input
            placeholder="Room Code"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white"
            onChange={(e)=>setRoom(e.target.value)}
          />

          <button
            onClick={join}
            className="w-full py-3 rounded-lg text-lg font-semibold bg-yellow-700 hover:bg-yellow-800  transition-colors duration-300 "
          >
            Join Room
          </button>

        </div>

      </div>

    </div>
  )
}