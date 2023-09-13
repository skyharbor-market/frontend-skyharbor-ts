import { Address } from "@coinbarn/ergo-ts";

// SEO
export const globalMeta = {
  siteName: "SkyHarbor | Ergo NFT Marketplace",
  siteUrl: "https://skyharbor.io",
  siteLogo: "/assets/images/skyharborlogo.jpeg",
  email: "skyharbornft@gmail.com",
  title: "SkyHarbor | Ergo NFT Marketplace",
  description:
    "Welcome to the premium NFT marketplace on the Ergo blockchain. Buy and sell NFTs with ease.",
};

// BACKEND URLS
// New SkyHarbor Test API url: testapi.skyharbor.io

// export const skyHarborApi = process.env.NODE_ENV === "development" ? "https://testapi.skyharbor.io" : "https://skyharbor-server.net"
// export const skyHarborApiRoot = process.env.NODE_ENV === "development" ? "testapi.skyharbor.io" : "skyharbor-server.net"

// export const skyHarborApi =  "https://skyharbor-server.net"
export const skyHarborApi = "https://api.skyharbor.io";

// export const skyHarborApi =  "https://testapi.skyharbor.io"
// export const skyHarborApiRoot = "testapi.skyharbor.io"
export const skyHarborApiRoot = "api.skyharbor.io";

// EXPLORER
// export const explorerApiUrl = 'https://explorer.skyharbor.io/api/v0'
// export const explorerApiV1Url = 'https://explorer.skyharbor.io/api/v1'

const skyharborExplorer = "https://explorer.skyharbor.io/api/v0";
const skyharborExplorerV1 = "https://explorer.skyharbor.io/api/v1";
const ergoExplorer = "https://api.ergoplatform.com/api/v0";
const ergoExplorerV1 = "https://api.ergoplatform.com/api/v1";

export const explorerApiUrl = ergoExplorer;
export const explorerApiV1Url = ergoExplorerV1;

// IMAGE URLS
export const cloudinaryOptimizerUrl = "https://skyharbor.mo.cloudinary.net";
export const ipfsGateway = "https://gateway.ipfs.io/ipfs";

// FEES
export const serviceFee = 0.02;
export const createCollectionFee = 100000000;
export const listingFee = 30000000;

// ADDRESSES
export const sigUsdAddress = `MUbV38YgqHy7XbsoXWF5z7EZm524Ybdwe5p9WDrbhruZRtehkRPT92imXer2eTkjwPDfboa1pR3zb3deVKVq3H7Xt98qcTqLuSBSbHb7izzo5jphEpcnqyKJ2xhmpNPVvmtbdJNdvdopPrHHDBbAGGeW7XYTQwEeoRfosXzcDtiGgw97b2aqjTsNFmZk7khBEQywjYfmoDc9nUCJMZ3vbSspnYo3LarLe55mh2Np8MNJqUN9APA6XkhZCrTTDRZb1B4krgFY1sVMswg2ceqguZRvC9pqt3tUUxmSnB24N6dowfVJKhLXwHPbrkHViBv1AKAJTmEaQW2DN1fRmD9ypXxZk8GXmYtxTtrj3BiunQ4qzUCu1eGzxSREjpkFSi2ATLSSDqUwxtRz639sHM6Lav4axoJNPCHbY8pvuBKUxgnGRex8LEGM8DeEJwaJCaoy8dBw9Lz49nq5mSsXLeoC4xpTUmp47Bh7GAZtwkaNreCu74m9rcZ8Di4w1cmdsiK1NWuDh9pJ2Bv7u3EfcurHFVqCkT3P86JUbKnXeNxCypfrWsFuYNKYqmjsix82g9vWcGMmAcu5nagxD4iET86iE2tMMfZZ5vqZNvntQswJyQqv2Wc6MTh4jQx1q2qJZCQe4QdEK63meTGbZNNKMctHQbp3gRkZYNrBtxQyVtNLR8xEY8zGp85GeQKbb37vqLXxRpGiigAdMe3XZA4hhYPmAAU5hpSMYaRAjtvvMT3bNiHRACGrfjvSsEG9G2zY5in2YWz5X9zXQLGTYRsQ4uNFkYoQRCBdjNxGv6R58Xq74zCgt19TxYZ87gPWxkXpWwTaHogG1eps8WXt8QzwJ9rVx6Vu9a5GjtcGsQxHovWmYixgBU8X9fPNJ9UQhYyAWbjtRSuVBtDAmoV1gCBEPwnYVP5GCGhCocbwoYhZkZjFZy6ws4uxVLid3FxuvhWvQrVEDYp7WRvGXbNdCbcSXnbeTrPMey1WPaXX`;
export const betaAddress = `Y2KFdpZQzL2Pb1vwYnaaYXcQCo7sajiPK3iL8TXttqAKwoqvVCSjqJEqi4x3PeQ8Ap5rUWYN7681J5DA7TzX5XSwVuNVatLYjmRKisnW8KoE7vGpfap4ixXB4jnw7jHMGvL81P8RtLDHvWTKDuDtnDFJiSaYH6SWxy8VKNDSM3H5sr7QSkG7NbN3wYAPHfmDnXwBajEbBRLXekpYnPc7Hb66buc1bBMhQE3vKXCxrzb93wX5zxy4cDoJhZtcFCHcxWpf1vh6DoxWu9tWEkLSaAHeVbm8fF34Nu6QZpSyQpb592ZzGgBBDz35WtYiDCyHb1CKEz1ckwXuF6cRNE2WP8ttsKX1HTPByZaaiXCqQTqWg31p1SrGj7pUXKQ9y8yYf6AJW2frv1nb9aLxmqozgZcZgVj9xeQ6BF2BVcqaiAjdwcRovh42vPzhJ2CTMEZ`;
export const v1ErgAddress =
  "26tpZU6i6zeBRuzZVo7tr47zjArAxkHP8x7ijiRbbrvLhySvSU84bH8wNPGGG27EwhJfJLe7bvRPv6B1jQFQqrWUQqBX1XJpVGoiNgveance6JFZ4mKv1KkRE8nBSB3jKBGnVJjJF6wR1Z8YXRsUqrTff4bfmtbhaRRjibnDDtKhS71spfjjTBeU1AhhQpitCDg4NFxmTLyV1arE7G2riZKzDryjWnCiEJGzWNxYtVt8uDxd3qNSRE5sHECwcsb98x7rn4q4FyHMvvWrRMPFfVgAQd5wHCAHwhMEdqUrSFQVkmUMavju8CLAgCNcVFjUBKPX4ooEHLUw3QkxS9Jp6fAFAGmzJ6QVD71mAZYMYhoEQnFyUBx1txJjVJjCrcZsW43dimbt5su4ahATJ8qRtWgwat8vTViTVXAcBmUSnqbqhAqTCxcsS5EFS6ApJSfthPHYUyXwtcbTptfdnUx1e5hEiGcwxoQ8ivufNNiZE9xkxi4nsBBrBVBJ7pfSSoHvbodkzLrq91RHYrvuatyLuBSxgJxs198xUQhULqxmWwgthJLrG5VVfVYH";
export const v1SigUsdAddress =
  "qNtfov7o2g1GYShDaD4a1QNv1bSjEXAbnWzVJQA7qVYogTFuxuw659G1WWwonQqA91AsYa9vL7JQLysRvMyNdZ6iLHH5mgx5RKn6tEE5uki3MPNg5cVrnG9rhZuKA3CpyaMbBBus7fxoYQsHgLCShaqJEyjFZsKooWqVJ1nFQeo9hiTCLcWd91B4EeWzrimYswG4cPaJyBwQp9eit1Hq1UtZ8dwo3r7vKsH7aJLzZbq6mky4itWHKueA4bybDQfPwYXoujsChY5jawj6V1YQrrVbzdxm66pBSfCdzr76nWp5VdnPJXbvnN6tHpv2Taivs23JJBPakAeDSpX1TuYx7Ce5KYHutTczNcytPQgbetWXNxTKzDsmzLbEX1bsWdryJnJT5bUHUXEEacWmz6JgUaKRbrJwWNgrpH5V3t6nvUgpZFpwQnNLYnLQs4tVHch3DeifD3f7BX4s5E3qArtDkNMPsY6AgUPd6kLNbfRvyZPf2RDA2CXn9ABmnKmTZdJYfc2bLHG1H7igeBH4g5Tok5fkjux6L8T8Pf7jBiV6WYRjD4y8E6idTTWrBJ9vvPJURnFD6L8jp2f3xt6HvKD1bokKUZyeTiu9hmFm3s9TE8x7ztCXeYUiJq7Lm4FzFsXkyqKgGDRSXXGmqDpwaWSdtH9Pn43kLWr8hRoMkAm1f9e6nhJQfCRu8wAK3Zv74vRfq";
export const makeOfferAddress =
  "Vrnq3xjz1EL6pCwuZotD5RDZaTt4WGPDsAQKiBSVLRtF6kouvuNy2GKY8HHBcoLhjVpLbQdUQVHEHcsdVpZMvLw7pKFQkMBoRsbMNSV6ZnpJ24wF1uUceDgHKM8Qo9vE455PnX2JPwYuTmhFGz6AquXSyXyLoZvBQ7izcCdtgwpozLzV34nVN3oN1yexXbNi8iaqt9Yz35RZroqLmT2CcGDBJuqxgsxmuvmJeCjR3E4UgpHBTfX3N9VM6FXidWzRGafGuY3r5nsiz35JQ8ATJLuAb44zcsMG1MWbYqW5jEdV3ApdDmBtDFHtSb9QR4qV5Gr5GqMy67yvdxxdVcuDpPxpSyrAPnMksV4cN5y2sWRkEXCQTknYyqdSy3c7zUfBQfmTwrXyqoRPFDkDKJsCaxbNFmWL83WH7C848GeNo8q8j88UaRB3xPb3cvcdaM5DC9tTvSmZDxL9XL6nv8sCNZ6RUxDXdRGq6h99cjmHsETN5ssmkxjVJPTEsz5NuYHvXFQeCEkUgUv3HSz1RKbkC9ejAAA5HwvET1MX2cH5TqboHTk4MAd5RzCSv1cnPSbynGeTrJfsgGr45H33x5jduzPSSFSk16oja1gG6ZnZ4JpKiyYWLYS7pWenoHgPtaHRMZHBNe2WnHnBNTacjtPCPzwaDeTr1mPv8PwnkQ3gwfpsHxRXsc9vzfXS4pxzgLZkexRE3aSBMaY4wiDUwss1zThfwUqzn9DkgHGgoR";
export const bulkMintNodeAddress =
  "9fMAnQTS1GrgHDfxuRHGRrTMnKU4KM6hst3aC2sTiLUNzkvwKWn";
export const cartCheckoutAddress =
  "WHJsMYemxRSNDF3U2zoz7r5cnULp94Pt8tQo3cU7kufCpywjfatMDHGizxRiWXB8Rdp43DVWq9EsHEbRKPVkHAVnCwJrBRs4wWgM4jB7bXAsRJZug7QhVazWoCi9PgtukTjMqEML5nj9yBNiq3kiW39J4sti3Y7x882LZE67J55CzT16NFTwtSghS6UYnqWbHTErxDGfY36zBpbCHJooHeo63VvNwPR7CqDTPiWXhwwbqEbYuGb7rJkVQuGA7rgpWia8iowAo4xYEqzv918HjDi92KFUyGCKbPKXn6puWMiPKJamAeEYqXrBZtSNtEfMwG59MfqJfwuGsZ4VxceTXkvQbCU6vyr6xsBZLmkbURL3ZPJ4iEbSTW85";
export const collectionScannerAddress =
  "9hWTbmWdAxdGEwJHYRuL8sKWDUm9adAyCrMKdKowf5nex11PQkC";

export const v1Addresses = [v1ErgAddress, v1SigUsdAddress];
export const MIN_NERG_BOX_VALUE = 1000000;
export const CHANGE_BOX_ASSET_LIMIT = 90;
export const auctionAddresses = [betaAddress];
export let additionalData = {};
export const auctionTrees = [betaAddress] // array of trees of all auction addresses until now.
  .map((addr) => new Address(addr).ergoTree);
export const trueAddress = "4MQyML64GnzMxZgm"; // dummy address to get unsigned tx from node, we only care about the boxes though in this case
export const auctionContract = ``;
export let contracts = {};
contracts[betaAddress] = {
  isActive: true,
  extendThreshold: 30 * 60 * 1000,
  extendNum: 40 * 60 * 1000,
  loyalty: true,
  customToken: true,
};

export const txFee = 2000000;
export const babyTxFee = 1000000;

export const assmUrl = "https://assembler.ergoauctions.org/";

export const supportedCurrencies = [
  {
    name: "erg",
    displayName: "ERG",
    id: "",
    decimal: 9,
    minSupported: 10000000,
    initial: 10000000,
    contractAddress: v1ErgAddress,
  },
  {
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
];

export const SupportedCurrenciesV2 = {
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

export const artworkTypes = {
  image: [0x01, 0x01],
  audio: [0x01, 0x02],
  video: [0x01, 0x03],
};

export const sortOptions = [
  // { value: 'list_time_asc', label: 'old - new' },
  { value: "list_time_desc", label: "Recently Listed" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "alphabetical_asc", label: "Alphabetical: A to Z" },
  { value: "alphabetical_desc", label: "Alphabetical: Z to A" },
];
