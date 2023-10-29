import axios from "axios";
import {
  showMsg,
  isWalletSaved,
  signTx,
  getListedBox,
  getSigUsdBoxId,
  getOracleBox,
} from "../helpers";
import { txFee, makeOfferAddress, CHANGE_BOX_ASSET_LIMIT } from "../consts";
import { currentBlock, boxById } from "../explorer";
import { encodeHex, getEncodedBoxSer } from "../serializer";
import { Address } from "@coinbarn/ergo-ts";
import { getConnectorAddress } from "../walletUtils";

// let ergolib = import('ergo-lib-wasm-browser')
import dynamic from "next/dynamic";

let ergolib = dynamic(() => import("ergo-lib-wasm-browser"), { ssr: false });

// const nodeUrl = "https://paidincrypto.io";
// const nodeUrl = "https://www.test-skyharbor-server.net:9053/";
const nodeUrl = "https://node.ergo.watch";
// new open node at https://node.ergo.watch/

const serviceAddress = "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd";
const minterServiceAddress =
  "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd";

export async function make_offer(nftId, price, buyBox) {
  // Cancel if wallet isnt connected
  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }

  const wasm = await ergolib;

  const offeree = await getConnectorAddress();
  const blockHeight = await currentBlock();

  let listedBox = buyBox ? await getListedBox(buyBox) : undefined;

  const p2s = makeOfferAddress;

  let need = { ERG: price };
  // Get all wallet tokens/ERG and see if they have enough
  let have = JSON.parse(JSON.stringify(need));
  have["ERG"] += txFee;

  let ins = [];
  const keys = Object.keys(have);

  for (let i = 0; i < keys.length; i++) {
    if (have[keys[i]] <= 0) continue;
    const curIns = await ergo.get_utxos(have[keys[i]].toString(), keys[i]);
    // console.log("bx", await ergo.get_utxos())
    // console.log("have[keys[i]].toString(): ", have[keys[i]].toString(), keys[i])

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

  const r6 = listedBox
    ? listedBox.additionalRegisters.R6
    : await getEncodedBoxSer(await boxById(nft_id));
  let publicKeyResponse = await axios
    .get(`${nodeUrl}/utils/addressToRaw/` + offeree)
    .catch((err) => {
      console.log("Error when calling utils/addressToRaw/useraddress");
    });
  let publicKey = publicKeyResponse.data.raw;

  // -----------Output boxes--------------
  let registers = {
    R4: await encodeHex(nftId),
    R5: await encodeHex(new Address(offeree).ergoTree),
    R6: r6,
    R7: "07" + publicKey,
  };

  const offerBox = {
    value: price.toString(),
    ergoTree: wasm.Address.from_mainnet_str(p2s)
      .to_ergo_tree()
      .to_base16_bytes(), // p2s to ergotree (can do through node or wasm)
    assets: [],
    additionalRegisters: registers,
    creationHeight: blockHeight.height,
  };

  const changeBox = {
    value: (-have["ERG"]).toString(),
    ergoTree: wasm.Address.from_mainnet_str(offeree)
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

    const inputList = ins.map((curIn) => {
      return {
        ...curIn,
        extension: {},
      }; // this gets all user eutxo boxes
    });

    const transaction_to_sign = {
      inputs: inputList,
      outputs: [offerBox, changeBox, feeBox],
      dataInputs: [],
      fee: txFee,
    };

    return await signTx(transaction_to_sign);
  }
}
