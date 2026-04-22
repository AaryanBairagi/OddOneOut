"use client"

import { motion } from "framer-motion"
import { playSound, sounds } from "../lib/sounds"

export default function PlayerCard({ player, onVote, hasVoted, disabled, selected }) { 

  function handleVote() {

    if (hasVoted || disabled) return

    playSound(sounds.vote)
    onVote(player.id)

  }

  return (
    <motion.div
      whileHover={!hasVoted ? { scale: 1.04 } : {}}
      whileTap={!hasVoted ? { scale: 0.95 } : {}}
      onClick={handleVote}
      className={`bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-xl flex items-center justify-between transition
      ${selected 
        ? "border-green-400 bg-green-500/20 scale-105"   // 🔥 highlight
        : "border-white/10"}

      ${ (hasVoted || disabled) ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-purple-400"}`}
      >

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center font-bold">
          {player.name[0]}
        </div>

        <span className="text-lg">
          {player.name}
        </span>

      </div>

      <span className="text-purple-400">
        {disabled 
          ? "You" 
          : selected 
          ? "Selected" 
          : hasVoted 
          ? "Voted" 
          : "Vote"}
      </span>

    </motion.div>
  )
}