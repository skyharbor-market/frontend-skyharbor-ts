import { ipfsGateway, SupportedCurrenciesV2 } from "@/ergofunctions/consts";
import { longToCurrency } from "@/ergofunctions/serializer";
import { StarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import ArtworkMedia from "../artworkMedia";
import Button from "../Button/Button";
import BuyNFTButton from "../BuyNFTButton/BuyNFTButton";
import Fade from "../Fade/Fade";
import FormattedMetadata from "../FormattedMetadata/FormattedMetadata";
import LoadingCircle from "../LoadingCircle/LoadingCircle";
import Modal from "../Modal/Modal";

type Props = {
  token: any;
  isOwner: boolean;
  noBuy?: boolean;
};

const NFTCard = ({ token, isOwner = false, noBuy = false }: Props) => {
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="relative transition-all group h-full overflow-hidden border dark:border-gray-600 rounded-lg shadow-lg dark:shadow-dark bg-white dark:bg-slate-800 scale-100 hover:scale-[1.05]">
      <div
        key={token?.id}
        className="transition-all group relative h-full group-hover:-mt-6"
      >
        <div
          onClick={() => setOpenInfo(true)}
          className="aspect-square overflow-hidden bg-gray-200 group-hover:opacity-90 bg-white cursor-pointer"
        >
          {/* <img
            src={token.ipfs_art_url}
            alt={token.nft_name}
            className="h-full w-full object-cover object-center"
          /> */}
          {/* @ts-ignore */}
          <ArtworkMedia box={token} ratio="square" />
        </div>
        <div className="pb-6 pt-4 text-left p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200  line-clamp-1 h-6">
            {/* <span aria-hidden="true" className="absolute inset-0" /> */}
            {token?.nft_name}
          </h3>
          <Link href={`/collection/${token?.collection_sys_name}`}>
            <div className="flex flex-row items-center hover:opacity-60 transition-all">
              <FaCheckCircle className="text-blue-400 mr-1" />

              <p className="text-sm -mb-[2px] text-gray-900 dark:text-gray-200 line-clamp-1 h-6 ">
                {/* <span aria-hidden="true" className="absolute inset-0" /> */}
                {token?.collection_name}
              </p>
            </div>
          </Link>

          <div className="mt-2 flex flex-col">
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 line-clamp-1">
              {longToCurrency(
                token?.nerg_sale_value,
                undefined,
                token?.currency
              )}{" "}
              {/* @ts-ignore */}
              {SupportedCurrenciesV2?.[token?.currency]?.displayName || ""}
            </p>
          </div>
        </div>
      </div>

      {!noBuy && (
        <div className="absolute transition-all bottom-0 left-0 bg-blue-500 w-full opacity-0 group-hover:opacity-100 cursor-pointer">
          <BuyNFTButton
            ownedNFT={false}
            box={token}
            buyButton={
              <button className="p-2 text-center w-full text-white text-sm">
                Buy
              </button>
            }
            sellButton={
              <button className="p-2 text-center w-full bg-red-400 text-white text-sm">
                Edit
              </button>
            }
            loadingButton={
              <button className="p-2 text-center w-full bg-white text-black  text-sm">
                Loading...
              </button>
            }
          />
        </div>
      )}
      <Modal
        open={openInfo}
        setOpen={() => {
          setOpenInfo(false);
        }}
        className="md:max-w-5xl"
      >
        <div key={`${token.token_id}-info`}>
          <div
            className="absolute top-4 right-4 cursor-pointer hover:opacity-60 animate-all"
            onClick={() => setOpenInfo(false)}
          >
            <XMarkIcon className="w-7 h-7" />
          </div>
          <div className="flex flex-row space-x-8">
            <div className="w-1/3 h-full aspect-square overflow-hidden bg-gray-200 group-hover:opacity-90 bg-white rounded">
              {/* <img
            src={token.ipfs_art_url}
            alt={token.nft_name}
            className="h-full w-full object-cover object-center"
          /> */}
              {/* {openInfo && (
                <Fade fadeKey={"info-box-fade"} fadeDuration={0.15}>
                  <div className="h-full w-full">
                    <ArtworkMedia box={token} />
                  </div>
                </Fade>
              )} */}
              {/* <ArtworkMedia
                box={token}
                key={`${token.token_id}-info-full`}
                mustLoad={true}
                ratio="regular"
              /> */}
              <img
                className="h-full w-full object-contain"
                src={
                  token.ipfs_art_hash
                    ? `${ipfsGateway}/${token.ipfs_art_hash}`
                    : token.ipfs_art_url
                }
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between">
              <div>
                <p className="text-xl">{token.nft_name}</p>
                <div className="my-4">
                  <FormattedMetadata description={token.nft_desc} />
                </div>
              </div>
              {!noBuy && (
                <div>
                  <BuyNFTButton
                    ownedNFT={false}
                    box={token}
                    sellButton={
                      <div>
                        <Button className="w-full mt-8">Cancel</Button>
                      </div>
                    }
                    buyButton={
                      <div>
                        <Button className="w-full mt-8">Buy</Button>
                      </div>
                    }
                    loadingButton={
                      <div>
                        <div className="animate-pulse">
                          <Button disabled className="w-full mt-8">
                            Loading...
                          </Button>
                        </div>
                      </div>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NFTCard;
