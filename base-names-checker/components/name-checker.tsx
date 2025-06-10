"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Search, Wallet, ExternalLink } from "lucide-react"
import { checkNameAvailability, registerBaseName } from "@/lib/base-names"
import { connectWallet } from "@/lib/wallet"

export function NameChecker() {
  const [name, setName] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [availability, setAvailability] = useState<{
    available: boolean
    price?: string
    error?: string
  } | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean
    txHash?: string
    error?: string
  } | null>(null)

  // Auto-check availability when name changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (name.trim() && isValidName) {
        handleCheck()
      } else {
        setAvailability(null)
        setRegistrationResult(null)
      }
    }, 800) // Wait 800ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [name])

  async function handleCheck() {
    if (!name.trim()) return

    setIsChecking(true)
    setAvailability(null)
    setRegistrationResult(null)

    try {
      const result = await checkNameAvailability(name.toLowerCase().trim())
      setAvailability(result)
    } catch (error) {
      console.error("Error checking name:", error)
      setAvailability({
        available: false,
        error: "Failed to check name availability. Please try again.",
      })
    } finally {
      setIsChecking(false)
    }
  }

  async function handleConnectWallet() {
    try {
      const address = await connectWallet()
      setWalletAddress(address)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  async function handleRegister() {
    if (!name.trim() || !walletAddress) return

    setIsRegistering(true)
    setRegistrationResult(null)

    try {
      const result = await registerBaseName(name.toLowerCase().trim(), walletAddress)
      setRegistrationResult(result)

      // If successful, update availability
      if (result.success) {
        setAvailability({ available: false })
      }
    } catch (error) {
      console.error("Error registering name:", error)
      setRegistrationResult({
        success: false,
        error: "Failed to register name. Please try again.",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const isValidName = name.trim().length >= 3 && /^[a-zA-Z0-9-]+$/.test(name.trim())

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Check Base Name
        </CardTitle>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400">Live Base Name Service</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("https://base.org/names", "_blank")}
            className="h-auto p-1 text-blue-400 hover:text-blue-300"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Enter your desired name</Label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                id="name"
                placeholder="yourname"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="bg-gray-700 border-gray-600 pr-20"
                disabled={isRegistering}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                .base.eth
              </span>
              {isChecking && (
                <div className="absolute right-24 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                </div>
              )}
            </div>
            <Button
              onClick={handleCheck}
              disabled={!isValidName || isChecking || isRegistering}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {name.trim() && !isValidName && (
            <p className="text-xs text-red-400">
              Name must be at least 3 characters and contain only lowercase letters, numbers, and hyphens
            </p>
          )}
          {isValidName && <p className="text-xs text-gray-400">✨ Checking availability automatically...</p>}
        </div>

        {availability && (
          <Alert
            className={availability.available ? "border-green-600 bg-green-900/30" : "border-red-600 bg-red-900/30"}
          >
            {availability.available ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <AlertDescription>
              {availability.error ? (
                <span className="text-red-400">{availability.error}</span>
              ) : availability.available ? (
                <div className="space-y-2">
                  <span className="text-green-400 font-semibold">🎉 {name}.base.eth is available!</span>
                  {availability.price && (
                    <div className="text-green-100">
                      <p>
                        Registration price: <strong>{availability.price} ETH</strong>
                      </p>
                      <p className="text-xs text-green-200">Price includes 1 year registration</p>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-red-400">❌ {name}.base.eth is already taken</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {availability?.available && !walletAddress && (
          <Button onClick={handleConnectWallet} className="w-full bg-purple-600 hover:bg-purple-700">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet to Register
          </Button>
        )}

        {availability?.available && walletAddress && (
          <div className="space-y-3">
            <Alert className="bg-blue-900/30 border-blue-600">
              <Wallet className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-100">
                <div className="space-y-1">
                  <p>
                    <strong>Connected:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                  <p className="text-xs">Ready to register {name}.base.eth</p>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleRegister}
              disabled={isRegistering}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                `Register ${name}.base.eth${availability.price ? ` for ${availability.price} ETH` : ""}`
              )}
            </Button>
          </div>
        )}

        {registrationResult && (
          <Alert
            className={registrationResult.success ? "border-green-600 bg-green-900/30" : "border-red-600 bg-red-900/30"}
          >
            {registrationResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <AlertDescription>
              {registrationResult.success ? (
                <div className="space-y-2">
                  <p className="text-green-400 font-semibold">🎉 Successfully registered {name}.base.eth!</p>
                  {registrationResult.txHash && (
                    <div className="space-y-1">
                      <p className="text-xs text-green-200">Transaction Hash:</p>
                      <code className="text-xs bg-gray-700 px-2 py-1 rounded break-all block">
                        {registrationResult.txHash}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://basescan.org/tx/${registrationResult.txHash}`, "_blank")}
                        className="mt-2 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      >
                        View on BaseScan
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-red-400">{registrationResult.error || "Failed to register name"}</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-400 space-y-2">
          <div className="bg-gray-700/50 rounded p-3">
            <p className="font-semibold text-gray-300">About Base Names:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Decentralized naming service on Base</li>
              <li>Use your name instead of long addresses</li>
              <li>Names are NFTs you own and control</li>
              <li>Can be used across Base ecosystem apps</li>
            </ul>
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className="text-xs text-gray-500">Powered by Base Name Service • Real-time availability checking</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
