
export function VotingSection({ players , onVote, voted, selectedVote }) {
return (
    <div className="flex flex-col gap-3">

      <p className="text-center text-white/70 text-sm">
        Vote the Impostor
      </p>

      {players.map((p) => (
        <button
          key={p.id}
          onClick={() => onVote(p.id)}   
          className={`flex items-center justify-between bg-white/5 hover:bg-yellow-400/20 border border-white/10 px-4 py-3 rounded-xl transition ${
            selectedVote === p.id ? "bg-yellow-400" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm">
              {p.name[0]}
            </div>
            <span>{p.name}</span>
          </div>

          <span className="text-xs text-white/50">
            Vote
          </span>
        </button>
      ))}

      {voted && (
      <p className="text-green-400 text-center mt-2">
        Vote submitted ✅
      </p>
      )}

    </div>
  )
}