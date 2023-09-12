import { Explorer, Transaction } from "@coinbarn/ergo-ts";
import { get } from "./rest";
import { explorerApiUrl, explorerApiV1Url } from "./consts";

const explorer = Explorer.mainnet;
// export const explorerApi = 'https://api.ergoplatform.com/api/v0'
// export const explorerApiV1 = 'https://api.ergoplatform.com/api/v1'

// New SkyHarbor explorer
export const explorerApi = explorerApiUrl;
export const explorerApiV1 = explorerApiV1Url;

async function getRequest(url, api = explorerApi) {
  return get(api + url)
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
}

export async function currentHeight() {
  return getRequest("/blocks?limit=1").then((res) => {
    return res.items[0].height;
  });
}

export async function currentBlock() {
  return getRequest("/blocks?limit=1").then((res) => {
    return res.items[0];
  });
}

export function unspentBoxesFor(address) {
  return getRequest(`/transactions/boxes/byAddress/unspent/${address}`);
}

export async function unspentBoxesForV1(address) {
  return getRequest(`/boxes/unspent/byAddress/${address}`, explorerApiV1).then(
    (res) => {
      return res.items;
    }
  );
}

export function getBoxesForAsset(asset) {
  return getRequest(`/boxes/unspent/byTokenId/${asset}`, explorerApiV1);
}

export function getActiveAuctions(addr) {
  return getRequest(`/boxes/unspent/byAddress/${addr}?limit=500`, explorerApiV1)
    .then((res) => res.items)
    .then((boxes) => boxes.filter((box) => box.assets.length > 0));
}

export function getUnconfirmedTxsFor(addr) {
  return getRequest(
    `/mempool/transactions/byAddress/${addr}`,
    explorerApiV1
  ).then((res) => res.items);
}

export async function getTokenBoxV1(tokenId) {
  return getRequest(`/tokens/${tokenId}`, explorerApiV1);
}

export function boxByAddress(id) {
  return getRequest(`/transactions/boxes/${id}`);
}

export function boxById(id) {
  return getRequest(`/transactions/boxes/${id}`);
}

export function txByAddress(addr) {
  return getRequest(`/addresses/${addr}/transactions`).then((res) => res.items);
}

export function txById(id) {
  return getRequest(`/transactions/${id}`);
}

export async function getSpendingTx(boxId) {
  const data = getRequest(`/transactions/boxes/${boxId}`);
  return data.then((res) => res.spentTransactionId).catch((_) => null);
}

export async function getIssuingBox(tokenId) {
  const data = getRequest(`/assets/${tokenId}/issuingBox`);
  return data.catch((_) => null);
}

export function sendTx(tx) {
  explorer.broadcastTx(tx);
}

export async function getBalance(addr) {
  return getRequest(`/addresses/${addr}/balance/confirmed`, explorerApiV1);
}
