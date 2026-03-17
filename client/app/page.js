"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSocket } from "../lib/socket"

export default function Home(){

const [name,setName] = useState("")
const [room,setRoom] = useState("")

const router = useRouter()
const socket = getSocket()

function create(){

socket.emit("create-room",{username:name})

socket.on("room-created",(roomId)=>{
router.push(`/lobby?room=${roomId}&name=${name}`)
})

}

function join(){
router.push(`/lobby?room=${room}&name=${name}`)
}

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-blue-900">

<div className="w-full max-w-md px-6">

<div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl">

<h1 className="text-5xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
OddOneOut
</h1>

<p className="text-center text-white/60 text-sm">

Find the impostor before they fool everyone.

</p>

<input
placeholder="Your Name"
className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
onChange={(e)=>setName(e.target.value)}
/>

<button
onClick={create}
className="w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-[1.02] active:scale-95 transition"
>

Create Room

</button>

<input
placeholder="Room Code"
className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
onChange={(e)=>setRoom(e.target.value)}
/>

<button
onClick={join}
className="w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-green-400 to-emerald-500 hover:scale-[1.02] active:scale-95 transition"
>

Join Room

</button>

</div>

</div>

</div>

)

}