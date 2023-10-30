/* eslint no-undef: "off"*/
// import { useDispatch } from 'react-redux';
import { setWallet } from "../redux/reducers/walletSlice";
import axios from "axios";
import { store } from "../pages/_app";
import { showMsg, isWalletSaved, getWalletType } from "./helpers";
import { getBalance } from "./explorer";

// const fromHexString = (hexString) =>
//     Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

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

function walletDisconnect() {
  showMsg("Disconnected from wallet", true);
  localStorage.removeItem("wallet");
  store.dispatch(setWallet(undefined));
}

// Set Up Nautilus wallet
export async function setupNautilus(isFirst = false) {
  if (typeof ergo_request_read_access === "undefined") {
    showMsg("You must install Nautilus Wallet to be able to connect.", true);
  } else {
    // if (isFirst) {
    window.removeEventListener("ergo_wallet_disconnected", walletDisconnect);
    window.addEventListener("ergo_wallet_disconnected", walletDisconnect);
    // }
    let hasAccess = await ergoConnector.nautilus.isConnected();
    if (!hasAccess) {
      let granted = await ergoConnector.nautilus.connect();
      if (!granted) {
        localStorage.removeItem("wallet");
        store.dispatch(setWallet(undefined));

        if (isFirst) {
          showMsg("Wallet access denied", true);
          return "denied";
        }
      } else {
        if (isFirst) showMsg("Successfully connected to Nautilus");
        return true;
      }
    } else return true;
  }
  return false;
}
// Set Up SAFEW wallet
export async function setupSAFEW(isFirst = false) {
  if (typeof ergo_request_read_access === "undefined") {
    showMsg("You must install Nautilus Wallet to be able to connect.", true);
  } else {
    // if (isFirst) {
    window.removeEventListener("ergo_wallet_disconnected", walletDisconnect);
    window.addEventListener("ergo_wallet_disconnected", walletDisconnect);
    // }
    // console.log("ergoconnector", ergoConnector)
    let hasAccess = await ergoConnector.safew.isConnected();
    if (!hasAccess) {
      let granted = await ergoConnector.safew.connect();
      if (!granted) {
        localStorage.removeItem("wallet");
        store.dispatch(setWallet(undefined));

        if (isFirst) {
          showMsg("Wallet access denied", true);
          return "denied";
        }
      } else {
        if (isFirst) showMsg("Successfully connected to SAFEW");
        return true;
      }
    } else return true;
  }
  return false;
}
// Set Up wallet
export async function setupWallet(isFirst = false, wallet = "nautilus") {
  if (typeof ergo_request_read_access === "undefined") {
    showMsg("You must install Nautilus Wallet to be able to connect.", true);
  } else {
    // if (isFirst) {
    window.removeEventListener("ergo_wallet_disconnected", walletDisconnect);
    window.addEventListener("ergo_wallet_disconnected", walletDisconnect);
    // }

    console.log("isFirst", isFirst);
    console.log("wallet", wallet);

    let walletType;
    if (isFirst) {
      walletType = wallet;
    } else {
      console.log("isWalletSaved()", isWalletSaved());
      if (isWalletSaved()) {
        let type = getWalletType();
        walletType = type;
      }
    }

    console.log("WALLET ETYPE", walletType);
    console.log("ergoConnector", ergoConnector);

    let hasAccess = await ergoConnector[walletType].isConnected();
    if (!hasAccess) {
      let granted = await ergoConnector[walletType].connect();
      if (!granted) {
        localStorage.removeItem("wallet");
        store.dispatch(setWallet(undefined));

        if (isFirst) {
          showMsg("Wallet access denied", true);
          return "denied";
        }
      } else {
        if (isFirst) showMsg(`Successfully connected to ${walletType}`);
        return true;
      }
    } else return true;
  }
  return false;
}

export async function getConnectorAddress(setup = false) {
  if (setup) {
    let res;
    // if(getWalletConnector() === 'nautilus') {
    res = await setupWallet();
    // }
    // else {
    //     setupSAFEW()
    // }

    // console.log(getWalletConnector())

    if (res && res !== "denied") {
      try {
        return await ergo.get_change_address();
      } catch {
        return "error";
      }
    }
  } else {
    try {
      return await ergo.get_change_address();
    } catch {
      return "error";
    }
  }

  return null;
}
export async function getWalletAddresses(setup = false) {
  if (setup) {
    let res = await setupWallet();

    if (res && res !== "denied") {
      try {
        return (await ergo.get_used_addresses()).concat(
          await ergo.get_unused_addresses()
        );
      } catch {
        return "error";
      }
    }
  } else {
    try {
      return (await ergo.get_used_addresses()).concat(
        await ergo.get_unused_addresses()
      );
    } catch {
      return "error";
    }
  }

  return null;
}

export async function getTokens() {
  // await setupNautilus()
  let res = await setupWallet(); // change this to "setupWallet" later so it can be used by multiple wallets

  if (!res || res === "denied") {
    return;
  }

  const addresses = (await ergo.get_used_addresses()).concat(
    await ergo.get_unused_addresses()
  );
  let tokens = {};

  try {
    const balances = await Promise.allSettled(
      addresses.map((address) => getBalance(address))
    );

    for (let i = 0; i < balances.length; i++) {
      if (balances[i].status === "fulfilled") {
        balances[i].value.tokens.forEach((ass) => {
          if (!Object.keys(tokens).includes(ass.tokenId)) {
            tokens[ass.tokenId] = {
              amount: 0,
              name: ass.name,
              tokenId: ass.tokenId,
            };
          }
          tokens[ass.tokenId].amount += parseInt(ass.amount);
        });
      } else {
        console.error(
          `Error getting balance for address ${addresses[i]}:`,
          balances[i].reason
        );
      }
    }
  } catch {
    showMsg("Sorry, an issue occurred. Try refreshing.", true);
  }

  return tokens;
}

export async function getWalletErgs() {
  // let res = await setupNautilus()
  // if(!res || res === 'denied') {
  //     return;
  // }
  const addresses = (await ergo.get_used_addresses()).concat(
    await ergo.get_unused_addresses()
  );
  let nanoErgs = 0;

  let apiCalls = [];

  for (let address of addresses) {
    apiCalls.push(getBalance(address));
  }

  try {
    const res = await Promise.all(apiCalls);
    const data = res.map((res) => res.nanoErgs);
    for (let dat of data) {
      nanoErgs += dat;
    }
  } catch {
    throw Error("Couldn't get for sale tokens.");
  }

  // for (let i = 0; i < addresses.length; i++) {
  //     // await getBalance(addresses[i]).then((res) => console.log("ass", res)) // lets see what tokens we have
  //     await getBalance(addresses[i]).then(ass => {
  //         nanoErgs += ass.nanoErgs
  //     }).catch((error)=> {
  //         console.log("Error retrieving wallet ERG balance.")
  //     })
  // }
  return nanoErgs;
}
