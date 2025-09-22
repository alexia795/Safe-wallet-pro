// Cross-chain bridge and multi-chain support utilities
export interface ChainInfo {
  chainId: number
  name: string
  symbol: string
  rpcUrl: string
  blockExplorer: string
  safeService: string
  bridgeSupported: boolean
  color: string
  icon: string
}

export interface BridgeRoute {
  id: string
  fromChain: number
  toChain: number
  token: string
  protocol: string
  estimatedTime: string
  fee: string
  minAmount: string
  maxAmount: string
}

export interface CrossChainTransaction {
  id: string
  fromChain: number
  toChain: number
  token: string
  amount: string
  recipient: string
  status: "pending" | "bridging" | "completed" | "failed"
  txHash: string
  bridgeTxHash?: string
  estimatedCompletion: string
  actualCompletion?: string
  protocol: string
  fee: string
}

// Extended chain configuration with cross-chain support
export const SUPPORTED_CHAINS: Record<string, ChainInfo> = {
  ETHEREUM: {
    chainId: 1,
    name: "Ethereum",
    symbol: "ETH",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY",
    blockExplorer: "https://etherscan.io",
    safeService: "https://safe-transaction-mainnet.safe.global",
    bridgeSupported: true,
    color: "#627EEA",
    icon: "⟠",
  },
  ARBITRUM: {
    chainId: 42161,
    name: "Arbitrum One",
    symbol: "ETH",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    safeService: "https://safe-transaction-arbitrum.safe.global",
    bridgeSupported: true,
    color: "#28A0F0",
    icon: "🔵",
  },
  POLYGON: {
    chainId: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    safeService: "https://safe-transaction-polygon.safe.global",
    bridgeSupported: true,
    color: "#8247E5",
    icon: "🟣",
  },
  OPTIMISM: {
    chainId: 10,
    name: "Optimism",
    symbol: "ETH",
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    safeService: "https://safe-transaction-optimism.safe.global",
    bridgeSupported: true,
    color: "#FF0420",
    icon: "🔴",
  },
  BASE: {
    chainId: 8453,
    name: "Base",
    symbol: "ETH",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    safeService: "https://safe-transaction-base.safe.global",
    bridgeSupported: true,
    color: "#0052FF",
    icon: "🔷",
  },
}

// Mock bridge routes for demo
export const MOCK_BRIDGE_ROUTES: BridgeRoute[] = [
  {
    id: "eth-arb-usdc",
    fromChain: 1,
    toChain: 42161,
    token: "USDC",
    protocol: "Arbitrum Bridge",
    estimatedTime: "10-15 minutes",
    fee: "0.001 ETH",
    minAmount: "1",
    maxAmount: "100000",
  },
  {
    id: "eth-poly-usdc",
    fromChain: 1,
    toChain: 137,
    token: "USDC",
    protocol: "Polygon PoS Bridge",
    estimatedTime: "20-30 minutes",
    fee: "0.002 ETH",
    minAmount: "1",
    maxAmount: "50000",
  },
  {
    id: "arb-eth-eth",
    fromChain: 42161,
    toChain: 1,
    token: "ETH",
    protocol: "Arbitrum Bridge",
    estimatedTime: "7 days",
    fee: "0.0005 ETH",
    minAmount: "0.01",
    maxAmount: "1000",
  },
]

// Mock cross-chain transactions for demo
export const MOCK_CROSS_CHAIN_TXS: CrossChainTransaction[] = [
  {
    id: "1",
    fromChain: 1,
    toChain: 42161,
    token: "USDC",
    amount: "1000000000", // 1000 USDC
    recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    status: "completed",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    bridgeTxHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    estimatedCompletion: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    actualCompletion: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
    protocol: "Arbitrum Bridge",
    fee: "0.001 ETH",
  },
  {
    id: "2",
    fromChain: 42161,
    toChain: 1,
    token: "ETH",
    amount: "500000000000000000", // 0.5 ETH
    recipient: "0x8ba1f109551bD432803012645Hac136c22C57592",
    status: "bridging",
    txHash: "0x2345678901bcdef12345678901bcdef12345678901bcdef12345678901bcdef1",
    estimatedCompletion: new Date(Date.now() + 86400000 * 6).toISOString(), // 6 days from now
    protocol: "Arbitrum Bridge",
    fee: "0.0005 ETH",
  },
]

export function getChainInfo(chainId: number): ChainInfo | undefined {
  return Object.values(SUPPORTED_CHAINS).find((chain) => chain.chainId === chainId)
}

export function getBridgeRoutes(fromChain: number, toChain: number, token: string): BridgeRoute[] {
  return MOCK_BRIDGE_ROUTES.filter(
    (route) => route.fromChain === fromChain && route.toChain === toChain && route.token === token,
  )
}

export function formatChainName(chainId: number): string {
  const chain = getChainInfo(chainId)
  return chain ? chain.name : `Chain ${chainId}`
}
