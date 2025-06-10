"use server"

import { cookies } from "next/headers"

// Store the connected account in a cookie with a specific key for the session
export async function saveAccount(address: string, sessionId?: string) {
  const cookieName = sessionId ? `wallet_address_${sessionId}` : "wallet_address"
  cookies().set(cookieName, address, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
  })
}

// Get the connected account from the cookie
export async function getAccount(sessionId?: string): Promise<string | undefined> {
  const cookieName = sessionId ? `wallet_address_${sessionId}` : "wallet_address"
  const address = cookies().get(cookieName)?.value
  return address
}

// Clear the account cookie
export async function clearAccount(sessionId?: string) {
  const cookieName = sessionId ? `wallet_address_${sessionId}` : "wallet_address"
  cookies().delete(cookieName)
}

// Get current session ID from cookies
export async function getCurrentSession(): Promise<string | undefined> {
  return cookies().get("current_session")?.value
}

// Set current session ID
export async function setCurrentSession(sessionId: string) {
  cookies().set("current_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
  })
}
