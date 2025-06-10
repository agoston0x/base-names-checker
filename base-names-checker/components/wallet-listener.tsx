"use client"

import { useEffect } from "react"
import { setupWalletListeners } from "@/lib/wallet"

export function WalletListener() {
  useEffect(() => {
    setupWalletListeners()
  }, [])

  return null
}
