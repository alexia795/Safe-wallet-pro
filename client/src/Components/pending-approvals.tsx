import { Send, Users, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSafe } from '@/hooks/use-safe';
import type { Transaction } from '@shared/schema';

interface PendingApprovalsProps {
  safeAddress?: string;
}

export function PendingApprovals({ safeAddress }: PendingApprovalsProps) {
  const { pendingTransactions, addConfirmation, isAddingConfirmation } = useSafe(safeAddress);
  const { toast } = useToast();

  const handleApprove = async (transactionId: string) => {
    try {
      addConfirmation({
        transactionId,
        owner: '0xCurrentUserAddress', // This should come from wallet context
        signature: 'mock-signature',
        signatureType: 'EOA',
      });

      toast({
        title: "Transaction Approved",
        description: "Your approval has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve transaction",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (transactionId: string) => {
    toast({
      title: "Transaction Rejected",
      description: "Transaction has been rejected.",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Less than an hour ago';
  };

  if (!pendingTransactions || pendingTransactions.length === 0) {
    return (
      <Card data-testid="pending-approvals-empty">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pending Approvals
            <Badge variant="secondary">0 pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending transactions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="pending-approvals">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pending Approvals
          <Badge variant="destructive">{pendingTransactions.length} pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="border border-border rounded-lg p-4 bg-accent/5"
            data-testid={`pending-transaction-${transaction.id}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  {transaction.value === '0' ? (
                    <Users className="text-accent-foreground h-3 w-3" />
                  ) : (
                    <Send className="text-accent-foreground h-3 w-3" />
                  )}
                </div>
                <span className="font-medium text-foreground">
                  {transaction.value === '0' 
                    ? 'Configuration Change' 
                    : `Send ${parseFloat(transaction.value) / 1e18} ETH`
                  }
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(transaction.submissionDate)}
              </span>
            </div>
            
            <div className="text-xs text-muted-foreground mb-3 font-mono">
              To: {formatAddress(transaction.to)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-muted-foreground">Approvals:</span>
                <span className="text-xs text-accent font-medium">
                  {transaction.confirmations}/{transaction.confirmationsRequired}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(transaction.id)}
                  data-testid={`reject-${transaction.id}`}
                >
                  <X className="h-3 w-3 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(transaction.id)}
                  disabled={isAddingConfirmation}
                  data-testid={`approve-${transaction.id}`}
                >
                  <Check className="h-3 w-3 mr-1" />
                  {isAddingConfirmation ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
