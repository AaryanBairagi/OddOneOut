"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Timer({ seconds, trigger }) {

  const [time, setTime] = useState(seconds)

  useEffect(() => {

    setTime(seconds) // 🔥 reset when trigger changes

    const interval = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)

  }, [trigger]) // 🔥 important

  const progress = (time / seconds) * 283

  return (
    <div className="flex justify-center">

      <div className="relative w-24 h-24">

        <svg viewBox="0 0 100 100" className="rotate-[-90deg] w-24 h-24">

  <circle
    cx="50"
    cy="50"
    r="45"
    stroke="#ffffff22"
    strokeWidth="8"
    fill="transparent"
  />

  <motion.circle
    cx="50"
    cy="50"
    r="45"
    stroke="#a855f7"
    strokeWidth="8"
    fill="transparent"
    strokeDasharray="283"
    animate={{ strokeDashoffset: 283 - progress }}
    transition={{ duration: 0.5, ease: "linear" }}
  />

</svg>

        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
          {time}
        </div>

      </div>

    </div>
  )
}