import CustomInput from "@/components/CustomInput/CustomInput";
import InfiniteCollectionsFeed from "@/components/InfiniteFeed/InfiniteCollectionsFeed";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import React, { useState, useCallback } from "react";
import { MdSearch } from "react-icons/md";
import debounce from "lodash/debounce";

type Props = {};

const Marketplace = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
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
          <InfiniteCollectionsFeed searchTerm={debouncedSearchTerm} />
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
