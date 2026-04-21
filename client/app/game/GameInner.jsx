"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import confetti from "canvas-confetti"
import { playSound, sounds } from "../../lib/sounds"
import Timer from "../../components/Timer"
import PlayerCard from "../../components/PlayerCard"
import AnswerCard from "../../components/AnswerCard"
import ScoreBoard from "../../components/ScoreBoard"
import ChatBox from "../../components/ChatBox"
import { connectSocket, subscribeRoom, sendMessage , subscribePrivate } from "../../lib/socket"

export default function Game() {

const params = useSearchParams()
const room = params.get("room")

const [question, setQuestion] = useState("")
const [answer, setAnswer] = useState("")
const [answers, setAnswers] = useState({})
const [players, setPlayers] = useState([])
const [phase, setPhase] = useState("loading") // "loading", "answer", "discussion", "vote", "result"
const [result, setResult] = useState(null)
const [myId, setMyId] = useState(null)
const [role, setRole] = useState(null) // "impostor" or "crewmate"
const [subscribed, setSubscribed] = useState(false)


useEffect(() => {
  const waitForId = setInterval(() => {
    const id = localStorage.getItem("playerId")

    if (id) {
      console.log("🔥 GOT ID:", id)
      setMyId(id)
      clearInterval(waitForId)
    }
  }, 100)

  return () => clearInterval(waitForId)
}, [])

useEffect(() => {
  connectSocket(() => {
    console.log("🔌 SOCKET READY")
  })
}, [])


useEffect(() => {
  if (!room || !myId || subscribed) return

  console.log("🚀 SUBSCRIBING:", room, myId)

  subscribePrivate(`${room}/player/${myId}`, (data) => {
    let parsed
    try { parsed = JSON.parse(data) } catch { parsed = data }

    console.log("🎯 PRIVATE:", parsed)

    if (parsed && parsed.text) {
      setRole(parsed.isImpostor ? "impostor" : "crewmate")
      setQuestion(parsed.text)
      setPhase("role")

      setTimeout(() => {
        setPhase("answer")
      }, 2500)
    }
  })

  subscribeRoom(room, (data) => {
    let parsed
    try { parsed = JSON.parse(data) } catch { parsed = data }

    if (parsed && parsed.type === "answers") {
      setAnswers(parsed.answers)
      setPlayers(parsed.players)
      setPhase("discussion")
    }

    if (parsed === "start-voting") {
      setPhase("vote")
    }

    if (parsed && parsed.type === "result") {
      setResult(parsed)
      setPlayers(parsed.players)
      setPhase("result")
    }
  })

  setSubscribed(true) 

}, [room, myId, subscribed])

function submitAnswer() {

if (!answer) {
  alert("Write something first")
  return
}

sendMessage("answer", { 
  roomId: room, 
  answer,
  playerId: myId
})

}

function vote(id) {
  sendMessage("vote", { 
    roomId: room, 
    vote: id,
    playerId: myId
  })
}


// 🟣 RESULT SCREEN
if (phase === "result") {
return (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white flex flex-col items-center justify-center p-6 gap-6">

    {/* <h2 className="text-3xl font-bold">
      Round Result
    </h2> */}

    <h2 className="text-4xl font-bold text-center">
    {result?.suspect === result?.impostor 
    ? "🎯 Impostor Caught!" 
    : "😈 Impostor Escaped!"}
    </h2>

    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl text-center">
      <p>Suspect: {result?.suspect}</p>
      <p>Impostor: {result?.impostor}</p>
    </div>

    <ScoreBoard players={players} />
    <div className="bg-white/10 p-4 rounded-lg">
    <h3 className="mb-2">Votes:</h3>

    {Object.entries(result.votes || {}).map(([voter, voted]) => {
      const voterName = players.find(p => p.id === voter)?.name
      const votedName = players.find(p => p.id === voted)?.name

      return (
        <p key={voter}>
          {voterName} ➝ {votedName}
        </p>
      )
    })}
    </div>
  </div>
)
}

console.log("RENDER QUESTION:", question)

// 🟣 MAIN UI
return (
<div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white flex justify-center">

  <div className="w-full max-w-md flex flex-col gap-6 p-6">

    <h1 className="text-3xl text-center font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
      OddOneOut
    </h1>

    <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-center">
      {question || "Waiting for Question..."}
    </div>

    {phase === "role" && (
      <div className="text-center text-2xl font-bold mt-4">
      {role === "impostor" 
        ? "😈 You are the Impostor" 
        : "🟢 You are a Crewmate"}
      </div>
    )}

    {/* 🟣 ANSWER PHASE */}
    {phase === "answer" && (
      <div className="flex flex-col gap-4">

        <Timer seconds={45} trigger={phase} />

        <textarea
          className="bg-black/40 border border-white/20 p-3 rounded-lg"
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button
          onClick={submitAnswer}
          className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-lg font-semibold"
        >
          Submit Answer
        </button>

      </div>
    )}

    {/* 🟣 DISCUSSION */}
    {phase === "discussion" && (
      <div className="flex flex-col gap-4">

        {Object.values(answers).map((a, i) => (
          <AnswerCard key={i} answer={a} />
        ))}

        <ChatBox room={room} />

      </div>
    )}

    {/* 🟣 VOTING */}
    {phase === "vote" && (
      <div className="flex flex-col gap-3">

        <h2 className="text-center text-xl">
          Vote the Impostor
        </h2>


      {players.length === 0 ? (
      <p className="text-center text-white/50">Waiting for players...</p>
      ) : (
        players.map(p => (
        <PlayerCard 
          key={p.id} 
          player={p} 
          onVote={vote}
          disabled={p.id === myId}   // 🔥 ADD
        />
      ))
    )}

      </div>
    )}

  </div>

</div>
)
}