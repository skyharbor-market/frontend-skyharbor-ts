import CustomInput from "@/components/CustomInput/CustomInput";
import InfiniteCollectionsFeed from "@/components/InfiniteFeed/InfiniteCollectionsFeed";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import React, { useState } from "react";
import { MdSearch } from "react-icons/md";

type Props = {};

const Marketplace = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="">
      <div>
        <p className="text-center text-4xl font-semibold">Collections</p>
      </div>
      <div className="">
        <div className="mx-auto my-6">
          <CustomInput
            leftIcon={<MdSearch />}
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="mt-8">
          <InfiniteCollectionsFeed searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
