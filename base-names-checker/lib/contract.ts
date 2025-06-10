"use client"

// Function to retrieve contract info from localStorage
export async function getContractInfo(contractAddress: string) {
  try {
    const contractInfo = localStorage.getItem(`contract_${contractAddress}`)
    return contractInfo ? JSON.parse(contractInfo) : null
  } catch (error) {
    console.error("Error getting contract info:", error)
    return null
  }
}
