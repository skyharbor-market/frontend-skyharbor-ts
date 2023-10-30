import axios from "axios";
import {
  showMsg,
  royalties_scan,
  generate_p2s,
  isWalletSaved,
  signTx,
  getListedBox,
  getSigUsdBoxId,
  getOracleBox,
  getWalletType,
  getWalletAddress,
  getWalletUUID,
} from "../helpers";
import {
  txFee,
  v1Addresses,
  v1ErgAddress,
  v1SigUsdAddress,
  supportedCurrencies,
  listingFee,
  makeOfferAddress,
  MIN_NERG_BOX_VALUE,
  CHANGE_BOX_ASSET_LIMIT,
  bulkMintNodeAddress,
  cartCheckoutAddress,
  babyTxFee,
  sigUsdAddress,
  skyHarborApi,
} from "../consts";
import { service_multiplier, min_value, min_fee } from "../conf";
import {
  currentBlock,
  getBalance,
  boxById,
  getIssuingBox,
  getActiveAuctions,
  getBoxesForAsset,
  unspentBoxesFor,
} from "../explorer";
import {
  colTuple,
  encodeByteArray,
  encodeHex,
  encodeNum,
  getEncodedBoxSer,
  getRoyaltyInfo,
} from "../serializer";
import { Serializer } from "@coinbarn/ergo-ts/dist/serializer";
import { Address, minBoxValue } from "@coinbarn/ergo-ts";
import { getConnectorAddress } from "../walletUtils";
import { v4 as uuidv4 } from "uuid";
import { ErgoBox, OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";
import { createUnsignedTransaction, get_utxos } from "../ergolibUtils";

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

// --------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------- Putting an NFT up for sale -----------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------

export async function list_NFT(nft_id, list_price, currencyIndex = 0) {
  if (getWalletType() === "ergopay") {
    list_NFT_ergopay(nft_id, list_price, currencyIndex);
  } else {
    list_NFT_nautilust(nft_id, list_price, currencyIndex);
  }
}

export async function list_NFT_ergopay(nft_id, list_price, currencyIndex = 0) {
  // Eject if wallet isnt connected
  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }
  // Consts
  const wasm = await ergolib;
  const p2s = supportedCurrencies[currencyIndex].contractAddress;
  const bidder = await getConnectorAddress();

  // Get Input Boxes
  let reqErg = min_value + txFee + txFee + listingFee + min_value;
  let inputsBoxes = await ergo.get_utxos(1, nft_id);
  if (inputsBoxes.length == 0) {
    showMsg(
      "Cant find NFT in the wallet! Contact team on discord and share this error message.",
      true
    );
    return;
  }
  let inputsTotal = inputsBoxes[0].value;
  inputsBoxes[0].extension = {};

  // Add checks if assets are over 100 in each box, if they are, create another box.
  if (inputsTotal < reqErg) {
    let ergBox = await ergo.get_utxos(reqErg, "ERG");
    if (ergBox.length == 0) {
      showMsg("Not enough balance in the wallet! See FAQ for more info.", true);
      return;
    }
    for (box of ergBox) {
      // The code below doesnt clone box, but makes a reference to it, so you're adding .extension to box as well. not sure if you knew kras
      var newBox = box; //JSON.parse(JSON.stringify(box));

      newBox.extension = {};
      if (newBox.boxId !== inputsBoxes[0].boxId) {
        inputsBoxes.push(newBox);
      }
    }
    // inputsBoxes = inputsBoxes.concat(ergBox)
  }

  // -----------Output boxes--------------
  const blockHeight = await currentBlock();
  let artBox = await boxById(nft_id);
  let publicKeyResponse = await axios
    .get(`${nodeUrl}/utils/addressToRaw/` + bidder)
    .catch((err) => {
      console.log("Error when calling utils/addressToRaw/useraddress");
    });
  let publicKey = publicKeyResponse.data.raw;

  const encodedSer = await getEncodedBoxSer(artBox).catch((err) => {
    console.log("Error: ", err);
    showMsg("Listing is currently unavailable, please try again later.", true);
    return;
  });

  if (!encodedSer) {
    return;
  }

  let registers = {
    R4: await encodeNum(list_price.toString()),
    R5: await encodeHex(new Address(bidder).ergoTree),
    R6: encodedSer,
    R7: "07" + publicKey,
  };

  const listedBox = {
    value: (min_value + txFee).toString(),
    ergoTree: wasm.Address.from_mainnet_str(p2s)
      .to_ergo_tree()
      .to_base16_bytes(), // p2s to ergotree (can do through node or wasm)
    assets: [{ tokenId: nft_id, amount: "1" }],
    additionalRegisters: registers,
    creationHeight: blockHeight.height,
  };

  const payServiceFee = {
    value: listingFee.toString(),
    ergoTree: wasm.Address.from_mainnet_str(serviceAddress)
      .to_ergo_tree()
      .to_base16_bytes(),
    assets: [],
    creationHeight: blockHeight.height,
    additionalRegisters: {},
  };

  // Change calculation
  let changeAssets = [];
  let changeValue = -reqErg + min_value;
  let firstTime = true; // subtract 1 nft from the first box you find that contains it
  let changeAssetsPerBox = [];

  let box;
  for (box of inputsBoxes) {
    let asset;
    for (asset of box.assets) {
      if (asset.tokenId !== nft_id) {
        changeAssets.push(asset);
      } else {
        if (parseInt(asset.amount) - 1 !== 0 && firstTime === true) {
          var tempAsset = JSON.parse(JSON.stringify(asset));

          tempAsset.amount = `${parseInt(asset.amount) - 1}`;
          changeAssets.push(tempAsset);
          firstTime = false;
        }
      }
      //cut change box once it hits change box asset limit, start a new change box
      // asset limit set to 90 because if the user has high count of particular tokens (i.e. 10,000,000 SIGRSV), a box might not be able to hold 100 distinct tokens
      // would be best to ensure box doesn't exceed 4KiB but not sure how to do that lel
      if (changeAssets.length == CHANGE_BOX_ASSET_LIMIT) {
        changeAssetsPerBox.push(changeAssets);
        // no need to remove already-processed change assets from change boxes, already looped over
        // clear changeAssets
        changeAssets = [];
      }
    }
    changeValue += parseInt(box.value);
  }
  //push remaining to changeBoxes
  changeAssetsPerBox.push(changeAssets);

  if (changeValue < min_value) {
    showMsg("Not enough balance in the wallet! See FAQ for more info.", true);
    return;
  }

  let remainder = changeValue % changeAssetsPerBox.length;
  let changeErgsPerBoxFloored = Math.floor(
    changeValue / changeAssetsPerBox.length
  );
  let changeBoxes = [];
  let i = 0;
  for (let assets of changeAssetsPerBox) {
    let boxValue;
    // add remainder nergs to final box in case ergs / changeboxes isn't integer
    if (i == changeAssetsPerBox.length - 1) {
      boxValue = changeErgsPerBoxFloored + remainder;
    } else {
      boxValue = changeErgsPerBoxFloored;
    }

    console.log(changeErgsPerBoxFloored);
    console.log(boxValue);
    console.log(boxValue.toString());

    let changeBox = {
      value: boxValue.toString(),
      ergoTree: wasm.Address.from_mainnet_str(bidder)
        .to_ergo_tree()
        .to_base16_bytes(),
      assets: assets,
      additionalRegisters: {},
      creationHeight: blockHeight.height,
    };

    changeBoxes.push(changeBox);

    i++;
  }

  const feeBox = {
    value: txFee.toString(),
    creationHeight: blockHeight.height,
    ergoTree:
      "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
    assets: [],
    additionalRegisters: {},
  };

  // console.log(paySeller.value + payService.value + payRoyalty.value + buyerGets.value + feeBox.value)
  let transaction_to_sign = {
    inputs: inputsBoxes,
    outputs: [listedBox, payServiceFee], // Adding change and fee boxes below.
    dataInputs: [],
    fee: txFee,
  };

  transaction_to_sign.outputs.push(feeBox);

  for (let changeBox of changeBoxes) {
    transaction_to_sign.outputs.push(changeBox);
  }

  console.log("transaction_to_sign", transaction_to_sign);

  // return transaction_to_sign
  return await signTx(transaction_to_sign);
}

export async function listNFTFleet(nft_id, list_price, currencyIndex = 0) {
  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }

  const wasm = await ergolib;
  const p2s = supportedCurrencies[currencyIndex].contractAddress;
  const seller = await getWalletAddress();
  const reqErg = min_value + txFee + txFee + listingFee + min_value;

  const ergBoxes = await get_utxos(seller, reqErg);
  const nftBoxes = await get_utxos(seller, 0, nft_id, 1);
  // const inputsBoxes = ergBoxes.concat(nftBoxes);
  const uniqueNftBoxes = nftBoxes.filter((nftBox) => {
    return !ergBoxes.some(
      (ergBox) => JSON.stringify(ergBox) === JSON.stringify(nftBox)
    );
  });

  const inputsBoxes = ergBoxes.concat(uniqueNftBoxes);

  if (inputsBoxes.length === 0) {
    showMsg(
      "Cant find NFT in the wallet! Contact team on discord and share this error message.",
      true
    );
    return;
  }
  inputsBoxes[0].extension = {};

  const blockHeight = await currentBlock();
  const artBox = await boxById(nft_id);
  const publicKeyResponse = await axios.get(
    `${nodeUrl}/utils/addressToRaw/${seller}`
  );
  const publicKey = publicKeyResponse.data.raw;
  const encodedSer = await getEncodedBoxSer(artBox);

  if (!encodedSer) {
    return;
  }

  const registers = {
    R4: await encodeNum(list_price.toString()),
    R5: await encodeHex(new Address(seller).ergoTree),
    R6: encodedSer,
    R7: "07" + publicKey,
  };

  const outputArray = [
    new OutputBuilder((min_value + txFee).toString(), p2s, blockHeight.height)
      .addTokens({ tokenId: nft_id, amount: "1" })
      .setAdditionalRegisters(registers),
    new OutputBuilder(
      listingFee.toString(),
      serviceAddress,
      blockHeight.height
    ),
  ];

  const unsignedTransaction = new TransactionBuilder(blockHeight.height)
    .from(inputsBoxes)
    .to(outputArray)
    .sendChangeTo(seller)
    .payMinFee()
    .build()
    .toEIP12Object();

  const unsignedTx = JSON.stringify(unsignedTransaction);

  if (getWalletType() === "ergopay") {
    const txId = await axios.post(`${skyHarborApi}/api/ergopay/saveTx`, {
      txData: unsignedTx,
      uuid: getWalletUUID(),
    });
    return txId.data;
  } else {
    return await signTx(unsignedTransaction);
  }
}

function toJson(data) {
  if (data !== undefined) {
    return JSON.stringify(data, (_, v) =>
      typeof v === "bigint" ? `${v}#bigint` : v
    ).replace(/"(-?\d+)#bigint"/g, (_, a) => a);
  }
}

export async function list_NFT_nautilust(
  nft_id,
  list_price,
  currencyIndex = 0
) {
  // Eject if wallet isnt connected
  if (!isWalletSaved()) {
    showMsg("Connect your wallet first.", true);
    return;
  }
  // Consts
  const wasm = await ergolib;
  const p2s = supportedCurrencies[currencyIndex].contractAddress;
  const bidder = await getConnectorAddress();

  // Get Input Boxes
  let reqErg = min_value + txFee + txFee + listingFee + min_value;
  let inputsBoxes = await ergo.get_utxos(1, nft_id);
  if (inputsBoxes.length == 0) {
    showMsg(
      "Cant find NFT in the wallet! Contact team on discord and share this error message.",
      true
    );
    return;
  }
  let inputsTotal = inputsBoxes[0].value;
  inputsBoxes[0].extension = {};

  // Add checks if assets are over 100 in each box, if they are, create another box.
  if (inputsTotal < reqErg) {
    let ergBox = await ergo.get_utxos(reqErg, "ERG");
    if (ergBox.length == 0) {
      showMsg("Not enough balance in the wallet! See FAQ for more info.", true);
      return;
    }
    for (box of ergBox) {
      // The code below doesnt clone box, but makes a reference to it, so you're adding .extension to box as well. not sure if you knew kras
      var newBox = box; //JSON.parse(JSON.stringify(box));

      newBox.extension = {};
      if (newBox.boxId !== inputsBoxes[0].boxId) {
        inputsBoxes.push(newBox);
      }
    }
    // inputsBoxes = inputsBoxes.concat(ergBox)
  }

  // -----------Output boxes--------------
  const blockHeight = await currentBlock();
  let artBox = await boxById(nft_id);
  let publicKeyResponse = await axios
    .get(`${nodeUrl}/utils/addressToRaw/` + bidder)
    .catch((err) => {
      console.log("Error when calling utils/addressToRaw/useraddress");
    });
  let publicKey = publicKeyResponse.data.raw;

  const encodedSer = await getEncodedBoxSer(artBox).catch((err) => {
    console.log("Error: ", err);
    showMsg("Listing is currently unavailable, please try again later.", true);
    return;
  });

  if (!encodedSer) {
    return;
  }

  let registers = {
    R4: await encodeNum(list_price.toString()),
    R5: await encodeHex(new Address(bidder).ergoTree),
    R6: encodedSer,
    R7: "07" + publicKey,
  };

  const listedBox = {
    value: (min_value + txFee).toString(),
    ergoTree: wasm.Address.from_mainnet_str(p2s)
      .to_ergo_tree()
      .to_base16_bytes(), // p2s to ergotree (can do through node or wasm)
    assets: [{ tokenId: nft_id, amount: "1" }],
    additionalRegisters: registers,
    creationHeight: blockHeight.height,
  };

  const payServiceFee = {
    value: listingFee.toString(),
    ergoTree: wasm.Address.from_mainnet_str(serviceAddress)
      .to_ergo_tree()
      .to_base16_bytes(),
    assets: [],
    creationHeight: blockHeight.height,
    additionalRegisters: {},
  };

  // Change calculation
  let changeAssets = [];
  let changeValue = -reqErg + min_value;
  let firstTime = true; // subtract 1 nft from the first box you find that contains it
  let changeAssetsPerBox = [];

  let box;
  for (box of inputsBoxes) {
    let asset;
    for (asset of box.assets) {
      if (asset.tokenId !== nft_id) {
        changeAssets.push(asset);
      } else {
        if (parseInt(asset.amount) - 1 !== 0 && firstTime === true) {
          var tempAsset = JSON.parse(JSON.stringify(asset));

          tempAsset.amount = `${parseInt(asset.amount) - 1}`;
          changeAssets.push(tempAsset);
          firstTime = false;
        }
      }
      //cut change box once it hits change box asset limit, start a new change box
      // asset limit set to 90 because if the user has high count of particular tokens (i.e. 10,000,000 SIGRSV), a box might not be able to hold 100 distinct tokens
      // would be best to ensure box doesn't exceed 4KiB but not sure how to do that lel
      if (changeAssets.length == CHANGE_BOX_ASSET_LIMIT) {
        changeAssetsPerBox.push(changeAssets);
        // no need to remove already-processed change assets from change boxes, already looped over
        // clear changeAssets
        changeAssets = [];
      }
    }
    changeValue += parseInt(box.value);
  }
  //push remaining to changeBoxes
  changeAssetsPerBox.push(changeAssets);

  if (changeValue < min_value) {
    showMsg("Not enough balance in the wallet! See FAQ for more info.", true);
    return;
  }

  let remainder = changeValue % changeAssetsPerBox.length;
  let changeErgsPerBoxFloored = Math.floor(
    changeValue / changeAssetsPerBox.length
  );
  let changeBoxes = [];
  let i = 0;
  for (let assets of changeAssetsPerBox) {
    let boxValue;
    // add remainder nergs to final box in case ergs / changeboxes isn't integer
    if (i == changeAssetsPerBox.length - 1) {
      boxValue = changeErgsPerBoxFloored + remainder;
    } else {
      boxValue = changeErgsPerBoxFloored;
    }

    console.log(changeErgsPerBoxFloored);
    console.log(boxValue);
    console.log(boxValue.toString());

    let changeBox = {
      value: boxValue.toString(),
      ergoTree: wasm.Address.from_mainnet_str(bidder)
        .to_ergo_tree()
        .to_base16_bytes(),
      assets: assets,
      additionalRegisters: {},
      creationHeight: blockHeight.height,
    };

    changeBoxes.push(changeBox);

    i++;
  }

  const feeBox = {
    value: txFee.toString(),
    creationHeight: blockHeight.height,
    ergoTree:
      "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
    assets: [],
    additionalRegisters: {},
  };

  // console.log(paySeller.value + payService.value + payRoyalty.value + buyerGets.value + feeBox.value)
  let transaction_to_sign = {
    inputs: inputsBoxes,
    outputs: [listedBox, payServiceFee], // Adding change and fee boxes below.
    dataInputs: [],
    fee: txFee,
  };

  transaction_to_sign.outputs.push(feeBox);

  for (let changeBox of changeBoxes) {
    transaction_to_sign.outputs.push(changeBox);
  }

  console.log("transaction_to_sign", transaction_to_sign);

  // return transaction_to_sign
  return await signTx(transaction_to_sign);
}
