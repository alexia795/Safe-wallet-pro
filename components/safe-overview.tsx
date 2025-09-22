"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Copy, ExternalLink, Users, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { SafeInfo } from "@/lib/safe-sdk"

interface SafeOverviewProps {
  safeInfo: SafeInfo | null
}

export function SafeOverview({ safeInfo }: SafeOverviewProps) {
  const { toast } = useToast()

  const copyAddress = () => {
    if (safeInfo?.address) {
      navigator.clipboard.writeText(safeInfo.address)
      toast({
        title: "Address copied",
        description: "Safe address has been copied to clipboard",
      })
    }
  }

  if (!safeInfo) return null

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Safe Wallet Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Multi-signature wallet management</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Version {safeInfo.version}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Safe Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4" />
              Safe Address
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                {safeInfo.address.slice(0, 10)}...{safeInfo.address.slice(-8)}
              </code>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={`https://etherscan.io/address/${safeInfo.address}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Signature Threshold */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Signature Threshold
            </div>
            <div className="text-2xl font-bold text-primary">
              {safeInfo.threshold} of {safeInfo.owners.length}
            </div>
            <p className="text-xs text-muted-foreground">Required confirmations</p>
          </div>

          {/* Transaction Nonce */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4" />
              Next Nonce
            </div>
            <div className="text-2xl font-bold text-secondary">#{safeInfo.nonce}</div>
            <p className="text-xs text-muted-foreground">Transaction counter</p>
          </div>
        </div>

        {/* Owners List */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Safe Owners</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {safeInfo.owners.map((owner, index) => (
              <div key={owner} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <code className="text-xs flex-1">
                  {owner.slice(0, 6)}...{owner.slice(-4)}
                </code>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
