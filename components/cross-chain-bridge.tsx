"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowRightLeft,
  Badge as Bridge,
  History,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  RefreshCw,
  Zap,
} from "lucide-react"
import {
  SUPPORTED_CHAINS,
  MOCK_CROSS_CHAIN_TXS,
  getBridgeRoutes,
  formatChainName,
  type BridgeRoute,
  type CrossChainTransaction,
} from "@/lib/cross-chain"
import type { SafeBalance } from "@/lib/safe-sdk"

interface CrossChainBridgeProps {
  balances: SafeBalance[]
  currentChain: number
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}

export function CrossChainBridge({ balances, currentChain, onProposeTransaction }: CrossChainBridgeProps) {
  const [activeTab, setActiveTab] = useState("bridge")
  const [crossChainTxs, setCrossChainTxs] = useState(MOCK_CROSS_CHAIN_TXS)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cross-Chain Bridge</h2>
          <p className="text-muted-foreground">Transfer assets across different blockchain networks</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Bridge Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bridge" className="flex items-center gap-2">
            <Bridge className="h-4 w-4" />
            Bridge Assets
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Bridge History ({crossChainTxs.length})
          </TabsTrigger>
          <TabsTrigger value="networks" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Networks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bridge" className="space-y-4">
          <BridgeInterface
            balances={balances}
            currentChain={currentChain}
            onProposeTransaction={onProposeTransaction}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <BridgeHistory transactions={crossChainTxs} />
        </TabsContent>

        <TabsContent value="networks" className="space-y-4">
          <NetworksOverview currentChain={currentChain} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BridgeInterface({
  balances,
  currentChain,
  onProposeTransaction,
}: {
  balances: SafeBalance[]
  currentChain: number
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  const [fromChain, setFromChain] = useState(currentChain.toString())
  const [toChain, setToChain] = useState("")
  const [selectedToken, setSelectedToken] = useState("ETH")
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<BridgeRoute | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const availableRoutes = getBridgeRoutes(Number.parseInt(fromChain), Number.parseInt(toChain), selectedToken)

  const handleSwapChains = () => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  const handleBridge = async () => {
    if (!selectedRoute || !amount || !recipient) return

    setLoading(true)
    try {
      // Mock bridge transaction
      const bridgeData = `0xbridge${selectedRoute.id}${amount}${recipient.slice(2)}`
      await onProposeTransaction({
        to: "0x0000000000000000000000000000000000000001", // Bridge contract placeholder
        value: selectedToken === "ETH" ? (Number.parseFloat(amount) * 1e18).toString() : "0",
        data: bridgeData,
      })

      toast({
        title: "Bridge transaction initiated",
        description: `Bridging ${amount} ${selectedToken} to ${formatChainName(Number.parseInt(toChain))}`,
      })

      // Reset form
      setAmount("")
      setRecipient("")
    } catch (error) {
      toast({
        title: "Bridge failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bridge Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chain Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label>From Chain</Label>
              <Select value={fromChain} onValueChange={setFromChain}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                    <SelectItem key={key} value={chain.chainId.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{chain.icon}</span>
                        {chain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={handleSwapChains} className="bg-transparent">
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label>To Chain</Label>
              <Select value={toChain} onValueChange={setToChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_CHAINS)
                    .filter(([, chain]) => chain.chainId.toString() !== fromChain)
                    .map(([key, chain]) => (
                      <SelectItem key={key} value={chain.chainId.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{chain.icon}</span>
                          {chain.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Token and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  {balances
                    .filter((b) => b.token)
                    .map((balance) => (
                      <SelectItem key={balance.token!.symbol} value={balance.token!.symbol}>
                        {balance.token!.symbol}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="any"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Recipient */}
          <div>
            <Label>Recipient Address</Label>
            <Input placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>

          {/* Bridge Routes */}
          {fromChain && toChain && selectedToken && availableRoutes.length > 0 && (
            <div>
              <Label>Bridge Route</Label>
              <div className="space-y-2 mt-2">
                {availableRoutes.map((route) => (
                  <Card
                    key={route.id}
                    className={`cursor-pointer transition-colors ${
                      selectedRoute?.id === route.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{route.protocol}</h4>
                          <p className="text-sm text-muted-foreground">
                            Fee: {route.fee} • Time: {route.estimatedTime}
                          </p>
                        </div>
                        <Badge variant="outline">Recommended</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedRoute && (
            <Alert>
              <Bridge className="h-4 w-4" />
              <AlertDescription>
                Bridging will take approximately {selectedRoute.estimatedTime}. Make sure the recipient address is
                correct on the destination chain.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleBridge} disabled={loading || !selectedRoute} className="w-full">
            {loading ? "Initiating Bridge..." : "Bridge Assets"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function BridgeHistory({ transactions }: { transactions: CrossChainTransaction[] }) {
  const { toast } = useToast()

  const copyTxHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    toast({
      title: "Transaction hash copied",
      description: "Hash has been copied to clipboard",
    })
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No bridge history</h3>
          <p className="text-muted-foreground">Your cross-chain transactions will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <BridgeTransactionCard key={tx.id} transaction={tx} onCopyHash={copyTxHash} />
      ))}
    </div>
  )
}

function BridgeTransactionCard({
  transaction,
  onCopyHash,
}: {
  transaction: CrossChainTransaction
  onCopyHash: (hash: string) => void
}) {
  const fromChain =
    SUPPORTED_CHAINS[
      Object.keys(SUPPORTED_CHAINS).find((key) => SUPPORTED_CHAINS[key].chainId === transaction.fromChain) || "ETHEREUM"
    ]
  const toChain =
    SUPPORTED_CHAINS[
      Object.keys(SUPPORTED_CHAINS).find((key) => SUPPORTED_CHAINS[key].chainId === transaction.toChain) || "ARBITRUM"
    ]

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "bridging":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (transaction.status) {
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const amount =
    transaction.token === "ETH"
      ? (Number.parseFloat(transaction.amount) / 1e18).toFixed(4)
      : (Number.parseFloat(transaction.amount) / 1e6).toFixed(2)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{fromChain.icon}</span>
                <ArrowRightLeft className="h-4 w-4" />
                <span>{toChain.icon}</span>
                Bridge {amount} {transaction.token}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {fromChain.name} → {toChain.name} via {transaction.protocol}
              </p>
            </div>
          </div>
          <Badge variant={getStatusVariant()}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Recipient:</span>
            <br />
            <code className="text-xs">
              {transaction.recipient.slice(0, 10)}...{transaction.recipient.slice(-10)}
            </code>
          </div>
          <div>
            <span className="text-muted-foreground">Fee:</span>
            <br />
            <span>{transaction.fee}</span>
          </div>
        </div>

        {transaction.status === "bridging" && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Bridge Progress</span>
              <span>Estimated: {new Date(transaction.estimatedCompletion).toLocaleDateString()}</span>
            </div>
            <Progress value={30} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Transaction is being processed on the destination chain
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Source Tx:</span>
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {transaction.txHash.slice(0, 10)}...{transaction.txHash.slice(-10)}
            </code>
            <Button variant="ghost" size="sm" onClick={() => onCopyHash(transaction.txHash)}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={`${fromChain.blockExplorer}/tx/${transaction.txHash}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {transaction.bridgeTxHash && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Bridge Tx:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {transaction.bridgeTxHash.slice(0, 10)}...{transaction.bridgeTxHash.slice(-10)}
              </code>
              <Button variant="ghost" size="sm" onClick={() => onCopyHash(transaction.bridgeTxHash!)}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={`${toChain.blockExplorer}/tx/${transaction.bridgeTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function NetworksOverview({ currentChain }: { currentChain: number }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
          <Card key={key} className={chain.chainId === currentChain ? "border-primary bg-primary/5" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{chain.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{chain.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Chain ID: {chain.chainId}</p>
                  </div>
                </div>
                {chain.chainId === currentChain && <Badge variant="default">Current</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Native Token:</span>
                  <span>{chain.symbol}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bridge Support:</span>
                  <Badge variant={chain.bridgeSupported ? "default" : "secondary"}>
                    {chain.bridgeSupported ? "Supported" : "Coming Soon"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Safe Service:</span>
                  <Badge variant="outline">Active</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <a href={chain.blockExplorer} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Explorer
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          Cross-chain functionality allows you to manage Safe wallets across multiple networks and bridge assets
          seamlessly between supported chains.
        </AlertDescription>
      </Alert>
    </div>
  )
}
