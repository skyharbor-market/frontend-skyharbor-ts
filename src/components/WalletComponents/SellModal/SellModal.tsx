import Button from "@/components/Button/Button";
import CustomInput from "@/components/CustomInput/CustomInput";
import Modal from "@/components/Modal/Modal";
import { bulk_list } from "@/ergofunctions/marketfunctions/bulkList";
import { decodeArtwork } from "@/ergofunctions/serializer";
import React, { useEffect, useState } from "react";

export interface SellTokenInterface {
  tokenId: string;
  nft_name: string;
}

interface RoyaltiesInterface {
  address: string | string[];
  percentage: number;
}

export interface SellModalProps {
  open: boolean;
  onClose: () => void;

  token: SellTokenInterface;
}

const SellModal = ({ open, onClose, token }: SellModalProps) => {
  const [royalties, setRoyalties] = useState<RoyaltiesInterface | null>();

  const [txId, setTxId] = useState<string | null>(null);

  const [price, setPrice] = useState<number | string>(0);
  const [currency, setCurrency] = useState<string>("erg");
  useEffect(() => {
    decodeArtwork(null, token.tokenId, false);

    setRoyalties({
      address: "",
      percentage: 5,
    });
  }, []);

  // Create Sale
  const createSaleTx = async () => {
    const tokenId = token.tokenId;
    const currencyIndex = 0; //currency
    try {
      const saleTxId = await bulk_list([
        {
          id: tokenId,
          // name: name,
          // ipfs_art_url: box.ipfs_art_url,
          // nft_type: box.nft_type,
          // royalty: box.royalty,
          currencyIndex: currencyIndex,
          price: price,
        },
      ]);
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
      console.log("error", error);
    }

    return;
  };
  return (
    <div>
      <Modal open={open} setOpen={onClose}>
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
                onChange={(e) => {
                  setPrice(e.target.value);
                }}
              />
            </div>
            <div className="w-1/4">
              <p className="mb-1">Currency</p>
              <input className="w-full" />
            </div>
          </div>
          <div className="flex flex-row justify-between text-sm">
            <p>Artist Royalties</p>
            <p>
              {parseInt(price) * ((royalties?.percentage || 0) / 100)}{" "}
              {currency}
            </p>
          </div>
          <div className="flex flex-row justify-between text-sm">
            <p>Service Fee</p>
            <p>0.5 {currency}</p>
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
          >
            List
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SellModal;
