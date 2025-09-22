"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Calendar, CreditCard, Settings, Play, Pause, Trash2, Plus, TrendingUp, AlertTriangle, Zap } from "lucide-react"
import {
  AVAILABLE_MODULES,
  MOCK_RECURRING_PAYMENTS,
  MOCK_ALLOWANCES,
  MOCK_PAYMENT_STREAMS,
  type PayableModule,
  type RecurringPayment,
  type Allowance,
  type PaymentStream,
} from "@/lib/payable-modules"
import type { SafeBalance } from "@/lib/safe-sdk"

interface PayableModulesProps {
  balances: SafeBalance[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}

export function PayableModules({ balances, onProposeTransaction }: PayableModulesProps) {
  const [activeTab, setActiveTab] = useState("modules")
  const [modules, setModules] = useState(AVAILABLE_MODULES)
  const [recurringPayments, setRecurringPayments] = useState(MOCK_RECURRING_PAYMENTS)
  const [allowances, setAllowances] = useState(MOCK_ALLOWANCES)
  const [paymentStreams, setPaymentStreams] = useState(MOCK_PAYMENT_STREAMS)

  const toggleModule = (moduleId: string) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, enabled: !m.enabled } : m)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payable Modules</h2>
          <p className="text-muted-foreground">Automate payments and manage spending allowances</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recurring ({recurringPayments.length})
          </TabsTrigger>
          <TabsTrigger value="allowances" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Allowances ({allowances.length})
          </TabsTrigger>
          <TabsTrigger value="streams" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Streams ({paymentStreams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <ModulesManagement modules={modules} onToggleModule={toggleModule} />
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <RecurringPaymentsManagement
            payments={recurringPayments}
            balances={balances}
            onProposeTransaction={onProposeTransaction}
          />
        </TabsContent>

        <TabsContent value="allowances" className="space-y-4">
          <AllowancesManagement
            allowances={allowances}
            balances={balances}
            onProposeTransaction={onProposeTransaction}
          />
        </TabsContent>

        <TabsContent value="streams" className="space-y-4">
          <PaymentStreamsManagement
            streams={paymentStreams}
            balances={balances}
            onProposeTransaction={onProposeTransaction}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ModulesManagement({
  modules,
  onToggleModule,
}: {
  modules: PayableModule[]
  onToggleModule: (moduleId: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => (
          <Card key={module.id} className={module.enabled ? "border-primary/50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${module.enabled ? "bg-primary/10" : "bg-muted"}`}>
                    <Zap className={`h-5 w-5 ${module.enabled ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <Switch checked={module.enabled} onCheckedChange={() => onToggleModule(module.id)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version:</span>
                  <Badge variant="outline">{module.version}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={module.enabled ? "default" : "secondary"}>
                    {module.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Permissions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {module.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Enabling modules grants them specific permissions to execute transactions on behalf of your Safe. Only enable
          trusted modules.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function RecurringPaymentsManagement({
  payments,
  balances,
  onProposeTransaction,
}: {
  payments: RecurringPayment[]
  balances: SafeBalance[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recurring Payments</h3>
        <CreateRecurringPaymentDialog balances={balances} onProposeTransaction={onProposeTransaction} />
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No recurring payments</h3>
            <p className="text-muted-foreground">Set up automated payments to save time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <RecurringPaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  )
}

function RecurringPaymentCard({ payment }: { payment: RecurringPayment }) {
  const { toast } = useToast()
  const progress = (payment.executedCount / payment.totalExecutions) * 100
  const isEth = payment.token === "ETH"
  const amount = isEth
    ? (Number.parseFloat(payment.amount) / 1e18).toFixed(4)
    : (Number.parseFloat(payment.amount) / 1e6).toFixed(2)

  const handlePause = () => {
    toast({
      title: "Payment paused",
      description: "Recurring payment has been paused",
    })
  }

  const handleResume = () => {
    toast({
      title: "Payment resumed",
      description: "Recurring payment has been resumed",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{payment.description}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {amount} {payment.token} every {Math.floor(payment.interval / 86400)} days
              </p>
            </div>
          </div>
          <Badge variant={payment.isActive ? "default" : "secondary"}>{payment.isActive ? "Active" : "Paused"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Recipient:</span>
            <br />
            <code className="text-xs">
              {payment.recipient.slice(0, 10)}...{payment.recipient.slice(-10)}
            </code>
          </div>
          <div>
            <span className="text-muted-foreground">Next Payment:</span>
            <br />
            <span>{new Date(payment.nextExecution).toLocaleDateString()}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>
              {payment.executedCount}/{payment.totalExecutions} payments
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex gap-2">
          {payment.isActive ? (
            <Button variant="outline" size="sm" onClick={handlePause} className="bg-transparent">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleResume} className="bg-transparent">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Button variant="outline" size="sm" className="bg-transparent">
            <Settings className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive bg-transparent">
            <Trash2 className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AllowancesManagement({
  allowances,
  balances,
  onProposeTransaction,
}: {
  allowances: Allowance[]
  balances: SafeBalance[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Spending Allowances</h3>
        <CreateAllowanceDialog balances={balances} onProposeTransaction={onProposeTransaction} />
      </div>

      {allowances.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No allowances set</h3>
            <p className="text-muted-foreground">Create spending limits for addresses</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allowances.map((allowance) => (
            <AllowanceCard key={allowance.id} allowance={allowance} />
          ))}
        </div>
      )}
    </div>
  )
}

function AllowanceCard({ allowance }: { allowance: Allowance }) {
  const isEth = allowance.token === "ETH"
  const totalAmount = isEth
    ? (Number.parseFloat(allowance.amount) / 1e18).toFixed(4)
    : (Number.parseFloat(allowance.amount) / 1e6).toFixed(2)
  const spentAmount = isEth
    ? (Number.parseFloat(allowance.spent) / 1e18).toFixed(4)
    : (Number.parseFloat(allowance.spent) / 1e6).toFixed(2)
  const remainingAmount = isEth
    ? ((Number.parseFloat(allowance.amount) - Number.parseFloat(allowance.spent)) / 1e18).toFixed(4)
    : ((Number.parseFloat(allowance.amount) - Number.parseFloat(allowance.spent)) / 1e6).toFixed(2)

  const spentPercentage = (Number.parseFloat(allowance.spent) / Number.parseFloat(allowance.amount)) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-lg">{allowance.description}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalAmount} {allowance.token} allowance
              </p>
            </div>
          </div>
          <Badge variant={allowance.isActive ? "default" : "secondary"}>
            {allowance.isActive ? "Active" : "Expired"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Spender:</span>
            <br />
            <code className="text-xs">
              {allowance.spender.slice(0, 10)}...{allowance.spender.slice(-10)}
            </code>
          </div>
          <div>
            <span className="text-muted-foreground">Expires:</span>
            <br />
            <span>{new Date(allowance.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Spent</span>
            <span>
              {spentAmount}/{totalAmount} {allowance.token}
            </span>
          </div>
          <Progress value={spentPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {remainingAmount} {allowance.token} remaining
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Settings className="h-4 w-4 mr-2" />
            Modify
          </Button>
          <Button variant="outline" size="sm" className="text-destructive bg-transparent">
            <Trash2 className="h-4 w-4 mr-2" />
            Revoke
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentStreamsManagement({
  streams,
  balances,
  onProposeTransaction,
}: {
  streams: PaymentStream[]
  balances: SafeBalance[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment Streams</h3>
        <CreatePaymentStreamDialog balances={balances} onProposeTransaction={onProposeTransaction} />
      </div>

      {streams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No payment streams</h3>
            <p className="text-muted-foreground">Stream payments over time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {streams.map((stream) => (
            <PaymentStreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentStreamCard({ stream }: { stream: PaymentStream }) {
  const totalAmount = Number.parseFloat(stream.totalAmount) / 1e6 // Assuming USDC
  const streamedAmount = Number.parseFloat(stream.streamedAmount) / 1e6
  const remainingAmount = totalAmount - streamedAmount
  const streamedPercentage = (streamedAmount / totalAmount) * 100

  const now = new Date()
  const startTime = new Date(stream.startTime)
  const endTime = new Date(stream.endTime)
  const totalDuration = endTime.getTime() - startTime.getTime()
  const elapsed = now.getTime() - startTime.getTime()
  const timeProgress = Math.min((elapsed / totalDuration) * 100, 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">{stream.description}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalAmount.toFixed(2)} {stream.token} over{" "}
                {Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
          <Badge variant={stream.isActive ? "default" : "secondary"}>
            {stream.isActive ? "Streaming" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Recipient:</span>
            <br />
            <code className="text-xs">
              {stream.recipient.slice(0, 10)}...{stream.recipient.slice(-10)}
            </code>
          </div>
          <div>
            <span className="text-muted-foreground">End Date:</span>
            <br />
            <span>{endTime.toLocaleDateString()}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Amount Streamed</span>
            <span>
              {streamedAmount.toFixed(2)}/{totalAmount.toFixed(2)} {stream.token}
            </span>
          </div>
          <Progress value={streamedPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {remainingAmount.toFixed(2)} {stream.token} remaining
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Time Progress</span>
            <span>{timeProgress.toFixed(1)}%</span>
          </div>
          <Progress value={timeProgress} className="h-2" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Settings className="h-4 w-4 mr-2" />
            Modify
          </Button>
          <Button variant="outline" size="sm" className="text-destructive bg-transparent">
            <Trash2 className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Dialog components for creating new payable items
function CreateRecurringPaymentDialog({
  balances,
  onProposeTransaction,
}: {
  balances: SafeBalance[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock implementation
    toast({
      title: "Recurring payment created",
      description: "Payment schedule has been set up",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Recurring Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Recipient Address</Label>
            <Input placeholder="0x..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <Input type="number" step="any" placeholder="0.0" required />
            </div>
            <div>
              <Label>Token</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
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
          <div>
            <Label>Payment Interval</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Input placeholder="Payment description" required />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CreateAllowanceDialog({
  balances,
  onProposeTransaction,
}: {
  balances: SafeBalance[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Allowance created",
      description: "Spending allowance has been set",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Allowance
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Spending Allowance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Spender Address</Label>
            <Input placeholder="0x..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <Input type="number" step="any" placeholder="0.0" required />
            </div>
            <div>
              <Label>Token</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
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
          <div>
            <Label>Expiration</Label>
            <Input type="date" required />
          </div>
          <div>
            <Label>Description</Label>
            <Input placeholder="Allowance description" required />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Allowance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CreatePaymentStreamDialog({
  balances,
  onProposeTransaction,
}: {
  balances: SafeBalance[]
  onProposeTransaction: (transaction: { to: string; value: string; data: string }) => Promise<string>
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Payment stream created",
      description: "Payment streaming has been initiated",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Stream
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Payment Stream</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Recipient Address</Label>
            <Input placeholder="0x..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Amount</Label>
              <Input type="number" step="any" placeholder="0.0" required />
            </div>
            <div>
              <Label>Token</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" required />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" required />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input placeholder="Stream description" required />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Stream
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
