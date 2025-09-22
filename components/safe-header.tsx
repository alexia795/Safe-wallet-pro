"use client"

import { Shield, Wallet, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { SAFE_CONFIG, type SupportedNetwork } from "@/lib/safe-config"
import { SUPPORTED_CHAINS } from "@/lib/cross-chain"

interface SafeHeaderProps {
  safeAddress?: string
  network: SupportedNetwork
  onNetworkChange: (network: SupportedNetwork) => void
}

export function SafeHeader({ safeAddress, network, onNetworkChange }: SafeHeaderProps) {
  const currentNetwork = SAFE_CONFIG.NETWORKS[network]
  const chainInfo = SUPPORTED_CHAINS[network]

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Safe Wallet Pro</h1>
                <p className="text-sm text-muted-foreground">Multi-signature crypto management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {safeAddress && (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {safeAddress.slice(0, 6)}...{safeAddress.slice(-4)}
                </code>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {chainInfo && <span className="text-sm">{chainInfo.icon}</span>}
                    {currentNetwork.name}
                  </Badge>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(SAFE_CONFIG.NETWORKS).map(([key, networkConfig]) => {
                  const chainData = SUPPORTED_CHAINS[key as SupportedNetwork]
                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => onNetworkChange(key as SupportedNetwork)}
                      className={network === key ? "bg-accent" : ""}
                    >
                      <div className="flex items-center gap-2">
                        {chainData && <span>{chainData.icon}</span>}
                        {networkConfig.name}
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
