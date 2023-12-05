export type Currency = "erg" | "sigusd";

export interface NftAssetInterface {
  id: string; // token_id
  price?: number; // in ERGs, not nanoergs
  currency: Currency;
}
