import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { GET_NFTS } from "@/lib/gqlQueries";
import { convertGQLObject } from "@/ergofunctions/helpers";
import NFTCard from "../NFTCard/NFTCard";
import { useSelector } from "react-redux";
import { DocumentNode } from "graphql";

interface InfiniteNFTFeedProps {
  gqlQuery: DocumentNode;
  collection?: string;
}

const InfiniteNFTFeed = ({ gqlQuery, collection }: InfiniteNFTFeedProps) => {
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of NFTs to load each time
  const userAddresses = useSelector((state) => state.wallet.addresses);

  const { data, loading, error, fetchMore } = useQuery(gqlQuery, {
    variables: { limit, offset: 0, collection },
    notifyOnNetworkStatusChange: true,
  });

  if (loading && !data?.sales) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <InfiniteScroll
      dataLength={data.sales.length}
      next={() => {
        fetchMore({
          variables: {
            offset: data.sales.length,
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
      loader={<h4>Loading...</h4>}
    >
      {/* <div className="grid grid-cols-4 gap-4"> */}
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
