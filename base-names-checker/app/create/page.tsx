import { redirect } from "next/navigation"
import { NFTCreationForm } from "@/components/nft-creation-form"
import { getAccount, getCurrentSession } from "@/lib/account"
import { WalletInfo } from "@/components/wallet-info"
import { WalletSwitcher } from "@/components/wallet-switcher"

export default async function CreateNFTPage() {
  const currentSession = await getCurrentSession()
  const account = currentSession ? await getAccount(currentSession) : await getAccount()

  if (!account) {
    redirect("/")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <header className="w-full max-w-6xl mx-auto py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">LFChat NFT</h1>
        <div className="flex items-center space-x-4">
          <WalletInfo address={account} sessionId={currentSession} />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Create Your NFT</h2>
            <p className="mt-2 text-gray-400">Fill in the details and upload an image</p>
          </div>

          <div className="p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl">
            <NFTCreationForm />
          </div>

          <WalletSwitcher />
        </div>
      </main>
    </div>
  )
}
