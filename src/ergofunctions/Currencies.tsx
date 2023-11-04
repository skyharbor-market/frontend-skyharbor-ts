import { v1ErgAddress, v1SigUsdAddress } from "./consts";

export interface CurrencyInterface {
  name: string;
  displayName: string;
  id: string;
  decimal: number;
  minSupported: number;
  initial: number;
  contractAddress: string;
}

export interface SupportedCurrenciesInterface {
  [key: string]: CurrencyInterface;

  erg: CurrencyInterface;
  sigusd: CurrencyInterface;
}

export const SupportedCurrenciesV2: SupportedCurrenciesInterface = {
  erg: {
    name: "erg",
    displayName: "ERG",
    id: "",
    decimal: 9,
    minSupported: 10000000,
    initial: 10000000,
    contractAddress: v1ErgAddress,
  },
  sigusd: {
    name: "sigusd",
    displayName: "SigUSD",
    id: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
    decimal: 2,
    minSupported: 100,
    initial: 1,
    contractAddress: v1SigUsdAddress,
  },
  // SigRSV: {
  //     name: 'SigRSV',
  //     id: '003bd19d0187117f130b62e1bcab0939929ff5c7709f843c5c4dd158949285d0',
  //     decimal: 0,
  //     minSupported: 100,
  //     initial: 1,
  // },
};
