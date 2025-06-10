import { NameChecker } from "@/components/name-checker"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-black text-white p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Base Names</h1>
          <p className="mt-2 text-gray-400">Check and register your .base.eth name</p>
        </div>

        <NameChecker />
      </div>
    </div>
  )
}
