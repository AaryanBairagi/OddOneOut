"use client"

import { Suspense } from "react"
import GameInner from "./GameInner"

export default function Game() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
      <GameInner />
    </Suspense>
  )
}

