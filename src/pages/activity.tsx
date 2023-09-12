import InfiniteCollectionsFeed from "@/components/InfiniteFeed/InfiniteCollectionsFeed";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import React from "react";

type Props = {};

const Marketplace = (props: Props) => {
  return (
    <div>
      <div>
        <p className="text-center text-4xl font-semibold">Activity</p>
      </div>
      <div className="mt-8">{/* <InfiniteCollectionsFeed /> */}</div>
    </div>
  );
};

export default Marketplace;
