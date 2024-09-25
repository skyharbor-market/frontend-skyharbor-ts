import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { GET_NFTS } from "@/lib/gqlQueries";
import { convertGQLObject } from "@/ergofunctions/helpers";
import NFTCard from "../NFTCard/NFTCard";
import { useSelector } from "react-redux";
import { DocumentNode } from "graphql";
import LoadingCircle from "../LoadingCircle/LoadingCircle";
import Link from "next/link";

interface InfiniteNFTFeedProps {
}

const LatestSales = ({
}: InfiniteNFTFeedProps) => {
  const limit = 18; // Number of NFTs to load each time
  // @ts-ignore
  const userAddresses = useSelector((state) => state.wallet.addresses);


  const { data, loading, error, fetchMore, refetch } = useQuery(GET_NFTS, {
    variables: {
      limit,
      offset: 0,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (loading && !data?.sales)
    return (
      <div className="w-24 h-24 mx-auto">
        <LoadingCircle />
      </div>
    );
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="mt-12">
      <div className="mx-auto ">
        <h2 className="sr-only">NFTs</h2>


        <h2 className="text-2xl md:text-3xl font-bold  mb-4 md:mb-6 flex items-center justify-center">
        Latest Listings
      </h2>

        <div className="grid grid-cols-2 sm:mx-0 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6 pb-8">
          {data.sales.map((nft: any, index: number) => {
            const nftObj = convertGQLObject(nft);

            return (
              <NFTCard
                token={nftObj}
                userAddresses={userAddresses}
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

    <Link href="/marketplace">
      <div className="flex justify-center mt-4">
        <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center">
          View All
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </Link>
    </div>
  );
};

export default LatestSales;
