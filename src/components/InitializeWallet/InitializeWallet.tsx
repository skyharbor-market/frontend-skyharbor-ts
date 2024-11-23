import React, { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import {
  setDefaultAddress,
  setTokens,
  setWallet,
  setWalletSelectOpen,
  setWalletState,
} from "../../redux/reducers/walletSlice";
import { FaWallet } from "react-icons/fa";
import { GiSubmarine } from "react-icons/gi";
import QRCode from "react-qr-code";
import { v4 as uuidv4 } from "uuid";

import {
  getWalletAddress,
  getWalletType,
  isAddressValid,
  isAssembler,
  isWalletSaved,
  getWholeWallet,
} from "../../ergofunctions/helpers";
import {
  getWalletAddresses,
  getWalletErgs,
  setupNautilus,
  getConnectorAddress,
  setupSAFEW,
  setupWallet,
} from "../../ergofunctions/walletUtils";
import { MdPhoneAndroid } from "react-icons/md";
import ErgoPaySubscription from "./ErgoPay/ErgoPaySubscription";
import { useApolloClient } from "@apollo/client";
import { skyHarborApiRoot } from "../../ergofunctions/consts";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

type WalletTypes = "nautilus" | "safew";

function InitializeWallet({}) {
  const router = useRouter();
  const client = useApolloClient();
  const reduxState = useSelector((state: any) => state);
  const dispatch = useDispatch();

  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("yoroi");
  const walletState = reduxState.wallet.walletState;
  const [userAddress, setUserAddress] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [walletBalance, setWalletBalance] = useState(-1);
  const [ergopayUUID, setErgopayUUID] = useState<string | null>(null);
  const [modalPage, setModalPage] = useState("main");

  function gotoWallet() {
    router.push(`/wallet`);
  }

  function handleClearButton() {
    setModalPage("clear");
  }

  function toggle() {
    let type = "yoroi";
    if (isWalletSaved()) type = getWalletType();

    setActiveTab(type);
    setProcessing(false);
    setApiKey("");
    setModalPage("main");

    dispatch(setWalletSelectOpen(false));
  }

  function clearWallet(message = true) {
    sessionStorage.removeItem("wallet");
    localStorage.removeItem("wallet");
    dispatch(setWallet(undefined));
    dispatch(setTokens([]));
    dispatch(setWalletState("Configure"));
    setUserAddress("");
    dispatch(setDefaultAddress(""));
    setWalletBalance(-1);

    if (message) {
      console.log("disconnect wallet");
      setActiveTab("yoroi");
      setProcessing(false);
      setApiKey("");
    }

    if (walletState === "safew" || walletState === "nautilus") {
      // @ts-ignore
      ergoConnector[walletState].disconnect();
      window.location.reload();
    }

    setErgopayUUID(uuidv4());
    toggle();
  }

  async function handleWalletConnect(wallet: WalletTypes) {
    let address;
    let addresses;
    let res = await setupWallet(true, wallet);
    
    if (res === "denied") {
      localStorage.removeItem("wallet");
      dispatch(setWallet(undefined));
      dispatch(setWalletState("Configure"));
      return;
    }
    
    if (res) {
      address = await getConnectorAddress();
      addresses = await getWalletAddresses();

      localStorage.setItem(
        "wallet",
        JSON.stringify({
          type: wallet,
          address: address,
          addresses: addresses
        })
      );
    }

    setUserAddress(address);
    dispatch(setDefaultAddress(address));

    if (res && address) {
      dispatch(setWallet(addresses));
      dispatch(setWalletState(wallet));
    }
    
    setProcessing(false);
    toggle();
  }

  async function connectErgopay() {
    setModalPage("ergopay");
  }

  async function getWalletInfo() {
    if (isWalletSaved()) {
      const walletType = getWalletType();
      dispatch(setWalletState(walletType));

      let addresses = undefined;

      if (walletType === "nautilus" || walletType === "safew") {
        let res = await setupWallet();

        addresses = await getWalletAddresses();
        if (addresses === "error" || !addresses) {
          dispatch(setWallet(undefined));
          clearWallet(false);
          return;
        }

        let changeAddress = await getConnectorAddress(false);
        setUserAddress(changeAddress);
        dispatch(setDefaultAddress(changeAddress));
      } else if (walletType === "ergopay") {
        const wholeWallet = await getWholeWallet();
        const walletUUID = wholeWallet?.uuid;
        if (!walletUUID) {
          console.error("No UUID found.");
        }

        setErgopayState(wholeWallet.address, walletUUID);
      }

      dispatch(setWallet(addresses));
      return;
    } else {
      setErgopayUUID(uuidv4());
      clearWallet(false);
    }

    let tempAddress = "";
    if (isAssembler()) {
      tempAddress = getWalletAddress();
      setUserAddress(tempAddress);
      return;
    }
  }

  function openErgoPay() {
    window.open(
      `ergopay://${skyHarborApiRoot}/api/ergopay/setAddr/${ergopayUUID}/#P2PK_ADDRESS#`,
      "_blank"
    );
  }

  function copyErgoPay() {
    navigator.clipboard
      .writeText(
        `ergopay://${skyHarborApiRoot}/api/ergopay/setAddr/${ergopayUUID}/#P2PK_ADDRESS#`
      )
      .then(() => console.log("Copied"));
  }

  function setErgopayState(ergopayAddress: string, epayUUI: string) {
    setUserAddress(ergopayAddress);
    dispatch(setDefaultAddress(ergopayAddress));
    dispatch(setWallet([ergopayAddress]));
    setErgopayUUID(epayUUI);
    dispatch(setWalletState("ergopay"));
  }

  useEffect(() => {
    getWalletInfo();
  }, []);

  const modalCurrentPage = () => {
    if (modalPage === "main") {
      return (
        <div className="">
          <p className="text-xl dark:text-white mb-4">
            {modalPage === "main" ? "Select your wallet" : "How To Disconnect"}
          </p>
          <div className="">
            <div className="space-y-3">
              <button
                className={`w-full py-4 px-6 mb-3 flex justify-between items-center rounded-lg border border-gray-200 hover:border-blue-500 transition-colors ${
                  walletState !== "Configure" && userAddress
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={() => handleWalletConnect("nautilus")}
                disabled={(walletState !== "Configure" && userAddress) ? true : false}
              >
                <div className="flex items-center dark:text-white">
                  <div className="relative w-8 h-8 mr-3">
                    <Image
                      layout="fill"
                      className="w-full h-full object-contain"
                      src="/assets/images/nautiluswallet.png"
                      alt="Nautilus Wallet"
                    />
                  </div>
                  <span className="font-medium">Nautilus</span>
                </div>
                {walletState === "nautilus" && userAddress && (
                  <span className="text-sm text-green-500">Connected</span>
                )}
              </button>

              <button
                className={`w-full py-4 px-6 mb-3 flex justify-between items-center rounded-lg border border-gray-200 hover:border-orange-500 transition-colors ${
                  walletState !== "Configure" && userAddress
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={() => handleWalletConnect("safew")}
                disabled={(walletState !== "Configure" && userAddress) ? true : false}
              >
                <div className="flex items-center dark:text-white">
                  <div className="mr-3">
                    <FaWallet size={24} className="text-orange-500" />
                  </div>
                  <span className="font-medium">SAFEW</span>
                </div>
                {walletState === "safew" && userAddress && (
                  <span className="text-sm text-green-500">Connected</span>
                )}
              </button>

              <button
                className={`w-full py-4 px-6 flex justify-between items-center rounded-lg border border-gray-200 hover:border-purple-500 transition-colors ${
                  walletState !== "Configure" && userAddress
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={connectErgopay}
                disabled={(walletState !== "Configure" && userAddress) ? true : false}
              >
                <div className="flex items-center dark:text-white">
                  <div className="mr-3">
                    <MdPhoneAndroid size={24} className="text-purple-500" />
                  </div>
                  <span className="font-medium">ErgoPay</span>
                </div>
                {walletState === "ergopay" && userAddress && (
                  <span className="text-sm text-green-500">Connected</span>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    } else if (modalPage === "ergopay") {
      return (
        <div>
          <div className="text-xl mb-2">{"Connect ErgoPay"}</div>
          <div>
            <p>
              Scan the QR or press the button below to connect ErgoPay. Do not
              close out of this popup while connecting.
            </p>

            <div className="text-center">
              <div className="w-40 h-40 mx-auto mb-4 mt-4 overflow-hidden rounded-lg bg-white p-2.5">
                <QRCode
                  size={138}
                  value={`ergopay://${skyHarborApiRoot}/api/ergopay/setAddr/${ergopayUUID}/#P2PK_ADDRESS#`}
                />
              </div>
              <div></div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2 text-center">
                <button
                  className="py-2 border-2 rounded-lg"
                  onClick={copyErgoPay}
                >
                  Copy request
                </button>
                <button
                  className="py-2 border-2 rounded-lg text-blue-500"
                  onClick={openErgoPay}
                >
                  Open wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (modalPage === "clear") {
      return (
        <div>
          <p className="text-xl dark:text-white mb-4">
          Disconnect
          </p>
          <div className="mb-4">
            <p className="mb-4 dark:text-white">
              Are you sure you want to disconnect?{" "}
              {walletState === "ergopay"
                ? ""
                : "This will refresh the page."}
            </p>

            <Button
              className="w-full py-2 border-2 rounded-lg text-red-500 border-red-500"
              onClick={() => clearWallet()}
              colorScheme="red"
            >
              Disconnect Wallet
            </Button>
          </div>
        </div>
      );
    }
  };
  return (
    <Fragment>
      {(walletState === "ergopay" || modalPage === "ergopay") && client && (
        <ErgoPaySubscription
          uuid={ergopayUUID}
          toggleModal={toggle}
          setErgopayState={setErgopayState}
        />
      )}

      <Modal open={reduxState?.wallet?.walletSelectOpen} setOpen={toggle}>
        <div className="max-w-md w-full mx-auto">
          {modalCurrentPage()}

          {modalPage !== "clear" && (
            <div className="mt-6 flex justify-between">
              <button
                className="py-2 px-4 bg-red-600 cursor-pointer hover:bg-red-700 rounded-lg text-white transition duration-300"
                disabled={walletState === "Configure"}
                onClick={handleClearButton}
              >
                Disconnect Wallet
              </button>
              <button
                className="py-2 px-4 bg-gray-700 cursor-pointer hover:bg-gray-600 rounded-lg text-white transition duration-300"
                onClick={toggle}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </Modal>
    </Fragment>
  );
}

export default InitializeWallet;
