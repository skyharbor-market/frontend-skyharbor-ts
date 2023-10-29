import { showMsg, isWalletSaved, signTx } from "../helpers";
import {
  txFee,
  CHANGE_BOX_ASSET_LIMIT,
  cartCheckoutAddress,
  babyTxFee,
  MIN_NERG_BOX_VALUE,
} from "../consts";
import { currentBlock } from "../explorer";
import { encodeHex, encodeLongArray, encodeNum } from "../serializer";
import { Address, minBoxValue } from "@coinbarn/ergo-ts";
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

export async function cart_checkout(cart) {
  const wasm = await ergolib;

  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }

  const buyer = await getConnectorAddress();
  console.log("buyer", buyer);
  const blockHeight = await currentBlock();

  let totalCost = 0;
  for (let order of cart) {
    totalCost += parseInt(order["nerg_sale_value"]);
  }

  const requiredErg =
    totalCost + babyTxFee * cart.length + MIN_NERG_BOX_VALUE + txFee;

  let need = { ERG: requiredErg };
  let have = JSON.parse(JSON.stringify(need));
  let ins = [];
  const keys = Object.keys(have);
  console.log("totalCost: ", totalCost);

  let tokensTuple = [
    { nft_id: cart[0].token_id, price: cart[0].nerg_sale_value },
  ];

  let reg4 = "1a" + ((cart.length <= 15 ? "0" : "") + cart.length.toString(16));

  let prices = [];

  for (let x of cart) {
    reg4 += "20" + x.token_id;

    prices.push(x.nerg_sale_value);
  }

  console.log("reg4", reg4);

  for (let i = 0; i < keys.length; i++) {
    if (have[keys[i]] <= 0) continue;
    const curIns = await ergo.get_utxos(have[keys[i]].toString(), keys[i]);
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

  console.log("blockHeight.height", blockHeight.height);

  const cartBox = {
    value: (
      totalCost +
      babyTxFee * cart.length +
      MIN_NERG_BOX_VALUE
    ).toString(),
    ergoTree: wasm.Address.from_mainnet_str(cartCheckoutAddress)
      .to_ergo_tree()
      .to_base16_bytes(),
    assets: [],
    creationHeight: blockHeight.height,
    additionalRegisters: {
      R4: reg4,
      R5: await encodeLongArray(prices),
      R6: await encodeHex(new Address(buyer).ergoTree),
      R7: await encodeNum(babyTxFee.toString()),
      R8: await encodeNum((blockHeight.height + 15).toString()),
    },
  };

  const changeBox = {
    value: (-have["ERG"]).toString(),
    ergoTree: wasm.Address.from_mainnet_str(buyer)
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

    let outputs = [cartBox, changeBox, feeBox];

    const transaction_to_sign = {
      inputs: ins.map((curIn) => {
        return {
          ...curIn,
          extension: {},
        };
      }),
      outputs: outputs,
      dataInputs: [],
      fee: babyTxFee,
    };
    console.log("transaction_to_sign", transaction_to_sign);
    return await signTx(transaction_to_sign);
  }
}
