import React, { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { FaWallet } from "react-icons/fa";

// import logoImage from '/assets/images/Ergosaurslogo.png'
// import yoroiWallet from '/assets/images/yoroi-logo-shape-blue.inline.svg';

import { friendlyAddress } from "../../ergofunctions/helpers";
import { MdPhoneAndroid, MdSettings } from "react-icons/md";
import { useApolloClient } from "@apollo/client";
import { withApollo } from "../../lib/withApollo";
import Button from "../Button/Button";
import { setWalletSelectOpen } from "../../redux/reducers/walletSlice";

function WalletButton({ changeTheme, darkMode }) {
  const router = useRouter();
  const client = useApolloClient();

  // Redux
  // const walletAddress = useSelector((state) => state.wallet.address)
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state);

  console.log("reux state", reduxState);

  const [userAddress, setUserAddress] = useState(
    reduxState.wallet.defaultAddress
  );

  function gotoWallet() {
    router.push(`/wallet`);
  }

  function handleConnectButton() {
    // if (!poolState.kyaAccepted) {
    //   // poolState.isKyaOpen;
    //   dispatch(setIsKyaOpen(true));
    //   showMsg("You must accept KYA", false, true);
    //   return;
    // }

    // onOpen();
    dispatch(setWalletSelectOpen(true));
  }

  return (
    <Fragment>
      <div>
        {reduxState.wallet.walletState !== "Configure" ? (
          <div>
            <div
            // size='lg'
            >
              <Button
                colorScheme="orange"
                // minW={100}
                // isLoading={!userAddress}
                className="flex flex-row items-center relative overflow-hidden"
              >
                <div
                  className="flex flex-row items-center relative overflow-hidden"
                  onClick={gotoWallet}
                >
                  <FaWallet className="mr-2 h-4 w-4 text-white" />
                  {/* {walletBalance === -1 ? "..." : walletBalance} ERG */}
                  <p className="text-ellipsis mb-0 pr-9 text-white font-semibold">
                    {friendlyAddress(reduxState?.wallet?.defaultAddress, 4)}
                  </p>
                </div>

                <div
                  className="absolute right-0 top-0 bg-gray-500 h-full flex justify-center w-10 items-center hover:bg-gray-300 transition-all"
                  onClick={() => {
                    dispatch(setWalletSelectOpen(true));
                  }}
                >
                  <MdSettings className="h-full w-4 mr-1 text-white" />
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={handleConnectButton} colorScheme="orange" w={16}>
            <FaWallet className="h-4 w-4 text-white dark:text-black" />
          </Button>
        )}
      </div>
    </Fragment>
  );
}

export default withApollo()(WalletButton);
