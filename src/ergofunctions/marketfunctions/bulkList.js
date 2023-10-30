import axios from "axios";
import { showMsg, isWalletSaved, signTx, getWalletAddress } from "../helpers";
import {
  txFee,
  supportedCurrencies,
  listingFee,
  CHANGE_BOX_ASSET_LIMIT,
} from "../consts";
import { min_value } from "../conf";
import { currentBlock, boxById } from "../explorer";
import { encodeHex, encodeNum, getEncodedBoxSer } from "../serializer";
import { Address } from "@coinbarn/ergo-ts";
let ergolib = import("ergo-lib-wasm-browser");

// import dynamic from "next/dynamic";

// let ergolib = dynamic(() => import("ergo-lib-wasm-browser"), { ssr: false });

import { getConnectorAddress, getTokens } from "../walletUtils";
import { get_utxos } from "../ergolibUtils";
import { signWalletTx } from "../utxos";

const backupNodeUrl = "https://paidincrypto.io";
// const nodeUrl = "https://www.test-skyharbor-server.net:9053/";
const nodeUrl = "https://node.ergo.watch";
// new open node at https://node.ergo.watch/

const serviceAddress = "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd";
const minterServiceAddress =
  "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd";

export async function bulk_list(nfts) {
  // Eject if wallet isnt connected
  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }
  const wasm = await ergolib;
  const seller = await getWalletAddress();
  const blockHeight = await currentBlock();

  let nft;
  let need = { ERG: (min_value + txFee) * nfts.length + txFee };
  for (nft of nfts) {
    need[nft.id] = 1;
  }

  // Get all wallet tokens/ERG and see if they have enough
  let have = JSON.parse(JSON.stringify(need));
  have["ERG"] += listingFee * nfts.length;
  let ins = [];
  const keys = Object.keys(have);

  //   const allBal = await getTokens();
  //   if (
  //     keys
  //       .filter((key) => key !== "ERG")
  //       .filter(
  //         (key) =>
  //           !Object.keys(allBal).includes(key) || allBal[key].amount < have[key]
  //       ).length > 0
  //   ) {
  //     showMsg("Not enough balance in the wallet! See FAQ for more info.", true);
  //     return;
  //   }

  for (let i = 0; i < keys.length; i++) {
    if (have[keys[i]] <= 0) continue;
    // const curIns = await ergo.get_utxos(have[keys[i]].toString(), keys[i]);
    // console.log("bx", await ergo.get_utxos())
    // console.log("have[keys[i]].toString(): ", have[keys[i]].toString(), keys[i])

    // Without dapp connector
    let curIns;
    if (keys[i] === "ERG") {
      curIns = await get_utxos(seller, have[keys[i]].toString());
    } else {
      curIns = await get_utxos(seller, 0, keys[i], have[keys[i]].toString());
    }

    if (curIns !== undefined) {
      curIns.forEach((bx) => {
        have["ERG"] -= parseInt(bx.value);
        bx.assets.forEach((ass) => {
          if (!Object.keys(have).includes(ass.tokenId)) have[ass.tokenId] = 0;
          have[ass.tokenId] -= parseInt(ass.amount);
        });
      });
      ins = ins.concat(curIns);
    }
  }
  if (keys.filter((key) => have[key] > 0).length > 0) {
    showMsg("Not enough balance in the wallet! See FAQ for more info.", true);
    return;
  }
  let publicKeyResponse = await axios
    .get(`${nodeUrl}/utils/addressToRaw/` + seller)
    .catch((err) => {
      console.log(
        "Error when calling utils/addressToRaw/useraddress, using backup"
      );
    });

  if (!publicKeyResponse.data) {
    try {
      publicKeyResponse = await axios.get(
        `${backupNodeUrl}/utils/addressToRaw/` + seller
      );
    } catch {
      console.log("Error when calling utils/addressToRaw/useraddress");

      return;
    }
  }

  if (!publicKeyResponse.data) {
    showMsg(
      "There was an error calling Node API, please try again later or notify support.",
      true
    );
    return;
  }

  let publicKey = publicKeyResponse.data.raw;

  let nftOut;
  let listedBoxes = [];

  for (nftOut of nfts) {
    let artBox = await boxById(nftOut.id);
    let p2s = supportedCurrencies[nftOut.currencyIndex].contractAddress;

    const encodedSer = await getEncodedBoxSer(artBox).catch((err) => {
      console.log("Error: ", err);
      showMsg(
        "Listing is currently unavailable, please try again later.",
        true
      );
      return;
    });

    if (!encodedSer) {
      return;
    }

    let registers = {
      R4: await encodeNum(nftOut.price.toString()),
      R5: await encodeHex(new Address(seller).ergoTree),
      R6: encodedSer,
      R7: "07" + publicKey,
    };
    listedBoxes.push({
      value: (min_value + txFee).toString(),
      ergoTree: wasm.Address.from_mainnet_str(p2s)
        .to_ergo_tree()
        .to_base16_bytes(), // p2s to ergotree (can do through node or wasm)
      assets: [{ tokenId: nftOut.id, amount: "1" }],
      additionalRegisters: registers,
      creationHeight: blockHeight.height,
    });
  }
  // -----------Output boxes--------------

  const payServiceFee = {
    value: (listingFee * nfts.length).toString(),
    ergoTree: wasm.Address.from_mainnet_str(serviceAddress)
      .to_ergo_tree()
      .to_base16_bytes(),
    assets: [],
    creationHeight: blockHeight.height,
    additionalRegisters: {},
  };

  const changeBox = {
    value: (-have["ERG"]).toString(),
    ergoTree: wasm.Address.from_mainnet_str(seller)
      .to_ergo_tree()
      .to_base16_bytes(),
    assets: Object.keys(have)
      .filter((key) => key !== "ERG")
      .filter((key) => have[key] < 0)
      .map((key) => {
        return {
          tokenId: key,
          amount: (-have[key]).toString(),
        };
      }),
    additionalRegisters: {},
    creationHeight: blockHeight.height,
  };

  if (changeBox.assets.length > CHANGE_BOX_ASSET_LIMIT) {
    showMsg(
      "Too many NFTs in input boxes to form single change box. Please de-consolidate some UTXOs. Contact the team on discord for more information.",
      true
    );
    return;
  } else {
    const feeBox = {
      value: txFee.toString(),
      creationHeight: blockHeight.height,
      ergoTree:
        "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
      assets: [],
      additionalRegisters: {},
    };

    let outputs = listedBoxes.concat([payServiceFee, changeBox, feeBox]);

    const transaction_to_sign = {
      inputs: ins.map((curIn) => {
        return {
          ...curIn,
          extension: {},
        };
      }),
      outputs: outputs,
      dataInputs: [],
      fee: txFee,
    };
    console.log("transaction_to_sign", transaction_to_sign);

    // return transaction_to_sign
    // return await signTx(transaction_to_sign)
    return await signWalletTx(transaction_to_sign);
  }
}
