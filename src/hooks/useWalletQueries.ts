import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getTokens } from "@/ergofunctions/walletUtils";
import { decodeArtwork } from "@/ergofunctions/serializer";
import { getBalance } from "@/ergofunctions/explorer";
import { getWalletAddress, getWalletConnector } from "@/ergofunctions/helpers";
import { getUserListedNFTsFromChain } from "@/ergofunctions/getUserListedNFTsFromChain";

// Fetch owned NFTs from wallet or blockchain
async function fetchOwnedNFTs() {
  let ids: string[] = [];
  let amounts: Record<string, number> = {};

  // Get wallet address/addresses
  const dappConnector = getWalletConnector();
  if (dappConnector === "nautilus" || dappConnector === "safew") {
    const tokens = await getTokens() as Record<string, { amount: number }> | undefined;
    if (tokens) {
      ids = Object.keys(tokens);
      ids.forEach((key) => (amounts[key] = tokens[key].amount));
    }
  } else {
    const balance = await getBalance(getWalletAddress()) as { tokens: Array<{ tokenId: string; amount: number }> };
    ids = balance.tokens.map((tok) => {
      amounts[tok.tokenId] = tok.amount;
      return tok.tokenId;
    });
  }

  // Create array of promises for each token decode attempt
  const apiCalls = ids.map((tokenId) =>
    decodeArtwork(null, tokenId, false)
      .then((result) => ({
        status: "fulfilled" as const,
        value: result,
      }))
      .catch((error) => ({
        status: "rejected" as const,
        tokenId,
        error,
      }))
  );

  // Wait for all promises to settle
  const results = await Promise.all(apiCalls);

  // Filter successful decodes
  const decoded = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as { status: "fulfilled"; value: any }).value)
    .flat();

  // Log failed decodes for debugging
  const failedDecodes = results.filter((result) => result.status === "rejected");
  if (failedDecodes.length > 0) {
    console.warn("Failed to decode some tokens:", failedDecodes);
  }

  // Add amounts to successfully decoded tokens
  for (const d of decoded) {
    if (d?.tokenId) {
      d.amount = amounts[d.tokenId];
    }
  }

  // Filter NFTs
  return decoded.filter((bx: any) => bx?.isArtwork);
}

// Hook for fetching owned NFTs
export function useOwnedNFTs(addresses: string[] | null) {
  return useQuery({
    queryKey: queryKeys.wallet.owned(addresses || []),
    queryFn: fetchOwnedNFTs,
    enabled: !!addresses && addresses.length > 0,
  });
}

// Hook for fetching listed NFTs
export function useListedNFTs(addresses: string[] | null) {
  return useQuery({
    queryKey: queryKeys.wallet.listed(addresses || []),
    queryFn: () => getUserListedNFTsFromChain(addresses!),
    enabled: !!addresses && addresses.length > 0,
    staleTime: 60 * 1000, // 60 seconds - listings only change on explicit user action
  });
}
