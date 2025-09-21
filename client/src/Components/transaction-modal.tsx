import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSafe } from '@/hooks/use-safe';

const transactionSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  value: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount'),
  data: z.string().optional().default('0x'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safeAddress?: string;
}

export function TransactionModal({ open, onOpenChange, safeAddress }: TransactionModalProps) {
  const { createTransaction, isCreatingTransaction } = useSafe(safeAddress);
  const { toast } = useToast();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      to: '',
      value: '',
      data: '0x',
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (!safeAddress) {
        throw new Error('Safe address is required');
      }

      // Convert value to wei (assuming ETH)
      const valueInWei = (parseFloat(data.value) * 1e18).toString();

      createTransaction({
        safeId: 'safe-id', // This would come from the safe context
        to: data.to,
        value: valueInWei,
        data: data.data || '0x',
        operation: 0, // CALL
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: 0, // This should be fetched from the safe
        safeTxGas: 0,
        baseGas: 0,
        gasPrice: '0',
        confirmationsRequired: 2, // This should come from safe threshold
      });

      toast({
        title: "Transaction Proposed",
        description: "Your transaction has been proposed and is waiting for confirmations.",
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to propose transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="transaction-modal">
        <DialogHeader>
          <DialogTitle>Send Transaction</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                      data-testid="input-recipient"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (ETH)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.0"
                      type="number"
                      step="0.000001"
                      {...field}
                      data-testid="input-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x"
                      {...field}
                      data-testid="input-data"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreatingTransaction}
                data-testid="button-propose"
              >
                {isCreatingTransaction ? "Proposing..." : "Propose Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
