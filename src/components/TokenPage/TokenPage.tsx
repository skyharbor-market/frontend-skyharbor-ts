import React, { Fragment, useEffect } from "react";
// import Image from 'next/image'
import Head from "next/head";
import {
  Heading,
  Box,
  Text,
  Stack,
  useToast,
  Tooltip,
  SimpleGrid,
  HStack,
  Link,
  Image,
  Fade,
  TableContainer,
  Table,
  Tr,
  Thead,
  Tbody,
  Th,
  Td,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
// import AudioPlayer from "react-h5-audio-player";
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
import LoadingCircle from "../LoadingCircle";
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
import TokenPrevSales from "../TokenPrevSales";
import { buyNFT } from "../../ergofunctions/marketfunctions/buyNFT";
import { buyTokenNFT } from "../../ergofunctions/marketfunctions/buyTokenNFT";
import { refund } from "../../ergofunctions/marketfunctions/refund";
import { CheckCircleIcon, EditIcon } from "@chakra-ui/icons";
import ShowMetadata from "../ShowMetadata";
import RecentlyListed from "./RecentlyListed";
import BuyNFTButton from "../BuyNFTButton";
import SEOHead from "../SEOHead";
import ImgixClient from "@imgix/js-core";
import { CHECK_MINT_ADDRESS } from "../../lib/gqlQueries";

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

const imgClient = new ImgixClient({
  domain: "skyharbor.imgix.net",
  secureURLToken: process.env.NEXT_PUBLIC_IMGIX_TOKEN,
});

function TokenPage({ token }) {
  let mounted = true;
  const router = useRouter();
  const toast = useToast();
  const client = useApolloClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  // img data
  const [imgHeight, setImgHeight] = React.useState(0);
  const [imgWidth, setImgWidth] = React.useState(0);

  const [tokenInfo, setTokenInfo] = React.useState();
  const [submitting, setSubmitting] = React.useState();
  const [modalType, setModalType] = React.useState("info");
  const [transactionId, setTransactionId] = React.useState("");
  const [isError, setIsError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const [tokenImage, setTokenImage] = React.useState(null);

  const userAddresses = useSelector((state) => state.wallet.addresses);

  // Hasura
  // const { loading, error, data } = useQuery(GET_TOKEN_PAGE, {
  //   variables: {
  //     tokenId: token,
  //   }
  // })

  // Copy text
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() =>
      toast({
        title: "Copied",
        // description: "We've created your account for you.",
        position: "bottom",
        status: "info",
        duration: 2000,
        isClosable: true,
      })
    );
  };

  const gotoCollection = (sys) => {
    // navigate("/explore")
    router.push(`/collection/${sys}`);
  };

  const gotoTransaction = (TID) => {
    window.open(
      `https://explorer.ergoplatform.com/en/transactions/${TID}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  };

  async function loadArtworks() {
    // setLoading(true)
    let ids = [];
    let amounts = {};

    let decoded = [];
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
      // const res = await Promise.all(apiCalls);
      // const data = res.map((res) => res.data.sales);
      // const coll = res.data.mint_addresses.find(x => x.address === decoded[0].artist)
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
        // const fileLink = imgClient.buildURL(tempLink, {
        //   "max-w": 500,
        //   "max-h": 500,
        //   // w: imageFit === "clip" ? sizeExpanded : null,
        //   // h:  imageFit === "clip" ? sizeExpanded : null,
        //   fit: "crop",
        //   auto: "format,compress",
        //   fm:"webm",
        //   // frame: thumbnail ? 1 : null
        // });
        setTokenImage(tempLink);
      }
    }
  }

  // Check if the data is json
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
    return <Text>Error getting token</Text>;
  } else if (!tokenInfo) {
    return (
      // <Text>Loading...</Text>
      <Box textAlign={"center"}>
        <LoadingCircle />
      </Box>
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
            currencyObject.decimal
          ) * 1000
        ) / 1000
      ).toLocaleString("en-US")
    : "";
  const ownedNFT = userAddresses
    ? userAddresses.includes(tokenInfo.seller_address)
    : false;

  return (
    <Box>
      <SEOHead
        canonicalUrl={`https://www.skyharbor.io/token/${token}`}
        title={`${tokenInfo.nft_name} | SkyHarbor`}
        description={`${
          isJson(tokenInfo.nft_desc)
            ? globalMeta.description
            : tokenInfo.nft_desc
        } | SkyHarbor`}
        ogImgUrl={tokenImage}
        ogType="website"
      />

      {/* <Head>
            <title>{tokenInfo.nft_name} | SkyHarbor</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />

            <meta name="twitter:card" content="Welcome to the premium NFT marketplace on the Ergo blockchain. Buy and sell NFTs with ease." key="twcard" />
            <meta name="twitter:creator" content={"@skyharbor_io"} key="twhandle" />

            <meta name="og:url" content={`https://www.skyharbor.io/marketplace`} key="ogurl" />
            <meta name="og:image" content={`${cloudinaryOptimizerUrl}/${transformType}/${tempLink}${resourceType}`} key="ogimage" />
            <meta name="og:site_name" content={"SkyHarbor"} key="ogsitename" />
            <meta name="og:title" content={`${tokenInfo.nft_name} | SkyHarbor`} key="ogtitle" />
            <meta name="og:description" content={`${tokenInfo.nft_desc} | SkyHarbor`} key="ogdesc" />
        </Head> */}

      <Box mb="8" textAlign={"center"}>
        <Heading>{tokenInfo.nft_name}</Heading>
        {tokenInfo.collection_name && (
          <Text
            cursor={"pointer"}
            onClick={() => gotoCollection(tokenInfo.collection_sys_name)}
            fontSize={"xl"}
            fontWeight={"semibold"}
            color={tokenInfo.verified_collection === true ? "blue.500" : "grey"}
            mt="1"
            mb="1"
          >
            {tokenInfo.verified_collection === true
              ? tokenInfo.collection_name
              : `Unverified (${friendlyAddress(tokenInfo.collection_name, 4)})`}
            {tokenInfo.verified_collection === true && (
              <CheckCircleIcon
                ml="2"
                textAlign={"right"}
                color={colorMode === "light" ? "blue.500" : "blue.300"}
                fontSize={"xl"}
              />
            )}
          </Text>
        )}

        <Text fontWeight={"semibold"}>
          Token ID:
          <Tooltip label="Copy">
            <Text
              cursor={"pointer"}
              as={"span"}
              color="blue.500"
              onClick={() => handleCopy(tokenInfo.tokenId)}
            >
              {" "}
              {friendlyToken(tokenInfo.tokenId, 8)}
            </Text>
          </Tooltip>
          {/* <Text as="span" onClick={()=>handleCopy(tokenInfo.NFTID)} color="blue.500"  fontSize={"lg"}> {friendlyToken(tokenInfo.NFTID, 6)}</Text> */}
        </Text>
      </Box>

      <Stack
        spacing={{ base: 4, md: 8 }}
        direction={{ base: "column", lg: "row" }}
        justifyContent="space-between"
      >
        <Box
          width="100%"
          // maxW={"500px"}
          pr={{ base: 0, md: 4 }} //w={{base: "100%", lg: "50%"}}//m="auto" w={{base: "100%", lg: "50%"}}
        >
          {/* <Box mb="6" textAlign={"center"}
        w={{base: "100%", md: "50%"}}
        > */}
          {/* <Text color="blue.500" fontWeight={"semibold"} fontSize={"lg"}>CollectionName</Text> */}

          {/* <Text>{tokenInfo.nft_desc}</Text> */}
          {/* <Box mt="4">
            <Button disabled isFullWidth size={"lg"}>Not For Sale</Button>
          </Box> */}
          {/* </Box> */}

          {/* <Fade in={isLoaded}> */}
          {/* <AspectRatio ratio={1} height={"100%"} width={"100%"} overflow="hidden"> */}
          <Box
            className="image-container"
            overflow={"hidden"}
            // borderRadius={8}
            // boxShadow={"xl"}
            // maxWidth="100%"
            height={"100%"}
            width="100%"
            // minHeight={"300px"}
          >
            {/* { tokenInfo.sales_address ?
              <ArtworkMedia box={tokenInfo} thumbnail={false} maxHeight={"70vh"} ratio="regular" />
              :
              <ArtworkMedia box={tokenInfo} thumbnail={false} maxHeight={"70vh"} cloudinary={false} ratio="regular" />
              } */}
            <Link
              href={resolveIpfs(tokenInfo.ipfs_art_url)}
              target="_blank"
              _hover={{ opacity: 0.7 }}
            >
              <a>
                <ArtworkMedia
                  borderRad={8}
                  box={tokenInfo}
                  thumbnail={false}
                  maxHeight={"70vh"}
                  // cloudinary={false}
                  ratio="regular"
                />
              </a>
            </Link>
          </Box>
          {/* </AspectRatio> */}
          {/* </Fade> */}
        </Box>

        {/* <DisplayContent /> */}
        {/* <Image height={300} width={300} objectFit="cover" src={resolveIpfs(toUtf8String(tokenBox.additionalRegisters.R9).substr(2))} /> */}

        <Box mt="8" width="100%" maxW={{ base: "100%", lg: "50%" }}>
          {/* BUY BUTTON */}
          {tokenInfo.sales_address && (
            <Box mt="4" mb="8">
              <Text mb="2" fontWeight={"semibold"} fontSize={"2xl"}>
                On sale for {nftPrice} {currencyObject.displayName}
              </Text>
              {/* {buyButton()} */}
              <BuyNFTButton ownedNFT={ownedNFT} box={tokenInfo} />
            </Box>
          )}

          <Text mb="2" fontWeight={"semibold"} fontSize={"2xl"}>
            Properties
          </Text>
          {/* <Text>{extractMetadata(tokenInfo.nft_desc)}</Text> */}
          {/* {tokenInfo.nft_desc} */}

          <Box mt="1" fontSize={"md"} color="gray.500">
            <ShowMetadata description={tokenInfo.nft_desc} />
          </Box>

          <Box>
            <Text mt="8" mb="2" fontWeight={"semibold"} fontSize={"2xl"}>
              Previous Sales
            </Text>
            <TokenPrevSales tokenId={token} expanded />
          </Box>
        </Box>
      </Stack>

      <Modal size="lg" isOpen={isOpen} onClose={() => onClose()}>
        <ModalOverlay />
        <ModalContent color="black" overflow="hidden" margin="4">
          <ModalCloseButton
            size={"lg"}
            color={colorMode === "light" ? "black" : "white"}
          />
          <ModalBody mt="8" mb="3">
            <Box mb="4">
              <Heading
                fontSize="xl"
                mb="4"
                color={colorMode === "light" ? "black" : "white"}
              >
                Transaction Submitted
              </Heading>
              <Box textAlign={"center"} w="100%" mb="8" mt="8">
                <CheckCircleIcon fontSize={"6xl"} color="green.400" />
              </Box>
              <Button
                mb="6"
                isFullWidth
                colorScheme="green"
                variant={"outline"}
                onClick={() => gotoTransaction(transactionId)}
              >
                View Tx on Explorer
              </Button>
              <Text
                mb="1"
                fontWeight={"semibold"}
                fontSize={"lg"}
                color={colorMode === "light" ? "black" : "white"}
              >
                Transaction ID:{" "}
                <Text as="span" color="green.400">
                  {transactionId}
                </Text>
              </Text>
              <Text fontSize={"sm"} color={"gray.400"}>
                Now we wait until it is confirmed on the blockchain. It should
                take about 2-10 minutes.
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {tokenInfo.collection_name && (
        <Box mt="12">
          <RecentlyListed
            collection={tokenInfo.collection_sys_name}
            collection_name={tokenInfo.collection_name}
            verified={tokenInfo.verified_collection}
          />
        </Box>
      )}
    </Box>
  );
}

export default withApollo()(TokenPage);
