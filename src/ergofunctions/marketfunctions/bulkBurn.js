import { showMsg, isWalletSaved, signTx } from "../helpers";
import { txFee, CHANGE_BOX_ASSET_LIMIT } from "../consts";
import { min_value } from "../conf";
import { currentBlock } from "../explorer";
import { getConnectorAddress, getTokens } from "../walletUtils";

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

export async function bulk_burn(nfts) {
  // Eject if wallet isnt connected
  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }
  const wasm = await ergolib;
  const seller = await getConnectorAddress();
  const blockHeight = await currentBlock();

  let nft;
  let need = { ERG: txFee };
  for (nft of nfts) {
    need[nft.id] = 1;
  }

  // Get all wallet tokens/ERG and see if they have enough
  let have = JSON.parse(JSON.stringify(need));
  have["ERG"] += min_value;

  let ins = [];
  const keys = Object.keys(have);

  const allBal = await getTokens();
  if (
    keys
      .filter((key) => key !== "ERG")
      .filter(
        (key) =>
          !Object.keys(allBal).includes(key) || allBal[key].amount < have[key]
      ).length > 0
  ) {
    console.log("Tokens");
    showMsg("Not enough balance in the wallet! See FAQ for more info.", true);
    return;
  }

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

  // -----------Output boxes--------------
  const changeBox = {
    value: (-have["ERG"] + min_value).toString(),
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
    let nftId;
    for (nftId of nfts) {
      var removeIndex = changeBox.assets
        .map((item) => item.tokenId)
        .indexOf(nftId);
      removeIndex >= 0 && array.splice(removeIndex, 1);
    }

    const feeBox = {
      value: txFee.toString(),
      creationHeight: blockHeight.height,
      ergoTree:
        "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
      assets: [],
      additionalRegisters: {},
    };

    let outputs = [changeBox, feeBox];

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
    return await signTx(transaction_to_sign);
  }
}
