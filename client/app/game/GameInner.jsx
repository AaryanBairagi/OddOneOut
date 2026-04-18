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
import { connectSocket, subscribeRoom, sendMessage, subscribePrivate } from "../../lib/socket"

export default function Game() {

const params = useSearchParams()
const room = params.get("room")

const [question, setQuestion] = useState("")
const [answer, setAnswer] = useState("")
const [answers, setAnswers] = useState({})
const [players, setPlayers] = useState([])
const [phase, setPhase] = useState("answer")
const [result, setResult] = useState(null)
const [myId , setMyId] = useState(null);

useEffect(() => {

if (!room) return

connectSocket(() => {

  subscribePrivate("/queue/me", (data) => {
    console.log("MY ID:", data.yourId)
    setMyId(data.yourId)   // ✅ FIXED
    localStorage.setItem("playerId", data.yourId)
  })

  subscribeRoom(room, (data) => {

    console.log("RAW DATA:", data)

    let parsed

    try {
      parsed = JSON.parse(data)
    } catch {
      parsed = data
    }

    console.log("PARSED:", parsed)

    // 🟣 PLAYERS
    if (parsed && parsed.type === "players") {
      setPlayers(parsed.players)
    }

    // 🟣 ANSWERS
    if (parsed && parsed.type === "answers") {
      setAnswers(parsed.answers)
      setPhase("discussion")
    }

    // 🟣 START VOTING
    if (parsed === "start-voting") {
      setPhase("vote")
    }

    // 🟣 RESULT
    if (parsed && parsed.type === "result") {

      setResult(parsed)
      setPlayers(parsed.players)
      setPhase("result")

      playSound(sounds.reveal)

      if (parsed.suspect === parsed.impostor) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        })
        playSound(sounds.win)
      }
    }

  })

})

}, [room])

// 🔥 NEW FIXED EFFECT (DO NOT TOUCH)
useEffect(() => {
  if (!myId) return

  console.log("SUBSCRIBING TO:", `question-${myId}`)

  subscribeRoom(`question-${myId}`, (data) => {
    const parsed = JSON.parse(data)

    console.log("SETTING QUESTION:", parsed.text)

    setQuestion(parsed.text)
    setPhase("answer")
  })

}, [myId])

function submitAnswer() {

if (!answer) {
  alert("Write something first")
  return
}

sendMessage("answer", { roomId: room, answer })

}

function vote(id) {
sendMessage("vote", { roomId: room, vote: id })
}

// 🟣 RESULT SCREEN
if (phase === "result") {
return ( <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white flex flex-col items-center justify-center p-6 gap-6">

    <h2 className="text-3xl font-bold">
      Round Result
    </h2>

    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl text-center">
      <p>Suspect: {result?.suspect}</p>
      <p>Impostor: {result?.impostor}</p>
    </div>

    <ScoreBoard players={players} />

  </div>
)
}

// 🟣 MAIN UI
return ( <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white flex justify-center">

  <div className="w-full max-w-md flex flex-col gap-6 p-6">

    <h1 className="text-3xl text-center font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
      OddOneOut
    </h1>

    <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-center">
      {question || "Waiting for Question..."}
    </div>

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

    {/* 🟣 DISCUSSION PHASE */}
    {phase === "discussion" && (
      <div className="flex flex-col gap-4">

        {Object.values(answers).map((a, i) => (
          <AnswerCard key={i} answer={a} />
        ))}

        <ChatBox room={room} />

      </div>
    )}

    {/* 🟣 VOTING PHASE */}
    {phase === "vote" && (
      <div className="flex flex-col gap-3">

        <h2 className="text-center text-xl">
          Vote the Impostor
        </h2>

        {players.map(p => (
          <PlayerCard key={p.id} player={p} onVote={vote} />
        ))}

      </div>
    )}

  </div>

</div>
)
}