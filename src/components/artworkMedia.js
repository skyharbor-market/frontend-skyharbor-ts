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

// Cache for loaded image states
const loadedImages = new Map();

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

  const [imgHeight, setImgHeight] = useState(0);
  const [imgWidth, setImgWidth] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = React.useState(() => {
    // Check cache on initial render
    return loadedImages.get(box?.ipfs_art_hash || box?.ipfs_art_url) || false;
  });
  const [fileSrc, setFileSrc] = React.useState("");
  const [retryCount, setRetryCount] = React.useState(0);
  const MAX_RETRIES = 3;

  const onImgLoad = ({ target: img }) => {
    if (mounted) {
      setImgHeight(img.naturalHeight);
      setImgWidth(img.naturalWidth);
      setIsLoaded(true);
      setIsLoading(false);
      setIsError(false);
      // Cache the loaded state
      loadedImages.set(box?.ipfs_art_hash || box?.ipfs_art_url, true);
    }
  };

  const tokenType = box?.nft_type ? box?.nft_type : box?.token?.nft_type;

  function resolveIpfs(url, isVideo = false) {
    const ipfsPrefix = "ipfs://";
    if (!url.startsWith(ipfsPrefix)) return url;
    else {
      if (isVideo)
        return url.replace(ipfsPrefix, "https://ipfs.blockfrost.dev/ipfs/");
      return url.replace(ipfsPrefix, "https://ipfs.io/ipfs/");
    }
  }

  useEffect(() => {
    mounted = true;
    // Only set loading if image hasn't been loaded before
    if (!loadedImages.get(box?.ipfs_art_hash || box?.ipfs_art_url)) {
      setIsLoading(true);
    }
    setIsError(false);

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

      fileLink = tempLink;
    }

    if (fileLink) {
      setFileSrc(fileLink);
    } else {
      setIsError(true);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [box]);

  const handleImageError = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      // Add a small delay before retrying
      setTimeout(() => {
        if (mounted) {
          setFileSrc(fileSrc + '?' + new Date().getTime());
        }
      }, 1000);
    } else {
      setIsError(true);
      setIsLoading(false);
      // Remove from cache if error
      loadedImages.delete(box?.ipfs_art_hash || box?.ipfs_art_url);
    }
  };

  if (tokenType === "audio") {
    return (
      <div className="max-w-40 m-auto flex flex-col">
        <img
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
          onError={handleImageError}
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
            src={box.audioUrl}
          />
        )}
      </div>
    );
  } else if (tokenType === "video") {
    if (!fileSrc) {
      return <LoadingCircle />;
    }
    return (
      <ReactPlayer
        loop={true}
        volume={thumbnail ? 0 : 0.8}
        muted={thumbnail ? true : false}
        playing={thumbnail && autoPlay ? true : false}
        url={[{ src: fileSrc }]}
        controls={thumbnail ? false : true}
        width="100%"
        height="100%"
        config={{
          file: {
            attributes: {
              controlsList: "nodownload",
              style: { height: "100%", objectFit: "cover", margin: "auto" },
            },
          },
        }}
      />
    );
  } else {
    return (
      <div className="w-full h-full">
        {isLoading && !isError && !isLoaded && (
          <div className="animate-pulse">
            <div className="aspect-square">
              <div className="flex h-full w-full items-center justify-center p-8">
                <LoadingCircle />
              </div>
            </div>
          </div>
        )}
        <div
          className={`${isLoaded ? "block" : "hidden"} w-full h-full`}
          style={{ borderRadius: borderRad }}
        >
          <img
            key={`${fileSrc}-${retryCount}`}
            className={`w-full h-full m-auto ${
              ratio === "square" && `object-cover`
            } ${
              imgWidth > 200 ? "display-image" : "display-image-pixelated"
            }`}
            onLoad={onImgLoad}
            loading={lazyLoad ? "lazy" : "eager"}
            alt={box.token_id}
            onError={handleImageError}
            overflow="hidden"
            src={fileSrc ? fileSrc : ""}
          />
        </div>
        {isError && !isLoading && (
          <div className="flex h-full items-center justify-center text-center">
            <MdOutlineImageNotSupported className="w-[70%] h-[70%]" />
          </div>
        )}
      </div>
    );
  }
}
