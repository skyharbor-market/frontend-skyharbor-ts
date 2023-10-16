import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import React from "react";

interface SellModalProps {
  open: boolean;
  onClose: () => void;

  token: any;
}

const SellModal = ({ open, onClose }: SellModalProps) => {
  return (
    <div>
      <Modal open={open} setOpen={onClose}>
        <div>
          <div className="text-xl">List NFT</div>
        </div>
        <hr className="my-2" />
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row space-x-2">
            <div className="w-3/4">
              <p>List Price</p>
              <input className="w-full" />
            </div>
            <div className="w-1/4">
              <p>Currency</p>
              <input className="w-full" />
            </div>
          </div>
          <div className="flex flex-row justify-between text-sm">
            <p>Artist Royalties</p>
            <p>0.5 ERG</p>
          </div>
          <div className="flex flex-row justify-between text-sm">
            <p>Service Fee</p>
            <p>0.5 ERG</p>
          </div>
          <div className="flex flex-row justify-between">
            <p>Your earnings</p>
            <p>2 ERG</p>
          </div>
        </div>

        <div className=" mt-4">
          <Button className="w-full bg-red-400">List</Button>
        </div>
      </Modal>
    </div>
  );
};

export default SellModal;
