import React, { Children, Fragment, useEffect, useState } from "react";
import { supportedCurrencies, v1ErgAddress } from "../../ergofunctions/consts";
import { buyTokenNFT } from "../../ergofunctions/marketfunctions/buyTokenNFT";
import { FaShoppingCart, FaCartPlus, FaCartArrowDown } from "react-icons/fa";
// import { setCartItems } from "../../redux/reducers/marketSlice";

import { buyNFT } from "../../ergofunctions/marketfunctions/buyNFT";
import { refund } from "../../ergofunctions/marketfunctions/refund";
import { relist_NFT } from "../../ergofunctions/marketfunctions/relistNFT";
import { useDispatch, useSelector } from "react-redux";
import { showMsg } from "../../ergofunctions/helpers";
import TxSubmitted, {UserActionType} from "../TxSubmitted/TxSubmitted";
import ArtworkMedia from "../artworkMedia";
import Modal from "../Modal/Modal";
import SellModal from "../WalletComponents/SellModal/SellModal";
import { SellTokenInterface } from "../WalletComponents/SellModal/SellModal";
import { MdEditDocument } from "react-icons/md";
import Button from "../Button/Button";
import toast, { Toaster } from "react-hot-toast";
import { buyNft, buyNftApi } from "api-calls/buy";
import { getWalletAddresses } from "@/ergofunctions/walletUtils";
import { getStoredWalletAddresses } from "../../ergofunctions/helpers";
import Tooltip from "../Tooltip/Tooltip";
import { delistNft } from "api-calls/delist";

interface BuyNFTButtonProps {
  box: any;

  userAddresses?: string[]
  buyButton: JSX.Element;
  editButton: JSX.Element;
  loadingButton: JSX.Element;
}

export default function BuyNFTButton({
  box,
  userAddresses,
  buyButton,
  editButton,
  loadingButton,
}: BuyNFTButtonProps) {
  // Cart items
  // const cartItems = useSelector((state) => state.market.cartItems);
  // const inCart = cartItems
  //   ? cartItems.find((l) => l.box_id === box.box_id)
  //   : false;
  // const dispatch = useDispatch();

  // const userAddresses = getStoredWalletAddresses();

  const [submitting, setSubmitting] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<UserActionType | null>(null);
  const [modalType, setModalType] = React.useState("edit");
  const [transactionId, setTransactionId] = React.useState(null);

  const [open, setOpen] = useState<boolean>(false);

  // Functions

  const handleBuy = async () => {
    setSelectedFunction("buy")
    // setModalType("sell");
    // onOpen();
    setSubmitting(true);

    let buyTxId;
    if (box.currency === "erg") {
      try {
        // buyTxId = await buyNFT(box);
        buyTxId = await buyNft({
          buyBox: box,
          userAddresses: await getWalletAddresses(),
        });
      } catch (err: any) {
        console.log(err?.message);
        toast.error(`Error: ${err?.message}`);
        setSubmitting(false);
      }
    } else {
      let currencyObject = supportedCurrencies.find(
        (l) => l.name === box.currency
      );
      buyTxId = await buyTokenNFT(box, currencyObject?.id);
    }
    if (buyTxId) {
      console.log("buyTxId", buyTxId);
      setModalType("submitted");
      setTransactionId(buyTxId);
      setOpen(true);
    }
    setSubmitting(false);

    // setSaleId(saleTxId);
    // setModalType('submitted');
    return;
  };

  // Cancel listing
  const handleCancel = async () => {
    setSelectedFunction("delist")
    // setModalType("sell");
    // onOpen();
    setSubmitting(true);

    try {

    const cancelTxId = await delistNft({
      buyBox: box,
      userAddresses: await getWalletAddresses(),
    });
    if (cancelTxId) {
      console.log("cancelTxId", cancelTxId);
      setModalType("submitted");
      setOpen(true);
      setTransactionId(cancelTxId);
    setSubmitting(false);
    }
  }catch (err: any) {
    console.log(err?.message);
    toast.error(`Error: ${err?.message}`);
    setSubmitting(false);

  }
    setSubmitting(false);

    // setSaleId(saleTxId);
    // setModalType('submitted');
    return;
  };

  // Edit price
  const handleEditPrice = () => {
    setSelectedFunction("edit")
    setModalType("edit");

    // Set edit modal open
    // onOpen();
  };
  const handleEditSubmit = async (
    tokenId: string,
    price: number,
    currencyIndex: number
  ) => {
    setSubmitting(true);

    const relistTxId = await relist_NFT(box, price, currencyIndex);

    if (relistTxId) {
      console.log("relistTxId", relistTxId);
      setModalType("submitted");
      setTransactionId(relistTxId);
    }

    setSubmitting(false);

    return;
  };

  // const handleCart = () => {
  //   if (cartItems.length >= 50) {
  //     return;
  //   }

  //   if (inCart) {
  //     var filtered = cartItems.filter(function (el) {
  //       return el.box_id != box.box_id;
  //     });
  //     dispatch(setCartItems(filtered));
  //     localStorage.setItem(
  //       "cart",
  //       JSON.stringify({
  //         items: filtered,
  //       })
  //     );
  //     dispatch(setCartItems([...cartItems, box]));
  //     localStorage.setItem(
  //       "cart",
  //       JSON.stringify({
  //         items: [...cartItems, box],
  //       })
  //     );
  //   }
  // };

  function gotoTransaction() {
    window.open(
      `https://explorer.ergoplatform.com/en/transactions/${transactionId}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  }

  function modalDisplay() {
    if (!open) {
      return;
    }
    if (modalType === "edit") {
      const tok: SellTokenInterface = {
        nft_name: box.nft_name,
        tokenId: box.tokenId,
      };
      return (
        // <Modal size="xl"  open={isOpen} onClose={onClose}>
        //   <div  className='m-4'>
        //     <p  className='text-xl'>
        //         Edit listing
        //     </p>

        //     <ModalBody mb="3">
        //       <SellForm tokenId={box.token_id} createSaleTx={handleEditSubmit} royalty={box.royalty_int} royalty_address={box.royalty_address} edit={true} />
        //     </ModalBody>
        //   </div>
        // </Modal>
        <SellModal token={tok} open={open} onClose={() => setOpen(false)} />
      );
    } else {
      //if modalType === "submitted"
      return (
        <Modal open={!!transactionId} setOpen={() => setTransactionId(null)}>
          <TxSubmitted txId={transactionId} box={box} type={selectedFunction || "buy"} onClose={() => setTransactionId(null)}/>
        </Modal>

        // <Box mb="4">
        //   <Heading fontSize="xl" mb="4" color={colorMode === "light" ? "black" : "white"}>Transaction Submitted</Heading>
        //   <Box maxW={300} mx="auto" my="6">
        //       <Box overflow={"hidden"} borderRadius={"lg"} position="relative">
        //           <Center textAlign={"center"} width="100%" position={"absolute"} zIndex={10} top="0" left="0" height={"100%"}>
        //               <CheckCircleIcon fontSize={"6xl"} color="green.400"/>
        //           </Center>
        //           <AspectRatio ratio={1}>
        //               <ArtworkMedia box={box} />
        //               {/* <DisplayMedia tokenInfo={box}/> */}
        //           </AspectRatio>

        //       </Box>
        //       <Text fontWeight={"semibold"} mt="2" textAlign={"center"} noOfLines={1} width={"100%"} color={colorMode === "light" ? "black" : "white"}>{box.nft_name}</Text>
        //       {/* <Text mt="1" textAlign={"center"} noOfLines={1} width={"100%"} color={colorMode === "light" ? "black" : "white"}>{nftPrice} {currencyObject.displayName}</Text> */}
        //   </Box>

        //   {/* <Box textAlign={"center"} w="100%" mb="8" mt="8">
        //       <CheckCircleIcon fontSize={"6xl"} color="green.400"/>
        //   </Box> */}
        //   <Button mb="3" isFullWidth colorScheme="green" variant={"outline"} onClick={()=>gotoTransaction(transactionId)}>View Tx on Explorer</Button>
        //   <Text mb="1" fontWeight={"semibold"} fontSize={"lg"} color={colorMode === "light" ? "black" : "white"}>Transaction ID: <Text as="span"  color="green.400">{transactionId}</Text></Text>
        //   <Text fontSize={"sm"} color={"gray.400"}>Now we wait until it is confirmed on the blockchain. It should take about 2-10 minutes.</Text>
        // </Box>
      );
    }
  }

  // Offer bid
  // const handleOfferBid = () => {
  //   setModalType("bid");
  //   onOpen();
  // }
  // const handleBidSubmit = async (tokenId, price, currencyIndex) => {
  //   setSubmitting(true);

  //   // console.log("Lol u thought")
  //   // return;

  //   // const relistTxId = await relist_NFT(props.box, price, currencyIndex);
  //   const offerTxId = await make_offer(props.box.token_id, price, props.box);
  //   console.log("After offerTxId", offerTxId)

  //   if(offerTxId) {
  //       console.log("offerTxId", offerTxId);
  //       setModalType("submitted");
  //       setTransactionId(offerTxId)
  //   }

  //   setSubmitting(false)

  //   return
  // }

  // useEffect(()=> {
  //   setTransactionId("0c6ddc39a6d8eb11f54dfbd7eec9058ca703464342293a3f17a1450529a2d26f")
  //   setModalType("submitted")
  //   onOpen();
  // }, [])

  const renderBuyButton = () => {
    let ownedNFT = userAddresses?.includes(box.seller_address) ? true : false;
    console.log("selllrrrrr", box.seller_address)
    console.log("userAddresses", userAddresses)
    if (ownedNFT) {
      return submitting ? (
        loadingButton
      ) : (
        <div className="flex flex-row space-x-2">
          <div onClick={handleCancel} className="flex-grow">
            {/* {editButton} */}
            <button className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
              Delist
            </button>
          </div>
          {box.sales_address === v1ErgAddress && box.currency === "erg" && (
            // <Tooltip label="Edit price" key={"editdoctooltipkey"}>
              <button
                onClick={handleEditPrice}
                className="py-2 px-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center whitespace-nowrap"
              >
                <MdEditDocument className="w-4 h-4" />
              </button>
            // </Tooltip>
          )}
        </div>
      );
    } else {
      return (
        <div onClick={() => handleBuy()}>
          {submitting ? loadingButton : buyButton}
        </div>
      );
    }
  };

  return (
    <div>
      {renderBuyButton()}

      {/* --------MODAL------- */}
      {modalDisplay()}
    </div>
  );
}
