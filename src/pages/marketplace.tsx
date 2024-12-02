import CustomInput from "@/components/CustomInput/CustomInput";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import { GET_NFTS, GET_NFTS_SEARCH } from "@/lib/gqlQueries";
import React, { useState, useCallback } from "react";
import { MdSearch } from "react-icons/md";
import debounce from "lodash/debounce";
import { useSelector } from "react-redux";
import SortDropdown, { SORT_OPTIONS } from '@/components/SortDropdown/SortDropdown';
import SEO from '@/components/SEO/SEO';

type Props = {};

const Marketplace = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);
  // const userAddresses = useSelector((state: any) => state.wallet.addresses);

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
    <>
      <SEO 
        title="Marketplace"
        url="https://skyharbor.io/marketplace"
      />
      <div>
        <div>
          <p className="text-center text-4xl font-semibold">Marketplace</p>
        </div>
        <div className="mt-8">
          <div className="mx-auto mb-6 flex gap-4">
            <div className="flex-grow">
              <CustomInput
                leftIcon={<MdSearch />}
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="w-48">
              <SortDropdown
                value={sortOption.value}
                onChange={setSortOption}
              />
            </div>
          </div>
          <div className="">
            <InfiniteNFTFeed 
              gqlQuery={debouncedSearchTerm.trim() === "" ? GET_NFTS : GET_NFTS_SEARCH} 
              searchTerm={debouncedSearchTerm}
              orderBy={sortOption.orderBy}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Marketplace;
