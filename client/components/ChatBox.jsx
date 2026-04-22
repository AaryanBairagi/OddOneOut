"use client"

// import { useState, useEffect, useRef } from "react"
// import { connectSocket, subscribeRoom, sendMessage } from "@/lib/socket"


export default function ChatBox({ answer, setAnswer, submit }) {
  return (
    <div className="flex flex-col gap-3">

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer..."
        className="w-full bg-black/40 border border-white/20 
                   rounded-xl p-3 text-white placeholder-white/40"
      />

      <button
        onClick={submit}
        className="py-3 rounded-xl bg-yellow-400 text-black font-semibold">
        Submit
      </button>

    </div>
  )
}

// export default function ChatBox({ room }) {

//   const [msg, setMsg] = useState("")
//   const [messages, setMessages] = useState([])
//   const bottomRef = useRef()

//   useEffect(() => {

//     if (!room) return

//     connectSocket()

//     subscribeRoom(room, (data) => {
//       console.log("Chat data:", data)

//       // chat messages come as string or object
//       if (typeof data === "string") {
//         setMessages(prev => [...prev, data])
//       }

//       if (data.msg) {
//         setMessages(prev => [...prev, data])
//       }
//     })

//   }, [room])

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   function send() {

//     if (!msg.trim()) return

//     sendMessage("chat", {
//       room,
//       msg,
//     })

//     setMsg("")
//   }

//   return (
//     <div className="bg-gray-900 p-3 rounded">

//       <div className="h-32 overflow-y-auto mb-2 text-sm">

//         {messages.map((m, i) => (
//           <div key={i}>
//             <span className="text-purple-400">{m.sender || "Anon"}:</span> {m.msg || m}
//           </div>
//         ))}

//         <div ref={bottomRef} />

//       </div>

//       <div className="flex gap-2">

//         <input
//           className="flex-1 bg-black p-2 rounded"
//           value={msg}
//           onChange={(e) => setMsg(e.target.value)}
//         />

//         <button
//           className="bg-blue-500 px-3 rounded"
//           onClick={send}
//         >
//           Send
//         </button>

//       </div>

//     </div>
//   )
// }