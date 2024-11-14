// @ts-nocheck
import React, { useEffect, useState } from "react";
import { MdCheckCircleOutline } from "react-icons/md";
import QRCode from "react-qr-code";
import { skyHarborApiRoot } from "../../ergofunctions/consts";
import { getWalletAddress, getWalletType } from "../../ergofunctions/helpers";
import ArtworkMedia from "../artworkMedia";
import Button from "../Button/Button";
import toast, { Toaster } from "react-hot-toast";
import ErgoPayCheckSigned from "../InitializeWallet/ErgoPay/ErgoPayCheckSigned";
import confetti from 'canvas-confetti';

export type UserActionType = "list" | "buy" | "delist" |"edit"

export default function TxSubmitted({ txId, box, onClose, type }: { txId: any; box?: any, onClose: ()=>void, type: UserActionType }) {
  const [userAddress, setUserAddress] = useState(null);
  const [usingErgoPay, setUsingErgoPay] = useState(null);

  // required to check if ergopay user signed tx
  const [signedTransaction, setSignedTransaction] = useState(false);

  useEffect(() => {
    if (type === "buy") {
      // Trigger confetti effect on initial render for buy action
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const isEPay = getWalletType();
    if (isEPay === "ergopay") {
      setUsingErgoPay(true);
      getErgoPayWalletAddress();
    }
  }, [type]);

  function gotoTransaction() {
    window.open(
      `https://explorer.ergoplatform.com/en/transactions/${txId}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  }

  function signErgoPay() {
    window.open(
      `ergopay://${skyHarborApiRoot}/api/ergopay/getTx/${txId}/${userAddress}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  }

  function copyErgoPay() {
    navigator.clipboard
      .writeText(
        `ergopay://${skyHarborApiRoot}/api/ergopay/getTx/${txId}/${userAddress}`
      )
      .then(() => toast("There was an error buying the NFT, try again later."));
  }

  async function getErgoPayWalletAddress() {
    setUserAddress(await getWalletAddress());
  }

  const SubmitDisplay = () => {
    if (usingErgoPay && !signedTransaction) {
      return (
        <div key={"ergopay"}>
          <div>
            <p>
              Scan the QR code below with an ErgoPay compatible wallet to sign
              the transaction.
            </p>
          </div>
          <div>
            <p>QR Code</p>
          </div>
          <div>
            <QRCode
              size={128}
              value={`ergopay://${skyHarborApiRoot}/api/ergopay/getTx/${txId}/${userAddress}`}
            />
          </div>
          <div>
            <p>or</p>
          </div>
          <div>
            <Button size={"lg"} onClick={copyErgoPay}>
              Copy request
            </Button>
            <Button size={"lg"} colorScheme={"blue"} onClick={signErgoPay}>
              Open wallet
            </Button>
          </div>
          <div>
            <p>Waiting for the transaction to be signed</p>
            <div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div key="submitted" className="bg-white dark:bg-gray-800 p-6 max-w-2xl mx-auto relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col items-center md:items-start space-y-6 md:space-y-0">
            <div className="w-full md:w-2/3 mx-auto">
              <div className="relative">
              {box && (

                <div className="absolute inset-0 flex items-center justify-center">
                  <MdCheckCircleOutline
                    className="h-20 w-20 text-green-500"
                    aria-hidden="true"
                    />
                  </div>
                )}
                {box && (
                  <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                    <ArtworkMedia box={box} />
                  </div>
                )}
              </div>
              {box?.nft_name && (
                <p className="text-center text-lg mb-4 text-gray-600 dark:text-gray-300  mt-2 font-medium">
                  {box.nft_name}
                </p>
              )}
            </div>
            <div className="w-full space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                <p className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">{txId}</p>
              </div>
              <div className="flex space-x-4">
                <Button
                  colorScheme="green"
                  className="w-2/3 py-3 text-white text-xs md:text-sm font-semibold transition duration-300 ease-in-out transform hover:bg-green-700"
                  onClick={() => gotoTransaction(txId)}
                >
                  View Transaction on Explorer
                </Button>
                <Button
                  // colorScheme="red"
                  variant="outline"
                  className="w-1/3 py-3 text-gray-800 border text-sm dark:text-white font-semibold transition duration-300 ease-in-out transform hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Please wait for confirmation on the blockchain. This process typically takes 2-10 minutes.
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      {usingErgoPay && (
        <ErgoPayCheckSigned
          key={txId}
          txId={txId}
          userSignedTx={() => setSignedTransaction(true)}
        />
      )}
      <SubmitDisplay />
    </div>
  );
}
