/**
 * Pending transaction management utilities for localStorage persistence
 */

const STORAGE_KEY = "skyharbor_pending_transactions";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface PendingTransaction {
  txId: string;
  type: "delist" | "buy" | "list" | "edit";
  tokenId: string;
  nftName: string;
  timestamp: number;
  walletAddress: string;
  ipfsArtHash?: string;
  collectionName?: string;
}

/**
 * Get all pending transactions from localStorage, filtering out stale ones
 */
export function getPendingTransactions(): PendingTransaction[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed: PendingTransaction[] = JSON.parse(stored);
    // Filter out transactions older than MAX_AGE_MS
    const fresh = parsed.filter(
      (tx) => Date.now() - tx.timestamp < MAX_AGE_MS
    );
    // If we filtered any out, update storage
    if (fresh.length !== parsed.length) {
      savePendingTransactions(fresh);
    }
    return fresh;
  } catch {
    return [];
  }
}

/**
 * Get pending transactions for a specific wallet address
 */
export function getPendingTransactionsForWallet(
  walletAddress: string
): PendingTransaction[] {
  return getPendingTransactions().filter(
    (tx) => tx.walletAddress === walletAddress
  );
}

/**
 * Save pending transactions to localStorage
 */
export function savePendingTransactions(txs: PendingTransaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

/**
 * Add a new pending transaction
 */
export function addPendingTransaction(
  tx: Omit<PendingTransaction, "timestamp">
): void {
  const existing = getPendingTransactions();
  // Avoid duplicates
  if (existing.some((t) => t.txId === tx.txId)) return;

  const newTx: PendingTransaction = {
    ...tx,
    timestamp: Date.now(),
  };
  savePendingTransactions([...existing, newTx]);
}

/**
 * Remove a specific pending transaction by txId
 */
export function removePendingTransaction(txId: string): void {
  const existing = getPendingTransactions();
  const filtered = existing.filter((tx) => tx.txId !== txId);
  savePendingTransactions(filtered);
}

/**
 * Remove multiple pending transactions by txId
 */
export function removePendingTransactions(txIds: string[]): void {
  const existing = getPendingTransactions();
  const filtered = existing.filter((tx) => !txIds.includes(tx.txId));
  savePendingTransactions(filtered);
}

/**
 * Clear all pending transactions for a specific wallet address
 */
export function clearPendingTransactionsForWallet(
  walletAddress: string
): void {
  const existing = getPendingTransactions();
  const filtered = existing.filter((tx) => tx.walletAddress !== walletAddress);
  savePendingTransactions(filtered);
}

/**
 * Clear all pending transactions
 */
export function clearAllPendingTransactions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
