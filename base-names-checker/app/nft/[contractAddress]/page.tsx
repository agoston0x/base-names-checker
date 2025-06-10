import { redirect } from "next/navigation"
import { getNFTDetails } from "@/lib/nft"
import { getAccount, getCurrentSession } from "@/lib/account"
import { WalletInfo } from "@/components/wallet-info"
import { NFTMintSection } from "@/components/nft-mint-section"
import { WalletSwitcher } from "@/components/wallet-switcher"
import Image from "next/image"

export default async function NFTPage({
  params,
}: {
  params: { contractAddress: string }
}) {
  const currentSession = await getCurrentSession()
  const account = currentSession ? await getAccount(currentSession) : await getAccount()

  if (!account) {
    redirect("/")
  }

  const nft = await getNFTDetails(params.contractAddress)

  if (!nft) {
    redirect("/")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <header className="w-full max-w-6xl mx-auto py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">LFChat NFT</h1>
        <WalletInfo address={account} sessionId={currentSession} />
      </header>

      <main className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">{nft.name}</h2>
            <p className="mt-2 text-gray-400">
              Contract: {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
            </p>
            <p className="text-sm text-gray-500">
              Created by: {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
            </p>
          </div>

          <div className="p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl">
            <div className="relative w-full aspect-square">
              <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-contain rounded-lg" />
            </div>

            <NFTMintSection contractAddress={nft.contractAddress} nftName={nft.name} />
          </div>

          <WalletSwitcher />
        </div>
      </main>
    </div>
  )
}
