"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Timer({ seconds, endTime }) {

  const [time, setTime] = useState(seconds)

  useEffect(() => {

    if (!endTime) return

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setTime(remaining)
    }, 1000)

    return () => clearInterval(interval)

  }, [endTime])

  const progress = (time / seconds) * 283

  return (
    <div className="flex justify-center">

      <div className="relative w-24 h-24">

        <svg className="rotate-[-90deg]">

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
            strokeDashoffset={283 - progress}
          />

        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
          {time}
        </div>

      </div>

    </div>
  )
}