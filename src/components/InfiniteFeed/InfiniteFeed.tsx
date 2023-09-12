import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { GET_NFTS } from "@/lib/gqlQueries";

const InfiniteNFTFeed = () => {
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of NFTs to load each time

  const { data, loading, error, fetchMore } = useQuery(GET_NFTS, {
    variables: { limit, offset: 0 },
    notifyOnNetworkStatusChange: true,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <InfiniteScroll
      dataLength={data.nfts.length}
      next={() => {
        fetchMore({
          variables: {
            offset: data.nfts.length,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            if (fetchMoreResult.nfts.length < limit) setHasMore(false);
            return {
              nfts: [...prev.nfts, ...fetchMoreResult.nfts],
            };
          },
        });
      }}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
    >
      {data.nfts.map((nft) => (
        <div key={nft.id}>
          <h2>{nft.title}</h2>
          <img src={nft.image_url} alt={nft.title} />
          {/* Render other NFT details here */}
        </div>
      ))}
    </InfiniteScroll>
  );
};

export default InfiniteNFTFeed;
