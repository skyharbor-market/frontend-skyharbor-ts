import React, { Fragment, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, gql } from "@apollo/client";
import { longToCurrency } from "@/ergofunctions/serializer";
import ArtworkMedia from "../artworkMedia";
import {
  convertGQLObject,
  friendlyAddress,
  friendlyToken,
} from "@/ergofunctions/helpers";
import moment from "moment";
import { FaExternalLinkAlt } from "react-icons/fa";

const GET_PREV_TOKEN_SALES = gql`
  query getTokenSales($tokenId: String, $limit: Int) {
    sales(
      where: {
        _and: { token_id: { _eq: $tokenId }, status: { _eq: "complete" } }
      }
      order_by: { completion_time: desc }
      limit: $limit
    ) {
      box_id
      buyer_address
      buyer_ergotree
      completion_time
      creation_height
      currency
      creation_tx
      id
      list_time
      nerg_royalty_value
      nerg_sale_value
      nerg_service_value
      sales_address_id
      sales_address {
        id
        address
      }
      seller_address
      seller_ergotree
      spent_tx
      status
      token_amount
      token_id
      token {
        nft_name
        nft_type
        nft_hash
        nft_desc
        ipfs_art_hash
        ipfs_audio_url
        ipfs_art_url
        royalty_address
        royalty_ergotree
        royalty_int
        token_id
        total_existing
        token_collection {
          sys_name
          name
        }
      }
    }
  }
`;

function TokenPrevSales({
  tokenId,
  expanded,
}: {
  tokenId: string;
  expanded: boolean;
}) {
  let mounted = true;
  const router = useRouter();

  const salesLimit = expanded ? 20 : 5;

  const { loading, error, data } = useQuery(GET_PREV_TOKEN_SALES, {
    variables: {
      tokenId: tokenId,
      limit: salesLimit,
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You can implement a toast notification here using a library of your choice
      console.log("Copied to clipboard");
    });
  };

  const gotoTransaction = (txId: string) => {
    window.open(
      `https://explorer.ergoplatform.com/en/transactions/${txId}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  };

  useEffect(() => {
    mounted = true;

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center w-full">
        <div className="mb-10 h-10 rounded-lg bg-gray-200 animate-pulse"></div>
      </div>
    );
  } else if (error) {
    return (
      <div className="text-center w-full">
        <p>There was an error retrieving token sales history.</p>
      </div>
    );
  } else if (data && data.sales) {
    return (
      <div>
        {data && data.sales && (
          <div className="transition-opacity duration-300 ease-in-out opacity-100">
            <div className="max-h-500 overflow-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
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

                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.sales.map((item: any, index: number) => {
                      const date1 = new Date(item.completion_time);
                      const date2 = new Date();
                      // @ts-ignore
                      const diffTime = Math.abs(date2 - date1);

                      const soldItem = {
                        id: item.id,
                        token_id: item.token_id,
                        completion_time: item.completion_time,
                        sales_address: item.sales_address.address,
                        nft_name: item.token.nft_name,
                        nerg_sale_value: item.nerg_sale_value,
                        seller_address: item.seller_address,
                        buyer_address: item.buyer_address,
                        spent_tx: item.spent_tx,
                        ipfs_art_hash: item.token.ipfs_art_hash,
                        ipfs_art_url: item.token.ipfs_art_url,
                        nft_type: item.token.nft_type,
                        currency: item.currency,
                        box_id: item.box_id,
                      };
                      const daysAgoText = msToTime(diffTime);

                      return (
                        // <SoldCard key={index} item={soldItem} noImage noTokenName/>
                        <tr
                          key={soldItem.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-3">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <ArtworkMedia
                                  // @ts-ignore
                                  box={convertGQLObject(item)}
                                />
                              </div>
                              <div className="ml-4">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {soldItem.nft_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {longToCurrency(
                              soldItem.nerg_sale_value,
                              0,
                              soldItem.currency
                            )}{" "}
                            {soldItem.currency}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {friendlyAddress(soldItem.seller_address, 4)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {friendlyAddress(soldItem.buyer_address, 4)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {daysAgoText === ""
                              ? moment(soldItem.completion_time).format(
                                  "MMM Do, YYYY"
                                )
                              : `${daysAgoText} ago`}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <button
                              onClick={() => gotoTransaction(soldItem.spent_tx)}
                              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              {friendlyToken(soldItem.box_id, 4)}
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
        )}
      </div>
    );
  }
}

export default TokenPrevSales;

function msToTime(ms: number) {
  let seconds = (ms / 1000).toFixed(0);
  let minutes = (ms / (1000 * 60)).toFixed(0);
  let hours = (ms / (1000 * 60 * 60)).toFixed(0);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);
  // @ts-ignore
  if (seconds < 60) return seconds + (seconds === "1" ? " sec" : " secs");
  // @ts-ignore
  else if (minutes < 60) return minutes + (minutes === "1" ? " min" : " mins");
  // @ts-ignore
  else if (hours < 24) return hours + (hours === "1" ? " hr" : " hrs");
  else return days + (days === "1" ? " day" : " days");
}
