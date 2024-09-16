import { ipfsGateway } from "@/ergofunctions/consts";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Button from "../Button/Button";
import BuyNFTButton from "../BuyNFTButton/BuyNFTButton";
import FormattedMetadata from "../FormattedMetadata/FormattedMetadata";
import ArtworkMedia from "../artworkMedia";
import { delay } from "lodash";
import Fade from "../Fade/Fade";
import { longToCurrency } from "@/ergofunctions/serializer";
import { SupportedCurrenciesV2 } from "@/ergofunctions/Currencies";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaPaintBrush } from 'react-icons/fa';
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { friendlyAddress, friendlyToken, msToTime } from '@/ergofunctions/helpers';
import { useSelector } from 'react-redux';
// import TokenPrevSales from '../TokenPrevSales/TokenPrevSales';
// import CollectionFloor from '../CollectionFloor/CollectionFloor';
import ShowMetadata from '../ShowMetadata';

interface NFTInfoProps {
  token: any;
  noBuy: boolean;
  onClose: () => void;
  artistIsSeller?: boolean;
  ownedNFT?: boolean;
}

const NFTInfo = ({ token, noBuy, onClose, artistIsSeller, ownedNFT }: NFTInfoProps) => {
  const [showImg, setShowImg] = useState<boolean>(false);
  const [propertiesOpen, setPropertiesOpen] = useState<boolean>(true);
  const router = useRouter();
  const ergPrice = useSelector((state: any) => state.market.ergPrice);

  const activateImage = async () => {
    await delay(() => setShowImg(true), 50);
  };

  useEffect(() => {
    activateImage();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add a toast notification here if needed
  };

  const gotoCollection = () => {
    router.push(`/collection/${token.collection_sys_name}`);
  };

  const date1 = new Date(token.list_time);
  const date2 = new Date();
  const diffTime = Math.abs(date2.getTime() - date1.getTime());

  const currencyObject = SupportedCurrenciesV2[token.currency] || SupportedCurrenciesV2.erg;
  const nftPrice = (Math.round(longToCurrency(parseInt(token.nerg_sale_value), currencyObject.decimal) * 1000) / 1000).toLocaleString("en-US");

  return (
    <div key={`${token.token_id}-info`} className="w-full text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800">
      <div
        className="absolute top-4 right-4 cursor-pointer hover:opacity-60 transition-all"
        onClick={onClose}
      >
        <XMarkIcon className="w-7 h-7" />
      </div>
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="w-full md:w-1/3">
        <div className=" bg-gray-200 overflow-hidden dark:bg-gray-700 rounded-lg mb-4 md:mb-0">

          {showImg && (
            <Fade fadeDuration={0.1} fadeKey={`tokenpopup-${token.token_id}`}>
              <ArtworkMedia box={token} thumbnail={false} ratio="regular" />
            </Fade>
          )}
        </div>
        </div>
        <div className="w-full md:w-2/3 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-0 text-gray-900 dark:text-gray-100">{token.nft_name}</h2>
            <div className="flex items-center mb-1 cursor-pointer hover:opacity-60 transition-opacity" onClick={gotoCollection}>
              <span className={`text-lg font-semibold ${token.verified_collection ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {token.verified_collection ? token.collection_name : `Unverified (${friendlyAddress(token.collection_name, 4)})`}
              </span>
              {token.verified_collection && <CheckCircleIcon className="w-5 h-5 ml-1 text-blue-500 dark:text-blue-400" />}
            </div>
            <p className="mb-0">
              <span className="font-semibold">Token ID: </span>
              <span className="text-blue-500 dark:text-blue-400 cursor-pointer hover:opacity-60 transition-opacity" onClick={() => handleCopy(token.token_id)}>
                {friendlyToken(token.token_id)}
              </span>
            </p>
            <Link href={`/token/${token.token_id}`}>
              <a className="text-blue-500 dark:text-blue-400 hover:underline hover:opacity-60 transition-opacity mb-2 inline-block">View Token Page</a>
            </Link>
            <p className="mb-2">
              <span className="font-semibold">Artist Royalties: </span>
              <span>{token.royalty_int ? token.royalty_int / 10 : 0}%</span>
            </p>
            <div className="mb-4">
              <div className="flex items-center space-x-2 cursor-pointer hover:opacity-60 transition-opacity" onClick={() => setPropertiesOpen(!propertiesOpen)}>
                <span className="font-semibold">Properties</span>
                {propertiesOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
              </div>
              {parseInt(token.total_existing) > 1 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {parseInt(token.token_amount).toLocaleString("en-US")} out of {parseInt(token.total_existing).toLocaleString("en-US")} minted
                </p>
              )}
              {propertiesOpen && <ShowMetadata description={token.nft_desc} />}
            </div>
            {/* <CollectionFloor collection={token.collection_sys_name} /> */}
          </div>
          <div>
            <div className="flex justify-end items-baseline space-x-2 mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nftPrice} {currencyObject.displayName}</span>
              {ergPrice && currencyObject.name === "erg" && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  (${(Math.round((longToCurrency(token.nerg_sale_value) * ergPrice) * 100) / 100).toLocaleString("en-US")} USD)
                </span>
              )}
              {artistIsSeller && (
                <FaPaintBrush className="w-4 h-4 text-gray-600 dark:text-gray-300" title="This NFT is being sold by the creator." />
              )}
            </div>
            {!noBuy && (
              <>
                <BuyNFTButton
                  box={token}
                  // ownedNFT={ownedNFT}
                  buyButton={<Button className="w-full hover:opacity-60 bg-blue-500 text-white dark:bg-blue-600 dark:text-gray-100">Buy</Button>}
                  editButton={
                    <button className="p-2 text-center h-full w-full bg-red-500 text-white dark:bg-red-600 dark:text-gray-100 text-sm hover:opacity-60">
                      Cancel
                    </button>
                  }
                  loadingButton={
                    <div className="animate-pulse">
                      <Button disabled className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                        Loading...
                      </Button>
                    </div>
                  }
                />
                <p className="text-right mt-3 text-sm text-gray-500 dark:text-gray-400">Listed {msToTime(diffTime)} ago</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTInfo;
