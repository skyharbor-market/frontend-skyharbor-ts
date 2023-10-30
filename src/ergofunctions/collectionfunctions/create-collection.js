import {
    showMsg,
    isWalletSaved,
    signTx, getListedBox, getWalletAddress, getWalletType, getWalletUUID
} from "../helpers";
import {
    txFee,
    CHANGE_BOX_ASSET_LIMIT,
    skyHarborApi,
    collectionScannerAddress,
    createCollectionFee
} from "../consts";
import { currentBlock } from "../explorer";
import { encodeCollCollByte, encodeCollGroupElement, encodeHex, getRoyaltyInfo , stringToHex} from "../serializer";
import { getConnectorAddress } from "../walletUtils";
import { useSelector } from 'react-redux';
import { OutputBuilder, TransactionBuilder, SConstant, SByte, SLong, SSigmaProp, SUnit, SColl } from "@fleet-sdk/core";
import { get_utxos } from "../ergolibUtils";
import axios from "axios";
import { min_value } from "../conf";

let ergolib = import('ergo-lib-wasm-browser')
// import dynamic from 'next/dynamic';
// let ergolib = dynamic(() => import('ergo-lib-wasm-browser'), { ssr: false });

// const nodeUrl = "https://paidincrypto.io";
// const nodeUrl = "https://www.test-skyharbor-server.net:9053/";
const nodeUrl = "https://node.ergo.watch";
// new open node at https://node.ergo.watch/ 

const serviceAddress = "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd"
const minterServiceAddress = "9h9ssEYyHaosFg6BjZRRr2zxzdPPvdb7Gt7FA8x7N9492nUjpsd"


export async function create_collection(collection) {


    if (!isWalletSaved()) {
        showMsg('Connect your wallet first.', true);
        return
    }

    // const user = useSelector((state) => state.wallet.defaultAddress);
    // const user = await getConnectorAddress()
    const user = await getWalletAddress();


    console.log("Buyer: ", user)
    const blockHeight = await currentBlock();
    // let reqErg = txFee + min_value + createCollectionFee


    // ***** CREATE TRANSACTION OUTPUT *****

    // Collection Name

    // Collection sys_name ("username") // backend + api handles duplicates
    // Description
    // socials - website, twitter, discord
    // Image/PFP address (file upload then do ipfs or our own storage)
    // mint addresses coll[]

    // //Collection Token Id (optional - look into how to verify? cant do now)


    let publicKeyResponse = await axios.get(`${nodeUrl}/utils/addressToRaw/` + collection.mintAddress).catch((err) => {
        console.log("Error when calling utils/addressToRaw/useraddress");
    })
    let publicKey = [publicKeyResponse.data.raw]

    console.log("pubkey", publicKey)


    let outputArray = [
        new OutputBuilder(min_value, collectionScannerAddress, blockHeight.height)  // Seller payment
            .mintToken({
                name: `${collection.name} - CREATE`,
                amount: 1n,
                decimals: 0,
                description: collection.description          
            })
            .setAdditionalRegisters({
                R4: await encodeHex(stringToHex(collection.name)),// SConstant(SColl(SByte, Buffer.from(listedBox.boxId, 'hex')))
                R5: await encodeHex(stringToHex(collection.username)),
                R6: await encodeHex(stringToHex(collection.description)),
                R7: encodeCollCollByte(collection.socials.map(a => stringToHex(a))),
                R8: await encodeHex(stringToHex(collection.ipfsImage)),
                R9: encodeCollGroupElement(publicKey)
            }),

            // THIS IS WHERE WE LEFT OFF -  KRAS AND QUOKKA MEETING
        new OutputBuilder(createCollectionFee, serviceAddress, blockHeight.height), // Service fee payment
    ]

    // ***** CREATE TRANSACTION INPUT *****
    const requiredErg = min_value + createCollectionFee
    let need = { ERG: requiredErg }
    let have = JSON.parse(JSON.stringify(need))
    have['ERG'] += txFee
    let ins = []
    const keys = Object.keys(have)

    // Gets user inputs, as well as checks if they have enough
    for (let i = 0; i < keys.length; i++) {
        if (have[keys[i]] <= 0) continue

        let curIns = []
        // With dapp connector
        // const curIns = await ergo.get_utxos(have[keys[i]].toString(), keys[i]);

        // Without dapp connector
        if (keys[i] === 'ERG') {
            curIns = await get_utxos(user, have[keys[i]].toString());
        }
        else {
            curIns = await get_utxos(user, 0, keys[i], have[keys[i]].toString());
        }

        // const curIns = await get_utxos(user, requiredErg);
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

    const inputBoxes = ins

    console.log("inputBoxes", inputBoxes)

    // ***** BUILD ENTIRE TRANSACTION *****
    const unsignedTransaction = new TransactionBuilder(blockHeight.height)
        .from(inputBoxes)
        .to(outputArray)
        .sendChangeTo(user)
        // .configureSelector((selector) => selector.ensureInclusion((input) => input.boxId === listedBox.boxId))
        .payMinFee()
        .build()
        .toEIP12Object()

    console.log("Unsigned TX: ", unsignedTransaction)

    const unsignedTx = JSON.stringify(unsignedTransaction)

    if (getWalletType() === "ergopay") {
        const txId = await axios.post(`${skyHarborApi}/api/ergopay/saveTx`, {
            // sendAddress: sendAddress,

            txData: unsignedTx,
            uuid: getWalletUUID(),
        });
        console.log("unsigned txId", txId.data)
        return txId.data
    }
    else {
        // if not ergopay
        try {
            return await signTx(unsignedTransaction)
        }
        catch(err) {
            console.log("ERR", err)
        }
    }
}