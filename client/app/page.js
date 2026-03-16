"use client"

import { useState } from "react"
import { socket } from "../lib/socket"
import { useRouter } from "next/navigation"

export default function Home(){

const [name,setName]=useState("")
const [room,setRoom]=useState("")

const router = useRouter()

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

<div className="min-h-screen bg-black text-white flex items-center justify-center">

<div className="w-full max-w-md flex flex-col gap-5 px-6">

<h1 className="text-3xl text-center font-bold">
Guess The Impostor
</h1>

<input
className="p-3 rounded bg-gray-800"
placeholder="Your Name"
onChange={(e)=>setName(e.target.value)}
/>

<button
className="bg-blue-500 p-3 rounded"
onClick={create}
>
Create Room
</button>

<input
className="p-3 rounded bg-gray-800"
placeholder="Room Code"
onChange={(e)=>setRoom(e.target.value)}
/>

<button
className="bg-green-500 p-3 rounded"
onClick={join}
>
Join Room
</button>

</div>

</div>

)

}