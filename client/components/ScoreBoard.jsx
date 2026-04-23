export default function ScoreBoard({ players }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">

      {/* 🔹 Title */}
      <h2 className="text-center text-lg font-semibold text-white mb-4">
        Scoreboard
      </h2>

      {/* 🔹 Player List */}
      <div className="flex flex-col gap-3">

        {sortedPlayers.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition
              ${
                i === 0
                  ? "bg-yellow-400/20 border border-yellow-400 shadow-lg"
                  : "bg-white/5 border border-white/10"
              }`}
          >

            {/* LEFT: Avatar + Name */}
            <div className="flex items-center gap-3">

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                  ${i === 0 ? "bg-yellow-400 text-black" : "bg-blue-500/60 text-white"}
                `}
              >
                {p.name[0].toUpperCase()}
              </div>

              <span className="text-white font-medium">
                {p.name}
              </span>

              {/* 👑 Crown for winner */}
              {i === 0 && (
                <span className="text-yellow-400 text-sm">👑</span>
              )}
            </div>

            {/* RIGHT: Score */}
            <span className="text-yellow-400 font-semibold">
              {p.score}
            </span>

          </div>
        ))}

      </div>
    </div>
  )
}




// export default function ScoreBoard({ players }) {

//   const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

//   return (
//     <div className="bg-gray-900 p-4 rounded">

//       <h2 className="text-center text-lg mb-3">
//         Scoreboard
//       </h2>

//       <div className="flex flex-col gap-2">

//         {sortedPlayers.map((p, i) => (

//           <div
//             key={p.id}
//             className={`flex justify-between p-2 rounded ${
//               i === 0
//                 ? "bg-yellow-500/20 border border-yellow-400"
//                 : "bg-gray-800"
//             }`}
//           >

//             <span>{p.name}</span>
//             <span>{p.score}</span>

//           </div>

//         ))}

//       </div>

//     </div>
//   )
// }