import Button from "@/components/Button/Button";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import CustomInput from "@/components/CustomInput/CustomInput";
import LoadingCircle from "@/components/LoadingCircle/LoadingCircle";
import Modal from "@/components/Modal/Modal";
import Tooltip from "@/components/Tooltip/Tooltip";
import TxSubmitted from "@/components/TxSubmitted/TxSubmitted";
import { serviceFee, supportedCurrencies } from "@/ergofunctions/consts";
import { SupportedCurrenciesV2 } from "@/ergofunctions/Currencies";
import { calculateEarnings } from "@/ergofunctions/helpers";
import { bulk_list } from "@/ergofunctions/marketfunctions/bulkList";
import { relist_NFT } from "@/ergofunctions/marketfunctions/relistNFT";
import {
  currencyToLong,
  decodeArtwork,
  getRoyaltyInfo,
} from "@/ergofunctions/serializer";
import { getWalletAddresses } from "@/ergofunctions/walletUtils";
import { delistNft } from "api-calls/delist";
import { editNft } from "api-calls/edit";
import { listNft } from "api-calls/list";
import { Currency } from "interfaces/ListInterface";
import React, { ChangeEvent, useEffect, useState } from "react";
import toast, { LoaderIcon } from "react-hot-toast";
import { IoClose } from "react-icons/io5";

export interface SellTokenInterface {
  tokenId: string;
  nft_name: string;
  box_json?: any
}

interface RoyaltiesInterface {
  address: string | string[] | null | undefined;
  percentage: number | null | undefined;
}

export interface SellModalProps {
  open: boolean;
  onClose: () => void;

  token: SellTokenInterface;

  isEdit?: boolean; // Not allowed to change currency if editing
}

const SellModal = ({
  open,
  onClose,
  token,
  isEdit = false,
}: SellModalProps) => {
  const [royalties, setRoyalties] = useState<RoyaltiesInterface | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);

  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("erg");

  const handleSubmit = () => {
    if (isEdit) {
      submitEdit();
    } else {
      createSaleTx();
    }
  };
  // Create Sale
  const createSaleTx = async () => {
    const tokenId = token.tokenId;
    const currencyIndex = 0; //currency

    const thePrice = typeof price === "string" ? parseFloat(price) : price;
    setIsSubmitting(true);
    try {
      const saleTxId = await listNft({
        nfts: {
          currency: currency as Currency,
          price: thePrice,
          id: tokenId,
        },
        userAddresses: await getWalletAddresses(),
      });
      if (saleTxId) {
        setTxId(saleTxId);
        return;
      }
    } catch (error) {
      console.error("ERROR", error);
      toast.error("There was an error submitting the transaction");
    } finally {
      setIsSubmitting(false);
    }

    return;
  };

  // edit price
  const submitEdit = async () => {
    const tokenId = token.tokenId;
    const currencyIndex = 0; //currency
    console.log("tokenId", tokenId);
    const thePrice = typeof price === "string" ? parseFloat(price) : price;
    setIsSubmitting(true);
    try {
      // const saleTxId = await relist_NFT({
      //   editBox: {box_id: tokenId},
      //   currency: currency as Currency,
      //   newPrice: thePrice,
      //   userAddresses: await getWalletAddresses(),
      // });
      const saleTxId = await relist_NFT(token, currencyToLong(thePrice, supportedCurrencies[currency === "erg"? 0 : 1].decimal),currency as Currency === "erg" ? 0 : 1 )

      if (saleTxId) {
        setTxId(saleTxId);
        return;
      }
    } catch (error) {
      console.error("ERROR", error);
      toast.error("There was an error submitting the transaction");
    } finally {
      setIsSubmitting(false);
    }

    return;
  };

  const getTokenRoyalties = async () => {
    setRoyalties(null);

    const royaltyRes = await getRoyaltyInfo(token.tokenId);
    console.log("royaltyRes", royaltyRes);
    if(royaltyRes) {
      setRoyalties({
        address: royaltyRes?.artist,
        percentage: royaltyRes?.royalty,
      });
    }
  };

  const handleCurrency = (e: any) => {
    setCurrency(e.value);
  };

  useEffect(() => {
    console.log("Is open?", open);
    if (open) {
      getTokenRoyalties();
    }
  }, [open]);

  const disableButton = !price || Number(price) <= 0 || royalties === null || isSubmitting;

  const calculateFees = () => {
    const priceNum = Number(price || 0);
    const royaltyPercentage = Number(royalties?.percentage || 0) / 1000; // Convert from basis points (0.1%) to decimal
    
    const royaltyAmount = priceNum * royaltyPercentage;
    const serviceAmount = priceNum * serviceFee;
    const earnings = priceNum - royaltyAmount - serviceAmount;

    return {
      royaltyAmount: royaltyAmount.toFixed(4),
      serviceAmount: serviceAmount.toFixed(4),
      earnings: earnings.toFixed(4)
    };
  };

  const fees = calculateFees();

  const renderForm = () => {
    return (
      <div className="dark:text-gray-100">
        <div className="flex justify-between items-center">
          <div className="text-xl dark:text-gray-50">
            {isEdit ? "Edit Listing:" : "List NFT:"} {token.nft_name}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>
        <hr className="my-2 dark:border-gray-700" />
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row space-x-2">
            <div className="w-3/4">
              <p className="mb-1 dark:text-gray-300">List Price</p>
              <CustomInput
                value={price}
                type={"number"}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPrice(e.target.value);
                }}
              />
            </div>
            <div className="w-1/4">
              <p className="mb-1 dark:text-gray-300">Currency</p>
              <div className={isEdit ? "relative" : ""}>
                <CustomDropdown
                  value={currency}
                  items={[
                    {
                      label: "ERG",
                      value: "erg",
                    },
                    {
                      label: "SigUSD",
                      value: "sigusd",
                    },
                  ]}
                  onChange={handleCurrency}
                  disabled={isEdit}
                />
                {isEdit && (
                  <Tooltip label="To change currency, you must delist first">
                    <div className="absolute z-50 h-full w-full top-0 left-0 inset-0 bg-gray-200 rounded-lg opacity-50 cursor-not-allowed"></div>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between text-sm dark:text-gray-300">
            <p>
              Artist Royalties{" "}
              {royalties?.percentage
                ? `(${royalties?.percentage / 10}%)`
                : "(0%)"}
            </p>
            <p>
              {fees.royaltyAmount} {currency}
            </p>
          </div>
          <div className="flex flex-row justify-between text-sm dark:text-gray-300">
            <p>Service Fee ({serviceFee * 100}%)</p>
            <p>
              {fees.serviceAmount} {currency}
            </p>
          </div>
          <div className="flex flex-row justify-between dark:text-gray-200">
            <p>Your earnings</p>
            <p>{fees.earnings} {currency}</p>
          </div>
        </div>

        <div className="mt-4">
          <Button
            className="w-full bg-red-400 dark:bg-red-500 dark:hover:bg-red-600 dark:text-white"
            colorScheme="red"
            onClick={handleSubmit}
            disabled={disableButton}
            loading={isSubmitting}
          >
            {royalties === null ? (
              <div className="text-center flex flex-row items-center justify-center">
                <LoaderIcon /> <p className="ml-2">Loading royalties</p>
              </div>
            ) : (
              `${isEdit ? "Submit change" : "List for sale"}`
            )}
          </Button>
        </div>
      </div>
    );
  };
  console.log("token", token);

  return (
    <div>
      <Modal open={open} setOpen={onClose}>
        {txId ? (
          <TxSubmitted box={token} txId={txId} type="list" onClose={onClose} />
        ) : (
          renderForm()
        )}
      </Modal>
    </div>
  );
};

export default SellModal;
