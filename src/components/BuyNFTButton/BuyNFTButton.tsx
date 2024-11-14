import React, { useState } from "react";
import { supportedCurrencies, v1ErgAddress } from "../../ergofunctions/consts";
import { buyTokenNFT } from "../../ergofunctions/marketfunctions/buyTokenNFT";
import { relist_NFT } from "../../ergofunctions/marketfunctions/relistNFT";
import TxSubmitted, { UserActionType } from "../TxSubmitted/TxSubmitted";
import Modal from "../Modal/Modal";
import SellModal from "../WalletComponents/SellModal/SellModal";
import { MdEditDocument } from "react-icons/md";
import toast from "react-hot-toast";
import { buyNft } from "api-calls/buy";
import { getWalletAddresses } from "@/ergofunctions/walletUtils";
import { delistNft } from "api-calls/delist";

interface BuyNFTButtonProps {
  box: any;
  userAddresses?: string[];
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
  const [submitting, setSubmitting] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<UserActionType | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  
  console.log("box", box);
  const handleBuy = async () => {
    setSelectedFunction("buy");
    setSubmitting(true);

    try {
      const buyTxId = box.currency === "erg"
        ? await buyNft({
            buyBox: box,
            userAddresses: await getWalletAddresses(),
          })
        : await buyTokenNFT(box, supportedCurrencies.find(c => c.name === box.currency)?.id);

      if (buyTxId) {
        setTransactionId(buyTxId);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err?.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setSelectedFunction("delist");
    setSubmitting(true);

    try {
      const cancelTxId = await delistNft({
        buyBox: box,
        userAddresses: await getWalletAddresses(),
      });

      if (cancelTxId) {
        setTransactionId(cancelTxId);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err?.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPrice = () => {
    setSelectedFunction("edit");
    setOpenEdit(true)
  };

  const handleEditSubmit = async (tokenId: string, price: number, currencyIndex: number) => {
    setSubmitting(true);
    try {
      const relistTxId = await relist_NFT(box, price, currencyIndex);
      if (relistTxId) {
        setTransactionId(relistTxId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderBuyButton = () => {
    const ownedNFT = userAddresses?.includes(box.seller_address);

    if (ownedNFT) {
      return submitting ? (
        loadingButton
      ) : (
        <div className="flex flex-row space-x-2">
          <div onClick={handleCancel} className="flex-grow">
            <button className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
              Delist
            </button>
          </div>
          {box.sales_address === v1ErgAddress && box.currency === "erg" && (
            <button
              onClick={handleEditPrice}
              className="py-2 px-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center whitespace-nowrap"
            >
              <MdEditDocument className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    } else {
      return (
        <div onClick={handleBuy}>
          {submitting ? loadingButton : buyButton}
        </div>
      );
    }
  };

  return (
    <div>
      {renderBuyButton()}
      <Modal open={!!transactionId} setOpen={() => setTransactionId(null)}>
        <TxSubmitted
          txId={transactionId!}
          box={box}
          type={selectedFunction || "buy"}
          onClose={() => setTransactionId(null)}
        />
      </Modal>
      <SellModal
        token={{
          nft_name: box.nft_name,
          tokenId: box.token_id,
          box_json: box.box_json,
          ...box.box_json,
          ipfs_art_hash: box?.ipfs_art_hash,
          ipfs_art_url: box?.ipfs_art_url
        }}
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        isEdit={true}
      />
    </div>
  );
}
