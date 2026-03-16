"use client"

import { useEffect,useState } from "react"
import { socket } from "../../lib/socket"
import { useSearchParams,useRouter } from "next/navigation"

export default function Lobby(){

const params = useSearchParams()
const room = params.get("room")
const name = params.get("name")

const [players,setPlayers]=useState([])

const router = useRouter()

useEffect(()=>{

socket.emit("join-room",{roomId:room,username:name})

socket.on("players",(p)=>{
setPlayers(p)
})

},[])

function start(){

socket.emit("start-game",room)

router.push(`/game?room=${room}`)

}

return(

<div className="min-h-screen bg-black text-white flex justify-center">

<div className="w-full max-w-md p-6">

<h1 className="text-xl mb-4">
Room: {room}
</h1>

<div className="flex flex-col gap-2">

{players.map(p=>(

<div
key={p.id}
className="bg-gray-800 p-3 rounded"
>
{p.name}
</div>

))}

</div>

<button
className="bg-blue-500 w-full mt-6 p-3 rounded"
onClick={start}
>
Start Game
</button>

</div>

</div>

)

}