import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { GET_NFTS } from "@/lib/gqlQueries";
import { convertGQLObject } from "@/ergofunctions/helpers";
import NFTCard from "../NFTCard/NFTCard";

const InfiniteNFTFeed = () => {
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of NFTs to load each time

  const { data, loading, error, fetchMore } = useQuery(GET_NFTS, {
    variables: { limit, offset: 0 },
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
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="sr-only">NFTs</h2>

          <div className="grid grid-cols-2 sm:mx-0 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-6">
            {data.sales.map((nft: any) => {
              const nftObj = convertGQLObject(nft);

              return <NFTCard token={nftObj} key={nftObj.token_id} />;
            })}
          </div>
        </div>
      </div>
    </InfiniteScroll>
  );
};

export default InfiniteNFTFeed;
