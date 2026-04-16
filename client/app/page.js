"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { connectSocket, subscribeRoom, sendMessage } from "../lib/socket"

export default function Home(){

const [name,setName] = useState("")
const [room,setRoom] = useState("")
const router = useRouter()

useEffect(()=>{
  connectSocket()
},[])

function create(){

  if(!name) return

  sendMessage("create-room",{username:name})

  // TEMP: listen for room creation
  subscribeRoom("global",(data)=>{
    if(typeof data === "string"){
      router.push(`/lobby?room=${data}&name=${name}`)
    }
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
className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white"
onChange={(e)=>setName(e.target.value)}
/>

<button
onClick={create}
className="w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500"
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
className="w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-green-400 to-emerald-500"
>
Join Room
</button>

</div>

</div>

</div>

)
}