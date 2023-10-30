import {
  showMsg,
  isWalletSaved,
  signTx,
  getListedBox,
  getWalletAddress,
} from "../helpers";
import { txFee, supportedCurrencies, CHANGE_BOX_ASSET_LIMIT } from "../consts";
import { min_value } from "../conf";
import { currentBlock } from "../explorer";
import { encodeNum } from "../serializer";
import { getConnectorAddress } from "../walletUtils";
import { get_utxos } from "../ergolibUtils";
import { signWalletTx } from "../utxos";

let ergolib = import("ergo-lib-wasm-browser");
// import dynamic from "next/dynamic";
// let ergolib = dynamic(() => import("ergo-lib-wasm-browser"), { ssr: false });

// const nodeUrl = "https://paidincrypto.io";
// const nodeUrl = "https://www.test-skyharbor-server.net:9053/";
const nodeUrl = "https://node.ergo.watch";
// new open node at https://node.ergo.watch/

const serviceAddress = "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd";
const minterServiceAddress =
  "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd";

// -------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------- Relist an NFT -----------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------

export async function relist_NFT(relistBox, list_price, currencyIndex = 0) {
  const wasm = await ergolib;

  // Cancel if wallet isnt connected
  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }

  const relister = await getWalletAddress();
  const blockHeight = await currentBlock();

  let listedBox = await getListedBox(relistBox);
  listedBox.additionalRegisters.R4 =
    listedBox.additionalRegisters.R4.serializedValue;
  listedBox.additionalRegisters.R5 =
    listedBox.additionalRegisters.R5.serializedValue;
  listedBox.additionalRegisters.R7 =
    listedBox.additionalRegisters.R7.serializedValue;
  const p2s = supportedCurrencies[currencyIndex].contractAddress;

  let need = { ERG: min_value + txFee };
  // Get all wallet tokens/ERG and see if they have enough
  let have = JSON.parse(JSON.stringify(need));
  have["ERG"] += txFee - listedBox.value;

  let ins = [];
  const keys = Object.keys(have);

  for (let i = 0; i < keys.length; i++) {
    if (have[keys[i]] <= 0) continue;
    // const curIns = await ergo.get_utxos(have[keys[i]].toString(), keys[i]);
    let curIns;
    // Without dapp connector
    if (keys[i] === "ERG") {
      curIns = await get_utxos(relister, have[keys[i]].toString());
    } else {
      curIns = await get_utxos(relister, 0, keys[i], have[keys[i]].toString());
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

  // -----------Output boxes--------------
  let registers = {
    R4: await encodeNum(list_price.toString()),
    R5: listedBox.additionalRegisters.R5,
    R6: listedBox.additionalRegisters.R6,
    R7: listedBox.additionalRegisters.R7,
  };

  const relistedBox = {
    value: (min_value + txFee).toString(),
    ergoTree: wasm.Address.from_mainnet_str(p2s)
      .to_ergo_tree()
      .to_base16_bytes(), // p2s to ergotree (can do through node or wasm)
    assets: [
      {
        tokenId: listedBox.assets[0].tokenId,
        amount: listedBox.assets[0].amount,
      },
    ],
    additionalRegisters: registers,
    creationHeight: blockHeight.height,
  };

  const changeBox = {
    value: (-have["ERG"]).toString(),
    ergoTree: wasm.Address.from_mainnet_str(relister)
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

    // console.log(paySeller.value + payService.value + payRoyalty.value + buyerGets.value + feeBox.value)
    let inputList = ins.map((curIn) => {
      return {
        ...curIn,
        extension: {},
      }; // this gets all user eutxo boxes (need to look into how we can get curIn)
    });
    const inputBoxes = inputList.concat(listedBox);
    const transaction_to_sign = {
      inputs: inputBoxes,
      outputs: [changeBox, relistedBox, feeBox],
      dataInputs: [],
      fee: txFee,
    };
    console.log("transaction_to_sign", transaction_to_sign);

    // return await signTx(transaction_to_sign)
    return await signWalletTx(transaction_to_sign);
  }
}
