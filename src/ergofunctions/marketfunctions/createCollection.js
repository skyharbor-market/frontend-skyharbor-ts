import { showMsg, isWalletSaved, signTx, getListedBox } from "../helpers";
import { txFee, CHANGE_BOX_ASSET_LIMIT } from "../consts";
import { currentBlock } from "../explorer";
import { encodeHex, getRoyaltyInfo } from "../serializer";
import { getConnectorAddress } from "../walletUtils";
import { useSelector } from "react-redux";
import {
  OutputBuilder,
  TransactionBuilder,
  SConstant,
  SByte,
  SLong,
  SSigmaProp,
  SUnit,
  SColl,
} from "@fleet-sdk/core";

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
// ------------------------------------------------ Creating a Collection --------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------

export async function createCollection(collectionInfo) {
  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }

  // const buyer = useSelector((state) => state.wallet.defaultAddress);
  // const buyer = await getConnectorAddress()
  const buyer = await getWalletAddress();

  console.log("buyer", buyer);
  const blockHeight = await currentBlock();

  // ***** CREATE TRANSACTION OUTPUT *****
  let outputArray = [
    new OutputBuilder(
      sellerValue,
      listedBox.additionalRegisters.R5.renderedValue
    ) // Seller payment
      .setAdditionalRegisters({
        R4: SConstant(SColl(SByte, Buffer.from(listedBox.boxId, "hex"))),
      }),
    new OutputBuilder(payServiceFee, serviceAddress), // Service fee payment
    new OutputBuilder(listedBox.value, buyer) // Buyer getting bought token
      .addTokens([
        {
          tokenId: listedBox.assets[0].tokenId,
          amount: listedBox.assets[0].amount,
        },
      ]),
  ];

  // If there are royalties, insert royalty payment
  if (royalties.artist) {
    outputArray.push(new OutputBuilder(royalty_value, royalty_propBytes)); // Royalty payment
  }

  // ***** CREATE TRANSACTION INPUT *****
  const requiredErg =
    parseInt(listedBox.additionalRegisters.R4.renderedValue) +
    parseInt(listedBox.value.toString()) +
    parseInt(feeBox.value);
  let need = { ERG: requiredErg };
  let have = JSON.parse(JSON.stringify(need));
  have["ERG"] += txFee;
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

  const inputBoxes = ins.concat(listedBox);

  // ***** BUILD ENTIRE TRANSACTION *****
  const unsignedTransaction = new TransactionBuilder(blockHeight)
    .from(inputBoxes)
    .to(outputArray)
    .sendChangeTo(buyer)
    .configureSelector((selector) =>
      selector.ensureInclusion((input) => input.boxId === listedBox.boxId)
    )
    .payMinFee()
    .build();

  console.log("unsignedTransaction", unsignedTransaction);

  return unsignedTransaction;
}
