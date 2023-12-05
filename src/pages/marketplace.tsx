import CustomInput from "@/components/CustomInput/CustomInput";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import { GET_NFTS } from "@/lib/gqlQueries";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { MdSearch } from "react-icons/md";

type Props = {};

const Marketplace = (props: Props) => {
  return (
    <div>
      <div>
        <p className="text-center text-4xl font-semibold">Marketplace</p>
      </div>
      <div className="mt-8">
        <div className="mx-auto mb-6">
          <CustomInput leftIcon={<MdSearch />} placeholder="Search..." />
        </div>
        <div className="">
          <InfiniteNFTFeed gqlQuery={GET_NFTS} />
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
