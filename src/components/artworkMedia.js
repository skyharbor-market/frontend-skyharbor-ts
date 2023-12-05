import React, { useEffect, useState } from "react";
import axios from "axios";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import ReactPlayer from "react-player";
import {
  MdImageNotSupported,
  MdOutlineImageNotSupported,
} from "react-icons/md";
import { cloudinaryOptimizerUrl, ipfsGateway } from "../ergofunctions/consts";
import LoadingCircle from "./LoadingCircle/LoadingCircle";
// import Lightbox from "react-image-lightbox";
// import ImgixClient from "@imgix/js-core";

// const client = new ImgixClient({
//   domain: "skyharbor.imgix.net",
//   secureURLToken: process.env.NEXT_PUBLIC_IMGIX_TOKEN,
// });

export default function ArtworkMedia({
  box,
  cloudinary = true,
  ratio = "square",
  thumbnail = true,
  lazyLoad = false,
  small = false,
  wallet = false,
  autoPlay = false,
  borderRad = 0,
}) {
  let mounted = true;

  // Get image height and width to see if its pixelated
  const [imgHeight, setImgHeight] = useState(0);
  const [imgWidth, setImgWidth] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [fileSrc, setFileSrc] = React.useState("");

  // const { colorMode, toggleColorMode } = useColorMode();

  const onImgLoad = ({ target: img }) => {
    setImgHeight(img.naturalHeight);
    setImgWidth(img.naturalWidth);
    setIsLoaded(true);
  };

  const tokenType = box.nft_type;

  // let backupFileLink;

  // let fileLink;
  // if (tokenType === "video"){
  //   fileLink = box.ipfs_art_hash ? `https://ipfs.blockfrost.dev/ipfs/${box.ipfs_art_hash}` : `${box.ipfs_art_url}`;
  // }
  // else if (tokenType === "audio"){
  //   fileLink = box.ipfs_art_hash ? `https://ipfs.blockfrost.dev/ipfs/${box.ipfs_art_hash}` : `${box.ipfs_art_url}`;
  // }
  // else {
  //   let tempLink = box.ipfs_art_hash ? `https://cloudflare-ipfs.com/ipfs/${box.ipfs_art_hash}` : `${box.ipfs_art_url}`;

  //   // If cloudinary doesn't load, use original IPFS
  //   backupFileLink = tempLink

  //   let transformType = ratio === "square" ? "card" : "original"
  //   if(small) {
  //     transformType = "small"
  //   }
  //   let resourceType = "?resource_type=image"
  //   if(cloudinary) {
  //     // fileLink = `${cloudinaryOptimizerUrl}/${transformType}/` + tempLink + resourceType;

  //     // fileLink = client.buildSrcSet(tempLink);

  //     // if(small) {
  //     //   fileLink = `/cdn-cgi/image/` + "width=250,height=250,fit=crop/" +  tempLink //+ resourceType;
  //     // }
  //   }
  //   else {
  //     fileLink = tempLink;
  //   }
  // }

  function resolveIpfs(url, isVideo = false) {
    const ipfsPrefix = "ipfs://";
    if (!url.startsWith(ipfsPrefix)) return url;
    else {
      if (isVideo)
        return url.replace(ipfsPrefix, "https://ipfs.blockfrost.dev/ipfs/");
      return url.replace(ipfsPrefix, "https://cloudflare-ipfs.com/ipfs/");
    }
  }
  useEffect(() => {
    mounted = true;

    // const tokenType = box.nft_type

    let backupFileLink;

    let fileLink;
    if (tokenType === "video") {
      fileLink = box.ipfs_art_hash
        ? `https://ipfs.blockfrost.dev/ipfs/${box.ipfs_art_hash}`
        : `${box.ipfs_art_url}`;
    } else if (tokenType === "audio") {
      fileLink = box.ipfs_art_hash
        ? `https://ipfs.blockfrost.dev/ipfs/${box.ipfs_art_hash}`
        : `${box.ipfs_art_url}`;
    } else {
      let tempLink = box.ipfs_art_hash
        ? `${ipfsGateway}/${box.ipfs_art_hash}`
        : `${box.ipfs_art_url}`;

      let transformType = ratio === "square" ? "card" : "original";
      if (small) {
        transformType = "small";
      }
      let resourceType = "?resource_type=image";
      if (cloudinary) {
        // fileLink = `${cloudinaryOptimizerUrl}/${transformType}/` + tempLink + resourceType;

        // fileLink = client.buildSrcSet(tempLink);
        // console.log("ADASDADADADA", tempLink)

        const imageSize = small ? 200 : 400;
        const imageFit = ratio === "square" ? "crop" : "clip";

        const sizeExpanded = 500;

        // fileLink = client.buildURL(tempLink, {
        //   "max-w": imageSize,
        //   "max-h": imageSize,
        //   w: imageFit === "clip" ? sizeExpanded : null,
        //   h:  imageFit === "clip" ? sizeExpanded : null,
        //   fit: imageFit,
        //   auto: "format,compress",
        //   fm:"webm",
        //   // frame: thumbnail ? 1 : null
        // })
        fileLink = tempLink;

        // if(small) {
        //   fileLink = `/cdn-cgi/image/` + "width=250,height=250,fit=crop/" +  tempLink //+ resourceType;
        // }
      } else {
        fileLink = tempLink;
      }
    }

    setFileSrc(fileLink);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setIsError(false);
  }, [box]);

  if (tokenType === "audio") {
    return (
      <div className="max-w-40 m-auto flex flex-col">
        <img
          // layout='fill'
          onLoad={onImgLoad}
          style={{
            width: "100%",
            height: "100%",
            minWidth: ratio === "square" ? 0 : 200,
            margin: "auto",
            overflow: "hidden",
            objectFit: ratio === "square" ? "cover" : "contain",
          }}
          alt={box.token_id}
          onError={() => setIsError(true)}
          // fallbackSrc="/assets/images/loadinginfinity.svg"
          className={`${
            imgWidth > 200 ? "display-image" : "display-image-pixelated"
          }`}
          src={fileSrc ? fileSrc : "/assets/images/quokka.webp"}
        />

        {!wallet && (
          <AudioPlayer
            isFullWidth
            customAdditionalControls={[]}
            showSkipControls={false}
            showJumpControls={false}
            showFilledVolume={false}
            defaultCurrentTime={"00:00"}
            layout={"horizontal"}
            width="100%"
            // preload={"none"}
            // autoPlay={false}
            // className='audioTab'
            src={box.audioUrl}
          />
        )}
      </div>
    );
  } else if (tokenType === "video") {
    if (fileSrc === "") {
      return <div></div>;
    }
    return (
      <ReactPlayer
        // pip={true}
        // light={!props.preload}
        loop={true}
        volume={thumbnail ? 0 : 0.8}
        muted={thumbnail ? true : false}
        playing={thumbnail && autoPlay ? true : false}
        url={[{ src: fileSrc }]} // video location
        controls={thumbnail ? false : true} // gives the front end video controls
        width="100%"
        height="100%"
        config={{
          file: {
            attributes: {
              controlsList: "nodownload", //<- this is the important bit
              style: { height: "100%", objectFit: "cover", margin: "auto" },
            },
          },
        }}
      />
    );
  } else {
    return (
      <div className="w-full h-full">
        {!isLoaded && !isError && (
          // <img
          //   // layout='fill'
          //   // width="600px" height="600px"
          //   width={"100%"}
          //   maxHeight={maxHeight ? maxHeight : "inherit"}
          //   placeholder="/assets/images/loadinginfinity.svg"
          //   objectFit={ratio === "square" ? "cover" : "contain"}
          //   // style={{objectFit: !objectFitStyle ? 'cover' : objectFitStyle}}
          //   // className="image"
          //   src="/assets/images/loadinginfinity.svg"
          // />
          // <div className="flex h-full w-full items-center justify-center p-[30%]">
          //   <LoadingCircle />
          // </div>
          <div className="animate-pulse">
            <div className="aspect-square">
              <div className="flex h-full w-full items-center justify-center p-8">
                <LoadingCircle />
              </div>
              <div className="rounded-t-md bg-slate-700 w-full h-full"></div>
            </div>
          </div>
        )}
        {
          !isError && (
            // <Fade in={isLoaded}>
            <div
              className={`${
                isLoaded || wallet ? "inherit" : "none"
              } w-full h-full`}
              style={{ borderRadius: borderRad }}
            >
              <img
                key={fileSrc}
                className={`w-full h-full m-auto ${
                  ratio === "square" && `object-cover`
                } ${
                  imgWidth > 200 ? "display-image" : "display-image-pixelated"
                }`}
                // layout='fill'
                onLoad={onImgLoad}
                // _hover={{
                //   opacity: lightbox ? 0.5 : 1,
                //   cursor: lightbox ? "pointer" : "inherit",
                // }}
                loading={lazyLoad ? "lazy" : "eager"}
                alt={box.token_id}
                // transition="opacity .2s"
                // minW={ratio === "square" ? 0 : 200}
                // minW={300}
                // height={"100%"}
                // onClick={() => setIsOpen(true)}
                // m="auto"
                onError={(e) => {
                  setIsError(true);
                }}
                // borderRadius={ratio === "square" ? 0 : 8}
                overflow="hidden"
                // fallbackSrc="/assets/images/loadinginfinity.svg"
                // className={
                //   imgWidth > 200 ? "display-image" : "display-image-pixelated"
                // }
                // objectFit={ratio === "square" ? "cover" : "contain"}
                // className="auctionImg"
                src={fileSrc ? fileSrc : ""}
              />
              {/* {isOpen && lightbox && (
                <Lightbox
                  imagePadding={0}
                  toolbarButtons={[]}
                  reactModalStyle={{ overlay: { zIndex: 10000 } }}
                  mainSrc={fileSrc}
                  onCloseRequest={() => setIsOpen(false)}
                />
              )} */}
            </div>
          )

          // </Fade>
        }
        {isError && (
          // <Image
          //     key={fileLink}
          //     // layout='fill'
          //     maxHeight={maxHeight ? maxHeight : "inherit"}
          //     _hover={{opacity: lightbox ? 0.5 : 1, cursor: lightbox ? "pointer" : "inherit"}}
          //     loading={lazyLoad ? "lazy" : "eager"}

          //     alt={box.token_id}
          //     transition="opacity .2s"
          //     width={"100%"}
          //     minW={ratio === "square" ? 0 : 200}
          //     // minW={300}
          //     height={"100%"}
          //     onClick={()=> setIsOpen(true)}
          //     m="auto"
          //     // borderRadius={ratio === "square" ? 0 : 8}
          //     overflow="hidden"

          //     fallbackSrc="/assets/images/loadinginfinity.svg"
          //     className={imgWidth > 200 ? "display-image" : "display-image-pixelated"}
          //     objectFit={ratio === "square" ? "cover" :"contain"}
          //     // className="auctionImg"
          //     src={
          //         fileLink
          //             ? fileLink
          //             : "/assets/images/quokka.webp"
          //     }
          // />

          <div className="flex h-full items-center justify-center text-center">
            {/* <Text
                  h={200}
                  fontWeight={"semibold"}
                  fontSize="sm"
                  textAlign={"center"}
                  p="4"
                  color={colorMode === "light" ? "black" : "white"}

                  > */}
            {/* <Tooltip
              textAlign={"center"}
              hasArrow
              label="File couldn't load. Refresh or view token page to see NFT."
              shouldWrapChildren
            > */}
            <MdOutlineImageNotSupported className="w-[70%] h-[70%]" />
            {/* </Tooltip> */}

            {/* <br />
                  File couldn&apos;t load. Refresh or view token page to see NFT. */}
            {/* </Text> */}
            {/* <Image left={"0"} pos={"absolute"} top="0" width={"100%"} height="100%" src="/assets/images/skyharborlogo.png" opacity={"0.6"} filter="blur(1px)"/> */}
          </div>
        )}
      </div>
    );
  }
}
