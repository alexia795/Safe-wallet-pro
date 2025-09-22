"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Send, ArrowUpDown } from "lucide-react"
import type { SafeBalance } from "@/lib/safe-sdk"

interface BalanceCardProps {
  balance: SafeBalance
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const isEth = !balance.tokenAddress
  const tokenSymbol = balance.token?.symbol || "ETH"
  const tokenName = balance.token?.name || "Ethereum"
  const formattedBalance = isEth
    ? (Number.parseFloat(balance.balance) / 1e18).toFixed(4)
    : (Number.parseFloat(balance.balance) / Math.pow(10, balance.token?.decimals || 18)).toFixed(2)

  // Mock price change for demo
  const priceChange = Math.random() > 0.5 ? 2.5 : -1.2
  const isPositive = priceChange > 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              {balance.token?.logoUri ? (
                <img
                  src={balance.token.logoUri || "/placeholder.svg"}
                  alt={tokenSymbol}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <span className="text-sm font-bold text-primary">{tokenSymbol.slice(0, 2)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{tokenSymbol}</h3>
                <Badge variant="outline" className="text-xs">
                  {tokenName}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formattedBalance} {tokenSymbol}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="font-semibold">${Number.parseFloat(balance.fiatBalance).toLocaleString()}</div>
            <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(priceChange)}%
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Swap
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
