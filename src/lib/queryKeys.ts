export const queryKeys = {
  wallet: {
    all: ['wallet'] as const,
    owned: (addresses: string[]) => [...queryKeys.wallet.all, 'owned', addresses] as const,
    listed: (addresses: string[]) => [...queryKeys.wallet.all, 'listed', addresses] as const,
  },
} as const;
