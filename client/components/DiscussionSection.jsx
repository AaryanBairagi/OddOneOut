
export function DiscussionSection({messages=[]}) {
  return (
    <div className="flex flex-col h-[250px]">

      {/* messages */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded-lg max-w-[75%] text-sm
              ${msg.isMe ? "bg-yellow-400 text-black ml-auto" : "bg-white/10 text-white"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* input */}
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
          placeholder="Say something..."
        />
        <button className="bg-yellow-600 hover:bg-yellow-700 transition-colors duration-300 text-white px-4 rounded-lg">
          Send
        </button>
      </div>

    </div>
  )
}