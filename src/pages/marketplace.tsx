import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteFeed";
import React from "react";

type Props = {};

const Marketplace = (props: Props) => {
  return (
    <div>
      <div>
        <p className="text-center text-4xl font-semibold">Marketplace</p>
      </div>
      <div className="mt-8">
        <InfiniteNFTFeed />
      </div>
    </div>
  );
};

export default Marketplace;
