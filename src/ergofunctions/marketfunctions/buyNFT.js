import {
    showMsg,
    isWalletSaved,
    signTx, getListedBox, getWalletAddress, getWalletType, getWalletUUID
} from "../helpers";
import {
    txFee,
    CHANGE_BOX_ASSET_LIMIT,
    skyHarborApi
} from "../consts";
import { currentBlock } from "../explorer";
import { encodeHex, getRoyaltyInfo } from "../serializer";
import { getConnectorAddress } from "../walletUtils";
import { useSelector } from 'react-redux';
import { OutputBuilder, TransactionBuilder, SConstant, SByte, SLong, SSigmaProp, SUnit, SColl } from "@fleet-sdk/core";
import { get_utxos } from "../ergolibUtils";
import axios from "axios";
import { signWalletTx } from "../utxos";

let ergolib = import('ergo-lib-wasm-browser')

// const nodeUrl = "https://paidincrypto.io";
// const nodeUrl = "https://www.test-skyharbor-server.net:9053/";
const nodeUrl = "https://node.ergo.watch";
// new open node at https://node.ergo.watch/ 

const serviceAddress = "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd"
const minterServiceAddress = "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd"


// -------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------- Buying an NFT -----------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------

export async function buyNFT(buyBox) {
    
    // return await buyNFTFleet(buyBox)
    const wasm = await ergolib

    if (!isWalletSaved()) {
        showMsg('Connect your wallet first.', true);
        return
    }

    // const buyer = await getConnectorAddress()
    const buyer = await getWalletAddress()
    console.log("buyer", buyer)
    const blockHeight = await currentBlock();
    let listedBox = await getListedBox(buyBox)

    // Calculate Box Values
    let sellerValue = 0
    let payServiceFee = Math.floor(0.02 * listedBox.additionalRegisters.R4.renderedValue)
    if (payServiceFee === 0) { payServiceFee = 1 }
    let royalties = await getRoyaltyInfo(listedBox.assets[0].tokenId)
    let royalty_value;
    let royalty_propBytes;
    if (royalties.artist) {
        royalty_value = Math.floor(listedBox.additionalRegisters.R4.renderedValue * royalties.royalty / 1000)
        if (royalty_value === 0) { royalty_value = 1 }
        royalty_propBytes = royalties.artist
    }
    sellerValue += listedBox.additionalRegisters.R4.renderedValue - payServiceFee - (royalty_value ? royalty_value : 0)


    const paySeller = {
        value: sellerValue.toString(),
        ergoTree: listedBox.additionalRegisters.R5.renderedValue,
        assets: [
        ],
        creationHeight: blockHeight.height,
        additionalRegisters: {
            R4: await encodeHex(listedBox.boxId)
        }

    }

    const payService = {
        value: payServiceFee,
        ergoTree: wasm.Address.from_mainnet_str(serviceAddress).to_ergo_tree().to_base16_bytes(),
        assets: [
        ],
        creationHeight: blockHeight.height,
        additionalRegisters: {}
    }

    let payRoyalty;
    if (royalty_value) {
        payRoyalty = {
            value: royalty_value,
            ergoTree: wasm.Address.from_mainnet_str(royalty_propBytes).to_ergo_tree().to_base16_bytes(),
            assets: [
            ],
            creationHeight: blockHeight.height,
            additionalRegisters: {}
        }
    }

    const buyerGets = {
        value: listedBox.value.toString(),
        ergoTree: wasm.Address.from_mainnet_str(buyer).to_ergo_tree().to_base16_bytes(),
        assets: [
            {
                tokenId: listedBox.assets[0].tokenId,
                amount: listedBox.assets[0].amount
            }
        ],
        creationHeight: blockHeight.height,
        additionalRegisters: {}
    }

    const feeBox = {
        value: txFee.toString(),
        creationHeight: blockHeight.height,
        ergoTree: "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
        assets: [],
        additionalRegisters: {},
    }

    const requiredErg = (parseInt(listedBox.additionalRegisters.R4.renderedValue) + parseInt(buyerGets.value) + parseInt(feeBox.value))
    let need = { ERG: requiredErg }
    // Get all wallet tokens/ERG and see if they have enough
    let have = JSON.parse(JSON.stringify(need))
    have['ERG'] += txFee
    let ins = []
    const keys = Object.keys(have)


    for (let i = 0; i < keys.length; i++) {
        if (have[keys[i]] <= 0) continue
        let curIns
        if(getWalletType() !== "ergopay") {
            curIns = await ergo.get_utxos(have[keys[i]].toString(), keys[i]);
        }

        // Without dapp connector
        else {
            if (keys[i] === 'ERG') {
                curIns = await get_utxos(buyer, have[keys[i]].toString());
            }
            else {
                curIns = await get_utxos(buyer, 0, keys[i], have[keys[i]].toString());
            }
        }


        if (curIns !== undefined) {
            curIns.forEach(bx => {
                have['ERG'] -= parseInt(bx.value)
                bx.assets.forEach(ass => {
                    if (!Object.keys(have).includes(ass.tokenId)) have[ass.tokenId] = 0
                    have[ass.tokenId] -= parseInt(ass.amount)
                })
            })
            ins = ins.concat(curIns)
        }
    }
    if (keys.filter(key => have[key] > 0).length > 0) {
        showMsg('Not enough balance in the wallet! See FAQ for more info.', true)
        return
    }

    const changeBox = {
        value: ((-have['ERG']) + listedBox.value + txFee).toString(),
        ergoTree: wasm.Address.from_mainnet_str(buyer).to_ergo_tree().to_base16_bytes(),
        assets: Object.keys(have).filter(key => key !== 'ERG')
            .filter(key => have[key] < 0)
            .map(key => {
                return {
                    tokenId: key,
                    amount: (-have[key]).toString()
                }
            }),
        additionalRegisters: {},
        creationHeight: blockHeight.height
    }

    if (changeBox.assets.length > CHANGE_BOX_ASSET_LIMIT) {

        showMsg('Too many NFTs in input boxes to form single change box. Please de-consolidate some UTXOs. Contact the team on discord for more information.', true)
        return
    } else {

        let finalOutputs = [
            paySeller, payService
        ]
        if (payRoyalty) {
            finalOutputs.push(payRoyalty);
        }
        finalOutputs.push(buyerGets)
        finalOutputs.push(changeBox)
        finalOutputs.push(feeBox)


        const inputList = ins.map(curIn => {
            return {
                ...curIn,
                extension: {}
            } // this gets all user eutxo boxes
        })
        const inputBoxes = inputList.concat(listedBox)
        const transaction_to_sign = {
            inputs: inputBoxes,
            outputs: finalOutputs,
            dataInputs: [],
            fee: txFee
        }

        // return await signTx(transaction_to_sign)
        return await signWalletTx(transaction_to_sign)
    }
}

// async function buyNFTFleet(buyBox) {


//     if (!isWalletSaved()) {
//         showMsg('Connect your wallet first.', true);
//         return
//     }

//     // const buyer = useSelector((state) => state.wallet.defaultAddress);
//     // const buyer = await getConnectorAddress()
//     const buyer = await getWalletAddress();


//     console.log("Buyer: ", buyer)
//     const blockHeight = await currentBlock();

//     // Get the sales listing box from explorer
//     let listedBox = await getListedBox(buyBox)

//     // ***** CALCULATE BOX VALUES *****
//     let sellerValue = 0
//     let payServiceFee = Math.floor(0.02 * listedBox.additionalRegisters.R4.renderedValue)
//     if (payServiceFee === 0) {
//         payServiceFee = 1
//     }
//     let royalties = await getRoyaltyInfo(listedBox.assets[0].tokenId)
//     let royalty_value;
//     let royalty_propBytes;
//     if (royalties.artist) {
//         royalty_value = Math.floor(listedBox.additionalRegisters.R4.renderedValue * royalties.royalty / 1000)
//         if (royalty_value === 0) { royalty_value = 1 }
//         royalty_propBytes = royalties.artist
//     }

//     sellerValue += listedBox.additionalRegisters.R4.renderedValue - payServiceFee - (royalty_value ? royalty_value : 0)


//     // ***** CREATE TRANSACTION OUTPUT *****


//     let outputArray = [
//         new OutputBuilder(sellerValue, listedBox.additionalRegisters.R5.renderedValue, blockHeight.height)  // Seller payment
//             .setAdditionalRegisters({
//                 R4: SConstant(SColl(SByte, Buffer.from(listedBox.boxId, 'hex')))
//             }),
//         new OutputBuilder(payServiceFee, serviceAddress, blockHeight.height), // Service fee payment
//     ]

//     // If there are royalties, insert royalty payment
//     if (royalties.artist) {
//         outputArray.push(new OutputBuilder(royalty_value, royalty_propBytes, blockHeight.height)) // Royalty payment
//     }

//     outputArray.push(new OutputBuilder(`${listedBox.value}`, buyer, blockHeight.height) // Add NFT as output to buyer
//     .addTokens({
//         tokenId: listedBox.assets[0].tokenId,
//         amount: listedBox.assets[0].amount
//     }))

//     // Not sure if being used, only get value from it (which is just txFee)
//     const feeBox = {
//         value: txFee.toString(),
//         creationHeight: blockHeight.height,
//         ergoTree: "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
//         assets: [],
//         additionalRegisters: {},
//     }

//     // ***** CREATE TRANSACTION INPUT *****
//     const requiredErg = (parseInt(listedBox.additionalRegisters.R4.renderedValue) + parseInt(listedBox.value.toString()) + parseInt(feeBox.value))
//     let need = { ERG: requiredErg }
//     let have = JSON.parse(JSON.stringify(need))
//     have['ERG'] += txFee
//     let ins = []
//     const keys = Object.keys(have)

//     // Gets user inputs, as well as checks if they have enough
//     for (let i = 0; i < keys.length; i++) {
//         if (have[keys[i]] <= 0) continue

//         let curIns = []
//         // With dapp connector
//         // const curIns = await ergo.get_utxos(have[keys[i]].toString(), keys[i]);

//         // Without dapp connector
//         if (keys[i] === 'ERG') {
//             curIns = await get_utxos(buyer, have[keys[i]].toString());
//         }
//         else {
//             curIns = await get_utxos(buyer, 0, keys[i], have[keys[i]].toString());
//         }

//         // const curIns = await get_utxos(buyer, requiredErg);
//         if (curIns !== undefined) {
//             curIns.forEach(bx => {
//                 have['ERG'] -= parseInt(bx.value)
//                 bx.assets.forEach(ass => {
//                     if (!Object.keys(have).includes(ass.tokenId)) have[ass.tokenId] = 0
//                     have[ass.tokenId] -= parseInt(ass.amount)
//                 })
//             })
//             ins = ins.concat(curIns)
//         }
//     }
//     if (keys.filter(key => have[key] > 0).length > 0) {
//         showMsg('Not enough balance in the wallet! See FAQ for more info.', true)
//         return
//     }

//     // Build the listed box the way FleetSDK takes it in
//     let FinalListedBox = JSON.parse(JSON.stringify(listedBox))
//     FinalListedBox.additionalRegisters = {
//         R4: listedBox?.additionalRegisters?.R4?.serializedValue || listedBox?.additionalRegisters?.R4,
//         R5: listedBox?.additionalRegisters?.R5?.serializedValue || listedBox?.additionalRegisters?.R5,
//         R6: listedBox?.additionalRegisters?.R6?.serializedValue || listedBox?.additionalRegisters?.R6,
//         R7: listedBox?.additionalRegisters?.R7?.serializedValue || listedBox?.additionalRegisters?.R7,
//         R8: listedBox?.additionalRegisters?.R8?.serializedValue || listedBox?.additionalRegisters?.R8
//     }

//     const inputBoxes = ins.concat(FinalListedBox)

//     console.log("inputBoxes", inputBoxes)

//     console.log("outputArray", outputArray)

//     // ***** BUILD ENTIRE TRANSACTION *****
//     const unsignedTransaction = new TransactionBuilder(blockHeight.height)
//         .from(inputBoxes)
//         .to(outputArray)
//         .sendChangeTo(buyer)
//         // .configureSelector((selector) => selector.ensureInclusion((input) => input.boxId === listedBox.boxId))
//         .payMinFee()
//         .build()
//         .toEIP12Object()

//     console.log("Unsigned TX: ", unsignedTransaction)

//     const unsignedTx = JSON.stringify(unsignedTransaction)

//     if (getWalletType() === "ergopay") {
//         const txId = await axios.post(`${skyHarborApi}/api/ergopay/saveTx`, {
//             // sendAddress: sendAddress,

//             txData: unsignedTx,
//             uuid: getWalletUUID(),
//         });
//         console.log("unsigned txId", txId.data)
//         return txId.data
//     }
//     else {
//         // if not ergopay
//         return await signTx(unsignedTransaction)
//     }
// }