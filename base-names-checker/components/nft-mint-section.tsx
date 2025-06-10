"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { mintNFT, checkNFTBalance } from "@/lib/nft"
import { getCurrentAccount } from "@/lib/account-client"
import { Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getContractInfo } from "@/lib/contract"

export function NFTMintSection({
  contractAddress,
  nftName,
}: {
  contractAddress: string
  nftName: string
}) {
  const [isMinting, setIsMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    txHash: string
  } | null>(null)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [nftBalance, setNftBalance] = useState<number>(0)
  const [isCheckingBalance, setIsCheckingBalance] = useState(true)
  const [contractExists, setContractExists] = useState(false)

  useEffect(() => {
    async function checkBalance() {
      try {
        const account = await getCurrentAccount()
        if (account) {
          // Check if contract exists
          const contractInfo = await getContractInfo(contractAddress)
          setContractExists(!!contractInfo)

          if (contractInfo) {
            const balance = await checkNFTBalance(contractAddress, account)
            setNftBalance(balance)
          }
        }
      } catch (err) {
        console.error("Error checking balance:", err)
        setError("Failed to check NFT balance. The contract may not exist.")
      } finally {
        setIsCheckingBalance(false)
      }
    }

    checkBalance()
  }, [contractAddress])

  async function handleMint() {
    if (!contractExists) {
      setError("Contract not found. Please make sure the NFT was created properly.")
      return
    }

    setIsMinting(true)
    setError(null)
    setCurrentStep("Preparing to mint NFT...")

    try {
      setCurrentStep("Minting NFT (this requires gas)...")
      const result = await mintNFT(contractAddress)

      setCurrentStep("NFT minted successfully!")
      setSuccess(result)

      // Update balance
      const account = await getCurrentAccount()
      if (account) {
        const newBalance = await checkNFTBalance(contractAddress, account)
        setNftBalance(newBalance)
      }
    } catch (err: any) {
      console.error("Failed to mint NFT:", err)
      setError(err.message || "Failed to mint NFT. Please try again.")
    } finally {
      setIsMinting(false)
      setCurrentStep("")
    }
  }

  if (isCheckingBalance) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Checking contract and balance...</span>
      </div>
    )
  }

  if (!contractExists) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>This NFT contract was not found. It may not have been deployed properly.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {nftBalance > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You already own {nftBalance} of this NFT!</AlertDescription>
        </Alert>
      )}

      {!success ? (
        <>
          <Alert className="bg-green-900/30 border-green-600">
            <AlertCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-100">
              <strong>Free on Base Sepolia Testnet!</strong>
              <br />
              This uses testnet ETH which has no real value. Perfect for testing.
            </AlertDescription>
          </Alert>

          {currentStep && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{currentStep}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleMint}
            className="w-full py-6 text-lg font-medium bg-green-600 hover:bg-green-700 text-white border-0"
            disabled={isMinting}
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              "Mint NFT (Free on Testnet)"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <div className="p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg">
          <h3 className="text-xl font-bold text-emerald-400 mb-2">Success!</h3>
          <p className="text-white mb-4">You have successfully minted the NFT!</p>

          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Transaction Hash:</span>
            </p>
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-gray-700 px-2 py-1 rounded break-all flex-1">{success.txHash}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://sepolia.basescan.org/tx/${success.txHash}`, "_blank")}
                className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            The NFT has been minted to your address. You can view your NFT collection in your wallet or on NFT
            marketplaces.
          </p>
        </div>
      )}
    </div>
  )
}
