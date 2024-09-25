import React, { Fragment, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import "react-h5-audio-player/lib/styles.css";
import ReactPlayer from "react-player";
import {
  decodeArtwork,
  longToCurrency,
  resolveIpfs,
} from "../../ergofunctions/serializer";
import {
  friendlyToken,
  extractMetadata,
  isJson,
  msToTime,
  friendlyAddress,
} from "../../ergofunctions/helpers";
// import LoadingCircle from "../LoadingCircle";
import ArtworkMedia from "../artworkMedia";

import { useSelector, useDispatch } from "react-redux";

// GraphQL
import { withApollo } from "../../lib/withApollo";
import { useQuery, gql, useApolloClient } from "@apollo/client";

import {
  cloudinaryOptimizerUrl,
  globalMeta,
  ipfsGateway,
  supportedCurrencies,
  v1ErgAddress,
} from "../../ergofunctions/consts";
// import TokenPrevSales from "../TokenPrevSales";
import { buyNFT } from "../../ergofunctions/marketfunctions/buyNFT";
import { buyTokenNFT } from "../../ergofunctions/marketfunctions/buyTokenNFT";
import { refund } from "../../ergofunctions/marketfunctions/refund";
import ShowMetadata from "../ShowMetadata";
// import RecentlyListed from "./RecentlyListed";
// import BuyNFTButton from "../BuyNFTButton";
// import SEOHead from "../SEOHead";
// import ImgixClient from "@imgix/js-core";
import { CHECK_MINT_ADDRESS } from "../../lib/gqlQueries";
import BuyNFTButton from "../BuyNFTButton/BuyNFTButton";
import LoadingCircle from "../LoadingCircle/LoadingCircle";
import SEOHead from "../SEOHead";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { BsCheckCircleFill } from "react-icons/bs";
import TokenPrevSales from "./TokenPrevSales";
import RecentlyListed from "./RecentlyListed";
import { FaRegCopy } from "react-icons/fa";
import toast from "react-hot-toast";

const GET_TOKEN_PAGE = gql`
  query getTokenSales($tokenId: String) {
    tokens(where: { token_id: { _eq: $tokenId } }) {
      nft_name
      nft_type
      nft_hash
      nft_desc
      ipfs_art_hash
      ipfs_audio_url
      ipfs_art_url
      royalty_address
      royalty_ergotree
      royalty_int
      token_id
      total_existing
      token_collection {
        sys_name
        name
        id
        verified
      }
      sales(
        where: { status: { _eq: active } }
        order_by: { nerg_sale_value: asc }
      ) {
        box_id
        box_json
        buyer_address
        buyer_ergotree
        completion_time
        creation_height
        currency
        creation_tx
        id
        list_time
        nerg_royalty_value
        nerg_sale_value
        nerg_service_value
        sales_address_id
        seller_address
        seller_ergotree
        spent_tx
        status
        token_amount
        token_id
        sales_address {
          id
          address
        }
      }
    }
  }
`;

// const imgClient = new ImgixClient({
//   domain: "skyharbor.imgix.net",
//   secureURLToken: process.env.NEXT_PUBLIC_IMGIX_TOKEN,
// });

interface TokenPageProps {
  token: string;
}

function TokenPage({ token }: TokenPageProps) {
  let mounted = true;
  const router = useRouter();
  const client = useApolloClient();

  // img data
  const [imgHeight, setImgHeight] = React.useState(0);
  const [imgWidth, setImgWidth] = React.useState(0);

  const [tokenInfo, setTokenInfo] = React.useState<any>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [modalType, setModalType] = React.useState<string>("info");
  const [transactionId, setTransactionId] = React.useState<string>("");
  const [isError, setIsError] = React.useState<boolean>(false);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

  const [tokenImage, setTokenImage] = React.useState<string | null>(null);

  const userAddresses = useSelector((state: any) => state.wallet.addresses);

  // Copy text
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"))
  };

  const gotoCollection = (sys: string) => {
    router.push(`/collection/${sys}`);
  };

  const gotoTransaction = (TID: string) => {
    window.open(
      `https://explorer.ergoplatform.com/en/transactions/${TID}`,
      "_blank"
    );
  };

  async function loadArtworks() {
    let decoded: any[] = [];
    const dec = await decodeArtwork(null, token);
    if (!dec) {
      return;
    }
    decoded = decoded.concat([dec]);

    try {
      console.log("decoded", decoded[0].artist);

      const res = await client.query({
        query: CHECK_MINT_ADDRESS,
        variables: {
          mintaddress: decoded[0].artist,
        },
      });
      console.log(res.data);
      const coll = res.data.collections[0];
      if (coll) {
        decoded[0].collection_name = coll.name;
        decoded[0].collection_sys_name = coll.sys_name;
        decoded[0].verified_collection = coll.verified;
      }
    } catch (err) {
      console.error("Error getting collection: ", err);
    }

    if (mounted) {
      setTokenInfo(decoded[0]);
    }
  }

  async function initializePage() {
    let graphqlData;
    try {
      graphqlData = await client.query({
        query: GET_TOKEN_PAGE,
        variables: {
          tokenId: token,
        },
      });
    } catch (err) {
      console.log("Error", err);
    }

    if (!graphqlData || graphqlData.data.tokens.length === 0) {
      loadArtworks();
      console.log("Token does not exist on DB");
    } else {
      console.log("Token exists on DB");

      const item = graphqlData.data.tokens[0];
      const tempToken = {
        token_id: item.token_id,
        tokenId: item.token_id,
        nft_name: item.nft_name,
        nft_desc: item.nft_desc,

        collection_name: item.token_collection.name,
        collection_sys_name: item.token_collection.sys_name,
        verified_collection: item.token_collection.verified,

        sales_address:
          item.sales.length > 0 ? item.sales[0].sales_address.address : null,
        box_json: item.sales.length > 0 ? item.sales[0].box_json : null,
        nerg_sale_value:
          item.sales.length > 0 ? item.sales[0].nerg_sale_value : null,
        seller_address:
          item.sales.length > 0 ? item.sales[0].seller_address : null,
        currency: item.sales.length > 0 ? item.sales[0].currency : null,
        box_id: item.sales.length > 0 ? item.sales[0].box_id : null,

        ipfs_art_hash: item.ipfs_art_hash,
        ipfs_art_url: item.ipfs_art_url,
        nft_type: item.nft_type,
      };

      setTokenInfo(tempToken);
      let tempLink = null;
      if (tempToken.nft_type === "image") {
        tempLink = tempToken.ipfs_art_hash
          ? `${ipfsGateway}/${tempToken.ipfs_art_hash}`
          : `${tempToken.ipfs_art_url}`;
        setTokenImage(tempLink);
      }
    }
  }

  useEffect(() => {
    mounted = true;

    if (client) {
      initializePage();
    }

    return () => {
      mounted = false;
    };
  }, [client]);

  if (isError) {
    return <p className="text-red-500">Error getting token</p>;
  } else if (!tokenInfo) {
    return (
      <div className="m-auto w-12 mt-12">
        <LoadingCircle />
      </div>
    );
  }

  // ****If token is for sale****
  let currencyObject;
  if (tokenInfo.sales_address) {
    currencyObject = supportedCurrencies.find(
      (l) => l.contractAddress === tokenInfo.sales_address
    );

    if (!currencyObject) {
      currencyObject = supportedCurrencies[0]; // Automatically set to ERG if there is none
    }
  }

  const nftPrice = tokenInfo.nerg_sale_value
    ? (
        Math.round(
          longToCurrency(
            parseInt(tokenInfo.nerg_sale_value),
            currencyObject?.decimal
          ) * 1000
        ) / 1000
      ).toLocaleString("en-US")
    : "";
  const ownedNFT = userAddresses
    ? userAddresses.includes(tokenInfo.seller_address)
    : false;

  return (
    <div>
      <SEOHead
        canonicalUrl={`https://www.skyharbor.io/token/${token}`}
        title={`${tokenInfo.nft_name} | SkyHarbor`}
        description={`${
          isJson(tokenInfo.nft_desc)
            ? globalMeta.description
            : tokenInfo.nft_desc
        } | SkyHarbor`}
        // ogImgUrl={tokenImage}
        ogType="website"
      >
        <div className="invisible"></div>
      </SEOHead>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{tokenInfo.nft_name}</h1>
        {tokenInfo.collection_name && (
          <div className="flex items-center justify-center mt-2 mb-3">
            <p
              className={`text-xl font-semibold cursor-pointer ${
                tokenInfo.verified_collection
                  ? "text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => gotoCollection(tokenInfo.collection_sys_name)}
            >
              {tokenInfo.verified_collection
                ? tokenInfo.collection_name
                : `Unverified (${friendlyAddress(
                    tokenInfo.collection_name,
                    4
                  )})`}
            </p>
            {tokenInfo.verified_collection && (
              <BsCheckCircleFill className="h-5 w-5 ml-2 text-blue-500" />
            )}
          </div>
        )}

        <div className="flex items-center justify-center text-sm">
          <span className="text-gray-500">Token ID:</span>
          <button
            className="ml-2 px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            onClick={() => handleCopy(tokenInfo.tokenId)}
          >
            <span className="text-gray-700">{friendlyToken(tokenInfo.tokenId, 8)}</span>
            <FaRegCopy className="ml-2 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-8">
        <div className="w-full lg:w-1/3">
          <div className="overflow-hidden">
            <a
              href={resolveIpfs(tokenInfo.ipfs_art_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70"
            >
              <ArtworkMedia
                borderRad={8}
                box={tokenInfo}
                thumbnail={false}
                // maxHeight={"70vh"}
                ratio="regular"
              />
            </a>
          </div>
        </div>

        <div className="w-full lg:w-2/3 mt-8">
          {tokenInfo.sales_address && (
            <div className="mt-4 mb-8">
              <p className="mb-2 font-semibold text-2xl">
                On sale for {nftPrice} {currencyObject?.displayName}
              </p>
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
              />{" "}
            </div>
          )}

          <h2 className="mb-2 font-semibold text-2xl">Properties</h2>
          <div className="mt-1 text-md text-gray-500">
            <ShowMetadata description={tokenInfo.nft_desc} />
          </div>

          <div>
            <h2 className="mt-8 mb-2 font-semibold text-2xl">Previous Sales</h2>
            <TokenPrevSales tokenId={token} expanded={false} />
          </div>
        </div>
      </div>

      {tokenInfo.collection_name && (
        <div className="mt-12">
          <RecentlyListed
            collection={tokenInfo.collection_sys_name}
            collection_name={tokenInfo.collection_name}
            verified={tokenInfo.verified_collection}
          />
        </div>
      )}
    </div>
  );
}

export default withApollo()(TokenPage);
