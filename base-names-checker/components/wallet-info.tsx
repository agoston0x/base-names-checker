"use client"

import { Button } from "@/components/ui/button"
import { disconnectWallet } from "@/lib/wallet"
import { useRouter } from "next/navigation"
import { LogOut, User, Wifi } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function WalletInfo({ address, sessionId }: { address: string; sessionId?: string }) {
  const router = useRouter()

  async function handleDisconnect() {
    await disconnectWallet(sessionId)
    router.push("/")
    router.refresh()
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Wifi className="h-4 w-4 text-green-400" />
              <span className="text-xs text-green-400">Base Sepolia</span>
            </div>
          </div>
          <div className="border-l border-gray-600 pl-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-emerald-400" />
              <div className="text-sm">
                <p className="font-mono text-emerald-400 font-semibold">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </p>
                {sessionId && <p className="text-xs text-gray-400">Session: {sessionId}</p>}
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="ml-4 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
