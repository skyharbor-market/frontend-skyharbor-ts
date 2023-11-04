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

export default function TxSubmitted({ txId, box }) {
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
        <div key={"submitted"}>
          <div className="max-w-2xl">
            <div>
              <div className="text-center w-full">
                <MdCheckCircleOutline
                  className="h-32 w-32 text-green-500 m-auto"
                  color="green.400"
                />
              </div>
              {box && (
                <div className="aspect-square">
                  <ArtworkMedia box={box} />
                </div>
              )}
            </div>
            {box?.nft_name && <p>{box.nft_name}</p>}
            {/* <p mt="1" textAlign={"center"} noOfLines={1} width={"100%"} color={colorMode === "light" ? "black" : "white"}>{nftPrice} {currencyObject.displayName}</p> */}
          </div>

          {/* <div textAlign={"center"} w="100%" mb="8" mt="8">
                        <CheckCircleIcon fontSize={"6xl"} color="green.400"/>
                    </div> */}

          <div className="mt-4">
            <p className="w-full break-words p-2 border rounded-lg">
              Transaction ID: <span className="text-gray-700">{txId}</span>
            </p>
          </div>
          <Button
            colorScheme="green"
            className="w-full bg-green-500 mt-3"
            onClick={() => gotoTransaction(txId)}
          >
            View Tx on Explorer
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Now we wait until it is confirmed on the blockchain. It should take
            about 2-10 minutes.
          </p>
        </div>
      );
    }
  };

  return (
    <div>
      {/* {
                usingErgoPay && 
                <ErgoPayCheckSigned key={txId} txId={txId} userSignedTx={()=>setSignedTransaction(true)}/>
            } */}
      <SubmitDisplay />
    </div>
  );
}
