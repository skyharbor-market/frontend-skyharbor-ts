import React, { useEffect, useState, useCallback, memo } from "react";
import { MdOutlineImageNotSupported } from "react-icons/md";
import { ipfsGateway } from "../ergofunctions/consts";
import LoadingCircle from "./LoadingCircle/LoadingCircle";
import AudioPlayer from "react-h5-audio-player";
import ReactPlayer from "react-player";
import "react-h5-audio-player/lib/styles.css";

// Move cache outside component to persist between renders
const loadedImages = new Map();

const ArtworkMedia = memo(function ArtworkMedia({
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
  const [imageState, setImageState] = useState({
    height: 0,
    width: 0,
    isError: false,
    isLoading: true, // Always start loading
    isLoaded: false, // Don't rely on cache for initial state
    retryCount: 0
  });

  const [fileSrc, setFileSrc] = useState("");
  const MAX_RETRIES = 3;

  const tokenType = box?.nft_type ?? box?.token?.nft_type;

  const onImgLoad = useCallback(({ target: img }) => {
    setImageState(prev => ({
      ...prev,
      height: img.naturalHeight,
      width: img.naturalWidth,
      isLoaded: true,
      isLoading: false,
      isError: false
    }));
    loadedImages.set(box?.ipfs_art_hash || box?.ipfs_art_url, true);
  }, [box]);

  const handleImageError = useCallback(() => {
    setImageState(prev => {
      if (prev.retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setFileSrc(curr => curr + '?' + Date.now());
        }, 1000);
        
        return {
          ...prev,
          retryCount: prev.retryCount + 1,
          isLoading: true
        };
      }
      
      loadedImages.delete(box?.ipfs_art_hash || box?.ipfs_art_url);
      return {
        ...prev,
        isError: true,
        isLoading: false
      };
    });
  }, [MAX_RETRIES, box]);

  useEffect(() => {
    const getFileLink = () => {
      if (!box) return null;
      
      if (tokenType === "video" || tokenType === "audio") {
        return box.ipfs_art_hash
          ? `https://ipfs.blockfrost.dev/ipfs/${box.ipfs_art_hash}`
          : box.ipfs_art_url;
      }
      
      return box.ipfs_art_hash
        ? `${ipfsGateway}/${box.ipfs_art_hash}`
        : box.ipfs_art_url;
    };

    const fileLink = getFileLink();
    if (fileLink) {
      setFileSrc(fileLink);
      // Don't update loading state here - let image load event handle it
    } else {
      setImageState(prev => ({
        ...prev,
        isError: true,
        isLoading: false
      }));
    }
  }, [box, tokenType]);

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
          className={`${imageState.width > 200 ? "display-image" : "display-image-pixelated"}`}
          src={fileSrc || "/assets/images/quokka.webp"}
        />
        {!wallet && (
          <AudioPlayer
            autoPlay={false}
            customAdditionalControls={[]}
            showSkipControls={false}
            showJumpControls={false}
            showFilledVolume={false}
            defaultCurrentTime="00:00"
            layout="horizontal"
            width="100%"
            src={box.audioUrl}
          />
        )}
      </div>
    );
  }

  if (tokenType === "video") {
    if (!fileSrc) return <LoadingCircle />;
    
    return (
      <ReactPlayer
        loop
        volume={thumbnail ? 0 : 0.8}
        muted={thumbnail}
        playing={thumbnail && autoPlay}
        url={[{ src: fileSrc }]}
        controls={!thumbnail}
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
  }

  return (
    <div className="w-full h-full">
      {imageState.isLoading && !imageState.isError && (
        <div className="animate-pulse">
          <div className="aspect-square">
            <div className="flex h-full w-full items-center justify-center p-8">
              <LoadingCircle />
            </div>
          </div>
        </div>
      )}
      
      <div
        className={`${imageState.isLoaded ? "block" : "hidden"} w-full h-full`}
        style={{ borderRadius: borderRad }}
      >
        <img
          key={`${fileSrc}-${imageState.retryCount}`}
          className={`w-full h-full m-auto ${
            ratio === "square" ? "object-cover" : ""
          } ${imageState.width > 200 ? "display-image" : "display-image-pixelated"}`}
          onLoad={onImgLoad}
          loading={lazyLoad ? "lazy" : "eager"}
          alt={box?.token_id || "NFT"}
          onError={handleImageError}
          src={fileSrc}
        />
      </div>

      {imageState.isError && !imageState.isLoading && (
        <div className="flex h-full items-center justify-center text-center">
          <MdOutlineImageNotSupported className="w-[70%] h-[70%]" />
        </div>
      )}
    </div>
  );
});

export default ArtworkMedia;
