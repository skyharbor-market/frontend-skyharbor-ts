import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { GET_NFTS, GET_UNVERIFIED_NFTS, GET_NFTS_SEARCH, GET_UNVERIFIED_NFTS_SEARCH } from "@/lib/gqlQueries";
import { convertGQLObject } from "@/ergofunctions/helpers";
import NFTCard from "../NFTCard/NFTCard";
import { useSelector } from "react-redux";
import { DocumentNode } from "graphql";
import LoadingCircle from "../LoadingCircle/LoadingCircle";

interface InfiniteNFTFeedProps {
  gqlQuery: DocumentNode;
  collection?: string;
  searchTerm?: string;
  orderBy?: any;
  verifiedOnly: boolean;
}

const InfiniteNFTFeed = ({ 
  gqlQuery, 
  collection, 
  searchTerm, 
  orderBy,
  verifiedOnly 
}: InfiniteNFTFeedProps) => {
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;
  const userAddresses = useSelector((state: any) => state.wallet.addresses);
  const isSearchActive = searchTerm && searchTerm.trim() !== "";

  // Query for verified NFTs
  const { 
    data: verifiedData, 
    loading: verifiedLoading, 
    error: verifiedError, 
    fetchMore: fetchMoreVerified 
  } = useQuery(isSearchActive ? GET_NFTS_SEARCH : GET_NFTS, {
    variables: { 
      limit, 
      offset: 0, 
      collection, 
      orderBy,
      ...(isSearchActive && { search: `%${searchTerm}%` })
    },
    skip: !verifiedOnly,
  });

  // Query for unverified NFTs
  const { 
    data: unverifiedData, 
    loading: unverifiedLoading, 
    error: unverifiedError, 
    fetchMore: fetchMoreUnverified 
  } = useQuery(isSearchActive ? GET_UNVERIFIED_NFTS_SEARCH : GET_UNVERIFIED_NFTS, {
    variables: { 
      limit, 
      offset: 0, 
      collection, 
      orderBy,
      ...(isSearchActive && { search: `%${searchTerm}%` })
    },
    skip: verifiedOnly,
  });

  const data = verifiedOnly ? verifiedData : {
    sales: [...(verifiedData?.sales || []), ...(unverifiedData?.sales || [])]
  };
  const loading = verifiedOnly ? verifiedLoading : (verifiedLoading || unverifiedLoading);
  const error = verifiedOnly ? verifiedError : (verifiedError || unverifiedError);

  useEffect(() => {
    if (isSearchActive) {
      fetchMoreVerified({ 
        variables: {
          search: `%${searchTerm}%`, 
          orderBy, 
          offset: 0 
        }
      });
      fetchMoreUnverified({ 
        variables: {
          search: `%${searchTerm}%`, 
          orderBy, 
          offset: 0 
        }
      });
    } else {
      fetchMoreVerified({ 
        variables: {
          orderBy, 
          offset: 0 
        }
      });
      fetchMoreUnverified({ 
        variables: {
          orderBy, 
          offset: 0 
        }
      });
    }
    setHasMore(true);
  }, [searchTerm, orderBy, verifiedOnly, fetchMoreVerified, fetchMoreUnverified, isSearchActive]);

  if (loading && !data?.sales) return <div className="w-24 h-24 mx-auto"><LoadingCircle /></div>;
  if (!loading && data?.sales?.length <= 0) return <div className="text-center"><p>No NFTs found {isSearchActive ? `under "${searchTerm}"` : ""}</p></div>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <InfiniteScroll
      dataLength={data.sales.length}
      style={{ overflow: "visible" }}
      next={() => {
        if (verifiedOnly) {
          fetchMoreVerified({
            variables: {
              offset: verifiedData?.sales.length || 0,
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
        } else {
          Promise.all([
            fetchMoreVerified({
              variables: {
                offset: verifiedData?.sales.length || 0,
                ...(isSearchActive && { search: `%${searchTerm}%` })
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                if (fetchMoreResult.sales.length < limit) setHasMore(false);
                return {
                  sales: [...prev.sales, ...fetchMoreResult.sales],
                };
              },
            }),
            fetchMoreUnverified({
              variables: {
                offset: unverifiedData?.sales.length || 0,
                ...(isSearchActive && { search: `%${searchTerm}%` })
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                if (fetchMoreResult.sales.length < limit) setHasMore(false);
                return {
                  sales: [...prev.sales, ...fetchMoreResult.sales],
                };
              },
            })
          ]);
        }
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
      </div>
    </InfiniteScroll>
  );
};

export default InfiniteNFTFeed;
