"use client"

import { Suspense } from "react"
import LobbyInner from "./LobbyInner"

export default function Lobby() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
      <LobbyInner />
    </Suspense>
  )
}

