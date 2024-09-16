import { SupportedCurrenciesV2 } from "@/ergofunctions/Currencies";
import { longToCurrency } from "@/ergofunctions/serializer";
import { StarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import ArtworkMedia from "../artworkMedia";
import BuyNFTButton from "../BuyNFTButton/BuyNFTButton";
import Modal from "../Modal/Modal";
import NFTInfo from "./NFTInfo";
import { formatValueWithDP } from "@/ergofunctions/frontend_helpers";

type Props = {
  token: any;
  isOwner: boolean;
  noBuy?: boolean;
  userAddresses?: string[]
};

const NFTCard = ({ token, isOwner = false, noBuy = false, userAddresses = [] }: Props) => {
  const [openInfo, setOpenInfo] = useState<boolean>(false);

  return (
    <div className="relative group h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-150 bg-white dark:bg-gray-800">
      <div className="h-full flex flex-col transition-all duration-150 group-hover:-translate-y-2">
        <div
          onClick={() => setOpenInfo(true)}
          className="aspect-square overflow-hidden cursor-pointer"
        >
          <ArtworkMedia box={token} ratio="square" />
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {token?.nft_name}
            </h3>
            <Link href={`/collection/${token?.collection_sys_name}`}>
              <div className="flex items-center mt-1 hover:opacity-80 transition-opacity cursor-pointer">
                <FaCheckCircle className="text-blue-500 mr-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {token?.collection_name}
                </p>
              </div>
            </Link>
          </div>
          <div className="mt-4">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatValueWithDP(longToCurrency(token?.nerg_sale_value, undefined, token?.currency))}
              {" "}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {SupportedCurrenciesV2?.[token?.currency]?.displayName || ""}
              </span>
            </p>
          </div>
        </div>
      </div>

      {!noBuy && (
        <div className="absolute inset-x-0 bottom-0 p-4 dark:from-black bg-gradient-to-t from-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <BuyNFTButton
            box={token}
            userAddresses={userAddresses}
            buyButton={
              <button className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                Buy Now
              </button>
            }
            editButton={
              <button className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
                Delist
              </button>
            }
            loadingButton={
              <button className="w-full py-2 px-4 bg-gray-400 text-white font-semibold rounded-md cursor-not-allowed">
                Loading...
              </button>
            }
          />
        </div>
      )}
      
      <Modal
        open={openInfo}
        setOpen={() => setOpenInfo(false)}
        size="max-w-5xl"
      >
        <NFTInfo
          token={token}
          noBuy={noBuy}
          userAddresses={userAddresses}
          onClose={() => setOpenInfo(false)}
        />
      </Modal>
    </div>
  );
};

export default NFTCard;
