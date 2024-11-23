import ActivityTable from "@/components/ActivityTable/ActivityTable";
import InfiniteActivityFeed from "@/components/InfiniteFeed/InfiniteActivityFeed";
import InfiniteCollectionsFeed from "@/components/InfiniteFeed/InfiniteCollectionsFeed";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import NFTCard from "@/components/NFTCard/NFTCard";
import { convertGQLObject } from "@/ergofunctions/helpers";
import { gql, useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import React from "react";
import SEO from '@/components/SEO/SEO';

const GET_TOP_WEEKLY_SALES = gql`
  query getTopWeeklySales($date: timestamptz, $limit: Int) {
    sales(
      where: {
        _and: { completion_time: { _gte: $date }, status: { _eq: "complete" } }
      }
      order_by: { nerg_sale_value: desc }
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
          verified
        }
      }
    }
  }
`;

type Props = {};

const Activity = (props: Props) => {
  return (
    <>
      <SEO 
        title="Activity"
        description="View the latest NFT sales and listings on SkyHarbor"
        url="https://skyharbor.io/activity"
      />
      <div>
        <div>
          <p className="text-center text-4xl font-semibold">Activity</p>
        </div>
        {/* <div className="bg-blue-500 h-40 w-full mt-8 w-full">
          <motion.div
            // let:motion
            className="w-full flex flex-row space-x-6"
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            initial={{ x: 0 }}
            animate={{ x: -window?.innerWidth }}
          >
            <img
              src={"assets/images/skyharborlogo.png"}
              alt="image"
              className="rounded h-40"
            />
          </motion.div>
        </div> */}
        {/* {renderTopSales()} */}
        <div className="mt-8">
          <InfiniteActivityFeed />
        </div>
      </div>
    </>
  );
};

export default Activity;
