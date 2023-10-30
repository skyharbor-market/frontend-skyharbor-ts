import {
  showMsg,
  isWalletSaved,
  signTx,
  getOracleBox,
  getSigUsdBox,
} from "../helpers";
import {
  txFee,
  supportedCurrencies,
  CHANGE_BOX_ASSET_LIMIT,
  babyTxFee,
  sigUsdAddress,
} from "../consts";
import { currentBlock } from "../explorer";
import { encodeNum } from "../serializer";
import { getConnectorAddress } from "../walletUtils";

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

export async function swapSigUSDtoERG(
  inputAmount,
  userAmountIn,
  skyHarborTaxIn
) {
  const skyHarborTax = parseInt(skyHarborTaxIn);
  const userAmount = parseInt(userAmountIn);

  const wasm = await ergolib;

  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }

  const buyer = await getConnectorAddress();
  console.log("buyer", buyer);
  const blockHeight = await currentBlock();

  const requiredErg = txFee;
  let need = { ERG: requiredErg };
  need[supportedCurrencies[1].id] = parseInt(inputAmount);
  let have = JSON.parse(JSON.stringify(need));
  let ins = [];
  const keys = Object.keys(have);

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

  const sigUsdBox = await getSigUsdBox();

  console.log("sigUsdBox", sigUsdBox);

  const sigUsdBoxOutput = {
    value: (parseInt(sigUsdBox.value) - userAmount - skyHarborTax).toString(),
    ergoTree: wasm.Address.from_mainnet_str(sigUsdAddress)
      .to_ergo_tree()
      .to_base16_bytes(),
    assets: [
      {
        tokenId: sigUsdBox.assets[0].tokenId,
        amount: sigUsdBox.assets[0].amount + parseInt(inputAmount),
      },
      {
        tokenId: sigUsdBox.assets[1].tokenId,
        amount: sigUsdBox.assets[1].amount,
      },
      {
        tokenId: sigUsdBox.assets[2].tokenId,
        amount: sigUsdBox.assets[2].amount,
      },
    ],
    creationHeight: blockHeight.height,
    additionalRegisters: {
      R4: await encodeNum(
        (
          parseInt(sigUsdBox.additionalRegisters.R4.renderedValue) -
          parseInt(inputAmount)
        ).toString()
      ),
      R5: await encodeNum(
        parseInt(sigUsdBox.additionalRegisters.R5.renderedValue).toString()
      ),
    },
  };

  console.log("0000000");

  console.log("skyHarborTax", skyHarborTax);

  const payServiceFee = {
    value: skyHarborTax.toString(),
    ergoTree: wasm.Address.from_mainnet_str(serviceAddress)
      .to_ergo_tree()
      .to_base16_bytes(),
    assets: [],
    creationHeight: blockHeight.height,
    additionalRegisters: {},
  };

  const userBox = {
    value: userAmount.toString(),
    ergoTree: wasm.Address.from_mainnet_str(buyer)
      .to_ergo_tree()
      .to_base16_bytes(),
    assets: [],
    creationHeight: blockHeight.height,
    additionalRegisters: {},
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

  const oracleBox = await getOracleBox();

  const oracleBoxObj = {
    value: oracleBox.value,
    ergoTree: oracleBox.ergoTree,
    assets: [
      {
        tokenId: oracleBox.assets[0].tokenId,
        amount: oracleBox.assets[0].amount,
      },
    ],
    transactionId: oracleBox.transactionId,
    index: oracleBox.index,
    additionalRegisters: {
      R4: oracleBox.additionalRegisters.R4.serializedValue,
      R5: oracleBox.additionalRegisters.R5.serializedValue,
      R6: oracleBox.additionalRegisters.R6.serializedValue,
    },
    creationHeight: oracleBox.creationHeight,
    extension: oracleBox.extension,
    boxId: oracleBox.boxId,
    confirmed: oracleBox.confirmed,
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

    let outputs = [sigUsdBoxOutput, payServiceFee, userBox, changeBox, feeBox];

    let finalInputs = ins.map((curIn) => {
      return {
        ...curIn,
        extension: {},
      };
    });

    finalInputs.push(sigUsdBox);

    const transaction_to_sign = {
      inputs: finalInputs,
      outputs: outputs,
      dataInputs: [oracleBoxObj],
      fee: babyTxFee,
    };
    console.log("transaction_to_sign", transaction_to_sign);
    return await signTx(transaction_to_sign);
  }
}
