import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { GET_NFTS } from "@/lib/gqlQueries";
import { convertGQLObject } from "@/ergofunctions/helpers";
import NFTCard from "../NFTCard/NFTCard";
import { useSelector } from "react-redux";
import { DocumentNode } from "graphql";
import LoadingCircle from "../LoadingCircle/LoadingCircle";

interface InfiniteNFTFeedProps {
  gqlQuery: DocumentNode;
  collection?: string;
  searchTerm: string;
}

const InfiniteNFTFeed = ({ gqlQuery, collection, searchTerm }: InfiniteNFTFeedProps) => {
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of NFTs to load each time
  // @ts-ignore
  const userAddresses = useSelector((state) => state.wallet.addresses);
  console.log("searchTerm", searchTerm)

  const isSearchActive = searchTerm && searchTerm.trim() !== "";

  const { data, loading, error, fetchMore, refetch } = useQuery(gqlQuery, {
    variables: { 
      limit, 
      offset: 0, 
      collection, 
      ...(isSearchActive && { search: `%${searchTerm}%` })
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (isSearchActive) {
      refetch({ search: `%${searchTerm}%` });
    } else {
      refetch();
    }
    setHasMore(true);
  }, [searchTerm, refetch, isSearchActive]);

  if (loading && !data?.sales) return <div className="w-24 h-24 mx-auto"><LoadingCircle /></div>;
  if (!loading && data?.sales?.length <= 0) return <div className="text-center"><p>No NFTs found {isSearchActive ? `under "${searchTerm}"` : ""}</p></div>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <InfiniteScroll
      dataLength={data.sales.length}
      style={{ overflow: "visible" }}
      next={() => {
        fetchMore({
          variables: {
            offset: data.sales.length,
            ...(isSearchActive && { search: `%${searchTerm}%` })
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            if (fetchMoreResult.sales.length < limit) setHasMore(false);
            return {
              sales: [...prev.sales, ...fetchMoreResult.sales],
            };
          },
        });
      }}
      hasMore={hasMore}
      loader={<div className="w-12 h-12 mx-auto mt-6"><LoadingCircle /></div>}
    >
      <div className="mt-3">
        <div className="mx-auto ">
          <h2 className="sr-only">NFTs</h2>

          <div className="grid grid-cols-2 sm:mx-0 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6 pb-8">
            {data.sales.map((nft: any, index: number) => {
              const nftObj = convertGQLObject(nft);

              return (
                <NFTCard
                  token={nftObj}
                  key={`${nftObj.token_id}-${nftObj.box_id}`}
                  isOwner={
                    userAddresses
                      ? userAddresses.includes(nftObj.seller_address)
                      : false
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </InfiniteScroll>
  );
};

export default InfiniteNFTFeed;
