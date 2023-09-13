import CustomInput from "@/components/CustomInput/CustomInput";
import InfiniteCollectionsFeed from "@/components/InfiniteFeed/InfiniteCollectionsFeed";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import React from "react";
import { MdSearch } from "react-icons/md";

type Props = {};

const Marketplace = (props: Props) => {
  return (
    <div>
      <div>
        <p className="text-center text-4xl font-semibold">Collections</p>
      </div>
      <div className="mx-auto mb-6 mt-6">
        <CustomInput leftIcon={<MdSearch />} placeholder="Search..." />
      </div>

      <div className="mt-8">
        <InfiniteCollectionsFeed />
      </div>
    </div>
  );
};

export default Marketplace;
