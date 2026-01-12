import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  getPendingTransactionsForWallet,
  removePendingTransactions,
  addPendingTransaction as addPendingTx,
  removePendingTransaction as removePendingTx,
  clearPendingTransactionsForWallet,
  type PendingTransaction,
} from "@/lib/pendingTransactions";
import { explorerApiV1Url } from "@/ergofunctions/consts";

const POLL_INTERVAL = 15000; // 15 seconds

interface TxStatusResponse {
  id?: string;
  numConfirmations?: number;
}

/**
 * Check if a transaction is confirmed on the Ergo blockchain
 */
async function checkTxConfirmed(txId: string): Promise<boolean> {
  try {
    const response = await fetch(`${explorerApiV1Url}/transactions/${txId}`);
    if (!response.ok) return false;

    const data: TxStatusResponse = await response.json();
    // Transaction is confirmed if it exists and has at least 1 confirmation
    return !!data?.id && (data?.numConfirmations ?? 0) >= 1;
  } catch {
    return false;
  }
}

/**
 * Hook for managing pending transactions with automatic polling
 */
export function usePendingTransactions(walletAddresses: string[] | null | undefined) {
  const queryClient = useQueryClient();
  const hasWallet = Array.isArray(walletAddresses) && walletAddresses.length > 0;
  const primaryAddress = hasWallet ? walletAddresses[0] : "";

  const {
    data: pendingTransactions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.transactions.pending(primaryAddress),
    queryFn: async (): Promise<PendingTransaction[]> => {
      if (!hasWallet || !primaryAddress) return [];

      // Get pending transactions for this wallet
      const userTxs = getPendingTransactionsForWallet(primaryAddress);
      if (userTxs.length === 0) return [];

      // Check status of each pending tx
      const statusChecks = await Promise.all(
        userTxs.map(async (tx) => ({
          txId: tx.txId,
          confirmed: await checkTxConfirmed(tx.txId),
        }))
      );

      // Find confirmed transactions
      const confirmedTxIds = statusChecks
        .filter((s) => s.confirmed)
        .map((s) => s.txId);

      // If any confirmed, remove them and invalidate wallet queries
      if (confirmedTxIds.length > 0) {
        removePendingTransactions(confirmedTxIds);

        // Invalidate wallet queries to refetch NFT lists
        queryClient.invalidateQueries({
          queryKey: queryKeys.wallet.listed(walletAddresses || []),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.wallet.owned(walletAddresses || []),
        });
      }

      // Return still-pending transactions
      return userTxs.filter((tx) => !confirmedTxIds.includes(tx.txId));
    },
    enabled: hasWallet,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false, // Don't poll when tab is hidden
    staleTime: 0, // Always refetch
  });

  /**
   * Add a new pending transaction
   */
  const addPendingTransaction = (
    tx: Omit<PendingTransaction, "timestamp">
  ) => {
    addPendingTx(tx);
    // Invalidate query to pick up the new transaction
    queryClient.invalidateQueries({
      queryKey: queryKeys.transactions.pending(primaryAddress),
    });
  };

  /**
   * Remove a specific pending transaction
   */
  const removePendingTransaction = (txId: string) => {
    removePendingTx(txId);
    queryClient.invalidateQueries({
      queryKey: queryKeys.transactions.pending(primaryAddress),
    });
  };

  /**
   * Clear all pending transactions for the current wallet
   */
  const clearPendingTransactions = () => {
    if (primaryAddress) {
      clearPendingTransactionsForWallet(primaryAddress);
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.pending(primaryAddress),
      });
    }
  };

  return {
    pendingTransactions,
    isLoading,
    hasPendingTransactions: pendingTransactions.length > 0,
    addPendingTransaction,
    removePendingTransaction,
    clearPendingTransactions,
    refetch,
  };
}

export type { PendingTransaction };
