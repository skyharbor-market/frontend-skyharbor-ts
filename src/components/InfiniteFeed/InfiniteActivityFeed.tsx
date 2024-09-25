import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { GET_ACTIVITY } from "@/lib/gqlQueries";
import {
  convertGQLObject,
  friendlyAddress,
  friendlyToken,
} from "@/ergofunctions/helpers";
import NFTCard from "../NFTCard/NFTCard";
import moment from "moment";
import { longToCurrency } from "@/ergofunctions/serializer";
import ArtworkMedia from "../artworkMedia";
import { BsLink } from "react-icons/bs";
import { FaExternalLinkAlt } from "react-icons/fa";
import LoadingCircle from "../LoadingCircle/LoadingCircle";
import Link from "next/link";

const InfiniteActivityFeed = () => {
  const [hasMore, setHasMore] = useState(true);
  const limit = 30; // Number of NFTs to load each time

  const { data, loading, error, fetchMore } = useQuery(GET_ACTIVITY, {
    variables: { limit, offset: 0 },
    notifyOnNetworkStatusChange: true,
  });


  function gotoTransaction(txId: string) {
    window.open(
      `https://explorer.ergoplatform.com/en/transactions/${txId}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  }

  if (loading && !data?.sales) return (
    <div className="m-auto w-12">
          <LoadingCircle />
        </div>
  );
  if (error) return <p className="text-red-500 dark:text-red-400">Error: {error.message}</p>;

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
      loader={<h4 className="text-gray-600 dark:text-gray-400">Loading...</h4>}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            {/* Add any additional buttons or controls here */}
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-3">Item</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Price</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">From</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">To</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {data.sales.map((transaction: any) => {
                  const daysAgoText = msToTime(transaction.completion_time);

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Link href={`/token/${transaction.token_id}`}>
                      <a>

                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <ArtworkMedia box={convertGQLObject(transaction)} />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.token.nft_name}</p>
                          </div>
                        </div>
                      </td>
                      </a>

                      </Link>

                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {longToCurrency(transaction.nerg_sale_value, 0, transaction.currency)} {transaction.currency}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{friendlyAddress(transaction.seller_address, 4)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{friendlyAddress(transaction.buyer_address, 4)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {daysAgoText === "" ? moment(transaction.completion_time).format("MMM Do, YYYY") : `${daysAgoText} ago`}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <button
                          onClick={() => gotoTransaction(transaction.spent_tx)}
                          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          {friendlyToken(transaction.box_id, 4)}
                          <FaExternalLinkAlt className="ml-2" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InfiniteScroll>
  );
};

export default InfiniteActivityFeed;

function msToTime(completion_time: string) {
  const date1: any = new Date(completion_time);
  const date2: any = new Date();
  const ms = Math.abs(date2 - date1);

  let seconds: any = (ms / 1000).toFixed(0);
  let minutes: any = (ms / (1000 * 60)).toFixed(0);
  let hours: any = (ms / (1000 * 60 * 60)).toFixed(0);
  let days: any = (ms / (1000 * 60 * 60 * 24)).toFixed(0);
  if (seconds < 60) return seconds + " sec";
  else if (minutes < 60) return minutes + " min";
  else if (hours < 24) return hours + " hrs";
  else if (days < 2) return hours + " hours";
  else return "";
}
