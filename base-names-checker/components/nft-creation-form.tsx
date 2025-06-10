"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createNFT } from "@/lib/nft"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function NFTCreationForm() {
  const [name, setName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    name: string
    image: string
    contractAddress: string
  } | null>(null)
  const [currentStep, setCurrentStep] = useState<string>("")

  const router = useRouter()

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file must be less than 10MB")
      return
    }

    setImage(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name || !image) {
      setError("Please provide both a name and an image")
      return
    }

    setIsCreating(true)
    setError(null)
    setCurrentStep("Preparing to create NFT...")

    try {
      setCurrentStep("Uploading image to IPFS...")
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Visual delay

      setCurrentStep("Creating metadata...")
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Visual delay

      setCurrentStep("Deploying smart contract (this requires gas)...")
      const result = await createNFT(name, image)

      setCurrentStep("NFT created successfully!")
      setSuccess(result)
    } catch (err: any) {
      console.error("Failed to create NFT:", err)
      setError(err.message || "Failed to create NFT. Please try again.")
    } finally {
      setIsCreating(false)
      setCurrentStep("")
    }
  }

  function handleViewNFT() {
    if (success?.contractAddress) {
      router.push(`/nft/${success.contractAddress}`)
    }
  }

  return (
    <div className="space-y-6">
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">NFT Name</Label>
            <Input
              id="name"
              placeholder="Enter a name for your NFT"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-700 border-gray-600"
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">NFT Image (Max 10MB)</Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-colors">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isCreating}
              />

              {imagePreview ? (
                <div className="relative w-full aspect-square mb-4">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="NFT Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload an image</p>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
                className="mt-4"
                disabled={isCreating}
              >
                {imagePreview ? "Change Image" : "Select Image"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isCreating && currentStep && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{currentStep}</AlertDescription>
            </Alert>
          )}

          <Alert className="bg-blue-900/30 border-blue-600">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-100">
              <strong>Testing on Base Sepolia Testnet</strong>
              <br />
              This is free testnet ETH. Get testnet ETH from the Base Sepolia faucet if needed.
              <br />
              <a
                href="https://www.alchemy.com/faucets/base-sepolia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline hover:text-blue-200"
              >
                Get testnet ETH here →
              </a>
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white border-0"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating NFT...
              </>
            ) : (
              "Create NFT (Testnet - Free)"
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Success!</h3>
            <p className="text-white">The following NFT was created:</p>
            <ul className="mt-2 space-y-2">
              <li>
                <span className="font-semibold">Name:</span> {success.name}
              </li>
              <li>
                <span className="font-semibold">Contract Address:</span>
                <br />
                <code className="text-xs bg-gray-700 px-2 py-1 rounded break-all">{success.contractAddress}</code>
              </li>
              <li className="pt-2">
                <div className="relative w-full aspect-square">
                  <Image
                    src={success.image || "/placeholder.svg"}
                    alt={success.name}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button onClick={handleViewNFT} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              View NFT
            </Button>
            <Button
              onClick={() => {
                setSuccess(null)
                setName("")
                setImage(null)
                setImagePreview(null)
              }}
              variant="outline"
              className="flex-1"
            >
              Create Another
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
