import Button from "@/components/Button/Button";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import CustomInput from "@/components/CustomInput/CustomInput";
import LoadingCircle from "@/components/LoadingCircle/LoadingCircle";
import Modal from "@/components/Modal/Modal";
import TxSubmitted from "@/components/TxSubmitted/TxSubmitted";
import { serviceFee } from "@/ergofunctions/consts";
import { SupportedCurrenciesV2 } from "@/ergofunctions/Currencies";
import { calculateEarnings } from "@/ergofunctions/helpers";
import { bulk_list } from "@/ergofunctions/marketfunctions/bulkList";
import {
  currencyToLong,
  decodeArtwork,
  getRoyaltyInfo,
} from "@/ergofunctions/serializer";
import { getWalletAddresses } from "@/ergofunctions/walletUtils";
import { listNft } from "api-calls/list";
import { Currency } from "interfaces/ListInterface";
import React, { ChangeEvent, useEffect, useState } from "react";
import toast, { LoaderIcon } from "react-hot-toast";

export interface SellTokenInterface {
  tokenId: string;
  nft_name: string;
}

interface RoyaltiesInterface {
  address: string | string[] | null | undefined;
  percentage: number | null | undefined;
}

export interface SellModalProps {
  open: boolean;
  onClose: () => void;

  token: SellTokenInterface;
}

const SellModal = ({ open, onClose, token }: SellModalProps) => {
  const [royalties, setRoyalties] = useState<RoyaltiesInterface | null>(null);

  const [txId, setTxId] = useState<string | null>(null);

  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("erg");
  // useEffect(() => {
  //   decodeArtwork(null, token.tokenId, false);

  //   setRoyalties({
  //     address: "",
  //     percentage: 5,
  //   });
  // }, []);
  // Create Sale
  const createSaleTx = async () => {
    const tokenId = token.tokenId;
    const currencyIndex = 0; //currency

    const thePrice = typeof price === "string" ? parseInt(price) : price;
    try {
      // const saleTxId = await bulk_list([
      //   {
      //     id: tokenId,
      //     currencyIndex: currencyIndex,
      //     price: currencyToLong(
      //       thePrice,
      //       SupportedCurrenciesV2[currency].decimal
      //     ),
      //   },
      // ]);
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
      // toast({
      //   title: "There was an error submitting the transaction.",
      //   description:
      //     error?.info || "There was an error submitting the transaction",
      //   position: "top-right",
      //   status: "error",
      //   duration: 5000,
      //   isClosable: true,
      // });
      toast.error("There was an error submitting the transaction");
    }

    return;
  };

  const getTokenRoyalties = async () => {
    setRoyalties(null);

    const royaltyRes = await getRoyaltyInfo(token.tokenId);
    console.log("royaltyRes", royaltyRes);
    setRoyalties({
      address: royaltyRes?.artist,
      percentage: royaltyRes?.royalty,
    });
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

  const disableButton = !price || price === 0 || royalties === null;

  const finalEarnings = calculateEarnings(
    royalties?.percentage,
    price,
    currency
  );

  const renderForm = () => {
    return (
      <div>
        <div>
          <div className="text-xl">List NFT: {token.nft_name}</div>
        </div>
        <hr className="my-2" />
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row space-x-2">
            <div className="w-3/4">
              <p className="mb-1">List Price</p>
              <CustomInput
                value={price}
                type={"number"}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.value) {
                    setPrice(e.target.value);
                  }
                }}
              />
            </div>
            <div className="w-1/4">
              <p className="mb-1">Currency</p>
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
              />
            </div>
          </div>
          <div className="flex flex-row justify-between text-sm">
            <p>
              Artist Royalties{" "}
              {royalties?.percentage
                ? `(${royalties?.percentage / 10}%)`
                : "(0%)"}
            </p>
            <p>
              {Number(price || 0) * (Number(royalties?.percentage || 0) / 100)}{" "}
              {currency}
            </p>
          </div>
          <div className="flex flex-row justify-between text-sm">
            <p>Service Fee ({serviceFee * 100}%)</p>
            <p>
              {finalEarnings.servicePayment} {currency}
            </p>
          </div>
          <div className="flex flex-row justify-between">
            <p>Your earnings</p>
            <p>2 {currency}</p>
          </div>
        </div>

        <div className=" mt-4">
          <Button
            className="w-full bg-red-400 text-white"
            onClick={() => createSaleTx()}
            disabled={disableButton}
          >
            {royalties === null ? (
              <div className="text-center flex flex-row items-center justify-center">
                <LoaderIcon /> <p className="ml-2">Loading royalties</p>
              </div>
            ) : (
              "List"
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Modal open={open} setOpen={onClose}>
        {txId ? <TxSubmitted txId={txId} /> : renderForm()}
      </Modal>
    </div>
  );
};

export default SellModal;
