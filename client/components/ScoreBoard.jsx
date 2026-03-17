export default function ScoreBoard({ players }) {

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="bg-gray-900 p-4 rounded">

      <h2 className="text-center text-lg mb-3">
        Scoreboard
      </h2>

      <div className="flex flex-col gap-2">

        {sortedPlayers.map((p, i) => (

          <div
            key={p.id}
            className={`flex justify-between p-2 rounded ${
              i === 0
                ? "bg-yellow-500/20 border border-yellow-400"
                : "bg-gray-800"
            }`}
          >

            <span>{p.name}</span>
            <span>{p.score}</span>

          </div>

        ))}

      </div>

    </div>
  )
}