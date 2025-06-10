"use client"

import { createPublicClient, http, formatEther } from "viem"
import { base } from "viem/chains"

// Real Base Name Service contract addresses
const BASE_REGISTRAR_CONTROLLER_ADDRESS = "0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5" as const
const BASE_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as const

// Real Base Name Service ABIs
const REGISTRAR_CONTROLLER_ABI = [
  {
    inputs: [{ name: "name", type: "string" }],
    name: "available",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "duration", type: "uint256" },
    ],
    name: "rentPrice",
    outputs: [
      {
        components: [
          { name: "base", type: "uint256" },
          { name: "premium", type: "uint256" },
        ],
        name: "price",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "owner", type: "address" },
      { name: "duration", type: "uint256" },
      { name: "resolver", type: "address" },
      { name: "data", type: "bytes[]" },
      { name: "reverseRecord", type: "bool" },
      { name: "fuses", type: "uint32" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const

const ENS_REGISTRY_ABI = [
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// Create public client for Base
const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
})

// Helper function to convert name to namehash
function namehash(name: string): `0x${string}` {
  const crypto = require("crypto")

  if (name === "") {
    return "0x0000000000000000000000000000000000000000000000000000000000000000"
  }

  const labels = name.split(".")
  let node = "0x0000000000000000000000000000000000000000000000000000000000000000"

  for (let i = labels.length - 1; i >= 0; i--) {
    const labelHash = crypto.createHash("keccak256").update(labels[i]).digest("hex")
    node = crypto
      .createHash("keccak256")
      .update(Buffer.from(node.slice(2) + labelHash, "hex"))
      .digest("hex")
    node = "0x" + node
  }

  return node as `0x${string}`
}

export async function checkNameAvailability(name: string): Promise<{
  available: boolean
  price?: string
  error?: string
}> {
  try {
    if (!name || name.length < 3) {
      return {
        available: false,
        error: "Name must be at least 3 characters long",
      }
    }

    // Check if name contains only valid characters
    if (!/^[a-z0-9-]+$/.test(name)) {
      return {
        available: false,
        error: "Name can only contain lowercase letters, numbers, and hyphens",
      }
    }

    console.log(`Checking availability for: ${name}.base.eth`)

    // Method 1: Check via Base Name Service API (if available)
    try {
      const response = await fetch(`https://api.basename.app/v1/name/${name}/availability`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("API response:", data)

        if (data.available !== undefined) {
          return {
            available: data.available,
            price: data.price ? formatEther(BigInt(data.price)) : "0.01",
          }
        }
      }
    } catch (apiError) {
      console.log("API check failed, falling back to contract call:", apiError)
    }

    // Method 2: Direct contract call
    try {
      // Check if name is available via the registrar controller
      const available = await publicClient.readContract({
        address: BASE_REGISTRAR_CONTROLLER_ADDRESS,
        abi: REGISTRAR_CONTROLLER_ABI,
        functionName: "available",
        args: [name],
      })

      console.log(`Contract says available: ${available}`)

      if (!available) {
        return {
          available: false,
        }
      }

      // Get pricing for 1 year registration
      const duration = BigInt(365 * 24 * 60 * 60) // 1 year in seconds

      try {
        const priceData = await publicClient.readContract({
          address: BASE_REGISTRAR_CONTROLLER_ADDRESS,
          abi: REGISTRAR_CONTROLLER_ABI,
          functionName: "rentPrice",
          args: [name, duration],
        })

        const totalPrice = priceData.base + priceData.premium
        const priceInEth = formatEther(totalPrice)

        return {
          available: true,
          price: priceInEth,
        }
      } catch (priceError) {
        console.log("Price check failed, using default:", priceError)
        // Fallback pricing based on length
        let defaultPrice = "0.01"
        if (name.length === 3) defaultPrice = "0.1"
        else if (name.length === 4) defaultPrice = "0.05"
        else if (name.length === 5) defaultPrice = "0.02"

        return {
          available: true,
          price: defaultPrice,
        }
      }
    } catch (contractError) {
      console.error("Contract call failed:", contractError)

      // Method 3: Check via ENS registry (fallback)
      try {
        const fullName = `${name}.base.eth`
        const node = namehash(fullName)

        const owner = await publicClient.readContract({
          address: BASE_REGISTRY_ADDRESS,
          abi: ENS_REGISTRY_ABI,
          functionName: "owner",
          args: [node],
        })

        const isAvailable = owner === "0x0000000000000000000000000000000000000000"

        return {
          available: isAvailable,
          price: isAvailable ? "0.01" : undefined,
        }
      } catch (registryError) {
        console.error("Registry check failed:", registryError)
        throw new Error("All availability check methods failed")
      }
    }
  } catch (error) {
    console.error("Error checking name availability:", error)
    return {
      available: false,
      error: "Failed to check name availability. Please try again.",
    }
  }
}

export async function registerBaseName(
  name: string,
  walletAddress: string,
): Promise<{
  success: boolean
  txHash?: string
  error?: string
}> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No Ethereum wallet found")
    }

    const { createWalletClient, custom } = await import("viem")

    const walletClient = createWalletClient({
      chain: base,
      transport: custom(window.ethereum),
    })

    // Check if name is still available
    const availability = await checkNameAvailability(name)
    if (!availability.available) {
      return {
        success: false,
        error: "Name is no longer available",
      }
    }

    // Get price for 1 year registration
    const duration = BigInt(365 * 24 * 60 * 60) // 1 year in seconds

    const priceData = await publicClient.readContract({
      address: BASE_REGISTRAR_CONTROLLER_ADDRESS,
      abi: REGISTRAR_CONTROLLER_ABI,
      functionName: "rentPrice",
      args: [name, duration],
    })

    const totalPrice = priceData.base + priceData.premium

    // Register the name
    const txHash = await walletClient.writeContract({
      address: BASE_REGISTRAR_CONTROLLER_ADDRESS,
      abi: REGISTRAR_CONTROLLER_ABI,
      functionName: "register",
      args: [
        name,
        walletAddress as `0x${string}`,
        duration,
        "0x0000000000000000000000000000000000000000", // resolver
        [], // data
        false, // reverseRecord
        0, // fuses
      ],
      value: totalPrice,
      account: walletAddress as `0x${string}`,
    })

    return {
      success: true,
      txHash,
    }
  } catch (error) {
    console.error("Error registering name:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to register name",
    }
  }
}
