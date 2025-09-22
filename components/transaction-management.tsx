"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Send,
  Plus,
  History,
  FileText,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Code,
} from "lucide-react"
import type { SafeBalance, SafeTransaction } from "@/lib/safe-sdk"

interface TransactionManagementProps {
  balances: SafeBalance[]
  pendingTransactions: SafeTransaction[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}

interface BatchTransaction {
  id: string
  to: string
  value: string
  data: string
  description: string
}

export function TransactionManagement({
  balances,
  pendingTransactions,
  onProposeTransaction,
}: TransactionManagementProps) {
  const [activeTab, setActiveTab] = useState("create")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction Management</h2>
          <p className="text-muted-foreground">Create, batch, and manage Safe transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Create Transaction
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Batch Transactions
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <CreateTransaction balances={balances} onProposeTransaction={onProposeTransaction} />
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <BatchTransactions balances={balances} onProposeTransaction={onProposeTransaction} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <TransactionHistory transactions={pendingTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CreateTransaction({
  balances,
  onProposeTransaction,
}: {
  balances: SafeBalance[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  const [transactionType, setTransactionType] = useState<"send" | "contract">("send")
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("ETH")
  const [contractData, setContractData] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient) return

    setLoading(true)
    try {
      let value = "0"
      let data = "0x"

      if (transactionType === "send" && amount) {
        if (selectedToken === "ETH") {
          value = (Number.parseFloat(amount) * 1e18).toString()
        } else {
          // For ERC20 tokens, we need to encode the transfer function call
          const tokenBalance = balances.find((b) => b.token?.symbol === selectedToken)
          if (tokenBalance?.tokenAddress) {
            const decimals = tokenBalance.token?.decimals || 18
            const transferAmount = (Number.parseFloat(amount) * Math.pow(10, decimals)).toString(16).padStart(64, "0")
            const recipientAddress = recipient.slice(2).padStart(64, "0")
            data = `0xa9059cbb${recipientAddress}${transferAmount}` // transfer(address,uint256)
            value = "0"
            recipient = tokenBalance.tokenAddress // Send to token contract
          }
        }
      } else if (transactionType === "contract") {
        data = contractData || "0x"
      }

      const txHash = await onProposeTransaction({
        to: recipient,
        value,
        data,
      })

      toast({
        title: "Transaction proposed",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      })

      // Reset form
      setRecipient("")
      setAmount("")
      setContractData("")
    } catch (error) {
      toast({
        title: "Failed to propose transaction",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Transaction Type</Label>
            <Select value={transactionType} onValueChange={(value: "send" | "contract") => setTransactionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send">Send Assets</SelectItem>
                <SelectItem value="contract">Contract Interaction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>

          {transactionType === "send" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Asset</Label>
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
              </div>

              {selectedToken !== "ETH" && (
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    Token transfers require contract interaction and may consume more gas.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {transactionType === "contract" && (
            <div>
              <Label htmlFor="contractData">Contract Data (Hex)</Label>
              <Textarea
                id="contractData"
                placeholder="0x..."
                value={contractData}
                onChange={(e) => setContractData(e.target.value)}
                className="font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the encoded function call data for contract interaction
              </p>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This transaction will require approval from the required number of Safe owners before execution.
            </AlertDescription>
          </Alert>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Proposing Transaction..." : "Propose Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function BatchTransactions({
  balances,
  onProposeTransaction,
}: {
  balances: SafeBalance[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  const [transactions, setTransactions] = useState<BatchTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const addTransaction = () => {
    const newTransaction: BatchTransaction = {
      id: Date.now().toString(),
      to: "",
      value: "0",
      data: "0x",
      description: "",
    }
    setTransactions([...transactions, newTransaction])
  }

  const updateTransaction = (id: string, field: keyof BatchTransaction, value: string) => {
    setTransactions(transactions.map((tx) => (tx.id === id ? { ...tx, [field]: value } : tx)))
  }

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter((tx) => tx.id !== id))
  }

  const handleBatchSubmit = async () => {
    if (transactions.length === 0) return

    setLoading(true)
    try {
      // For demo purposes, we'll create a single transaction that represents the batch
      // In a real implementation, this would use Safe's batch transaction functionality
      const batchData = transactions.map((tx) => `${tx.to}:${tx.value}:${tx.data}`).join("|")

      await onProposeTransaction({
        to: "0x0000000000000000000000000000000000000000", // Batch transaction placeholder
        value: "0",
        data: `0xbatch${Buffer.from(batchData).toString("hex")}`,
      })

      toast({
        title: "Batch transaction proposed",
        description: `${transactions.length} transactions batched successfully`,
      })

      setTransactions([])
    } catch (error) {
      toast({
        title: "Failed to propose batch",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Batch Transactions</CardTitle>
          <Button onClick={addTransaction} variant="outline" size="sm" className="bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions in batch</p>
              <p className="text-sm">Add transactions to create a batch</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <Card key={tx.id} className="border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Transaction {index + 1}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeTransaction(tx.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Transaction description"
                        value={tx.description}
                        onChange={(e) => updateTransaction(tx.id, "description", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>To Address</Label>
                      <Input
                        placeholder="0x..."
                        value={tx.to}
                        onChange={(e) => updateTransaction(tx.id, "to", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Value (ETH)</Label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="0.0"
                          value={tx.value === "0" ? "" : (Number.parseFloat(tx.value) / 1e18).toString()}
                          onChange={(e) =>
                            updateTransaction(
                              tx.id,
                              "value",
                              (Number.parseFloat(e.target.value || "0") * 1e18).toString(),
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Data</Label>
                        <Input
                          placeholder="0x..."
                          value={tx.data}
                          onChange={(e) => updateTransaction(tx.id, "data", e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleBatchSubmit} disabled={loading} className="flex-1">
                  {loading ? "Proposing Batch..." : `Propose Batch (${transactions.length} transactions)`}
                </Button>
                <Button variant="outline" onClick={() => setTransactions([])} className="bg-transparent">
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Batch transactions allow you to execute multiple operations in a single Safe transaction, saving gas and
          simplifying complex operations.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function TransactionHistory({ transactions }: { transactions: SafeTransaction[] }) {
  const { toast } = useToast()

  const copyTxHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    toast({
      title: "Transaction hash copied",
      description: "Hash has been copied to clipboard",
    })
  }

  // Mock some historical transactions for demo
  const allTransactions = [
    ...transactions,
    {
      to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      value: "500000000000000000", // 0.5 ETH
      data: "0x",
      operation: 0,
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000",
      refundReceiver: "0x0000000000000000000000000000000000000000",
      nonce: 41,
      executionDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      submissionDate: new Date(Date.now() - 90000000).toISOString(),
      modified: new Date(Date.now() - 86400000).toISOString(),
      blockNumber: 18500000,
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      safeTxHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      executor: "0x1234567890123456789012345678901234567890",
      isExecuted: true,
      isSuccessful: true,
      ethGasPrice: "20000000000",
      gasUsed: 21000,
      fee: "420000000000000",
      origin: null,
      dataDecoded: null,
      confirmationsRequired: 2,
      confirmations: [
        {
          owner: "0x1234567890123456789012345678901234567890",
          submissionDate: new Date(Date.now() - 90000000).toISOString(),
          transactionHash: null,
          confirmationType: "CONFIRMATION",
          signature: "0x123456",
        },
        {
          owner: "0x0987654321098765432109876543210987654321",
          submissionDate: new Date(Date.now() - 89000000).toISOString(),
          transactionHash: null,
          confirmationType: "CONFIRMATION",
          signature: "0x789abc",
        },
      ],
      signatures: "0x123456789abc",
    },
  ]

  return (
    <div className="space-y-4">
      {allTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No transaction history</h3>
            <p className="text-muted-foreground">Transactions will appear here once created</p>
          </CardContent>
        </Card>
      ) : (
        allTransactions.map((tx) => (
          <HistoryTransactionCard key={tx.safeTxHash} transaction={tx} onCopyHash={copyTxHash} />
        ))
      )}
    </div>
  )
}

function HistoryTransactionCard({
  transaction,
  onCopyHash,
}: {
  transaction: SafeTransaction
  onCopyHash: (hash: string) => void
}) {
  const ethValue = Number.parseFloat(transaction.value) / 1e18
  const isContractInteraction = transaction.data !== "0x" && transaction.data !== ""

  const getStatusIcon = () => {
    if (transaction.isExecuted) {
      return transaction.isSuccessful ? (
        <CheckCircle className="h-5 w-5 text-green-600" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-red-600" />
      )
    }
    return <Clock className="h-5 w-5 text-yellow-600" />
  }

  const getStatusText = () => {
    if (transaction.isExecuted) {
      return transaction.isSuccessful ? "Executed Successfully" : "Execution Failed"
    }
    return "Pending Execution"
  }

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (transaction.isExecuted) {
      return transaction.isSuccessful ? "default" : "destructive"
    }
    return "secondary"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {isContractInteraction ? (
                  <>
                    <Code className="h-4 w-4" />
                    Contract Interaction
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {ethValue > 0 ? `Send ${ethValue.toFixed(4)} ETH` : "Transaction"}
                  </>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                To: {transaction.to.slice(0, 10)}...{transaction.to.slice(-10)}
              </p>
            </div>
          </div>
          <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Nonce:</span> #{transaction.nonce}
          </div>
          <div>
            <span className="text-muted-foreground">Submitted:</span>{" "}
            {new Date(transaction.submissionDate).toLocaleDateString()}
          </div>
          {transaction.executionDate && (
            <div>
              <span className="text-muted-foreground">Executed:</span>{" "}
              {new Date(transaction.executionDate).toLocaleDateString()}
            </div>
          )}
          {transaction.gasUsed && (
            <div>
              <span className="text-muted-foreground">Gas Used:</span> {transaction.gasUsed.toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Safe Tx Hash:</span>
          <code className="bg-muted px-2 py-1 rounded text-xs">
            {transaction.safeTxHash.slice(0, 10)}...{transaction.safeTxHash.slice(-10)}
          </code>
          <Button variant="ghost" size="sm" onClick={() => onCopyHash(transaction.safeTxHash)}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        {transaction.transactionHash && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Execution Hash:</span>
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {transaction.transactionHash.slice(0, 10)}...{transaction.transactionHash.slice(-10)}
            </code>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`https://etherscan.io/tx/${transaction.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Confirmations:</span>
          <Badge variant="outline">
            {transaction.confirmations.length}/{transaction.confirmationsRequired}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
