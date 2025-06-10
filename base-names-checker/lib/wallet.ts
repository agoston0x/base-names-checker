"use client"

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found. Please install MetaMask or another wallet.")
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

    // Check if we're on Base chain
    const chainId = await window.ethereum.request({ method: "eth_chainId" })
    const baseChainId = "0x2105" // Base Mainnet

    // If not on Base, prompt to switch
    if (chainId !== baseChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: baseChainId }],
        })
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: baseChainId,
                chainName: "Base Mainnet",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          })
        } else {
          throw switchError
        }
      }
    }

    return accounts[0]
  } catch (error) {
    console.error("Error connecting to wallet:", error)
    throw error
  }
}

// Add this to make TypeScript happy with window.ethereum
declare global {
  interface Window {
    ethereum: any
  }
}
