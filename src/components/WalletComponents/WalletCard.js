import React, { Fragment, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
// import {Button, Col, Row,} from 'reactstrap';
import { friendlyToken } from "../../ergofunctions/helpers";
// import {css} from '@emotion/core';
// import 'react-h5-audio-player/lib/styles.css';
import ArtworkMedia from "../artworkMedia";
// import {bulk_list, getTokens, list_NFT} from "../../ergofunctions/walletUtils";
import { bulk_list } from "../../ergofunctions/marketfunctions/bulkList";
// import {
//   listNFTFleet,
//   list_NFT,
// } from "../../ergofunctions/marketfunctions/listNFT";

// import PropagateLoader from "react-spinners/PropagateLoader";
import { boxById, getBalance } from "../../ergofunctions/explorer";
// import SellForm from "../../SellForm";
// import TxSubmitted from "../ModalComponents/TxSubmitted";
import { supportedCurrencies } from "../../ergofunctions/consts";
import { currencyToLong } from "../../ergofunctions/serializer";
import { FaCheckCircle } from "react-icons/fa";

export default function WalletCard({
  box,
  selected,
  currentlySelecting,
  verified,
}) {
  const colorMode = "light";
  const router = useRouter();

  // Modal
  const finalRef = React.useRef();
  const [isOpen, setOpen] = useState(false);
  // modalType = "info" means we show NFT info, type "sell" is the modal for user inputting the amount they're selling for
  const [modalType, setModalType] = React.useState("info");
  const [selectedToken, setSelectedToken] = React.useState({});
  const [artDetail, setArtDetails] = React.useState(false);
  const [saleId, setSaleId] = React.useState(null);
  const [loadingRoyalty, setLoadingRoyalty] = React.useState(false);

  // Change modals
  const handleSellButton = async (tokenId, nft_name, royalty, artist) => {
    // setLoadingRoyalty(true)
    // const royaltyInfo = await getRoyaltyInfo(tokenId);

    // Get mint address to see if it a verified nft
    // const tokBox = await boxById(tokenId)
    // const artistInfo = await getArtist(tokBox);
    // console.log("artistInfo", artistInfo)

    // setLoadingRoyalty(false);
    const royaltyInfo = {
      royalty: royalty,
      artist: artist,
    };

    if (!royaltyInfo) {
      // toast({
      //     title: "NFTs without royalties cannot be sold currently.",
      //     description: "this feature will be out VERY soon.",
      //     position: "top-right",
      //     status: "warning",
      //     duration: 5000,
      //     isClosable: true,
      //   })
      // return;
    }
    setModalType("sell");
    setSelectedToken({
      tokenId: tokenId,
      nft_name: nft_name,
      royalty: royaltyInfo.royalty ? royaltyInfo.royalty : 0,
      artist: royaltyInfo.artist ? royaltyInfo.artist : null,
    });
    // onOpen();
    setOpen(true);
  };
  const closeModal = () => {
    // setModalType("info");
    setOpen(false);
  };

  // Rerouting
  const gotoToken = (tokenId) => {
    router.push(`/token/${tokenId}`);
  };
  const gotoTransaction = (TID) => {
    window.open(
      `https://explorer.ergoplatform.com/en/transactions/${TID}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  };

  const gotoCollection = (sys_name) => {
    if (currentlySelecting) {
      return;
    }
    router.push(`/collection/${sys_name}`);
  };

  // Create Sale
  const createSaleTx = async (tokenId, price, currencyIndex) => {
    // return;
    try {
      const saleTxId = await bulk_list([
        {
          id: tokenId,
          // name: name,
          // ipfs_art_url: box.ipfs_art_url,
          // nft_type: box.nft_type,
          // royalty: box.royalty,
          currencyIndex: currencyIndex,
          price: price,
        },
      ]);
      if (saleTxId) {
        setSaleId(saleTxId);
        setModalType("submitted");
        return;
      }
    } catch (error) {
      console.error("ERROR", error);
      // toast({
      //   title: "There was an error submitting the transaction.",
      //   description:
      //     error?.info || "There was an error submitting the transaction",
      //   position: "top-right",
      //   status: "error",
      //   duration: 5000,
      //   isClosable: true,
      // });
      console.log("error", error);
    }

    return;
  };

  // Copy text
  const handleCopy = (text) => {
    if (currentlySelecting) {
      return;
    }
    navigator.clipboard.writeText(text).then(() =>
      // toast({
      //   title: "Copied",
      //   // description: "We've created your account for you.",
      //   position: "bottom",
      //   status: "info",
      //   duration: 2000,
      //   isClosable: true,
      // })
      console.log("copied")
    );
  };

  return (
    // <Fade in={true}>
    <div
      className={`${
        currentlySelecting ? "cursor-pointer" : ""
      } max-w-[350px] min-w-[200px] transform transition-transform duration-200 ${
        selected ? "scale-95" : ""
      } hover:opacity-70`}
    >
      <div
        className={`shadow-lg rounded-lg ${
          selected ? "border-2 border-orange-500" : ""
        }`}
      >
        <Link
          href={`/token/${box.tokenId}`}
          className={`${!currentlySelecting ? "" : "pointer-events-none"}`}
        >
          <div
            className={`overflow-hidden rounded-t-lg aspect-square ${
              currentlySelecting ? "" : "card-container"
            }`}
          >
            <ArtworkMedia
              wallet={true}
              box={box}
              cloudinary={false}
              // lazyLoad={true}
            />
          </div>
        </Link>
        <div
          className={`p-4 rounded-b-lg ${
            colorMode === "light" ? "" : "bg-black opacity-40"
          } border-t border-gray-200`}
        >
          {verified ? (
            <div className="collection-name">
              <p
                overflow={"hidden"}
                whiteSpace={"nowrap"}
                textOverflow="ellipsis"
                bt="3"
                onClick={() =>
                  gotoCollection(verified.address_collection.sys_name)
                }
                fontWeight={"semibold"}
                mb="1"
                fontSize={"md"}
                color={colorMode === "light" ? "blue.500" : "blue.300"}
                className={currentlySelecting ? "" : "collection-name-fade"}
              >
                {verified.address_collection.name}
                <FaCheckCircle
                  ml="1.5"
                  color={colorMode === "light" ? "blue.500" : "blue.300"}
                  fontSize={"lg"}
                />
              </p>
            </div>
          ) : (
            <div className="collection-name">
              <p
                overflow={"hidden"}
                whiteSpace={"nowrap"}
                textOverflow="ellipsis"
                bt="3"
                // onClick={gotoCollection}
                fontWeight={"semibold"}
                mb="1"
                fontSize={"md"}
                color={"gray.500"}
                // className="collection-name-fade"
              >
                Unverified
              </p>
            </div>
          )}

          {/* NFT Name */}
          <p
            overflow={"hidden"}
            whiteSpace={"nowrap"}
            textOverflow="ellipsis"
            mb="1"
            fontSize={"lg"}
          >
            {box.nft_name}
          </p>

          {/* NFT ID */}
          {/* <Tooltip label="Copy" hasArrow isDisabled={currentlySelecting}> */}
          <p
            overflow={"hidden"}
            whiteSpace={"nowrap"}
            textOverflow="ellipsis"
            cursor={"pointer"}
            onClick={() => handleCopy(box.tokenId)}
            color="grey"
            fontSize={"sm"}
          >
            Token ID: {friendlyToken(box.tokenId, 8)}
          </p>
          {/* </Tooltip> */}

          <p
            overflow={"hidden"}
            whiteSpace={"nowrap"}
            textOverflow="ellipsis"
            cursor={"pointer"}
            onClick={() => handleCopy(box.tokenId)}
            color="grey"
            fontSize={"sm"}
          >
            {box.amount || "-"} of {box.totalIssued}
          </p>
          {/* ... [Other UI Elements] ... */}
          <button
            className={`mt-4 w-full border border-red-500 text-red-500 rounded-lg py-2 ${
              currentlySelecting || box.nft_type === "audio"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() =>
              handleSellButton(
                box.assets[0].tokenId,
                box.tokenName,
                box.royalty,
                box.artist
              )
            }
            disabled={currentlySelecting || box.nft_type === "audio"}
          >
            Sell
          </button>
        </div>
      </div>
      {/* --------MODAL------- */}

      {/* </div> */}

      {/* --------MODAL------- */}

      {/* <Modal
        finalFocusRef={finalRef}
        size={modalType === "submitted" ? "md" : "xl"}
        isOpen={isOpen}
        onClose={closeModal}
      >
        <ModalOverlay />
        <ModalContent overflow="hidden" margin="4">
          <ModalCloseButton color={colorMode === "light" ? "black" : "white"} />
          <ModalHeader py="6" color={colorMode === "light" ? "black" : "white"}>
            {modalType === "submitted"
              ? "NFT Sale Submitted"
              : `Selling NFT: ${selectedToken.nft_name}`}
          </ModalHeader>
          <Divider />
          <ModalBody mt="3">
            {modalType === "submitted" ? (
              <TxSubmitted txId={saleId} box={box} />
            ) : (
              <Box>
                <SellForm
                  tokenId={selectedToken.tokenId}
                  createSaleTx={createSaleTx}
                  royalty={selectedToken.royalty}
                  royalty_address={selectedToken.artist}
                />
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal> */}
    </div>
    // </Fade>
  );
}
