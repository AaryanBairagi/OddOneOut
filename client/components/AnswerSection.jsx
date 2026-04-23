import { useState } from "react"

export default function AnswerSection({ onSubmit, hasAnswered }) {
  const [answer, setAnswer] = useState("")

  const handleSubmit = () => {
    if (!answer.trim()) return
    onSubmit(answer)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* 🔹 Input */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer..."
        disabled={hasAnswered}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
      />

      {/* 🔹 Button */}
      <button
        onClick={handleSubmit}
        disabled={hasAnswered}
        className={`w-full py-3 rounded-xl font-semibold transition
          ${
            hasAnswered
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-yellow-600 text-white hover:bg-yellow-700 transition-colors duration-300 active:scale-95"
          }`}
      >
        {hasAnswered ? "Submitted" : "Submit"}
      </button>
      {hasAnswered && (
        <p className="text-green-400 text-center mt-2">
          Answer submitted ✅
        </p>
        )}
        
    </div>
  )
}