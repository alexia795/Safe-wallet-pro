import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/use-wallet';
import { useWebSocket } from '@/hooks/use-websocket';

export function WalletConnection() {
  const { isConnected, connect, disconnect } = useWallet();
  const { isConnected: isWebSocketConnected } = useWebSocket();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <Badge 
          variant="secondary" 
          className="bg-primary/10 border border-primary/20 text-primary"
          data-testid="connection-status"
        >
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-1" />
          Connected
        </Badge>
        {isWebSocketConnected && (
          <Badge 
            variant="outline" 
            className="text-xs"
            data-testid="websocket-status"
          >
            Live
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          data-testid="disconnect-wallet"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
      data-testid="connect-wallet"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
