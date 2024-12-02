import CustomButtonGroup from "@/components/CustomButtonGroup/CustomButtonGroup";
import CustomInput from "@/components/CustomInput/CustomInput";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import LoadingCircle from "@/components/LoadingCircle/LoadingCircle";
import {
  GET_COLLECTION_INFO,
  GET_COLLECTION_NFTS,
  GET_NFTS,
  GET_NFTS_SEARCH,
} from "@/lib/gqlQueries";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useState, useCallback } from "react";
import { FaCheckCircle, FaDiscord, FaImage, FaSearch, FaTwitter } from "react-icons/fa";
import { MdOutlineSell, MdSearch } from "react-icons/md";
import { BsCheckCircle, BsGlobe } from "react-icons/bs";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button/Button";
import { copyToClipboard, friendlyAddress } from "@/ergofunctions/helpers";
import Fade from "@/components/Fade/Fade";
import toast from "react-hot-toast";
import Tabs from "@/components/Tabs/Tabs";
import InfiniteActivityFeed from "@/components/InfiniteFeed/InfiniteActivityFeed";
import SortDropdown, { SORT_OPTIONS } from '@/components/SortDropdown/SortDropdown';
import debounce from "lodash/debounce";
import SEO from '@/components/SEO/SEO';

interface CollectionInfoInterface {
  id: number;
  card_image: string;
  description: string;
  mint_addresses: any;
  name: string;
  verified: boolean;
  website_link?: string;
  discord_link?: string;
  twitter_link?: string;
}

const Collection = () => {
  const router = useRouter();
  const { collection } = router.query;
  
  const [viewMintAddresses, setViewMintAddresses] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("For Sale");
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[2]);
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

  const { data, loading, error, fetchMore } = useQuery(GET_COLLECTION_INFO, {
    variables: { collection },
    notifyOnNetworkStatusChange: true,
  });

  const collectionInfo = data?.collections?.[0];

  function gotoSocial(social?: string) {
    if (!social) {
      return;
    }
    window.open(social, "_ blank");
  }

  const renderCollectionInfo = () => {
    if (loading) {
      return (
        <div className="flex flex-row space-x-4">
          <div className="w-44 h-44 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="w-5/6 flex flex-col space-y-3">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      );
    } else if (error || !data?.collections) {
      return <div>Error occurred</div>;
    } else {
      const colData: CollectionInfoInterface = data.collections[0];

      let socialButtons = [];

      if (colData?.website_link) {
        socialButtons.push({
          label: "",
          onClick: () => {
            gotoSocial(colData.website_link);
          },
          icon: <BsGlobe />,
        });
      }
      if (colData?.twitter_link) {
        socialButtons.push({
          label: "",
          onClick: () => {
            gotoSocial(colData.twitter_link);
          },
          icon: <FaTwitter />,
        });
      }
      if (colData?.discord_link) {
        socialButtons.push({
          label: "",
          onClick: () => {
            gotoSocial(colData.discord_link);
          },
          icon: <FaDiscord />,
        });
      }
      return (
        <div className="flex flex-row space-x-4">
          <div className="flex w-44 h-44 rounded-full overflow-hidden">
            <div className="aspect-square w-full">
              <img
                src={colData.card_image}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="w-5/6 flex flex-col space-y-3">
            <div className="flex flex-row items-center">
              <p className="text-2xl font-semibold">{colData?.name}</p>
              {colData.verified && (
                <div className="w-5 h-5 ml-2">
                  <FaCheckCircle className="text-blue-400 h-full w-full" />
                </div>
              )}
            </div>
            <div className="">
              <p>{colData?.description}</p>
            </div>
            <div className="flex flex-row items-center space-x-2">
              <CustomButtonGroup buttons={socialButtons} />

              <div className="">
                <Button
                  variant={viewMintAddresses ? "primary" : "outline"}
                  onClick={() => setViewMintAddresses(!viewMintAddresses)}
                  className="text-xs h-full border text-black rounded-md whitespace-nowrap"
                  colorScheme="purple"
                >
                  Mint Addresses
                </Button>
              </div>
            </div>

            {viewMintAddresses && (
              <Fade fadeKey={"mint-addresses-click"} fadeDuration={0.2}>
                <div className="flex flex-wrap">
                  {colData.mint_addresses.map((item: any, index: number) => {
                    return (
                      <div
                        key={index}
                        className="m-1"
                        onClick={() => {
                          copyToClipboard(item.address);
                          toast.success("Copied address");
                        }}
                      >
                        <p className="text-xs border p-2 rounded hover:opacity-60 hover:shadow cursor-pointer transition-all">
                          {friendlyAddress(item.address, 4)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Fade>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <SEO 
        title={collectionInfo?.name || 'Collection'}
        description={collectionInfo?.description || undefined}
        image={collectionInfo?.card_image || undefined}
        url={`https://skyharbor.io/collection/${collection}`}
      />
      <div>
        <div>{renderCollectionInfo()}</div>
      </div>
      <div className="mt-8">
        <div className="mb-4">
          <Tabs
            tabs={[
              { name: "For Sale", value: "For Sale", icon: MdOutlineSell },
              { name: "Activity", value: "Activity", icon: FaImage }
            ]}
            currentTab={activeTab}
            setTab={setActiveTab}
          />
        </div>

        {activeTab === "For Sale" ? (
          <>
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
            <div>
              <InfiniteNFTFeed
                gqlQuery={debouncedSearchTerm.trim() === "" ? GET_COLLECTION_NFTS : GET_NFTS_SEARCH}
                collection={collection as string}
                searchTerm={debouncedSearchTerm}
                orderBy={sortOption.orderBy}
              />
            </div>
          </>
        ) : (
          <div>
            <InfiniteActivityFeed collection={collection as string} />
          </div>
        )}
      </div>
    </>
  );
};

export default Collection;
