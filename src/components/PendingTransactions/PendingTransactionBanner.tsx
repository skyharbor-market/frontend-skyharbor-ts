import { useSelector } from "react-redux";
import { usePendingTransactions } from "@/hooks/usePendingTransactions";
import { HiOutlineExternalLink, HiX } from "react-icons/hi";
import { cloudinaryOptimizerUrl, ipfsGateway } from "@/ergofunctions/consts";

export default function PendingTransactionBanner() {
  const { addresses: userAddresses } = useSelector(
    (state: any) => state.wallet
  );
  const {
    pendingTransactions,
    hasPendingTransactions,
    removePendingTransaction,
  } = usePendingTransactions(userAddresses);

  if (!hasPendingTransactions) return null;

  const getImageUrl = (ipfsHash?: string) => {
    if (!ipfsHash) return null;
    return `${cloudinaryOptimizerUrl}/f_auto,q_auto,w_40/${ipfsGateway}/${ipfsHash}`;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

      {/* Glass-morphism container */}
      <div className="bg-amber-50/80 dark:bg-amber-950/40 backdrop-blur-sm border-b border-amber-200/50 dark:border-amber-800/30">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - status indicator */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Pulsing dot */}
              <div className="relative flex-shrink-0">
                <span className="flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                </span>
              </div>

              <span className="text-sm font-medium text-amber-800 dark:text-amber-200 whitespace-nowrap">
                {pendingTransactions.length === 1
                  ? "Transaction pending"
                  : `${pendingTransactions.length} transactions pending`}
              </span>
            </div>

            {/* Right side - transaction pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {pendingTransactions.slice(0, 3).map((tx) => (
                <div
                  key={tx.txId}
                  className="flex items-center gap-2 bg-white/60 dark:bg-black/30 rounded-full pl-1.5 pr-2 py-1 border border-amber-200/60 dark:border-amber-700/40 shadow-sm"
                >
                  {/* NFT thumbnail */}
                  {tx.ipfsArtHash ? (
                    <img
                      src={getImageUrl(tx.ipfsArtHash) || ""}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-800" />
                  )}

                  {/* NFT name */}
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate max-w-[80px] sm:max-w-[120px]">
                    {tx.nftName}
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <a
                      href={`https://explorer.ergoplatform.com/en/transactions/${tx.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
                      title="View on Explorer"
                    >
                      <HiOutlineExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => removePendingTransaction(tx.txId)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      title="Dismiss"
                    >
                      <HiX size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Overflow indicator */}
              {pendingTransactions.length > 3 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
                  +{pendingTransactions.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
