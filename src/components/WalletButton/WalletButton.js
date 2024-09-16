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
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  onClick={gotoWallet}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-l-lg hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-700 focus:z-10 focus:ring-2 focus:ring-orange-500 focus:outline-none transition duration-300 ease-in-out"
                >
                  <FaWallet className="inline-block mr-2 h-4 w-4" />
                  <span className="truncate">View Wallet</span>
                </button>
                <button
                  onClick={() => dispatch(setWalletSelectOpen(true))}
                  className="px-3 py-2 border-l border-orange-500 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-r-lg hover:bg-gradient-to-r hover:from-orange-700 hover:to-orange-800 focus:z-10 focus:ring-2 focus:ring-orange-500 focus:outline-none transition duration-300 ease-in-out"
                >
                  <MdSettings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnectButton}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-[1.01]"
          >
            <FaWallet className="h-5 w-5 mr-2" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </Fragment>
  );
}

export default withApollo()(WalletButton);
