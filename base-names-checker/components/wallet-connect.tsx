"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { connectWallet } from "@/lib/wallet"
import { saveCurrentAccount } from "@/lib/account-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleConnect() {
    setIsConnecting(true)
    setError(null)

    try {
      const account = await connectWallet()
      if (account) {
        // Save account using the API route
        await saveCurrentAccount(account)
        router.push("/create")
        router.refresh()
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      setError("Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white border-0"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="text-xs text-center text-gray-400 space-y-2">
            <p>Connect your wallet to create and mint NFTs on Base Sepolia testnet</p>
            <div className="bg-green-900/30 border border-green-700 rounded p-3">
              <p className="font-semibold text-green-400">🧪 Testing Mode - Base Sepolia</p>
              <p className="text-green-100">This is a testnet - completely free to use!</p>
              <p className="text-green-100">
                Need testnet ETH?{" "}
                <a
                  href="https://www.alchemy.com/faucets/base-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-300 underline"
                >
                  Get it here
                </a>
              </p>
            </div>
            <div className="bg-blue-900/30 border border-blue-700 rounded p-3">
              <p className="font-semibold text-blue-400">Testing with Multiple Wallets:</p>
              <p>You can switch between different wallet accounts in MetaMask to test the full flow:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-left">
                <li>Connect with Wallet A → Create NFT</li>
                <li>Switch to Wallet B in MetaMask → Refresh page</li>
                <li>Connect with Wallet B → Mint the NFT</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
