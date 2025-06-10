"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Users } from "lucide-react"
import { saveCurrentAccount } from "@/lib/account-client"
import { useRouter } from "next/navigation"

export function WalletSwitcher() {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function getCurrentAccount() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          setCurrentAccount(accounts[0] || null)
        } catch (error) {
          console.error("Error getting current account:", error)
        }
      }
    }

    getCurrentAccount()

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        const newAccount = accounts[0] || null
        setCurrentAccount(newAccount)

        if (newAccount) {
          // Auto-save the new account
          await saveCurrentAccount(newAccount)
          router.refresh()
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [router])

  async function handleSwitchAccount() {
    if (window.ethereum) {
      setIsLoading(true)
      try {
        // Request account access to trigger account selection
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const newAccount = accounts[0]

        if (newAccount) {
          await saveCurrentAccount(newAccount)
          setCurrentAccount(newAccount)
          router.refresh()
        }
      } catch (error) {
        console.error("Error switching account:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Multi-Wallet Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentAccount && (
          <div className="text-xs text-gray-400">
            <p>Current MetaMask Account:</p>
            <p className="font-mono text-emerald-400">
              {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
            </p>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleSwitchAccount}
          className="w-full text-xs"
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Switching..." : "Switch Wallet Account"}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-semibold">Testing Flow:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create NFT with current wallet</li>
            <li>Switch to different account in MetaMask</li>
            <li>Click "Switch Wallet Account" above</li>
            <li>Navigate to NFT page and mint</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
