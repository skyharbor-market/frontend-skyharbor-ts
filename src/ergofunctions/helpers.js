import React from "react";
// import {Flip, Slide, toast} from 'react-toastify';
// import { createStandaloneToast } from "@chakra-ui/react";
import axios from "axios";

import { Address, Explorer } from "@coinbarn/ergo-ts";
import {
  additionalData,
  auctionNFT,
  fakeThreshold,
  fakeURL,
  serviceFee,
  supportedCurrencies,
} from "./consts";
import { SupportedCurrenciesV2 } from "./Currencies";
import { boxById, getBoxesForAsset } from "./explorer";
import moment from "moment";
// import ahIcon from "../assets/images/Ergo_auction_house_logo.png";
import { get } from "./rest";
// import { theme } from "../components/theme";
import { currencyToLong, getEncodedBoxSer, longToCurrency } from "./serializer";
// const toast = createStandaloneToast({ theme: theme });
import toast from "react-hot-toast";

const explorerUrl = "https://explorer.ergoplatform.com/en/";
// const explorerUrl = 'https://ergo-explorer.getblok.io/';

// Getblok explorer
// export const explorerApi = 'https://ergo-explorer.getblok.io/api/v0'
// export const explorerApiV1 = 'https://ergo-explorer.getblok.io/api/v1'

export const explorerApi = "https://api.ergoplatform.com/api/v0";
export const explorerApiV1 = "https://api.ergoplatform.com/api/v1";

// New SkyHarbor explorer
// export const explorerApi = 'https://explorer.skyharbor.io/api/v0'
// export const explorerApiV1 = 'https://explorer.skyharbor.io/api/v1'

// const nodeUrl = "https://paidincrypto.io"
const nodeUrl = "https://node.ergo.watch";
// const nodeUrl = "https://www.test-skyharbor-server.net:9053"

export function friendlyToken(token, length = 10) {
  let res = "";
  res += token.slice(0, length) + "..." + token.slice(-length);
  return res;
}

export function friendlyERG(value) {
  return (value / 1e9).toFixed(2);
}

export function friendlyAddress(addr, tot = 13) {
  if (addr === undefined || addr.slice === undefined) return "";
  return addr.slice(0, tot) + "..." + addr.slice(-tot);
}

export function friendlyName(name, tot = 80) {
  if (name === undefined || name.slice === undefined) return "";
  else if (name.length < tot) return name;
  return name.slice(0, tot) + "...";
}

export function getTxUrl(txId) {
  return explorerUrl + "transactions/" + txId;
}

export function getAuctionUrl(boxId) {
  return "#/auction/specific/" + boxId;
}

export function getArtworkUrl(tokenId) {
  return "#/artwork/" + tokenId;
}

export function getAddrUrl(addr) {
  return explorerUrl + "addresses/" + addr;
}

export function getArtistUrl(addr) {
  return "#/auction/active?type=all&artist" + addr;
}

export function showMsg(message, isError = false, isWarning = false) {
  let status = "info";
  if (isError) status = "error";
  if (isWarning) status = "warning";

  if (status === "error") {
    toast.error(message);
  } else if (status === "warning") {
    toast.warning(message);
  } else {
    toast(message);
  }

  // toast(message, {
  //     transition: Slide,
  //     closeButton: true,
  //     autoClose: 5000,
  //     position: 'top-right',
  //     type: status,
  // });

  //   toast({
  //     title: message,
  //     // description: "Unable to create user account.",
  //     position: "bottom",
  //     status: status,
  //     duration: 5000,
  //     isClosable: true,
  //   });
}
export function showMsgSuccess(message, isError = false, isWarning = false) {
  let status = "success";
  if (isError) status = "error";
  if (isWarning) status = "warning";
  // toast(message, {
  //     transition: Slide,
  //     closeButton: true,
  //     autoClose: 5000,
  //     position: 'top-right',
  //     type: status,
  // });

  //   toast({
  //     title: message,
  //     // description: "Unable to create user account.",
  //     position: "bottom",
  //     status: status,
  //     duration: 5000,
  //     isClosable: true,
  //   });
}

export function showStickyMsg(message, isError = false) {
  // toast(message, {
  //     transition: Flip,
  //     closeButton: true,
  //     autoClose: false,
  //     closeOnClick: false,
  //     position: 'top-center',
  //     type: isError ? 'error' : 'default',
  // });
  //   toast({
  //     title: message,
  //     // description: "Unable to create user account.",
  //     position: "top",
  //     status: isError ? "error" : "info",
  //     duration: 10000,
  //     isClosable: false,
  //   });
}

export function isWalletSaved() {
  // console.log(localStorage.getItem('wallet'))
  return (
    sessionStorage.getItem("wallet") !== null ||
    localStorage.getItem("wallet") !== null
  );
}

export function isAssembler() {
  return isWalletSaved() && getWalletType() === "assembler";
}

export function isYoroi() {
  // console.log("getwalletype", getWalletType())
  return isWalletSaved() && getWalletType() === "yoroi";
}
export function isNautilus() {
  return isWalletSaved() && getWalletType() === "nautilus";
}
export function getWalletConnector() {
  if (isWalletSaved()) {
    return getWalletType();
  }
  return false;
}

export function getWalletAddress() {
  return JSON.parse(localStorage.getItem("wallet")).address;
}
export function getStoredWalletAddresses() {
  return JSON.parse(localStorage.getItem("wallet")).addresses;
}

export function getWalletType() {
  if (localStorage.getItem("wallet") !== null)
    return JSON.parse(localStorage.getItem("wallet"))?.type;
  return JSON.parse(sessionStorage.getItem("wallet"))?.type;
}

export function getWalletUUID() {
  if (localStorage.getItem("wallet") !== null)
    return JSON.parse(localStorage.getItem("wallet"))?.uuid;
  return JSON.parse(sessionStorage.getItem("wallet"))?.uuid;
}
export function getWholeWallet() {
  if (localStorage.getItem("wallet") !== null)
    return JSON.parse(localStorage.getItem("wallet"));
  return JSON.parse(sessionStorage.getItem("wallet"));
}

export function getUrl(url) {
  if (!url.startsWith("http")) url = "http://" + url;
  if (url.endsWith("/")) url = url.slice(0, url.length - 1);
  return url;
}

export function getCartItems() {
  if (localStorage.getItem("cart") !== null)
    return JSON.parse(localStorage.getItem("cart")).items;
  else {
    return [];
  }
}

// async function notifyMe(msg, lnk) {
//     if (!isNotifSupported()) return
//     if (Notification.permission !== 'granted')
//         await Notification.requestPermission();
//     else {
//         const notification = new Notification('Notification title', {
//             icon: ahIcon,
//             body: msg,
//         });
//         notification.onclick = function () {
//             window.open(lnk);
//         };
//     }
// }

export async function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function isAddressValid(address) {
  try {
    return new Address(address).isValid();
  } catch (_) {
    return false;
  }
}

export async function isTokenValid(tokenId) {
  try {
    const explorer = Explorer.mainnet;
    // return (new Box(tokenId).isValid())
    const res = await explorer.getTokenInfo(tokenId);
    console.log("rererere", res);
    return res ? true : false;
  } catch (_) {
    console.log("erere", _);
    return false;
  }
}

export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

// Coingecko get price of ERG

export async function getPrice() {
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=ergo&vs_currencies=usd"
  );

  return response.data;
}

// Get token royalties
export async function royalties_scan(nft_id) {
  let creation_box_registers;
  creation_box_registers = await axios.get(`${explorerApiV1}/boxes/${nft_id}`);

  // need to check if royalties empty
  if (
    Object.keys(creation_box_registers.data.additionalRegisters).length != 0
  ) {
    try {
      let royalties = {};
      royalties["multiplier"] =
        parseFloat(
          creation_box_registers.data.additionalRegisters["R4"]["renderedValue"]
        ) / 1000;
      let royalty_ergo_tree =
        creation_box_registers.data.additionalRegisters["R5"]["renderedValue"];
      let tempAddress = await axios
        .get(`${nodeUrl}/utils/ergoTreeToAddress/${royalty_ergo_tree}`)
        .catch((err) => {
          console.log(err);
        });
      royalties["propositionBytes"] = creation_box_registers.data.address;
      royalties["address"] = tempAddress.data["address"];
      return royalties;
    } catch {
      console.log("Error while decoding royalties");
    }
  }
  return false;
}
export async function generate_p2s(script) {
  let payload = {};
  payload["source"] = script;
  let p2s_address_resp = await axios.post(
    `${nodeUrl}/script/p2sAddress`,
    payload
  );
  const p2s_address = p2s_address_resp.data["address"];
  return p2s_address;
}

export function extractMetadata(description) {
  // Clean up metadata
  let displayDescription = description;

  if (displayDescription.includes(`"721"`)) {
    let v = JSON.parse(displayDescription);
    let metadata = v["721"][Object.keys(v["721"])[0]];

    return metadata;

    let mdatatext = "";

    for (const key in metadata) {
      if (metadata[key] !== "none") {
        mdatatext += `- ${metadata[key]} `;
      }
    }

    displayDescription = mdatatext;
  } else {
    return false;
  }
}

export function visualizoMetadata(obj) {
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    if (typeof obj[key] !== "object") {
      if (key == "image") {
        objetoTokenURL.description =
          objetoTokenURL.description +
          "<strong>" +
          letraMayuscula(key) +
          "</strong>: " +
          '<a href="' +
          obj[key] +
          '">' +
          obj[key].substring(8, 30) +
          "...</a><br>";
      } else if (!Array.isArray(obj)) {
        objetoTokenURL.description =
          objetoTokenURL.description +
          "<strong>" +
          letraMayuscula(key) +
          "</strong>: " +
          obj[key] +
          "<br>";
      }
    } else {
      visualizoMetadata(obj[key]);
    }
    if (Array.isArray(obj[key])) {
      objetoTokenURL.description =
        objetoTokenURL.description +
        "<strong> " +
        letraMayuscula(key) +
        ": </strong>" +
        obj[key] +
        "<br>";
    }
  }
}

export async function signTx(transaction_to_sign) {
  // let sellerTx;
  let tx;
  console.log("Transaction To Sign", transaction_to_sign);

  try {
    tx = await ergo.sign_tx(transaction_to_sign);
  } catch (e) {
    console.log(e);
    showMsg("Error while sending funds!", true);
    return;
  }
  const txId = await ergo.submit_tx(tx);

  console.log("tx id", txId);
  if (true) {
    if (txId !== undefined && txId.length > 0)
      // showMsg("Necessary funds were sent. Now we wait until it's confirmed!");
      showMsgSuccess(
        "Necessary funds were sent. Now we wait until it's confirmed!"
      );
    else showMsg("Error while sending funds!", true);
  }
  return txId;
}

export async function getListedBox(buyBox) {
  // Get listed Box from explorer
  let listedBox;
  if (!buyBox.box_json) {
    let tempBox = await axios.get(`${explorerApiV1}/boxes/${buyBox.box_id}`);
    listedBox = tempBox.data;
  } else {
    listedBox = JSON.parse(JSON.stringify(buyBox.box_json));
  }
  listedBox.extension = {};
  // Add R6 to listedBox since explorer does not return it
  let buyArtBox = await boxById(listedBox.assets[0].tokenId);

  try {
    listedBox.additionalRegisters.R6 = await getEncodedBoxSer(buyArtBox);
  } catch {
    console.log("Get EncodedBoxSer Failed, attempting to get R6 through node");

    const resp = await axios.get(
      `${explorerApiV1}/transactions/${listedBox.transactionId}`
    );
    const nodeResp = await axios.get(
      `${nodeUrl}/blocks/${resp.data.blockId}/transactions`
    );

    let blockObject = nodeResp.data.transactions;
    for (tx of blockObject) {
      for (let i = 0; i < tx.outputs.length; i++) {
        if (tx.outputs[i].boxId === listedBox.boxId) {
          listedBox.additionalRegisters.R6 =
            tx.outputs[i].additionalRegisters.R6;
        }
      }
    }
  }

  return listedBox;
}

export function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(0);
  let minutes = (ms / (1000 * 60)).toFixed(0);
  let hours = (ms / (1000 * 60 * 60)).toFixed(0);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);
  if (seconds < 60) return seconds + ` sec${seconds !== 1 ? "s" : ""}`;
  else if (minutes < 60) return minutes + ` min${minutes !== 1 ? "s" : ""}`;
  else if (hours < 24) return hours + ` hr${hours !== 1 ? "s" : ""}`;
  else return days + " days";
}

export function calculateEarnings(royalty, price, currency) {
  const decimalPlaces = currency == 0 ? 3 : 2;

  let previewArtistRoyalty =
    royalty > 0
      ? parseFloat(
          Math.floor(
            currencyToLong(price, SupportedCurrenciesV2[currency].decimal) *
              (royalty / 1000)
          ).toFixed(decimalPlaces)
        )
      : 0;
  if (currency == 1 && previewArtistRoyalty < 0.01 && royalty > 0) {
    previewArtistRoyalty = 1;
  }

  // let previewServiceFee = parseFloat((price * serviceFee).toFixed(decimalPlaces));
  let previewServiceFee = parseFloat(
    Math.floor(
      currencyToLong(price, SupportedCurrenciesV2[currency].decimal) *
        serviceFee
    ).toFixed(decimalPlaces)
  );

  if (currency == 1 && previewServiceFee < 0.01) {
    previewServiceFee = 1;
  }

  let userEarnings = (
    parseFloat(price ? price : 0) -
    (longToCurrency(
      previewServiceFee,
      SupportedCurrenciesV2[currency].decimal
    ) +
      longToCurrency(
        previewArtistRoyalty,
        SupportedCurrenciesV2[currency].decimal
      ))
  ).toFixed(decimalPlaces);
  if (userEarnings < 0) {
    userEarnings = 0;
  }

  previewArtistRoyalty = longToCurrency(
    previewArtistRoyalty,
    SupportedCurrenciesV2[currency].decimal
  );
  previewServiceFee = longToCurrency(
    previewServiceFee,
    SupportedCurrenciesV2[currency].decimal
  );

  return {
    artistPayment: previewArtistRoyalty,
    servicePayment: previewServiceFee,
    earnings: userEarnings,
  };
}

export async function getSigUsdBox() {
  console.log("helllooooo");
  const res = await axios.get(
    `https://api.ergoplatform.com/api/v1/mempool/transactions/byAddress/MUbV38YgqHy7XbsoXWF5z7EZm524Ybdwe5p9WDrbhruZRtehkRPT92imXer2eTkjwPDfboa1pR3zb3deVKVq3H7Xt98qcTqLuSBSbHb7izzo5jphEpcnqyKJ2xhmpNPVvmtbdJNdvdopPrHHDBbAGGeW7XYTQwEeoRfosXzcDtiGgw97b2aqjTsNFmZk7khBEQywjYfmoDc9nUCJMZ3vbSspnYo3LarLe55mh2Np8MNJqUN9APA6XkhZCrTTDRZb1B4krgFY1sVMswg2ceqguZRvC9pqt3tUUxmSnB24N6dowfVJKhLXwHPbrkHViBv1AKAJTmEaQW2DN1fRmD9ypXxZk8GXmYtxTtrj3BiunQ4qzUCu1eGzxSREjpkFSi2ATLSSDqUwxtRz639sHM6Lav4axoJNPCHbY8pvuBKUxgnGRex8LEGM8DeEJwaJCaoy8dBw9Lz49nq5mSsXLeoC4xpTUmp47Bh7GAZtwkaNreCu74m9rcZ8Di4w1cmdsiK1NWuDh9pJ2Bv7u3EfcurHFVqCkT3P86JUbKnXeNxCypfrWsFuYNKYqmjsix82g9vWcGMmAcu5nagxD4iET86iE2tMMfZZ5vqZNvntQswJyQqv2Wc6MTh4jQx1q2qJZCQe4QdEK63meTGbZNNKMctHQbp3gRkZYNrBtxQyVtNLR8xEY8zGp85GeQKbb37vqLXxRpGiigAdMe3XZA4hhYPmAAU5hpSMYaRAjtvvMT3bNiHRACGrfjvSsEG9G2zY5in2YWz5X9zXQLGTYRsQ4uNFkYoQRCBdjNxGv6R58Xq74zCgt19TxYZ87gPWxkXpWwTaHogG1eps8WXt8QzwJ9rVx6Vu9a5GjtcGsQxHovWmYixgBU8X9fPNJ9UQhYyAWbjtRSuVBtDAmoV1gCBEPwnYVP5GCGhCocbwoYhZkZjFZy6ws4uxVLid3FxuvhWvQrVEDYp7WRvGXbNdCbcSXnbeTrPMey1WPaXX`
  );

  console.log("resitems", res);

  if (res.data.total === 0) {
    const newRes = await axios.get(
      `https://api.ergoplatform.com/api/v1/boxes/unspent/byTokenId/7d672d1def471720ca5782fd6473e47e796d9ac0c138d9911346f118b2f6d9d9`
    );
    console.log(newRes.data);
    return newRes.data.items[0];
  } else {
    for (let item of res.data.items) {
      if (item.outputs[0].spentTransactionId === null) {
        return item.outputs[0];
      }
    }
  }
}

export async function getOracleBox() {
  const res = await axios.get(
    `https://api.ergoplatform.com/api/v1/boxes/unspent/byTokenId/011d3364de07e5a26f0c4eef0852cddb387039a921b7154ef3cab22c6eda887f`
  );
  console.log("res", res.data);
  if (!res) {
    return null;
  }

  return res.data.items[0];
}

export async function getPrices() {
  const oracleBox = await getOracleBox();
  if (!oracleBox) {
    return {
      ErgInUSD: 0,
      UsdInErg: 0,
    };
  }
  return {
    ErgInUSD: 1000000000 / oracleBox.additionalRegisters.R4.renderedValue,
    UsdInErg: oracleBox.additionalRegisters.R4.renderedValue / 1000000000,
  };
}

export async function ableToBuyUSD() {
  const sigUsdBox = getSigUsdBox();
  const oracleBox = getOracleBox();
  return (
    4 <
    ((sigUsdBox.value * 100) / oracleBox.additionalRegisters.R4.renderedValue) *
      sigUsdBox.assets[0].amount
  );
}

// Adds commas to number values
export function addNumberCommas(value) {
  var str = value.toString().split(".");
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return str.join(".");
}

export function convertGQLObject(item) {
  const cardItem = {
    token_id: item.token_id,
    box_id: item.box_id,
    box_json: item.box_json,
    completion_time: item.completion_time,
    sales_address: item.sales_address.address,
    nerg_sale_value: item.nerg_sale_value,
    seller_address: item.seller_address,
    buyer_address: item.buyer_address,
    spent_tx: item.spent_tx,
    currency: item.currency,
    list_time: item.list_time,

    nft_name: item.token.nft_name,
    nft_desc: item.token.nft_desc,
    royalty_int: item.token.royalty_int,
    royalty_address: item.token.royalty_address,

    ipfs_art_hash: item.token.ipfs_art_hash,
    ipfs_art_url: item.token.ipfs_art_url,
    nft_type: item.token.nft_type,

    collection_name: item.token.token_collection.name,
    collection_sys_name: item.token.token_collection.sys_name,
    verified_collection: item.token.token_collection.verified,
  };
  return cardItem;
}

const fetchTokenInfoGQL = async (tokenArray) => {
  try {
    const allTokenInfo = await axios({
      method: "post",
      url: "https://graphql.erg.zelcore.io/",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        query: `
                    query getAllTokenInfo($tokenArray: [String!]){
                        tokens(tokenIds: $tokenArray) {
                            tokenId
                            box{      
                              boxId
                              address
                              additionalRegisters
                              assets{
                                amount
                                tokenId
                              }
                              transaction{
                                inputs {
                                  box{
                                    address
                                  }
                                }
                              }
                            }
                        }
                    }
                `,
        variables: {
          tokenArray,
        },
      }),
    });
    return allTokenInfo.data.data.tokens;
  } catch (err) {
    console.error("Error fetching token info:", err);
    return [];
  }
};
