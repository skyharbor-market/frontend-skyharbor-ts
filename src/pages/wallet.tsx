// @ts-nocheck

import React, { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { setTokens } from "../redux/reducers/walletSlice";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
// import {Button, Col, Row,} from 'reactstrap';
import {
  getWalletAddress,
  isAssembler,
  isWalletSaved,
  getWalletConnector,
  friendlyToken,
  friendlyAddress,
} from "../ergofunctions/helpers";
// import {css} from '@emotion/core';
// import 'react-h5-audio-player/lib/styles.css';
// import ArtworkMedia from "../components/artworkMedia";
import { getTokens } from "../ergofunctions/walletUtils";

import { decodeArtwork, decodeNFT } from "../ergofunctions/serializer";
// import PropagateLoader from "react-spinners/PropagateLoader";
import { getBalance } from "../ergofunctions/explorer";
import UserListedTokens from "../components/WalletComponents/UserListedTokens";
import WalletList from "../components/WalletComponents/WalletList";

import { motion } from "framer-motion";
import UserActivity from "../components/WalletComponents/UserActivity";
import Tabs from "@/components/Tabs/Tabs";
import { FaChevronDown, FaChevronUp, FaImage, FaUserMd } from "react-icons/fa";
import { ImPriceTag } from "react-icons/im";
import { MdOutlineSell, MdSell } from "react-icons/md";
import SEO from '@/components/SEO/SEO';

export default function WalletPage() {
  let mounted = true;

  // const { colorMode, toggleColorMode } = useColorMode()

  // const router = useRouter();
  // const toast = useToast()

  // Redux
  const {addresses: userAddresses, tokens: userTokens} = useSelector((state) => state.wallet);
  const dispatch = useDispatch();
  // const userAddresses = useSelector((state) => state.wallet.addresses);
  console.log("userAddresses,", userAddresses)

  const [loading, setLoading] = React.useState(false);
  const [artworks, setArtworks] = React.useState(userTokens);
  const [filteredArtworks, setFilteredArtworks] = React.useState(userTokens);
  const [walletSaved, setWalletSaved] = React.useState(false);
  const [totalArtworks, setTotalArtworks] = React.useState(0);
  const [LoadingCount, setLoadingCount] = React.useState(0);

  const [openAddresses, setOpenAddresses] = React.useState(false);

  const [currentTab, setCurrentTab] = useState("for_sale");

  // for loading counter
  const countRef = useRef(LoadingCount);
  countRef.current = LoadingCount;

  async function getTokensFromAddress(addr) {
    let tokens = {}(
      await getBalance(addr).tokens.forEach((ass) => {
        if (!Object.keys(tokens).includes(ass.tokenId))
          tokens[ass.tokenId] = {
            amount: 0,
            name: ass.name,
            tokenId: ass.tokenId,
          };
        tokens[ass.tokenId].amount += parseInt(ass.amount);
      })
    );
  }

  async function gqlGetTokens() {
    setLoading(true);
    let ids = [];
    let amounts = {};

    try {
      // Get wallet address/addresses
      const dappConnector = getWalletConnector();
      if (dappConnector === "nautilus" || dappConnector === "safew") {
        const tokens = await getTokens();
        ids = Object.keys(tokens);
        ids.forEach((key) => (amounts[key] = tokens[key].amount));
      } else {
        ids = (await getBalance(getWalletAddress())).tokens.map((tok) => {
          amounts[tok.tokenId] = tok.amount;
          return tok.tokenId;
        });
      }

      let decoded = [];
      let apiCalls = [];

      // Create array of promises for each token decode attempt
      for (let i = 0; i < ids.length; i++) {
        apiCalls.push(
          decodeArtwork(null, ids[i], false)
            .then(result => ({
              status: 'fulfilled',
              value: result
            }))
            .catch(error => ({
              status: 'rejected',
              tokenId: ids[i],
              error
            }))
        );
      }

      // Wait for all promises to settle
      const results = await Promise.all(apiCalls);

      // Filter successful decodes and log errors
      decoded = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
        .flat();

      // Log failed decodes for debugging
      const failedDecodes = results.filter(result => result.status === 'rejected');
      if (failedDecodes.length > 0) {
        console.warn('Failed to decode some tokens:', failedDecodes);
      }

      // Add amounts to successfully decoded tokens
      for (let d of decoded) {
        if (d?.tokenId) {
          d.amount = amounts[d.tokenId];
        }
      }

      // Filter NFTs and save to redux
      const filteredNFTs = decoded.filter((bx) => bx?.isArtwork);
      
      console.log("Decoded NFTs:", filteredNFTs);
      
      dispatch(setTokens(filteredNFTs));
      setArtworks(filteredNFTs);
      setLoading(false);

    } catch (err) {
      console.error("Error getting tokens:", err);
      // Still update state with any tokens we managed to decode
      if (decoded?.length > 0) {
        const filteredNFTs = decoded.filter((bx) => bx?.isArtwork);
        dispatch(setTokens(filteredNFTs));
        setArtworks(filteredNFTs);
      }
      setLoading(false);
    }
  }

  // const searchFilter = () => {
  //     if(search === "") {
  //         setFilteredArtworks(artworks)
  //         return
  //     }

  //     setFilteredArtworks(artworks.filter(filterBy(search)))
  //     return
  // }

  // const filterBy = (term) => {
  //     const escapeRegExp = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

  //     const re = new RegExp(escapeRegExp(term), 'i')
  //     return item => {
  //       for (let prop in item) {
  //         if (!item.hasOwnProperty(prop)) {
  //           continue;
  //         }
  //         if (re.test(item[prop])) {
  //           return true;
  //         }
  //       }
  //       return false;
  //     }
  // }

  React.useEffect(() => {
    mounted = true;

    setWalletSaved(isWalletSaved());

    if (isWalletSaved() && !loading) {
      // loadArtworks()
      gqlGetTokens();
    }

    return function cleanup() {
      mounted = false;
    };
  }, [userAddresses]);

  const renderTabs = () => {
    if (currentTab === "owned") {
      return (
        <div className="mb-8">
          {!walletSaved && (
            <strong
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              Set your wallet first!
            </strong>
          )}
          {walletSaved && !loading && artworks.length === 0 && (
            <strong
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              No artworks are owned
            </strong>
          )}
          <WalletList artworks={artworks} tokensLoading={loading} />
        </div>
      );
    } else if (currentTab === "for_sale") {
      return <UserListedTokens addresses={userAddresses} />;
    } else {
      return <UserActivity addresses={userAddresses} />;
    }
  };

  const renderWalletAddresses = () => {
    return (
      <div>
        <p className="mb-4">Your Wallet</p>
        {userAddresses && (
          <Fragment>
            <div
              className="flex flex-row items-center"
              onClick={() => setOpenAddresses(!openAddresses)}
            >
              <p className="bg-gray-600 rounded-full">
                Address: {friendlyAddress(userAddresses[0], 6)}
              </p>{" "}
              {openAddresses ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {/* <Collapse in={openAddresses}>
              {userAddresses.map((item, index) => {
                if (index === 0) {
                  return;
                }

                return (
                  <Badge key={index} m="1" borderRadius={"full"} py={1} px={2}>
                    Address: {friendlyAddress(item, 6)}
                  </Badge>
                );
              })}
            </Collapse> */}
          </Fragment>
        )}
      </div>
    );
  };

  return (
    <>
      <SEO 
        title="My Wallet"
        description="View and manage your NFTs on SkyHarbor"
        url="https://skyharbor.io/wallet"
      />
      <div>
        {/* <div className="mb-6">{renderWalletAddresses()}</div> */}

        <Tabs
          tabs={[
            // { name: "Owned", value: "owned", icon: FaImage },
            { name: "For Sale", value: "for_sale", icon: MdOutlineSell },
            // { name: "Sold", value: "sold", icon: MdSell },
          ]}
          currentTab={currentTab}
          setTab={(val) => {
            console.log("VAL", val);
            setCurrentTab(val);
          }}
        />
        <div className="mt-6">{renderTabs()}</div>
      </div>
    </>
  );
}
