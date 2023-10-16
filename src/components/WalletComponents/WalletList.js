import React, { Fragment, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { setTokens } from "../../redux/reducers/walletSlice";
import { useSelector, useDispatch } from "react-redux";
import axios, { Axios } from "axios";
// import {Button, Col, Row,} from 'reactstrap';
import {
  getWalletAddress,
  isAssembler,
  isWalletSaved,
  getWalletConnector,
  friendlyToken,
  friendlyAddress,
} from "../../ergofunctions/helpers";
// import {css} from '@emotion/core';
// import 'react-h5-audio-player/lib/styles.css';
// import ArtworkMedia from "../components/artworkMedia";
import { getTokens } from "../../ergofunctions/walletUtils";

import { decodeArtwork } from "../../ergofunctions/serializer";
// import PropagateLoader from "react-spinners/PropagateLoader";
import { getBalance } from "../../ergofunctions/explorer";
// import NFTInfo from "../NFTInfo";
// import SellForm from "../SellForm";
import LoadingCircle from "../LoadingCircle/LoadingCircle";
import WalletCard from "./WalletCard";
// import MassListForm from "../ModalComponents/MassListForm";

import { useQuery, gql, useApolloClient } from "@apollo/client";
// import BurnButton from "../ModalComponents/BurnButton";
import { GET_ALL_MINT_ADDRESSES } from "../../lib/gqlQueries";
import Fade from "../Fade/Fade";
import LoadingCard from "../NFTCard/LoadingCard";

function WalletList({ artworks, tokensLoading }) {
  let mounted = true;

  // const { colorMode, toggleColorMode } = useColorMode()

  // const router = useRouter();
  // const toast = useToast()

  const client = useApolloClient();

  // Redux
  const userTokens = useSelector((state) => state.wallet.tokens);
  const dispatch = useDispatch();
  const userAddresses = useSelector((state) => state.wallet.addresses);

  const [loading, setLoading] = React.useState(false);
  // const [artworks, setArtworks] = React.useState(userTokens);
  const [filteredArtworks, setFilteredArtworks] = React.useState(userTokens);
  const [LoadingCount, setLoadingCount] = React.useState(0);

  const [selectedForSale, setSelectedForSale] = React.useState([]);
  const [allowMultipleSelect, setAllowMultipleSelect] = React.useState(false);

  const [mintAddresses, setMintAddresses] = React.useState([]);

  // search
  const [search, setSearch] = React.useState("");

  // for loading counter
  const countRef = useRef(LoadingCount);
  countRef.current = LoadingCount;

  // Selected Tokens
  function handleSelect(box) {
    const name = box.assets[0].name;
    const tokenId = box.assets[0].tokenId;

    if (selectedForSale.find((i) => i.id === tokenId)) {
      setSelectedForSale(selectedForSale.filter((i) => i.id !== tokenId));
    } else {
      setSelectedForSale([
        ...selectedForSale,
        {
          id: tokenId,
          name: name,
          ipfs_art_url: box.ipfs_art_url,
          nft_type: box.nft_type,
          royalty: box.royalty,
        },
      ]);
    }
  }

  function handleToggle() {
    if (allowMultipleSelect === true) {
      setSelectedForSale([]);
    }
    setAllowMultipleSelect(!allowMultipleSelect);
  }

  const searchFilter = () => {
    if (search === "") {
      setFilteredArtworks(artworks);
      return;
    }

    setFilteredArtworks(artworks.filter(filterBy(search)));
    return;
  };

  const filterBy = (term) => {
    const escapeRegExp = (str) =>
      str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

    const re = new RegExp(escapeRegExp(term), "i");
    return (item) => {
      for (let prop in item) {
        if (!item.hasOwnProperty(prop)) {
          continue;
        }
        if (re.test(item[prop])) {
          return true;
        }
      }
      return false;
    };
  };

  // Get mint addresses to see if verified:
  async function getAllMintAddresses() {
    let apiCalls = [];

    // for(let address of addresses) {
    //     apiCalls.push(
    //         client.query({query: GET_ALL_MINT_ADDRESSES})
    //     )
    // }

    try {
      const res = await client.query({ query: GET_ALL_MINT_ADDRESSES });

      console.log("RESSSSSS", res);
      // const res = await Promise.all(apiCalls);
      // const data = res.map((res) => res.data.sales);
      setMintAddresses(res.data.mint_addresses);
    } catch {
      throw Error("Couldn't get for sale tokens.");
    }
  }

  function checkMintCollection(mintObj, box) {
    if (!mintObj) {
      return null;
    }

    let verif = JSON.parse(JSON.stringify(mintObj));
    if (
      mintObj.address === "9hCqMZy97mi5qooyKzEWSJB4dcdCBoY4FRykNrcNy3wqcgZ4ayH"
    ) {
      if (box.nft_name.includes("Ergoat")) {
        verif.address_collection.name = "Screaming Ergoat Wine Club";
        verif.address_collection.sys_name = "ergoats";
      } else if (box.nft_name.startsWith("Gnomekin #")) {
        verif.address_collection.name = "Gnomekins";
        verif.address_collection.sys_name = "gnomekins";
      } else if (
        box.nft_name.includes("Ergnome") ||
        box.nft_name.includes("ERGnome")
      ) {
        verif.address_collection.name = "ERGnomes";
        verif.address_collection.sys_name = "ergnomes";
      } else if (box.nft_name.includes("SigmaWorlds")) {
        verif.address_collection.name = "Sigma Worlds";
        verif.address_collection.sys_name = "sigmaworlds";
      }
    }

    return verif;
  }

  React.useEffect(() => {
    getAllMintAddresses();
  }, []);

  React.useEffect(() => {
    searchFilter();
  }, [search, artworks]);
  // React.useEffect(() => {
  //     setFilteredArtworks(artworks);
  // }, [artworks])

  return (
    <div>
      <div>
        {/* <InputGroup variant={"filled"} size="lg">
                    <Input isDisabled={tokensLoading} defaultValue={search} onChange={(e)=>setSearch(e.target.value)} placeholder='Search your NFTs' size='lg' />
                    <InputRightElement ><SearchIcon color={"gray.500"} /></InputRightElement>
                </InputGroup>
                <HStack mt="4" height={"38px"} justifyContent="space-between">
                    <Checkbox isDisabled={tokensLoading} size={"lg"} colorScheme={"orange"} mr="2" isChecked={allowMultipleSelect} onChange={handleToggle}>Select Multiple</Checkbox>
                        <HStack>
                            <div zIndex={50}>
                                <BurnButton selectedTokens={selectedForSale} disabled={selectedForSale.length === 0 || !allowMultipleSelect}/>
                            </div>
                            <div zIndex={50}>
                                <MassListForm selectedTokens={selectedForSale} disabled={selectedForSale.length === 0 || !allowMultipleSelect} />
                            </div>
                            

                        </HStack>
                </HStack> */}
      </div>

      <div>
        {/* {loading && <Text fontSize={"sm"} color="gray.500" mb="4" textAlign={"center"}>Reloading NFTs... {LoadingCount} loaded.</Text>} */}
        {tokensLoading && (
          <p className="my-3 text-center text-gray-500">
            Loading NFTs, this may take a while. You can view the{" "}
            <span as="span" fontWeight={"semibold"}>
              For Sale
            </span>{" "}
            and{" "}
            <span fontWeight={"semibold"} as="span">
              Sold
            </span>{" "}
            tabs while you wait.
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {tokensLoading
            ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => {
                return <LoadingCard key={item} />;
              })
            : filteredArtworks.map((box) => {
                let verifObject = mintAddresses.find(
                  (i) => i.address === box.artist
                );
                let finalObj;
                if (verifObject) {
                  finalObj = checkMintCollection(verifObject, box);
                }

                return (
                  // <Fade key={box.tokenId} fadeKey={box.tokenId}>
                  <div key={box.assets[0].tokenId}>
                    {/* {allowMultipleSelect && <Checkbox mb="2"  onChange={() => handleSelect(box.assets[0].tokenId, box.assets[0].name)} isChecked={selectedForSale.find(i => i.id === box.assets[0].tokenId) !== undefined}>Select</Checkbox>} */}
                    <div
                      onClick={
                        allowMultipleSelect ? () => handleSelect(box) : null
                      }
                    >
                      <WalletCard
                        verified={finalObj}
                        currentlySelecting={allowMultipleSelect}
                        selected={selectedForSale.find(
                          (i) => i.id === box.assets[0].tokenId
                        )}
                        box={box}
                      />
                    </div>
                  </div>
                  // </Fade>
                );
              })}
        </div>
      </div>
    </div>
  );
}

export default WalletList;
