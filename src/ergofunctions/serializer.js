import { Serializer } from "@coinbarn/ergo-ts/dist/serializer";
import moment from "moment";
import { Address, AddressKind } from "@coinbarn/ergo-ts/dist/models/address";
import { boxById, getIssuingBox, txById } from "./explorer";
import { supportedCurrencies } from "./consts";
import { SupportedCurrenciesV2 } from "./Currencies";
// import { createStandaloneToast } from "@chakra-ui/react"
// import { theme } from "../components/theme";
import axios from "axios";

// const toast = createStandaloneToast({theme: theme})

// import {addNFTInfo, getNFTInfo} from "./dbUtils";

var momentDurationFormatSetup = require("moment-duration-format");

export const explorerApi = "https://api.ergoplatform.com/api/v0";
export const explorerApiV1 = "https://api.ergoplatform.com/api/v1";

// New SkyHarbor explorer
// export const explorerApi = 'https://explorer.skyharbor.io/api/v0'
// export const explorerApiV1 = 'https://explorer.skyharbor.io/api/v1'

let ergolib = import("ergo-lib-wasm-browser");
// import dynamic from "next/dynamic";

// let ergolib = dynamic(() => import("ergo-lib-wasm-browser"), { ssr: false });

const floatRe = new RegExp("^([0-9]*[.])?[0-9]*$");
const naturalRe = new RegExp("^[0-9]+$");

export async function encodeLongTuple(a, b) {
  if (typeof a !== "string") a = a.toString();
  if (typeof b !== "string") b = b.toString();
  return (await ergolib).Constant.from_i64_str_array([a, b]).encode_to_base16();
}

export async function colTuple(a, b) {
  return (await ergolib).Constant.from_tuple_coll_bytes(
    Buffer.from(a, "hex"),
    Buffer.from(b, "hex")
  ).encode_to_base16();
}

export async function encodeByteArray(reg) {
  return (await ergolib).Constant.from_byte_array(reg).encode_to_base16();
}

export async function decodeLongTuple(val) {
  return (await ergolib).Constant.decode_from_base16(val)
    .to_i64_str_array()
    .map((cur) => parseInt(cur));
}

export async function encodeNum(n, isInt = false) {
  if (isInt) return (await ergolib).Constant.from_i32(n).encode_to_base16();
  else
    return (await ergolib).Constant.from_i64(
      (await ergolib).I64.from_str(n)
    ).encode_to_base16();
}

export async function decodeNum(n, isInt = false) {
  if (isInt) return (await ergolib).Constant.decode_from_base16(n).to_i32();
  else return (await ergolib).Constant.decode_from_base16(n).to_i64().to_str();
}

export async function encodeHex(reg) {
  return (await ergolib).Constant.from_byte_array(
    Buffer.from(reg, "hex")
  ).encode_to_base16();
}

export async function encodeLongArray(longArray) {
  return (await ergolib).Constant.from_i64_str_array(
    longArray
  ).encode_to_base16();
}

export async function decodeLongArray(encodedArray) {
  return (await ergolib).Constant.decode_from_base16(encodedArray)
    .to_i64_str_array()
    .map((cur) => parseInt(cur));
}

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

export function stringToHex(str) {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hex += charCode.toString(16).padStart(2, "0");
  }
  return hex;
}

export async function decodeString(encoded) {
  return toHexString(
    (await ergolib).Constant.decode_from_base16(encoded).to_byte_array()
  );
}

async function decodeColTuple(str) {
  const two = (await ergolib).Constant.decode_from_base16(
    str
  ).to_tuple_coll_bytes();
  const decoder = new TextDecoder();
  return [decoder.decode(two[0]), decoder.decode(two[1])];
}

async function decodeStr(str) {
  return new TextDecoder().decode(
    (await ergolib).Constant.decode_from_base16(str).to_byte_array()
  );
}

// data is an array of hex strings
export function encodeCollCollByte(data) {
  const numItems = data.length;
  const encodedItems = [];

  // Encode each item in the collection
  for (let i = 0; i < numItems; i++) {
    const item = Uint8Array.from(Buffer.from(data[i], "hex"));
    const itemLen = item.length;
    const itemPrefix =
      itemLen < 253 ? [itemLen] : [253, itemLen & 0xff, (itemLen >> 8) & 0xff];
    encodedItems.push(itemPrefix.concat(Array.from(item)));
  }

  // Encode the collection itself
  const collPrefix =
    numItems < 253
      ? [numItems]
      : [253, numItems & 0xff, (numItems >> 8) & 0xff];
  const byteArray = collPrefix.concat(...encodedItems);

  // Convert the byte array to a hexadecimal string
  const result = byteArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return result;
}

// data is an array of GroupElement objects
export function encodeCollGroupElement(data) {
  const numItems = data.length;
  const encodedItems = [];
  let numBytes = 0;

  // Encode each item in the collection
  for (let i = 0; i < numItems; i++) {
    const itemHex = data[i];
    const item = hexToByteArray(itemHex);
    const itemLen = item.length;
    const itemPrefix =
      itemLen < 253 ? [itemLen] : [253, itemLen & 0xff, (itemLen >> 8) & 0xff];
    encodedItems.push(itemPrefix.concat(item));
    numBytes += itemLen + itemPrefix.length;
  }

  // Encode the collection itself
  const collPrefix =
    numItems < 253
      ? [numItems]
      : [253, numItems & 0xff, (numItems >> 8) & 0xff];
  const byteArray = collPrefix.concat(...encodedItems);
  const result = byteArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return result;
}

function hexToByteArray(hexString) {
  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const byteArray = [];
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.slice(i, i + 2), 16));
  }
  return byteArray;
}

export function resolveIpfs(url, isVideo = false) {
  const ipfsPrefix = "ipfs://";
  if (!url.startsWith(ipfsPrefix)) return url;
  else {
    if (isVideo)
      return url.replace(ipfsPrefix, "https://ipfs.blockfrost.dev/ipfs/");
    return url.replace(ipfsPrefix, "https://cloudflare-ipfs.com/ipfs/");
  }
}

export async function decodeArtwork(box, tokenId, considerArtist = true) {
  let inf = { type: "other" };

  const res = await getIssuingBox(tokenId);
  if (!res) {
    return null;
  }
  if (box === null) box = res[0];
  inf.totalIssued = res[0].assets[0].amount;
  if (Object.keys(res[0].additionalRegisters).length >= 5) {
    inf.isArtwork = true;
    inf.artHash = res[0].additionalRegisters.R8;
    inf.artCode = res[0].additionalRegisters.R7;
    inf.tokenName = res[0].additionalRegisters.R4;
    inf.nft_name = res[0].additionalRegisters.R4;
    inf.tokenDescription = res[0].additionalRegisters.R5;
    inf.nft_desc = res[0].additionalRegisters.R5;
    if (Object.keys(res[0].additionalRegisters).length === 6)
      inf.ipfs_art_url = res[0].additionalRegisters.R9.replace(
        "http://",
        "https://"
      );
  } else if (Object.keys(res[0].additionalRegisters).length >= 1) {
    inf.tokenName = res[0].additionalRegisters.R4;
    inf.nft_name = res[0].additionalRegisters.R4;
  }
  if (Object.keys(res[0].additionalRegisters).length >= 2) {
    inf.tokenDescription = res[0].additionalRegisters.R5;
    inf.nft_desc = res[0].additionalRegisters.R5;
  }

  if (inf.isArtwork) {
    try {
      if (inf.artCode === "0e020101" || inf.artCode === "0e0430313031") {
        inf.nft_type = "image";
        inf.type = "image";
      } else if (inf.artCode === "0e020102") {
        inf.nft_type = "audio";
        inf.type = "audio";
        inf.isAudio = true;
      } else if (inf.artCode === "0e020103") {
        inf.nft_type = "video";
        inf.type = "video";
        inf.isVideo = true;
      } else {
        inf.nft_type = "utility";

        inf.type = "other";
      }
      if (inf.isArtwork) {
        inf.artHash = await decodeString(inf.artHash);
        inf.tokenName = await decodeStr(inf.tokenName);
        if (inf.tokenName.length === 0) inf.tokenName = "-";

        inf.nft_name = inf.tokenName;
        inf.tokenDescription = await decodeStr(inf.tokenDescription);
        inf.nft_desc = inf.tokenDescription;
        if (inf.isAudio) {
          try {
            const two = await decodeColTuple(inf.ipfs_art_url);
            inf.audioUrl = resolveIpfs(two[0]);
            inf.ipfs_art_url = resolveIpfs(two[1]);
          } catch (e) {
            inf.audioUrl = resolveIpfs(await decodeStr(inf.ipfs_art_url));
            inf.ipfs_art_url = null;
          }
        } else if (inf.ipfs_art_url)
          inf.ipfs_art_url = resolveIpfs(
            await decodeStr(inf.ipfs_art_url),
            inf.isVideo
          ).replace("http://", "https://");
      }
    } catch (e) {
      console.error("decodeArtwork error: ", e);
      inf.isArtwork = false;
    }
  } else {
    if (inf.tokenName) {
      inf.tokenName = await decodeStr(inf.tokenName);
      inf.nft_name = inf.tokenName;
    }
    if (inf.tokenDescription) {
      inf.tokenDescription = await decodeStr(inf.tokenDescription);
      inf.token_desc = inf.tokenDescription;
    }
  }

  if (considerArtist) {
    try {
      inf.artist = "Unknown";
      const tokBox = await boxById(tokenId);
      inf.artist = tokBox.address;

      inf.royalty = 0;
      if (tokBox.additionalRegisters.R4)
        inf.royalty = await decodeNum(tokBox.additionalRegisters.R4, true);

      if (inf.tokenName.includes("Test NFT")) {
        // console.log("tokBox: ", tokBox)
      }
      inf.artist = await getArtist(tokBox);
    } catch (e) {
      // console.error(e);
    }
  }
  // Place tokenId
  // inf.NFTID = tokenId;
  inf.tokenId = tokenId;

  return { ...box, ...inf };
}

export async function decodeNFT(box, tokenId) {
  let inf = { type: "other" };

  inf.totalIssued = box.assets[0].amount;
  if (Object.keys(box.additionalRegisters).length >= 5) {
    inf.isArtwork = true;
    inf.artHash = box.additionalRegisters.R8;
    inf.artCode = box.additionalRegisters.R7;
    inf.nft_name = box.additionalRegisters.R4;
    inf.nft_desc = box.additionalRegisters.R5;
    if (Object.keys(box.additionalRegisters).length === 6)
      inf.ipfs_art_url = box.additionalRegisters.R9.replace(
        "http://",
        "https://"
      );
  } else if (Object.keys(box.additionalRegisters).length >= 1) {
    inf.nft_name = box.additionalRegisters.R4;
  }
  if (Object.keys(box.additionalRegisters).length >= 2) {
    inf.nft_desc = box.additionalRegisters.R5;
  }

  if (inf.isArtwork) {
    try {
      if (inf.artCode === "0e020101" || inf.artCode === "0e0430313031") {
        inf.nft_type = "image";
        inf.type = "image";
      } else if (inf.artCode === "0e020102") {
        inf.nft_type = "audio";
        inf.type = "audio";
        inf.isAudio = true;
      } else if (inf.artCode === "0e020103") {
        inf.nft_type = "video";
        inf.type = "video";
        inf.isVideo = true;
      } else {
        inf.nft_type = "utility";

        inf.type = "other";
      }
      if (inf.isArtwork) {
        inf.artHash = await decodeString(inf.artHash);
        inf.nft_name = await decodeStr(inf.nft_name);
        if (inf.nft_name.length === 0) inf.nft_name = "-";

        inf.nft_desc = await decodeStr(inf.nft_desc);
        if (inf.isAudio) {
          try {
            const two = await decodeColTuple(inf.ipfs_art_url);
            inf.audioUrl = resolveIpfs(two[0]);
            inf.ipfs_art_url = resolveIpfs(two[1]);
          } catch (e) {
            inf.audioUrl = resolveIpfs(await decodeStr(inf.ipfs_art_url));
            inf.ipfs_art_url = null;
          }
        } else if (inf.ipfs_art_url)
          inf.ipfs_art_url = resolveIpfs(
            await decodeStr(inf.ipfs_art_url),
            inf.isVideo
          ).replace("http://", "https://");
      }
    } catch (e) {
      inf.isArtwork = false;
    }
  } else {
    if (inf.nft_name) {
      inf.nft_name = await decodeStr(inf.nft_name);
    }
    if (inf.nft_desc) {
      inf.nft_desc = await decodeStr(inf.nft_desc);
    }
  }

  // console.log("tokenId: ", tokenId)
  // console.log("box.transaction.inputs: ", box.transaction.inputs[0].box.address)
  inf.artist = box.transaction.inputs[0].box.address;

  // if (true) {
  //     try {
  //         inf.artist = 'Unknown'
  //         const tokBox = await boxById(tokenId)
  //         inf.artist = tokBox.address;

  //         inf.royalty = 0
  //         if (tokBox.additionalRegisters.R4) {
  //             inf.royalty = await decodeNum(tokBox.additionalRegisters.R4, true)
  //         }

  //         inf.artist = await getArtist(tokBox)
  //     } catch (e) {
  //         console.error(e);
  //     }
  // }

  // if (true) {
  //     try {
  //         inf.artist = 'Unknown'
  //         inf.artist = box.address;

  //         inf.royalty = 0

  //         if (box.additionalRegisters.R4) {
  //             inf.royalty = await decodeNum(box.additionalRegisters.R4)
  //         }

  //         console.log("querry artist");

  //         box.txId = tokenId

  //         let tempBox = JSON.parse(JSON.stringify(box))

  //         inf.artist = await getArtist(box)

  //         // inf.artist = artistInfo.address
  //         // if(artistInfo.royalty) {
  //         //     inf.royalty = await decodeNum(artistInfo.royalty)
  //         // }

  //     } catch (e) {
  //         console.error(e);
  //     }
  // }
  // Place tokenId
  // inf.NFTID = tokenId;
  inf.tokenId = tokenId;

  return { ...box, ...inf };
}

// tokenid is same as box id in this sense
export async function queryArtistAndRoyalties(boxId) {
  // if (AddressKind.P2PK === new Address(bx.address).getType()) {

  // }
  const boxInfo = await axios({
    method: "post",
    url: "https://graphql.erg.zelcore.io/",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      query: `
                    query getMintAddress($box: String!){
                        boxes(boxId: $box) {
                            transaction{
                              inputs{
                                box{
                                  address
                                }
                              }
                            }
                          }
                    }
                `,
      variables: {
        box: boxId,
      },
    }),
  });
  // }

  return boxInfo.data.data.boxes[0].transaction.inputs[0].box.address;
}

export async function getArtist(bx) {
  while (AddressKind.P2PK !== new Address(bx.address).getType()) {
    let tx = await txById(
      bx.txId === undefined ? bx.outputTransactionId : bx.txId
    );
    bx = tx.inputs[0];
  }
  return bx.address;
}

export async function getRoyaltyInfo(tokenId) {
  // try {
  let tempItem = {
    artist: null,
    royalty: null,
  };
  const tokBox = await axios
    .get(`https://api.ergoplatform.com/api/v1/boxes/${tokenId}`)
    .catch((error) => {
      //boxById(tokenId).catch(error => {
      console.log("Error while getting box ID.");
      // toast({
      //     title: "Error while getting box ID.",
      //     // description: "Unable to create user account.",
      //     position: "bottom",
      //     status: "error",
      //     duration: 5000,
      //     isClosable: true,
      // });
      return null;
    });

  tempItem.royalty = 0;
  try {
    if (tokBox.data.additionalRegisters.R4) {
      tempItem.royalty = parseInt(
        tokBox.data.additionalRegisters.R4["renderedValue"]
      ); //await decodeNum(tokBox.data.additionalRegisters.R4, true);
      if (tempItem.royalty > 900) {
        console.log("Royalty is over 90%, reducing down to 0%");
        tempItem.royalty = 0;
      }
      tempItem.artist = tokBox.data.address; //await getArtist(tokBox.data);
    }
  } catch {
    console.log(
      "Error While Decoding Artist Royalty Percentage - Royalty Set to 0"
    );
    // toast({
    //     title: "Error While Decoding Artist Royalty Percentage",
    //     // description: "Unable to create user account.",
    //     position: "bottom",
    //     status: "error",
    //     duration: 5000,
    //     isClosable: true,
    // });
    return null;
  }
  return tempItem;

  // } catch (e) {
  //     console.error(e)
  // }
}

export function currencyToLong(val, decimal = 9) {
  if (typeof val !== "string") val = String(val);
  if (val === undefined) return 0;
  if (val.startsWith("."))
    return parseInt(val.slice(1) + "0".repeat(decimal - val.length + 1));
  let parts = val.split(".");
  if (parts.length === 1) parts.push("");
  if (parts[1].length > decimal) return 0;
  return parseInt(parts[0] + parts[1] + "0".repeat(decimal - parts[1].length));
}

export function longToCurrency(val, decimal = 9, currencyName = null) {
  if (typeof val !== "number") val = parseInt(val);
  if (currencyName) decimal = SupportedCurrenciesV2[currencyName].decimal;
  return val / Math.pow(10, decimal);
}

export function isFloat(num) {
  return num === "" || floatRe.test(num);
}

export function isNatural(num) {
  return num === "" || naturalRe.test(num);
}

export async function getEncodedBoxSer(box) {
  const bytes = (await ergolib).ErgoBox.from_json(
    JSON.stringify(box)
  ).sigma_serialize_bytes();
  let hexString = toHexString(bytes);
  return "63" + hexString;
}

export function isP2pkAddr(tree) {
  return Address.fromErgoTree(tree).getType() === AddressKind.P2PK;
}

export function ascii_to_hex(str) {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join("");
}
