import { Link, useLocation } from 'wouter';
import { Shield, Home, Wallet, ArrowLeftRight, Users, Vote, Settings, ChevronDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SUPPORTED_CHAINS } from '@/lib/constants';
import { useWallet } from '@/hooks/use-wallet';

export function Sidebar() {
  const [location] = useLocation();
  const { chainId, switchChain } = useWallet();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: location === '/' },
    { name: 'Assets', href: '/assets', icon: Wallet, current: location === '/assets' },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight, current: location === '/transactions' },
    { name: 'Signers', href: '/signers', icon: Users, current: location === '/signers', badge: '3/5' },
    { name: 'Proposals', href: '/proposals', icon: Vote, current: location === '/proposals', badge: '2', badgeVariant: 'destructive' as const },
    { name: 'Admin', href: '/admin', icon: Lock, current: location === '/admin', badge: '3', badgeVariant: 'destructive' as const },
    { name: 'Settings', href: '/settings', icon: Settings, current: location === '/settings' },
  ];

  const currentChain = chainId ? SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS] : null;

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="text-primary-foreground h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Safe Wallet Pro</h1>
            <p className="text-xs text-muted-foreground">Multi-Sig Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  item.current
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="w-4 h-4" />
                <span className={cn("font-medium", item.current && "font-semibold")}>
                  {item.name}
                </span>
                {item.badge && (
                  <Badge 
                    variant={item.badgeVariant || "secondary"} 
                    className="ml-auto text-xs"
                    data-testid={`badge-${item.name.toLowerCase()}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Network Selector */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => {
            // Cycle through supported chains for demo
            const chainIds = Object.keys(SUPPORTED_CHAINS).map(Number);
            const currentIndex = chainId ? chainIds.indexOf(chainId) : -1;
            const nextIndex = (currentIndex + 1) % chainIds.length;
            switchChain(chainIds[nextIndex]);
          }}
          data-testid="network-selector"
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">
                {currentChain?.symbol?.[0] || 'E'}
              </span>
            </div>
            <span className="text-sm font-medium">
              {currentChain?.name || 'Ethereum'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </aside>
  );
}
