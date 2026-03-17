"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function AnswerCard({ answer, index }) {

  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true)
    }, index * 1200)

    return () => clearTimeout(timer)
  }, [index])

  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-xl text-center"
    >
      <motion.div
        key={revealed ? "front" : "back"}
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.4 }}
      >
        {revealed ? answer : "❓ Hidden Answer"}
      </motion.div>
    </motion.div>
  )
}