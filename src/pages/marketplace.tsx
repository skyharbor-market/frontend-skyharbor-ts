import CustomInput from "@/components/CustomInput/CustomInput";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import { GET_NFTS, GET_NFTS_SEARCH } from "@/lib/gqlQueries";
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
    <div>
      <div>
        <p className="text-center text-4xl font-semibold">Marketplace</p>
      </div>
      <div className="mt-8">
        <div className="mx-auto mb-6">
          <CustomInput
            leftIcon={<MdSearch />}
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="">
          <InfiniteNFTFeed gqlQuery={debouncedSearchTerm.trim() === "" ? GET_NFTS : GET_NFTS_SEARCH} searchTerm={debouncedSearchTerm} />
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
