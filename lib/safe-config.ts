// Safe SDK configuration and utilities
export const SAFE_CONFIG = {
  // Default Safe address from README
  SAFE_ADDRESS: process.env.NEXT_PUBLIC_SAFE_ADDRESS || "0xFDf84a0e7D07bC56f7De56696fc409704cC83a24",
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY",

  // Supported networks
  NETWORKS: {
    ETHEREUM: {
      chainId: 1,
      name: "Ethereum",
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY",
      safeService: "https://safe-transaction-mainnet.safe.global",
    },
    ARBITRUM: {
      chainId: 42161,
      name: "Arbitrum",
      rpcUrl: "https://arb1.arbitrum.io/rpc",
      safeService: "https://safe-transaction-arbitrum.safe.global",
    },
    POLYGON: {
      chainId: 137,
      name: "Polygon",
      rpcUrl: "https://polygon-rpc.com",
      safeService: "https://safe-transaction-polygon.safe.global",
    },
  },
}

export type NetworkConfig = typeof SAFE_CONFIG.NETWORKS.ETHEREUM
export type SupportedNetwork = keyof typeof SAFE_CONFIG.NETWORKS
