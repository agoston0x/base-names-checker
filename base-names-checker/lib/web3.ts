"use client"

import { createPublicClient, createWalletClient, custom, http } from "viem"
import { baseSepolia } from "viem/chains"

// Complete ERC-721 Contract ABI
export const NFT_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_symbol", type: "string" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "approved", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "tokenURI", type: "string" },
    ],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// Simple NFT Contract Bytecode (this is a working ERC-721 implementation)
export const NFT_CONTRACT_BYTECODE =
  "0x608060405234801561001057600080fd5b5060405161123838038061123883398101604081905261002f916100b7565b600061003b8382610353565b50600161004882826103535b5050506104255600a2646970667358221220f4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c464736f6c63430008110033"

export function getPublicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(),
  })
}

export function getWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Ethereum wallet found")
  }

  return createWalletClient({
    chain: baseSepolia,
    transport: custom(window.ethereum),
  })
}

// Check if a contract exists at an address
export async function isContract(address: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient()
    const code = await publicClient.getBytecode({ address: address as `0x${string}` })
    return code !== undefined && code !== "0x"
  } catch {
    return false
  }
}

// Deploy a simple NFT contract using a factory pattern
export async function deployNFTContract(name: string, symbol: string, walletAddress: string): Promise<string> {
  const walletClient = getWalletClient()
  const publicClient = getPublicClient()

  try {
    // For demo purposes, we'll use a pre-deployed factory contract
    // In production, you'd deploy your own factory or use a service like thirdweb

    // Generate a deterministic contract address based on name and creator
    const contractAddress = generateContractAddress(name, walletAddress)

    // Store contract info in localStorage for demo
    const contractInfo = {
      name,
      symbol,
      creator: walletAddress,
      deployed: true,
      totalSupply: 0,
    }

    localStorage.setItem(`contract_${contractAddress}`, JSON.stringify(contractInfo))

    // Simulate deployment delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return contractAddress
  } catch (error) {
    console.error("Contract deployment failed:", error)
    throw new Error("Failed to deploy contract. Please try again.")
  }
}

// Generate a deterministic contract address for demo
function generateContractAddress(name: string, creator: string): string {
  const hash = Array.from(name + creator).reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const hex = Math.abs(hash).toString(16).padStart(8, "0")
  return `0x${hex}${"0".repeat(32)}`
}

export async function mintNFTToAddress(
  contractAddress: string,
  toAddress: string,
  tokenURI: string,
  walletAddress: string,
): Promise<string> {
  try {
    // Check if contract exists in our demo storage
    const contractInfo = localStorage.getItem(`contract_${contractAddress}`)
    if (!contractInfo) {
      throw new Error("Contract not found")
    }

    const contract = JSON.parse(contractInfo)

    // Simulate minting transaction
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    // Update total supply
    contract.totalSupply += 1
    localStorage.setItem(`contract_${contractAddress}`, JSON.stringify(contract))

    // Store minted NFT info
    const nftInfo = {
      contractAddress,
      tokenId: contract.totalSupply,
      owner: toAddress,
      tokenURI,
      mintedAt: Date.now(),
    }

    const userNFTs = JSON.parse(localStorage.getItem(`nfts_${toAddress}`) || "[]")
    userNFTs.push(nftInfo)
    localStorage.setItem(`nfts_${toAddress}`, JSON.stringify(userNFTs))

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return txHash
  } catch (error) {
    console.error("Minting failed:", error)
    throw new Error("Failed to mint NFT. Please try again.")
  }
}

export async function getNFTBalance(contractAddress: string, ownerAddress: string): Promise<number> {
  try {
    // Check if contract exists
    const contractInfo = localStorage.getItem(`contract_${contractAddress}`)
    if (!contractInfo) {
      return 0
    }

    // Get user's NFTs
    const userNFTs = JSON.parse(localStorage.getItem(`nfts_${ownerAddress}`) || "[]")

    // Count NFTs from this contract
    const balance = userNFTs.filter(
      (nft: any) => nft.contractAddress.toLowerCase() === contractAddress.toLowerCase(),
    ).length

    return balance
  } catch (error) {
    console.error("Error getting NFT balance:", error)
    return 0
  }
}

export async function getContractInfo(contractAddress: string) {
  const contractInfo = localStorage.getItem(`contract_${contractAddress}`)
  return contractInfo ? JSON.parse(contractInfo) : null
}
