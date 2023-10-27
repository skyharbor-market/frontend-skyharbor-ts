// @ts-nocheck
import React, { useEffect, useState } from "react";
import { MdCheckCircleOutline } from "react-icons/md";
import QRCode from "react-qr-code";
import { skyHarborApiRoot } from "../../ergofunctions/consts";
import { getWalletAddress, getWalletType } from "../../ergofunctions/helpers";
import ArtworkMedia from "../artworkMedia";
import Button from "../Button/Button";
// import ErgoPayCheckSigned from '../ErgoPay/ErgoPayCheckSigned';

export default function TxSubmitted({ txId, box }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const [userAddress, setUserAddress] = useState(null);
  const [usingErgoPay, setUsingErgoPay] = useState(null);
  const toast = useToast();

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
      .then(() =>
        toast({
          title: "Copied",
          variant: "subtle",
          // description: "We've created your account for you.",
          position: "bottom",
          status: "info",
          duration: 2000,
          isClosable: true,
        })
      );
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
          <div mb="4">
            {/* <Heading fontSize="lg" mb="3" color={colorMode === "light" ? "black" : "white"}>Sign the transaction to continue</Heading> */}
            <p fontSize={"md"}>
              Scan the QR code below with an ErgoPay compatible wallet to sign
              the transaction.
            </p>
          </div>
          <div textAlign={"center"} mb="2">
            <p fontSize={"sm"}>QR Code</p>
          </div>
          <div
            w={148}
            margin="auto"
            mb="4"
            overflow="hidden"
            borderRadius={"lg"}
            bgColor="white"
            p="10px"
          >
            <QRCode
              size={128}
              value={`ergopay://${skyHarborApiRoot}/api/ergopay/getTx/${txId}/${userAddress}`}
            />
          </div>
          <div mb="4">
            <p textAlign={"center"} fontSize="sm">
              or
            </p>
          </div>
          <div
            mb="4"
            spacing={2}
            columns={{ base: 1, md: 2 }}
            textAlign={"center"}
          >
            <Button size={"lg"} onClick={copyErgoPay}>
              Copy request
            </Button>
            <Button size={"lg"} colorScheme={"blue"} onClick={signErgoPay}>
              Open wallet
            </Button>
          </div>
          <div textAlign={"center"}>
            <p fontSize={"sm"}>Waiting for the transaction to be signed</p>
            <div mt="3">
              {/* <CircularProgress isIndeterminate color='#3182ce'/> */}
              {/* <Progress borderRadius={"xl"} size="xs" isIndeterminate color='#3182ce'/> */}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div key={"submitted"}>
          <div maxW={300} mx="auto" my="6">
            <div overflow={"hidden"} borderRadius={"lg"} position="relative">
              <div
                textAlign={"center"}
                width="100%"
                position={"absolute"}
                zIndex={10}
                top="0"
                left="0"
                height={"100%"}
              >
                <MdCheckCircleOutline fontSize={"6xl"} color="green.400" />
              </div>
              {box && (
                <div className="aspect-square">
                  <ArtworkMedia box={box} />
                </div>
              )}
            </div>
            {box?.nft_name && (
              <p
                fontWeight={"semibold"}
                mt="2"
                textAlign={"center"}
                noOfLines={1}
                width={"100%"}
              >
                {box.nft_name}
              </p>
            )}
            {/* <p mt="1" textAlign={"center"} noOfLines={1} width={"100%"} color={colorMode === "light" ? "black" : "white"}>{nftPrice} {currencyObject.displayName}</p> */}
          </div>

          {/* <div textAlign={"center"} w="100%" mb="8" mt="8">
                        <CheckCircleIcon fontSize={"6xl"} color="green.400"/>
                    </div> */}
          <Button
            mb="3"
            isFullWidth
            colorScheme="green"
            variant={"outline"}
            onClick={() => gotoTransaction(txId)}
          >
            View Tx on Explorer
          </Button>
          <p mb="1" fontWeight={"semibold"} fontSize={"lg"}>
            Transaction ID:{" "}
            <p as="span" color="green.400">
              {txId}
            </p>
          </p>
          <p fontSize={"sm"} color={"gray.400"}>
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
