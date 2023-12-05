import { ipfsGateway } from "@/ergofunctions/consts";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Button from "../Button/Button";
import BuyNFTButton from "../BuyNFTButton/BuyNFTButton";
import FormattedMetadata from "../FormattedMetadata/FormattedMetadata";
import ArtworkMedia from "../artworkMedia";
import { delay } from "lodash";
import Fade from "../Fade/Fade";

interface NFTInfoProps {
  token: any;
  noBuy: boolean;
  onClose: () => void;
}

const NFTInfo = ({ token, noBuy, onClose }: NFTInfoProps) => {
  const [showImg, setShowImg] = useState<boolean>(false)

  const activateImage = async()=> {
    await delay(()=>setShowImg(true), 50)

  }
  useEffect(()=> {
    activateImage();
  }, [])

  return (
    <div key={`${token.token_id}-info`} className="w-full">
      <div
        className="absolute top-4 right-4 cursor-pointer hover:opacity-60 animate-all"
        onClick={() => onClose()}
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
          {/* <img
            className="h-full w-full object-contain"
            src={
              token.ipfs_art_hash
                ? `${ipfsGateway}/${token.ipfs_art_hash}`
                : token.ipfs_art_url
            }
          /> */}
          {
            showImg &&
            <Fade fadeDuration={0.1} fadeKey={`tokenpopup-${token.token_id}`}>
              <ArtworkMedia box={token}/>

            </Fade>
          }
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
  );
};

export default NFTInfo;
