# Base Names Checker

A simple, focused web application for checking Base Name Service (.base.eth) availability and registering names.

## Features

- ✅ Check .base.eth name availability
- ✅ Display pricing information
- ✅ Connect wallet (MetaMask support)
- ✅ Register available names
- ✅ Transaction tracking
- ✅ Responsive design
- ✅ Real-time validation

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Viem** - Ethereum interactions
- **Lucide React** - Icons
- **shadcn/ui** - UI components

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter your desired name (3+ characters, letters/numbers/hyphens only)
2. Click the search button to check availability
3. If available, connect your wallet
4. Register the name (requires ETH for gas + registration fee)
5. Track your transaction on BaseScan

## Configuration

To use with real Base Name Service contracts, update the contract addresses in `lib/base-names.ts`:

\`\`\`typescript
const BASE_REGISTRAR_ADDRESS = "0x..." // Real registrar address
const BASE_RESOLVER_ADDRESS = "0x..."  // Real resolver address
\`\`\`

## Deployment

Deploy to Vercel:

\`\`\`bash
npm run build
\`\`\`

Or use the Vercel CLI for automatic deployment.

## License

MIT License
