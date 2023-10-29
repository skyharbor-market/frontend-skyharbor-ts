import { showMsg, generate_p2s, isWalletSaved, signTx } from "../helpers";
import { txFee, CHANGE_BOX_ASSET_LIMIT, bulkMintNodeAddress } from "../consts";
import { min_value } from "../conf";
import { currentBlock } from "../explorer";
import { encodeHex, encodeNum } from "../serializer";
import { Address } from "@coinbarn/ergo-ts";
import { binary_to_base58 } from "base58-js";
import { getConnectorAddress, getTokens } from "../walletUtils";

import blake from "blakejs";
const fromHexString = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

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

export async function bulk_mint(
  hashes,
  size,
  royaltyPercent,
  receiveAddress,
  ergDollars
) {
  // Eject if wallet isnt connected
  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }
  const wasm = await ergolib;
  const minter = await getConnectorAddress();
  const blockHeight = await currentBlock();
  const nanoErgMultiplier = 1000000000;

  // Calculate cost
  // Cost per nft **!! CHECK INT/ LONG SIZE !!**
  const x = hashes.length;
  let numberCost;
  if (x < 200) {
    numberCost = ((0.3 * x) / ergDollars) * nanoErgMultiplier;
  } else if (x < 1000) {
    numberCost = ((0.25 * x + 10) / ergDollars) * nanoErgMultiplier;
  } else if (x < 5000) {
    numberCost = ((0.2 * x + 60) / ergDollars) * nanoErgMultiplier;
  } else {
    numberCost = ((0.15 * x + 60) / ergDollars) * nanoErgMultiplier;
  }

  numberCost = Math.floor(numberCost);

  let sizeCost;
  // Some cost function based on size (lets do $3.60 per gb for now)
  sizeCost = ((size * 3.6) / ergDollars) * nanoErgMultiplier;
  sizeCost = Math.floor(sizeCost);

  let need = { ERG: numberCost + sizeCost + txFee };

  console.log("numberCost: ", numberCost);
  console.log("sizeCost: ", sizeCost);
  console.log("x: ", x);

  // Get all wallet tokens/ERG and see if they have enough
  let have = JSON.parse(JSON.stringify(need));
  // Amount of Erg artist p2pk gets from tx (probably will just be 0)
  have["ERG"] += 0;

  // Generic get inputs code by anon_real
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

  // Loop create output boxes
  let listedBoxes = [];
  let hash;
  // generate p2s
  const receiveAdd = binary_to_base58(
    fromHexString(
      blake.blake2bHex(
        fromHexString(new Address(receiveAddress).ergoTree),
        null,
        32
      )
    )
  );
  const royaltyAdd = binary_to_base58(
    fromHexString(
      blake.blake2bHex(fromHexString(new Address(minter).ergoTree), null, 32)
    )
  );
  let script = `
    {
    val receiveAddress = fromBase58("${receiveAdd}")
    val royaltyAddress = fromBase58("${royaltyAdd}")
    val deadline = ${blockHeight.height + 1000}
    val r4 = OUTPUTS(0).R4[Coll[Byte]].get
    val r5 = OUTPUTS(0).R5[Coll[Byte]].get
    val r6 = OUTPUTS(0).R6[Coll[Byte]].get
    val r7 = OUTPUTS(0).R7[Coll[Byte]].get
    val r8 = OUTPUTS(0).R8[Coll[Byte]].get
    val r9 = OUTPUTS(0).R9[Coll[Byte]].get
    
    // Value not necessary since, min value is fine if people want to steal
    if (HEIGHT < deadline) {
    allOf(Coll(
    blake2b256(r4.append(r5).append(r6).append(r7).append(r8).append(r9)) == SELF.R6[Coll[Byte]].get,
    blake2b256(OUTPUTS(0).propositionBytes) == receiveAddress,
    OUTPUTS(0).tokens(0)._1 == SELF.id))
    }
    else{
    true}
    }`;

  let p2s = await generate_p2s(script);
  console.log("p2s", p2s);

  for (hash of hashes) {
    let registers = {
      R4: await encodeNum((royaltyPercent * 10).toString()),
      R5: await encodeHex(new Address(receiveAddress).ergoTree),
      R6: await encodeHex(hash),
    };
    listedBoxes.push({
      value: (min_value + txFee).toString(),
      ergoTree: wasm.Address.from_mainnet_str(p2s)
        .to_ergo_tree()
        .to_base16_bytes(), // p2s to ergotree (can do through node or wasm)
      assets: [],
      additionalRegisters: registers,
      creationHeight: blockHeight.height,
    });
  }

  // Change, service fee and minting
  const payServiceFee = {
    value: (numberCost + sizeCost - x * (min_value + txFee)).toString(),
    ergoTree: wasm.Address.from_mainnet_str(bulkMintNodeAddress)
      .to_ergo_tree()
      .to_base16_bytes(),
    assets: [],
    creationHeight: blockHeight.height,
    additionalRegisters: {},
  };

  const changeBox = {
    value: (-have["ERG"]).toString(),
    ergoTree: wasm.Address.from_mainnet_str(minter)
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
    return await signTx(transaction_to_sign);
  }
}
