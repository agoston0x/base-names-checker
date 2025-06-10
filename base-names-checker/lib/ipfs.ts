"use client"

// Simple IPFS-like storage simulation
// In production, use actual IPFS or Pinata/NFT.Storage
export async function uploadToIPFS(file: File): Promise<string> {
  // Convert file to base64 for demo
  // In production, upload to actual IPFS
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      // Simulate IPFS hash
      const hash = `Qm${Math.random().toString(36).substring(2, 15)}`

      // Store in localStorage for demo (in production, this would be IPFS)
      localStorage.setItem(`ipfs_${hash}`, base64)

      resolve(`ipfs://${hash}`)
    }
    reader.readAsDataURL(file)
  })
}

export async function uploadMetadataToIPFS(metadata: {
  name: string
  description: string
  image: string
}): Promise<string> {
  // Simulate metadata upload to IPFS
  const hash = `Qm${Math.random().toString(36).substring(2, 15)}`

  // Store in localStorage for demo
  localStorage.setItem(`ipfs_${hash}`, JSON.stringify(metadata))

  return `ipfs://${hash}`
}

export function getIPFSUrl(ipfsHash: string): string {
  // In production, use actual IPFS gateway
  if (ipfsHash.startsWith("ipfs://")) {
    const hash = ipfsHash.replace("ipfs://", "")
    const stored = localStorage.getItem(`ipfs_${hash}`)
    if (stored) {
      try {
        // Try to parse as JSON (metadata)
        JSON.parse(stored)
        return stored
      } catch {
        // It's a base64 image
        return stored
      }
    }
  }
  return ipfsHash
}
