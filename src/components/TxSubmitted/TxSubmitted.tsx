// @ts-nocheck
import React, { useEffect, useState } from "react";
import { MdCheckCircleOutline } from "react-icons/md";
import QRCode from "react-qr-code";
import { skyHarborApiRoot } from "../../ergofunctions/consts";
import { getWalletAddress, getWalletType } from "../../ergofunctions/helpers";
import ArtworkMedia from "../artworkMedia";
import Button from "../Button/Button";
// import ErgoPayCheckSigned from '../ErgoPay/ErgoPayCheckSigned';
import toast, { Toaster } from "react-hot-toast";
import ErgoPayCheckSigned from "../InitializeWallet/ErgoPay/ErgoPayCheckSigned";

export default function TxSubmitted({ txId, box }: { txId: any; box?: any }) {
  const [userAddress, setUserAddress] = useState(null);
  const [usingErgoPay, setUsingErgoPay] = useState(null);

  // required to check if ergopay user signed tx
  const [signedTransaction, setSignedTransaction] = useState(false);

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

  useEffect(() => {
    const isEPay = getWalletType();
    if (isEPay === "ergopay") {
      setUsingErgoPay(true);
      getErgoPayWalletAddress();
    }
  }, []);

  const SubmitDisplay = () => {
    if (usingErgoPay && !signedTransaction) {
      return (
        <div key={"ergopay"}>
          <div>
            {/* <Heading fontSize="lg" mb="3" color={colorMode === "light" ? "black" : "white"}>Sign the transaction to continue</Heading> */}
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
              {/* <CircularProgress isIndeterminate color='#3182ce'/> */}
              {/* <Progress borderRadius={"xl"} size="xs" isIndeterminate color='#3182ce'/> */}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div key={"submitted"} className="flex flex-row space-x-2">
          <div className="w-1/3">
            <div className="relative">
              <div className="absolute text-center w-full">
                <MdCheckCircleOutline
                  className="h-32 w-32 text-green-500 m-auto"
                  color="green.400"
                />
              </div>
              {box && (
                <div className="aspect-square rounded overflow-hidden">
                  <ArtworkMedia box={box} />
                </div>
              )}
            </div>
            {box?.nft_name && (
              <p className="text-center text-gray-500 text-sm mt-1">
                {box.nft_name}
              </p>
            )}
          </div>
          <div className="w-2/3">
            <div>
              <div className="w-full break-words p-2 border rounded">
                <p className="text-sm">Transaction ID</p>
                <p className="text-gray-700 font-semibold">{txId}</p>
              </div>
            </div>
            <Button
              colorScheme="green"
              className="w-full bg-green-500 mt-3"
              onClick={() => gotoTransaction(txId)}
            >
              View Tx on Explorer
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Now we wait until it is confirmed on the blockchain. It should
              take about 2-10 minutes.
            </p>
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
