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
import { connectSocket, subscribeRoom, sendMessage , subscribePrivateUser, subscribePrivate } from "../../lib/socket"
import Image from "next/image"

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
const [voted, setVoted] = useState(false)
const [selectedVote, setSelectedVote] = useState(null)


useEffect(() => {
  connectSocket(() => {
    console.log("🔌 SOCKET READY")
  })
}, [])

useEffect(() => {
  if (!room || subscribed) return

  connectSocket(() => {
    console.log("🚀 SAFE SUBSCRIBE AFTER CONNECT")

  subscribePrivateUser((data) => {
  let parsed
  try { parsed = JSON.parse(data) } catch { parsed = data }

  console.log("🎯 USER PRIVATE:", parsed)

  // 🔥 ADD THIS
  if (parsed?.playerId) {
    console.log("✅ SETTING PLAYER ID:", parsed.playerId)
    setMyId(parsed.playerId)
    sessionStorage.setItem("playerId", parsed.playerId)
  }

  if (parsed?.text) {
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

      if (parsed?.type === "answers") {
        setAnswers(parsed.answers)
        setPlayers(parsed.players)
        setPhase("discussion")
      }

      if (parsed === "start-voting") {
        setPhase("vote")
      }

      if (parsed?.type === "result") {
        setResult(parsed)
        setPlayers(parsed.players)
        setPhase("result")
        setVoted(false)
        setSelectedVote(null)
      }
    })

    setSubscribed(true)
  })

}, [room, subscribed])



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
  if (voted) return // prevent multiple clicks

  setSelectedVote(id)   // 🔥 highlight immediately

  sendMessage("vote", { 
    roomId: room, 
    vote: id,
    playerId: myId
  })

  setVoted(true)
}


// 🟣 RESULT SCREEN
if (phase === "result") {
return (
  <div className="min-h-screen bg-gradient-to-br from-[#0B1D3A] via-[#081224] to-black text-white flex flex-col items-center justify-center p-6 gap-6">

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

// // 🟣 MAIN UI
// return (
//   <div className="min-h-screen bg-gradient-to-br from-[#0B1D3A] via-[#081224] to-black 
//                 flex items-center justify-center px-4">

//   <div className="w-full max-w-md">

//     <div className="bg-white/5 backdrop-blur-xl border border-white/10 
//                     rounded-3xl p-6 flex flex-col gap-5 shadow-2xl">

//       {/* 🧠 ROLE SECTION */}
//       <div className="flex flex-col items-center gap-2">

//         <Image
//           src={isImpostor ? "/assets/impostor.png" : "/assets/crewmate.png"}
//           width={80}
//           height={80}
//           alt="role"
//         />

//         <h2 className="text-lg font-semibold text-yellow-400">
//           {isImpostor ? "You are the Impostor" : "You are a Crewmate"}
//         </h2>

//       </div>

//       {/* ❓ QUESTION */}
//       <div className="bg-[#0f2a52] border border-yellow-500/20 
//                       rounded-xl p-4 text-center text-white">
//         {question}
//       </div>

//       {/* ⏱ TIMER */}
//       <Timer time={time} key={phase} />

//       {/* 💬 INPUT */}
//       <textarea
//         value={answer}
//         onChange={(e) => setAnswer(e.target.value)}
//         placeholder="Type your answer..."
//         className="w-full bg-black/40 border border-white/20 
//                    rounded-xl p-3 text-white placeholder-white/40 
//                    focus:outline-none focus:ring-2 focus:ring-yellow-400"
//       />

//       {/* 🚀 BUTTON */}
//       <button
//         onClick={submitAnswer}
//         className="w-full py-3 rounded-xl font-semibold text-lg 
//                    bg-gradient-to-r bg-yellow-600 hover-yellow-800
//                    text-black active:scale-95 transition-transform">
//         Submit Answer
//       </button>

//     </div>

//   </div>
//   </div>
//     )}

//     {phase === "discussion" && (
//       <div className="flex flex-col gap-4">

//         {Object.values(answers).map((a, i) => (
//           <AnswerCard key={i} answer={a} />
//         ))}

//         <ChatBox
//           answer={answer}
//           setAnswer={setAnswer}
//           submit={submitAnswer}
//         />

//       </div>
//     )}

//     {/* 🟣 VOTING */}
//     {phase === "vote" && (
//       <div className="flex flex-col gap-3">

//         <h2 className="text-center text-xl">
//           Vote the Impostor
//         </h2>
        
//         <Timer seconds={20} key={phase} />

//       {players.length === 0 ? (
//       <p className="text-center text-white/50">Waiting for players...</p>
//       ) : (
//         players.map(p => (
//         <PlayerCard 
//           key={p.id} 
//           player={p} 
//           onVote={vote}
//           disabled={p.id === myId || voted}
//           hasVoted={voted} 
//           selected={selectedVote === p.id}  
//         />
//       ))
//     )}
    
//      {voted && (
//       <p className="text-center text-green-400 mt-2">
//        ✅ Vote submitted
//       </p>
//       )}
//       </div>
 
//     )}


return (
  <div className="min-h-screen bg-gradient-to-br from-[#0B1D3A] via-[#081224] to-black 
                  flex items-center justify-center px-4">

    <div className="w-full max-w-md">

      {/* 🟣 ANSWER PHASE */}
      {phase === "answer" && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 
                        rounded-3xl p-6 flex flex-col items-center gap-5 shadow-2xl">
             <Image
               src={role==="impostor" ? "/assets/impostor.png" : "/assets/crewmate.png"}
               width={80}
               height={80}
               alt="role"
               className="text-center "
             />

          <div className="text-center text-white/20 font-semibold">
            {role === "impostor" ? "You are the Impostor" : "You are a Crewmate"}
          </div>

          <div className="bg-[#0f2a52] rounded-xl p-4 text-white text-center">
            {question}
          </div>

          <Timer key={phase} seconds={45} />

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-black/40 p-3 rounded-xl text-white"
          />

          <button onClick={submitAnswer} className="bg-yellow-700 hover:bg-yellow-800 transition-colors w-full text-white py-2 rounded-xl">
            Submit
          </button>

        </div>
      )}

      {/* 🟣 DISCUSSION */}
      {phase === "discussion" && (
        <div className="flex flex-col gap-4">

          {Object.values(answers).map((a, i) => (
            <AnswerCard key={i} answer={a} />
          ))}

          <ChatBox
            answer={answer}
            setAnswer={setAnswer}
            submit={submitAnswer}
          />

        </div>
      )}

      {/* 🟣 VOTING */}
      {phase === "vote" && (
        <div className="flex flex-col gap-3">

          <h2 className="text-center text-xl text-white">
            Vote the Impostor
          </h2>

          <Timer key={phase} seconds={20} />

          {players.map(p => (
            <PlayerCard 
              key={p.id} 
              player={p} 
              onVote={vote}
              disabled={p.id === myId || voted}
              hasVoted={voted} 
              selected={selectedVote === p.id}  
            />
          ))}

        </div>
      )}

    </div>
  </div>
)
}