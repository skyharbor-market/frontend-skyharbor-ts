import React, { useState, Fragment } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdSettings } from "react-icons/md";
import { useApolloClient } from "@apollo/client";
import { withApollo } from "../../lib/withApollo";
import { setWalletSelectOpen } from "../../redux/reducers/walletSlice";

function WalletButton({ changeTheme, theme }) {
  const router = useRouter();
  const client = useApolloClient();
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state);

  const [userAddress, setUserAddress] = useState(
    reduxState.wallet.defaultAddress
  );

  function gotoWallet() {
    router.push(`/wallet`);
  }

  function handleConnectButton() {
    dispatch(setWalletSelectOpen(true));
  }

  const isDarkMode = theme === "dark";

  const buttonVariants = {
    light: {
      background: "linear-gradient(to right, #f97316, #fb923c)",
    },
    dark: {
      background: "linear-gradient(to right, #1f2937, #374151)",
    },
  };

  const hoverVariants = {
    light: {
      background: "linear-gradient(to right, #ea580c, #f97316)",
    },
    dark: {
      background: "linear-gradient(to right, #111827, #1f2937)",
    },
  };

  return (
    <Fragment>
      <div>
        {reduxState.wallet.walletState !== "Configure" ? (
          <div>
            <div>
              <div
                className="inline-flex rounded-md shadow-sm"
                role="group"
              >
                <motion.button
                  onClick={gotoWallet}
                  className="px-4 py-2 text-sm font-medium text-white rounded-l-lg focus:z-10 focus:outline-none flex flex-row items-center"
                  variants={buttonVariants}
                  animate={isDarkMode ? "dark" : "light"}
                  whileHover={isDarkMode ? hoverVariants.dark : hoverVariants.light}
                  transition={{ duration: 0.15 }}
                >
                  <FaWallet className="inline-block mr-2 h-4 w-4" />
                  <span className="truncate">View Wallet</span>
                </motion.button>
                <motion.button
                  onClick={() => dispatch(setWalletSelectOpen(true))}
                  className="px-3 py-2 border-l border-orange-500 dark:border-gray-600 text-sm font-medium text-white rounded-r-lg focus:z-10 focus:outline-none"
                  variants={buttonVariants}
                  animate={isDarkMode ? "dark" : "light"}
                  whileHover={isDarkMode ? hoverVariants.dark : hoverVariants.light}
                  transition={{ duration: 0.15 }}
                >
                  <MdSettings className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={handleConnectButton}
            className="flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg shadow-md transform hover:scale-[1.01]"
            variants={buttonVariants}
            animate={isDarkMode ? "dark" : "light"}
            whileHover={isDarkMode ? hoverVariants.dark : hoverVariants.light}
            transition={{ duration: 0.3 }}
          >
            <FaWallet className="h-5 w-5 mr-2" />
            <span>Connect Wallet</span>
          </motion.button>
        )}
      </div>
    </Fragment>
  );
}

export default withApollo()(WalletButton);
