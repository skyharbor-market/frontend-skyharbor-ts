import React, { useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { withApollo } from "../../lib/withApollo";
import SoldCard from "../SoldCard/SoldCard";

const GET_USER_ACTIVITY = gql`
  query getUserActivity($addresses: [String!]) {
    sales(
      where: {
        _and: {
          seller_address: { _in: $addresses }
          status: { _eq: "complete" }
        }
      }
      order_by: { list_time: desc }
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

function UserActivity({ addresses }) {
  let mounted = true;

  // Hasura
  const { loading, error, data } = useQuery(GET_USER_ACTIVITY, {
    variables: {
      addresses: addresses,
    },
  });

  useEffect(() => {
    mounted = true;

    return () => {
      mounted = false;
    };
  }, [addresses]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 place-content-center">
        {[0, 1, 2, 3, 4, 5].map((item) => {
          return (
            <div
              key={item}
              className="w-full h-4 bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          );
        })}
      </div>
    );
  } else if (error) {
    return (
      <div className="text-center">
        <span className="font-semibold text-center text-gray-800 dark:text-gray-200">
          An error occurred retrieving your listed NFTs. Please refresh, If
          problem persists, notify us on{" "}
          <span
            onClick={() =>
              window.open("https://discord.com/invite/JyxsBvjqWs", "_blank")
            }
            className="text-purple-400 cursor-pointer"
          >
            Discord
          </span>
          .
        </span>
      </div>
    );
  } else if (data.sales.length === 0) {
    return (
      <div className="text-center">
        <strong className="flex justify-center items-center text-gray-800 dark:text-gray-200">
          You haven{"'"}t sold any NFTs yet.
        </strong>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="  ">
        <table className="min-w-full dark:bg-gray-800 border dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.sales.map((item, index) => {
              const soldItem = {
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
              };

              return <SoldCard key={index} item={soldItem} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default withApollo()(UserActivity);
