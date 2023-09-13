import ActivityTable from "@/components/ActivityTable/ActivityTable";
import InfiniteActivityFeed from "@/components/InfiniteFeed/InfiniteActivityFeed";
import InfiniteCollectionsFeed from "@/components/InfiniteFeed/InfiniteCollectionsFeed";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import { motion } from "framer-motion";
import React from "react";

type Props = {};

const Marketplace = (props: Props) => {
  return (
    <div>
      <div>
        <p className="text-center text-4xl font-semibold">Activity</p>
      </div>
      <div className="bg-blue-500 h-40 w-full mt-8 w-full">
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

          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />
          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />

          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />
          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />

          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />
          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />

          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />
          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />

          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />
          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />

          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />
          <img
            src={"assets/images/skyharborlogo.png"}
            alt="image"
            className="rounded h-40"
          />
        </motion.div>
      </div>
      <div className="mt-8">
        <InfiniteActivityFeed />
      </div>
    </div>
  );
};

export default Marketplace;
