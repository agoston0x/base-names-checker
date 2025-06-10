"use client"

// Client-side account management that works with the session system
export async function getCurrentAccount(): Promise<string | null> {
  try {
    // First try to get from the current page's session
    const response = await fetch("/api/account", {
      method: "GET",
      credentials: "include",
    })

    if (response.ok) {
      const data = await response.json()
      return data.account || null
    }

    // Fallback: try to get directly from MetaMask
    if (typeof window !== "undefined" && window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      return accounts[0] || null
    }

    return null
  } catch (error) {
    console.error("Error getting current account:", error)
    return null
  }
}

export async function saveCurrentAccount(address: string): Promise<void> {
  try {
    await fetch("/api/account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ address }),
    })
  } catch (error) {
    console.error("Error saving account:", error)
  }
}
