// @ts-nocheck

import React, { Fragment, useEffect, useState } from "react";
import { setTokens } from "../redux/reducers/walletSlice";
import { useSelector, useDispatch } from "react-redux";
import {
  isWalletSaved,
  friendlyAddress,
} from "../ergofunctions/helpers";
import UserListedTokens from "../components/WalletComponents/UserListedTokens";
import WalletList from "../components/WalletComponents/WalletList";

import UserActivity from "../components/WalletComponents/UserActivity";
import Tabs from "@/components/Tabs/Tabs";
import { FaChevronDown, FaChevronUp, FaImage } from "react-icons/fa";
import { MdOutlineSell, MdSell } from "react-icons/md";
import SEO from '@/components/SEO/SEO';
import { useOwnedNFTs } from "@/hooks/useWalletQueries";

export default function WalletPage() {
  // Redux
  const { addresses: userAddresses } = useSelector((state) => state.wallet);
  const dispatch = useDispatch();

  const [walletSaved, setWalletSaved] = useState(false);
  const [openAddresses, setOpenAddresses] = useState(false);
  const [currentTab, setCurrentTab] = useState("for_sale");

  // Fetch owned NFTs using TanStack Query
  const { data: artworks = [], isLoading: loading } = useOwnedNFTs(userAddresses);

  // Sync to Redux when data changes
  useEffect(() => {
    if (artworks.length > 0) {
      dispatch(setTokens(artworks));
    }
  }, [artworks, dispatch]);

  // Check if wallet is saved
  useEffect(() => {
    setWalletSaved(isWalletSaved());
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
