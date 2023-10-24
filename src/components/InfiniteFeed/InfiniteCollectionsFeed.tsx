import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { GET_COLLECTIONS } from "@/lib/gqlQueries";
import { convertGQLObject } from "@/ergofunctions/helpers";
import NFTCard from "../NFTCard/NFTCard";
import Image from "next/image";
import Link from "next/link";

const InfiniteCollectionsFeed = () => {
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of NFTs to load each time

  const { data, loading, error, fetchMore } = useQuery(GET_COLLECTIONS, {
    variables: { limit, offset: 0 },
    notifyOnNetworkStatusChange: true,
  });

  if (loading && !data?.collections) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <InfiniteScroll
      dataLength={data.collections.length}
      style={{ overflow: "visible" }}
      next={() => {
        fetchMore({
          variables: {
            offset: data.collections.length,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            if (fetchMoreResult.collections.length < limit) setHasMore(false);
            return {
              collections: [
                ...prev.collections,
                ...fetchMoreResult.collections,
              ],
            };
          },
        });
      }}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
    >
      {/* <div className="grid grid-cols-4 gap-4"> */}
      <div className="">
        <div className="mx-auto">
          <h2 className="sr-only">Collections</h2>

          <div className="grid grid-cols-2 sm:mx-0 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2">
            {data.collections.map((collection: any) => {
              return (
                <div className="h-full border scale-100 hover:scale-[1.03] transition-all ease-in-out duration-200 rounded-lg shadow">
                  <Link
                    href={`/collection/${collection.sys_name}`}
                    className="h-full"
                  >
                    <div className="w-full  overflow-hidden h-full">
                      <div className="aspect-square w-full overflow-hidden">
                        <div className="relative h-full w-full">
                          <img
                            src={collection.card_image}
                            // fill={true}
                            alt={collection.name}
                            className="object-cover aspect-square rounded-t-lg"
                            // objectFit="contain"
                          />
                        </div>
                      </div>
                      <div className="py-3 px-2 text-center overflow-hidden">
                        <p className="line-clamp-2 font-semibold">
                          {collection.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </InfiniteScroll>
  );
};

export default InfiniteCollectionsFeed;
