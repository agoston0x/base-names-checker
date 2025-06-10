"use client"

import { deployNFTContract, mintNFTToAddress, getNFTBalance } from "./web3"
import { uploadToIPFS, uploadMetadataToIPFS } from "./ipfs"
import { getCurrentAccount } from "./account-client"

interface NFTData {
  name: string
  contractAddress: string
  image: string
  creator: string
  tokenURI: string
}

// Store NFT data in localStorage for demo
// In production, use a proper database
function storeNFTData(contractAddress: string, data: NFTData) {
  const existing = JSON.parse(localStorage.getItem("nft_contracts") || "{}")
  existing[contractAddress] = data
  localStorage.setItem("nft_contracts", JSON.stringify(existing))
}

function getNFTData(contractAddress: string): NFTData | null {
  const existing = JSON.parse(localStorage.getItem("nft_contracts") || "{}")
  return existing[contractAddress] || null
}

export async function createNFT(
  name: string,
  imageFile: File,
): Promise<{
  name: string
  image: string
  contractAddress: string
}> {
  const account = await getCurrentAccount()
  if (!account) {
    throw new Error("No wallet connected")
  }

  try {
    // 1. Upload image to IPFS
    console.log("Uploading image to IPFS...")
    const imageIPFS = await uploadToIPFS(imageFile)

    // 2. Create and upload metadata to IPFS
    console.log("Creating metadata...")
    const metadata = {
      name,
      description: `${name} - Created on LFChat NFT Platform`,
      image: imageIPFS,
    }
    const metadataIPFS = await uploadMetadataToIPFS(metadata)

    // 3. Deploy NFT contract
    console.log("Deploying NFT contract...")
    const symbol = name.toUpperCase().replace(/\s+/g, "").substring(0, 5)
    const contractAddress = await deployNFTContract(name, symbol, account)

    // 4. Store NFT data
    const nftData: NFTData = {
      name,
      contractAddress,
      image: imageIPFS,
      creator: account,
      tokenURI: metadataIPFS,
    }
    storeNFTData(contractAddress, nftData)

    // Convert image for display
    const imageUrl = await fileToDataUrl(imageFile)

    return {
      name,
      image: imageUrl,
      contractAddress,
    }
  } catch (error) {
    console.error("Error creating NFT:", error)
    throw new Error("Failed to create NFT. Please check your wallet and try again.")
  }
}

export async function getNFTDetails(contractAddress: string) {
  return getNFTData(contractAddress)
}

export async function mintNFT(contractAddress: string): Promise<{
  txHash: string
}> {
  const account = await getCurrentAccount()
  if (!account) {
    throw new Error("No wallet connected")
  }

  const nftData = getNFTData(contractAddress)
  if (!nftData) {
    throw new Error("NFT not found")
  }

  try {
    console.log("Minting NFT...")
    const txHash = await mintNFTToAddress(contractAddress, account, nftData.tokenURI, account)

    return { txHash }
  } catch (error) {
    console.error("Error minting NFT:", error)
    throw new Error("Failed to mint NFT. Please check your wallet and try again.")
  }
}

export async function checkNFTBalance(contractAddress: string, address: string): Promise<number> {
  try {
    return await getNFTBalance(contractAddress, address)
  } catch (error) {
    console.error("Error checking NFT balance:", error)
    return 0
  }
}

// Helper function to convert File to data URL
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
