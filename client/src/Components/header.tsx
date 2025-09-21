import { Copy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnection } from './wallet-connection';

interface HeaderProps {
  title: string;
  description: string;
}

export function Header({ title, description }: HeaderProps) {
  const { isConnected, address } = useWallet();
  const { toast } = useToast();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-card border-b border-border p-6" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="header-title">
            {title}
          </h2>
          <p className="text-muted-foreground" data-testid="header-description">
            {description}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Wallet Connection Status */}
          <WalletConnection />
          
          {/* Wallet Address */}
          {isConnected && address && (
            <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
              <span 
                className="text-sm font-mono text-muted-foreground" 
                data-testid="wallet-address"
              >
                {formatAddress(address)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-auto p-1 text-muted-foreground hover:text-foreground"
                data-testid="copy-address"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Profile Menu */}
          <Button
            variant="secondary"
            size="sm"
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold p-0"
            data-testid="profile-menu"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
