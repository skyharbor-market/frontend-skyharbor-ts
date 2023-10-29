import React, { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import {
  setDefaultAddress,
  setTokens,
  setWallet,
  setWalletSelectOpen,
  setWalletState,
} from "../../redux/reducers/walletSlice";
// import { useNavigate } from "react-router-dom";
import { FaWallet } from "react-icons/fa";
import { GiSubmarine } from "react-icons/gi";
import QRCode from "react-qr-code";
import { v4 as uuidv4 } from "uuid";

// import logoImage from '/assets/images/Ergosaurslogo.png'
// import yoroiWallet from '/assets/images/yoroi-logo-shape-blue.inline.svg';

import {
  getWalletAddress,
  getWalletType,
  isAddressValid,
  isAssembler,
  isWalletSaved,
  getWholeWallet,
} from "../../ergofunctions/helpers";
import {
  getWalletAddresses,
  getWalletErgs,
  setupNautilus,
  getConnectorAddress,
  setupSAFEW,
  setupWallet,
} from "../../ergofunctions/walletUtils";
import { MdPhoneAndroid } from "react-icons/md";
import ErgoPaySubscription from "./ErgoPay/ErgoPaySubscription";
import { useApolloClient } from "@apollo/client";
import { skyHarborApiRoot } from "../../ergofunctions/consts";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

type WalletTypes = "nautilus" | "safew";

function InitializeWallet({}) {
  const router = useRouter();
  const client = useApolloClient();

  const reduxState = useSelector((state) => state);

  console.log("reduxState", reduxState);

  let type = "yoroi";
  let walletSt = "Configure";
  let userAddr = "";

  // Redux
  // const walletAddress = useSelector((state) => state.wallet.address)
  const dispatch = useDispatch();

  //For Modal
  const finalRef = React.useRef();

  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState(type);
  // const [walletState, setWalletState] = useState(walletSt);

  //@ts-ignore
  const walletState = reduxState.wallet.walletState;

  const [userAddress, setUserAddress] = useState(userAddr);
  const [apiKey, setApiKey] = useState("");
  const [walletBalance, setWalletBalance] = useState(-1);

  const [ergopayUUID, setErgopayUUID] = useState<string | null>(null);

  const [modalPage, setModalPage] = useState("main");

  function gotoHome() {
    // navigate("/")
  }
  function gotoAbout() {
    // navigate("/info");
  }

  function gotoWallet() {
    router.push(`/wallet`);
  }

  function handleClearButton() {
    setModalPage("clear");
  }

  function toggle() {
    let type = "yoroi";
    if (isWalletSaved()) type = getWalletType();

    setActiveTab(type);
    setProcessing(false);
    setApiKey("");
    setModalPage("main");

    dispatch(setWalletSelectOpen(false));
  }

  function clearWallet(message = true) {
    // const walletState// = getWalletType();

    sessionStorage.removeItem("wallet");
    localStorage.removeItem("wallet");
    dispatch(setWallet(undefined));
    dispatch(setTokens([]));

    // setWalletState("Configure");
    dispatch(setWalletState("Configure"));

    setUserAddress("");
    dispatch(setDefaultAddress(""));

    setWalletBalance(-1);
    if (message) {
      console.log("disconnect wallet");

      setActiveTab(type);
      setProcessing(false);
      setApiKey("");
    }

    if (walletState === "safew" || walletState === "nautilus") {
      // @ts-ignore
      ergoConnector[walletState].disconnect();
      window.location.reload();
    }

    setErgopayUUID(uuidv4());

    toggle();

    // setModalPage("main")
  }

  async function getUserAddress() {
    let addresses = await getWalletAddresses();
    if (addresses === "error") {
      dispatch(setWallet(undefined));
    }
    dispatch(setWallet(addresses));

    return;
  }

  async function handleWalletConnect(wallet: WalletTypes) {
    //wallet can equal = ["safew", "nautilus"]

    let address;
    let addresses;
    let res = await setupWallet(true, wallet);
    // If Nautilus is denied
    if (res === "denied") {
      localStorage.removeItem("wallet");

      dispatch(setWallet(undefined));
      // setWalletState("Configure");
      dispatch(setWalletState("Configure"));

      return;
    }
    if (res) {
      address = await getConnectorAddress();
      addresses = await getWalletAddresses();

      localStorage.setItem(
        "wallet",
        JSON.stringify({
          type: wallet,
          address: address,
        })
      );
    }

    setUserAddress(address);
    dispatch(setDefaultAddress(address));

    if (res && address) {
      dispatch(setWallet(addresses));

      // Get total ERGs in wallet
      // getWalletErgs().then(res => {
      //     setWalletBalance((Math.round(friendlyERG(res) * 1000) / 1000));
      // });

      // setWalletState(wallet);
      dispatch(setWalletState(wallet));
    }
    setProcessing(false);
    toggle();
    return;
  }

  async function connectErgopay() {
    // setWalletState("ergopay");
    setModalPage("ergopay");
  }

  async function getWalletInfo() {
    if (isWalletSaved()) {
      const walletType = getWalletType();
      setWalletState(walletType);
      dispatch(setWalletState(walletType));

      // get user addresses to input into redux
      let addresses = undefined;

      // Add if statement if wallet is nautilus only do this.
      if (walletType === "nautilus" || walletType === "safew") {
        let res = await setupWallet();

        addresses = await getWalletAddresses();
        if (addresses === "error" || !addresses) {
          dispatch(setWallet(undefined));
          clearWallet(false);
          return;
        }

        let changeAddress = await getConnectorAddress(false);
        setUserAddress(changeAddress);
        dispatch(setDefaultAddress(changeAddress));
      } else if (walletType === "ergopay") {
        // Get wallet address of ergopay
        // addresses = ""
        const wholeWallet = await getWholeWallet();
        const walletUUID = wholeWallet?.uuid;
        if (!walletUUID) {
          console.error("No UUID found.");
        }

        setErgopayState(wholeWallet.address, walletUUID);
      }

      dispatch(setWallet(addresses));

      // const ergRes = await getWalletErgs();
      // if(!ergRes) {
      //     setWalletState('Configure');
      //     return
      // }
      // setWalletBalance(friendlyERG(ergRes));

      return;
    } else {
      // const walletUUID = await getWalletUUID();
      setErgopayUUID(uuidv4());
      clearWallet(false);
    }

    let tempAddress = "";
    if (isAssembler()) {
      tempAddress = getWalletAddress();
      setUserAddress(tempAddress);
      return;
    }

    // setWalletState('Configure');
    // setWalletBalance(0);
  }

  function openErgoPay() {
    window.open(
      `ergopay://${skyHarborApiRoot}/api/ergopay/setAddr/${ergopayUUID}/#P2PK_ADDRESS#`,
      "_blank" // <- This is what makes it open in a new window.
    );
  }

  function copyErgoPay() {
    navigator.clipboard
      .writeText(
        `ergopay://${skyHarborApiRoot}/api/ergopay/setAddr/${ergopayUUID}/#P2PK_ADDRESS#`
      )
      .then(
        () => console.log("Copied")
        // toast({
        //   title: "Copied",
        //   variant: "subtle",
        //   // description: "We've created your account for you.",
        //   position: "bottom",
        //   status: "info",
        //   duration: 2000,
        //   isClosable: true,
        // })
      );
  }

  function setErgopayState(ergopayAddress: string, epayUUI: string) {
    // Set default user address
    setUserAddress(ergopayAddress);
    dispatch(setDefaultAddress(ergopayAddress));

    // Set all user addresses
    dispatch(setWallet([ergopayAddress]));

    setErgopayUUID(epayUUI);
    // setWalletState("ergopay");
    dispatch(setWalletState("ergopay"));
  }

  useEffect(() => {
    getWalletInfo();
  }, []);

  const modalCurrentPage = () => {
    if (modalPage === "main") {
      return (
        <div>
          <div>
            {modalPage === "main" ? "Select your wallet" : "How To Disconnect"}
          </div>
          <div>
            <Button
              isFullWidth
              size={"lg"}
              leftIcon={<GiSubmarine size={28} />}
              rightIcon={<GiSubmarine size={28} />}
              onClick={() => handleWalletConnect("nautilus")}
              colorScheme="blue"
              disabled={
                walletState !== "Configure" && userAddress ? true : false
              }
            >
              Nautilus{" "}
              {walletState === "nautilus" && userAddress ? "(Connected)" : ""}
            </Button>

            <Button
              isFullWidth
              size={"lg"}
              mt="3"
              leftIcon={<FaWallet size={22} />}
              rightIcon={<FaWallet size={22} />}
              onClick={() => handleWalletConnect("safew")}
              disabled={
                walletState !== "Configure" && userAddress ? true : false
              }
            >
              SAFEW{" "}
              {walletState === "safew" && userAddress ? "(Connected)" : ""}
            </Button>

            <Button
              isFullWidth
              size={"lg"}
              leftIcon={<MdPhoneAndroid size={20} />}
              onClick={connectErgopay}
              colorScheme="purple"
              disabled={
                walletState !== "Configure" && userAddress ? true : false
              }
            >
              ErgoPay{" "}
              {walletState === "ergopay" && userAddress ? "(Connected)" : ""}
            </Button>
          </div>
        </div>
      );
    } else if (modalPage === "ergopay") {
      let disErgopayUUID = ergopayUUID;

      return (
        <Fragment>
          <div>{"Connect ErgoPay"}</div>
          <div>
            <p>Scan the QR or press the button below to connect ErgoPay.</p>

            <div>
              <div>
                <QRCode
                  size={128}
                  value={`ergopay://${skyHarborApiRoot}/api/ergopay/setAddr/${disErgopayUUID}/#P2PK_ADDRESS#`}
                />
              </div>

              <div className="flex flex-col flex-cols-1 md:flex-cols-2">
                <Button onClick={copyErgoPay}>Copy request</Button>
                <Button colorScheme={"blue"} onClick={openErgoPay}>
                  Open wallet
                </Button>
              </div>
            </div>
          </div>
        </Fragment>
      );
    } else if (modalPage === "clear") {
      return (
        <Fragment>
          <div>
            {/* @ts-ignore */}
            {modalPage === "main" ? "Select your wallet" : "Disconnect"}
          </div>
          <div>
            <p>
              Are you sure you want to disconnect?{" "}
              {walletState === "ergopay" ? "" : "This will refresh the page."}
            </p>

            <Button
              width={"100%"}
              onClick={clearWallet}
              mt="1"
              colorScheme={"red"}
              variant="outline"
            >
              Disconnect Wallet
            </Button>

            {/* <Text fontWeight={"bold"} mb="4">Make Sure To Follow These Steps to Disconnect your wallet properly.</Text>
                        <OrderedList mt="2" spacing={4}>
                            <ListItem mb="2">
                                Click {`"Clear Wallet From Site"`} below. <br />
                                <Button width={"100%"} onClick={clearWallet} mt="1" colorScheme={"red"} variant="outline">Clear Wallet From Site</Button>
                            </ListItem>
                            <ListItem mb="2">
                                Then disconnect from SkyHarbor on Nautilus by opening the Nautilus Chrome extension, clicking on your wallet name, going into the {`"Connected Dapps"`} tab, and deleting SkyHarbor.io from connected Dapps.
                            </ListItem>
                            <ListItem>
                                Finally, <Text as="span" fontWeight={"semibold"}>refresh the site</Text>. You can then connect your new wallet. Make sure to check preview address in top-right corner before making any transactions to make sure your new wallet it being used.
                            </ListItem>
                        </OrderedList> */}
          </div>
        </Fragment>
      );
    }
  };

  return (
    <Fragment>
      {(walletState === "ergopay" || modalPage === "ergopay") && client && (
        <ErgoPaySubscription
          uuid={ergopayUUID}
          toggleModal={toggle}
          setErgopayState={setErgopayState}
        />
      )}

      <div>
        {/* {walletState !== "Configure" ? (
          <div>
            <ButtonGroup
              isAttached
              variant="solid"
            >
              <Button
                onClick={gotoWallet}
                colorScheme="orange"
                minW={100}
                isLoading={!userAddress}
              >
                <Icon as={FaWallet} boxSize={5} mr="2" />
                <Text noOfLines={1} textOverflow="ellipsis">
                  {friendlyAddress(userAddress, 4)}
                </Text>
              </Button>
              <IconButton onClick={onOpen} icon={<SettingsIcon />} />
            </ButtonGroup>
          </Box>
        ) : (
          <Button onClick={onOpen} colorScheme="orange" w={16}>
            <Icon as={FaWallet} boxSize={5} />
          </Button>
        )} */}

        {/* @ts-ignore */}
        <Modal open={reduxState?.wallet?.walletSelectOpen} setOpen={toggle}>
          <div>
            {modalCurrentPage()}

            {modalPage !== "clear" && (
              <div>
                <Button
                  disabled={walletState === "Configure"}
                  onClick={handleClearButton}
                >
                  Disconnect Wallet
                </Button>
                <Button onClick={toggle}>Close</Button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </Fragment>
  );
}

export default InitializeWallet;
