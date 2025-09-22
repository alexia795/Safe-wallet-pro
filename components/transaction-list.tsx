"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, Users, ExternalLink } from "lucide-react"
import type { SafeTransaction } from "@/lib/safe-sdk"

interface TransactionListProps {
  transactions: SafeTransaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent transactions</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <TransactionItem key={tx.safeTxHash} transaction={tx} />
      ))}
    </div>
  )
}

function TransactionItem({ transaction }: { transaction: SafeTransaction }) {
  const getStatusIcon = () => {
    if (transaction.isExecuted) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (transaction.confirmations.length >= transaction.confirmationsRequired) {
      return <Clock className="h-4 w-4 text-yellow-600" />
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  const getStatusText = () => {
    if (transaction.isExecuted) return "Executed"
    if (transaction.confirmations.length >= transaction.confirmationsRequired) return "Ready to Execute"
    return "Pending Confirmations"
  }

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (transaction.isExecuted) return "default"
    if (transaction.confirmations.length >= transaction.confirmationsRequired) return "secondary"
    return "outline"
  }

  const ethValue = Number.parseFloat(transaction.value) / 1e18

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{ethValue > 0 ? `${ethValue.toFixed(4)} ETH` : "Contract Interaction"}</span>
            <Badge variant={getStatusVariant()} className="text-xs">
              {getStatusText()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              To: {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
            </span>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {transaction.confirmations.length}/{transaction.confirmationsRequired}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
