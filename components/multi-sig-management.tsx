"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Users, UserPlus, Settings, Shield, CheckCircle, Clock, AlertTriangle, Copy, ExternalLink } from "lucide-react"
import type { SafeInfo, SafeTransaction } from "@/lib/safe-sdk"

interface MultiSigManagementProps {
  safeInfo: SafeInfo | null
  pendingTransactions: SafeTransaction[]
  onConfirmTransaction: (safeTxHash: string) => Promise<void>
  onExecuteTransaction: (safeTxHash: string) => Promise<string>
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}

export function MultiSigManagement({
  safeInfo,
  pendingTransactions,
  onConfirmTransaction,
  onExecuteTransaction,
  onProposeTransaction,
}: MultiSigManagementProps) {
  const [activeTab, setActiveTab] = useState("pending")
  const { toast } = useToast()

  const handleConfirm = async (safeTxHash: string) => {
    try {
      await onConfirmTransaction(safeTxHash)
      toast({
        title: "Transaction confirmed",
        description: "Your confirmation has been recorded",
      })
    } catch (error) {
      toast({
        title: "Confirmation failed",
        description: error instanceof Error ? error.message : "Failed to confirm transaction",
        variant: "destructive",
      })
    }
  }

  const handleExecute = async (safeTxHash: string) => {
    try {
      const txHash = await onExecuteTransaction(safeTxHash)
      toast({
        title: "Transaction executed",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      })
    } catch (error) {
      toast({
        title: "Execution failed",
        description: error instanceof Error ? error.message : "Failed to execute transaction",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Signature Management</h2>
          <p className="text-muted-foreground">Manage owners, thresholds, and transaction approvals</p>
        </div>
        <div className="flex gap-2">
          <AddOwnerDialog onProposeTransaction={onProposeTransaction} />
          <ChangeThresholdDialog safeInfo={safeInfo} onProposeTransaction={onProposeTransaction} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="owners" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Owners ({safeInfo?.owners.length || 0})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <PendingTransactions
            transactions={pendingTransactions}
            onConfirm={handleConfirm}
            onExecute={handleExecute}
            threshold={safeInfo?.threshold || 0}
          />
        </TabsContent>

        <TabsContent value="owners" className="space-y-4">
          <OwnersManagement safeInfo={safeInfo} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SafeSettings safeInfo={safeInfo} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PendingTransactions({
  transactions,
  onConfirm,
  onExecute,
  threshold,
}: {
  transactions: SafeTransaction[]
  onConfirm: (safeTxHash: string) => Promise<void>
  onExecute: (safeTxHash: string) => Promise<void>
  threshold: number
}) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No pending transactions</h3>
          <p className="text-muted-foreground">All transactions have been processed</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <TransactionCard
          key={tx.safeTxHash}
          transaction={tx}
          onConfirm={onConfirm}
          onExecute={onExecute}
          threshold={threshold}
        />
      ))}
    </div>
  )
}

function TransactionCard({
  transaction,
  onConfirm,
  onExecute,
  threshold,
}: {
  transaction: SafeTransaction
  onConfirm: (safeTxHash: string) => Promise<void>
  onExecute: (safeTxHash: string) => Promise<void>
  threshold: number
}) {
  const canExecute = transaction.confirmations.length >= threshold
  const ethValue = Number.parseFloat(transaction.value) / 1e18

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {ethValue > 0 ? `Send ${ethValue.toFixed(4)} ETH` : "Contract Interaction"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                To: {transaction.to.slice(0, 10)}...{transaction.to.slice(-10)}
              </p>
            </div>
          </div>
          <Badge variant={canExecute ? "default" : "secondary"}>
            {transaction.confirmations.length}/{threshold} confirmations
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Nonce:</span> #{transaction.nonce}
          </div>
          <div>
            <span className="text-muted-foreground">Submitted:</span>{" "}
            {new Date(transaction.submissionDate).toLocaleDateString()}
          </div>
        </div>

        {transaction.confirmations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Confirmations</h4>
            <div className="space-y-2">
              {transaction.confirmations.map((confirmation) => (
                <div key={confirmation.owner} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <code className="bg-muted px-2 py-1 rounded">
                    {confirmation.owner.slice(0, 6)}...{confirmation.owner.slice(-4)}
                  </code>
                  <span className="text-muted-foreground">
                    {new Date(confirmation.submissionDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={() => onConfirm(transaction.safeTxHash)} variant="outline" className="flex-1 bg-transparent">
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirm
          </Button>
          <Button onClick={() => onExecute(transaction.safeTxHash)} disabled={!canExecute} className="flex-1">
            <Shield className="h-4 w-4 mr-2" />
            Execute
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={`https://etherscan.io/tx/${transaction.safeTxHash}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function OwnersManagement({ safeInfo }: { safeInfo: SafeInfo | null }) {
  const { toast } = useToast()

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address copied",
      description: "Owner address has been copied to clipboard",
    })
  }

  if (!safeInfo) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Owners ({safeInfo.owners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safeInfo.owners.map((owner, index) => (
              <div key={owner} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <code className="text-sm font-mono">{owner}</code>
                    <p className="text-xs text-muted-foreground">Safe Owner</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => copyAddress(owner)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`https://etherscan.io/address/${owner}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Adding or removing owners requires a multi-signature transaction that must be approved by the current owners.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function SafeSettings({ safeInfo }: { safeInfo: SafeInfo | null }) {
  if (!safeInfo) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Safe Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Current Threshold</Label>
              <div className="text-2xl font-bold text-primary">
                {safeInfo.threshold} of {safeInfo.owners.length}
              </div>
              <p className="text-xs text-muted-foreground">Required signatures for execution</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Safe Version</Label>
              <div className="text-2xl font-bold text-secondary">{safeInfo.version}</div>
              <p className="text-xs text-muted-foreground">Smart contract version</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Changing the signature threshold requires approval from the current threshold number of owners.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function AddOwnerDialog({
  onProposeTransaction,
}: {
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  const [open, setOpen] = useState(false)
  const [newOwner, setNewOwner] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOwner) return

    setLoading(true)
    try {
      // Mock transaction data for adding owner
      await onProposeTransaction({
        to: "0x1234567890123456789012345678901234567890", // Safe contract address
        value: "0",
        data: `0xaddOwner${newOwner.slice(2)}`, // Mock encoded function call
      })

      toast({
        title: "Add owner transaction proposed",
        description: "The transaction has been submitted for approval",
      })
      setOpen(false)
      setNewOwner("")
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-transparent">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Owner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Owner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newOwner">Owner Address</Label>
            <Input
              id="newOwner"
              placeholder="0x..."
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              required
            />
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Adding a new owner requires approval from the current threshold number of owners.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Proposing..." : "Propose Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ChangeThresholdDialog({
  safeInfo,
  onProposeTransaction,
}: {
  safeInfo: SafeInfo | null
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  const [open, setOpen] = useState(false)
  const [newThreshold, setNewThreshold] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newThreshold || !safeInfo) return

    setLoading(true)
    try {
      // Mock transaction data for changing threshold
      await onProposeTransaction({
        to: safeInfo.address,
        value: "0",
        data: `0xchangeThreshold${Number.parseInt(newThreshold).toString(16).padStart(64, "0")}`,
      })

      toast({
        title: "Change threshold transaction proposed",
        description: "The transaction has been submitted for approval",
      })
      setOpen(false)
      setNewThreshold("")
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

  if (!safeInfo) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-transparent">
          <Settings className="h-4 w-4 mr-2" />
          Change Threshold
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Signature Threshold</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newThreshold">New Threshold</Label>
            <Select value={newThreshold} onValueChange={setNewThreshold}>
              <SelectTrigger>
                <SelectValue placeholder="Select new threshold" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: safeInfo.owners.length }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} of {safeInfo.owners.length}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Current threshold: {safeInfo.threshold} of {safeInfo.owners.length}
            </p>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Changing the threshold requires approval from the current threshold number of owners.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Proposing..." : "Propose Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
