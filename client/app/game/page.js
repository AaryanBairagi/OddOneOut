"use client"

import { useEffect,useState } from "react"
import { socket } from "../../lib/socket"
import { useSearchParams } from "next/navigation"

export default function Game(){

const params = useSearchParams()

const room = params.get("room")

const [question,setQuestion]=useState("")
const [answer,setAnswer]=useState("")
const [answers,setAnswers]=useState({})
const [vote,setVote]=useState("")
const [result,setResult]=useState(null)

useEffect(()=>{

socket.on("question",(q)=>{

setQuestion(q)

})

socket.on("answers",(a)=>{

setAnswers(a)

})

socket.on("result",(r)=>{

setResult(r)

})

},[])

function submitAnswer(){

socket.emit("answer",{roomId:room,answer})

}

function submitVote(){

socket.emit("vote",{roomId:room,vote})

}

if(result){

return(

<div className="min-h-screen bg-black text-white p-6">

<h1 className="text-xl">Impostor Reveal</h1>

<p>Suspect: {result.suspect}</p>

<p>Real Impostor: {result.impostor}</p>

</div>

)

}

return(

<div className="min-h-screen bg-black text-white flex flex-col gap-4 p-6">

<h1 className="text-xl">Question</h1>

<p>{question}</p>

<input
className="p-3 rounded bg-gray-800"
onChange={(e)=>setAnswer(e.target.value)}
/>

<button
className="bg-blue-500 p-3 rounded"
onClick={submitAnswer}
>
Submit Answer
</button>

<h2 className="text-lg">Answers</h2>

{Object.values(answers).map((a,i)=>(

<div key={i} className="bg-gray-800 p-2 rounded">

{a}

</div>

))}

<input
className="p-3 rounded bg-gray-800"
placeholder="Vote socket id"
onChange={(e)=>setVote(e.target.value)}
/>

<button
className="bg-red-500 p-3 rounded"
onClick={submitVote}
>
Vote
</button>

</div>

)

}