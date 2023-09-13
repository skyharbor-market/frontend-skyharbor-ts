import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { GET_ACTIVITY } from "@/lib/gqlQueries";
import { convertGQLObject } from "@/ergofunctions/helpers";
import NFTCard from "../NFTCard/NFTCard";
import moment from "moment";

const InfiniteActivityFeed = () => {
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // Number of NFTs to load each time

  const { data, loading, error, fetchMore } = useQuery(GET_ACTIVITY, {
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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Transactions
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A table of placeholder stock market data that does not make any
              sense.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            {/* <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Export
          </button> */}
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      NFT
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Commision
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Net amount
                    </th>
                    <th
                      scope="col"
                      className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0"
                    >
                      <span className="sr-only">Explorer Link</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {/* <div className="grid grid-cols-4 gap-4"> */}
                  {data.sales.map((transaction: any) => {
                    // get how long ago it happened
                    const daysAgoText = msToTime(transaction.completion_time);

                    return (
                      <tr key={transaction.id}>
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                          {daysAgoText === "" ? "" : `${daysAgoText} ago`}
                          {/* ago */}
                          {moment(transaction.completion_time).format(
                            "MMM Do, YYYY"
                          )}{" "}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900 flex flex-row items-center">
                          <div className="w-16 w-16 aspect-square rounded overflow-hidden">
                            <img
                              className="h-full w-full"
                              src={transaction.token.ipfs_art_url}
                              alt={transaction.token.nft_name}
                            />
                          </div>
                          <p className="ml-2 mb-0 font-semibold">
                            {transaction.token.nft_name}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
                          {transaction.token.nft_name}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                          {transaction.currency}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                          {transaction.currency}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                          {transaction.currency}
                        </td>
                        <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <a
                            href="#"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                            <span className="sr-only">, {transaction.id}</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </InfiniteScroll>
  );
};

export default InfiniteActivityFeed;

function msToTime(completion_time) {
  const date1 = new Date(completion_time);
  const date2 = new Date();
  const ms = Math.abs(date2 - date1);

  let seconds = (ms / 1000).toFixed(0);
  let minutes = (ms / (1000 * 60)).toFixed(0);
  let hours = (ms / (1000 * 60 * 60)).toFixed(0);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);
  if (seconds < 60) return seconds + " sec";
  else if (minutes < 60) return minutes + " min";
  else if (hours < 24) return hours + " hrs";
  else if (days < 2) return hours + " day";
  else return "";
}
