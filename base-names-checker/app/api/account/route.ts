import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const currentSession = cookies().get("current_session")?.value
    const cookieName = currentSession ? `wallet_address_${currentSession}` : "wallet_address"
    const account = cookies().get(cookieName)?.value

    return NextResponse.json({ account: account || null })
  } catch (error) {
    console.error("Error getting account:", error)
    return NextResponse.json({ account: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Create session ID from address
    const sessionId = address.slice(2, 8)

    // Set the account cookie with session
    const cookieName = `wallet_address_${sessionId}`
    cookies().set(cookieName, address, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
    })

    // Set current session
    cookies().set("current_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving account:", error)
    return NextResponse.json({ error: "Failed to save account" }, { status: 500 })
  }
}
