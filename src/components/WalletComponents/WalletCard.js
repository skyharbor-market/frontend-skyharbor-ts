import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { friendlyToken } from "../../ergofunctions/helpers";
import ArtworkMedia from "../artworkMedia";
import { bulk_list } from "../../ergofunctions/marketfunctions/bulkList";
import { FaCheckCircle } from "react-icons/fa";
import SellModal from "./SellModal/SellModal";

export default function WalletCard({
  box,
  selected,
  currentlySelecting,
  verified,
}) {
  const router = useRouter();
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState({});

  const handleSellButton = (tokenId, nft_name, royalty, artist) => {
    setSelectedToken({
      tokenId: tokenId,
      nft_name: nft_name,
      royalty: royalty || 0,
      artist: artist || null,
    });
    setSellModalOpen(true);
  };

  const handleCopy = (text) => {
    if (currentlySelecting) return;
    navigator.clipboard.writeText(text).then(() => console.log("copied"));
  };

  const createSaleTx = async (tokenId, price, currencyIndex) => {
    try {
      const saleTxId = await bulk_list([
        {
          id: tokenId,
          currencyIndex: currencyIndex,
          price: price,
        },
      ]);
      if (saleTxId) {
        console.log("Sale transaction submitted:", saleTxId);
        // Handle successful submission
      }
    } catch (error) {
      console.error("ERROR", error);
      // Handle error
    }
  };

  return (
    <div
      className={`max-w-sm rounded overflow-hidden shadow-lg ${
        currentlySelecting ? "cursor-pointer" : ""
      } ${selected ? "ring-2 ring-orange-500" : ""} transition-all duration-300 hover:shadow-xl`}
    >
      <Link
        href={`/token/${box.tokenId}`}
        className={`${!currentlySelecting ? "" : "pointer-events-none"}`}
      >
        <div className="relative aspect-square cursor-pointer">
          <ArtworkMedia
            wallet={true}
            box={box}
            cloudinary={false}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
      </Link>
      <div className="px-6 py-4">
        {verified && (
          <div className="flex items-center mb-0">
            <span className="text-blue-500 font-semibold mr-1">{verified.address_collection.name}</span>
            <FaCheckCircle className="text-blue-500" />
          </div>
        )}
        <div className="font-bold text-xl truncate">{box.nft_name}</div>
        <p className="text-gray-700 text-base mb-0 truncate" onClick={() => handleCopy(box.tokenId)}>
          Token ID: {friendlyToken(box.tokenId, 8)}
        </p>
        <p className="text-gray-600 text-sm">
          {box.amount || "-"} of {box.totalIssued}
        </p>
      </div>
      <div className="px-6 pt-0 pb-6">
        <button
          className={`w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ${
            currentlySelecting || box.nft_type === "audio"
              ? "opacity-50 cursor-not-allowed"
              : "transition duration-300 ease-in-out transform hover:-translate-y-1"
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
      <SellModal
        open={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        tokenId={selectedToken.tokenId}
        token={selectedToken}
        createSaleTx={createSaleTx}
        royalty={selectedToken.royalty}
        royalty_address={selectedToken.artist}
      />
    </div>
  );
}
