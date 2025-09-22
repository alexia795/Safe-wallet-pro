"use client"

import { useState } from "react"
import { SafeHeader } from "@/components/safe-header"
import { WalletDashboard } from "@/components/wallet-dashboard"
import { MultiSigManagement } from "@/components/multi-sig-management"
import { TransactionManagement } from "@/components/transaction-management"
import { PayableModules } from "@/components/payable-modules"
import { CrossChainBridge } from "@/components/cross-chain-bridge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSafe } from "@/hooks/use-safe"
import { SUPPORTED_CHAINS } from "@/lib/cross-chain"
import type { SupportedNetwork } from "@/lib/safe-config"
import { LayoutDashboard, Users, Send, Zap, Badge as Bridge } from "lucide-react"

export default function HomePage() {
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>("ETHEREUM")
  const [activeTab, setActiveTab] = useState("dashboard")
  const {
    safeInfo,
    balances,
    pendingTransactions,
    loading,
    error,
    proposeTransaction,
    confirmTransaction,
    executeTransaction,
  } = useSafe(selectedNetwork)

  // Get current chain ID for cross-chain functionality
  const currentChainId = SUPPORTED_CHAINS[selectedNetwork]?.chainId || 1

  return (
    <div className="min-h-screen bg-background">
      <SafeHeader safeAddress={safeInfo?.address} network={selectedNetwork} onNetworkChange={setSelectedNetwork} />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="multisig" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Multi-Sig
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="bridge" className="flex items-center gap-2">
              <Bridge className="h-4 w-4" />
              Bridge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <WalletDashboard
              safeInfo={safeInfo}
              balances={balances}
              pendingTransactions={pendingTransactions}
              loading={loading}
              error={error}
            />
          </TabsContent>

          <TabsContent value="multisig">
            <MultiSigManagement
              safeInfo={safeInfo}
              pendingTransactions={pendingTransactions}
              onConfirmTransaction={confirmTransaction}
              onExecuteTransaction={executeTransaction}
              onProposeTransaction={proposeTransaction}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionManagement
              balances={balances}
              pendingTransactions={pendingTransactions}
              onProposeTransaction={proposeTransaction}
            />
          </TabsContent>

          <TabsContent value="modules">
            <PayableModules balances={balances} onProposeTransaction={proposeTransaction} />
          </TabsContent>

          <TabsContent value="bridge">
            <CrossChainBridge
              balances={balances}
              currentChain={currentChainId}
              onProposeTransaction={proposeTransaction}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
