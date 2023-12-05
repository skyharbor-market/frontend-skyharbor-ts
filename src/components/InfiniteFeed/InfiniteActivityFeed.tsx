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

const InfiniteActivityFeed = () => {
  const [hasMore, setHasMore] = useState(true);
  const limit = 30; // Number of NFTs to load each time

  const { data, loading, error, fetchMore } = useQuery(GET_ACTIVITY, {
    variables: { limit, offset: 0 },
    notifyOnNetworkStatusChange: true,
  });


  function gotoTransaction(txId) {
    window.open(
      `https://explorer.ergoplatform.com/en/transactions/${txId}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  }

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
          {/* <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"> */}
          <table className="min-w-full divide-y divide-gray-300 table-fixed">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  Item
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
                  From
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  To
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  <span>Transaction</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* <div className="grid grid-cols-4 gap-4"> */}
              {data.sales.map((transaction: any) => {
                // get how long ago it happened
                const daysAgoText = msToTime(transaction.completion_time);

                return (
                  <tr key={transaction.id} className="">
                    <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900 flex flex-row items-center">
                      <div className="w-12 aspect-square rounded overflow-hidden">
                        {/* <img
                          className="h-full w-full"
                          src={transaction.token.ipfs_art_url}
                          alt={transaction.token.nft_name}
                        /> */}
                        <ArtworkMedia box={convertGQLObject(transaction)}/>
                      </div>
                      <p className="w-5/6 ml-2 mb-0 font-semibold line-clamp-1">
                        {transaction.token.nft_name}
                      </p>
                    </td>

                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0 uppercase">
                      {longToCurrency(
                        transaction.nerg_sale_value,
                        0,
                        transaction.currency
                      )}{" "}
                      {transaction.currency}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
                      {friendlyAddress(transaction.seller_address, 4)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
                      {friendlyAddress(transaction.buyer_address, 4)}
                    </td>
                    <td className=" whitespace-nowrap px-2 py-2 text-sm text-gray-900">
                      {daysAgoText === ""
                        ? moment(transaction.completion_time).format(
                            "MMM Do, YYYY"
                          )
                        : `${daysAgoText} ago`}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 cursor-pointer hover:opacity-60 transition-colors" onClick={()=>gotoTransaction(transaction.spent_tx)}>
                      <div className="flex flex-row items-center"> 
                        
                      {friendlyToken(transaction.box_id, 4)}
                      <FaExternalLinkAlt className="ml-2"/>
                      </div>
                    </td>
                    {/* <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <a
                            href="#"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                            <span className="sr-only">, {transaction.id}</span>
                          </a>
                        </td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* </div>
        </div> */}
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
