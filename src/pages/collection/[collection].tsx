import CustomInput from "@/components/CustomInput/CustomInput";
import InfiniteNFTFeed from "@/components/InfiniteFeed/InfiniteNFTFeed";
import { GET_COLLECTION_NFTS, GET_NFTS } from "@/lib/gqlQueries";
import { useRouter } from "next/router";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { MdSearch } from "react-icons/md";

const Collection = () => {
  const router = useRouter();
  const { collection } = router.query;
  console.log("router collection", collection);

  return (
    <div>
      <div>
        <p className="text-center text-4xl font-semibold">{collection}</p>
      </div>
      <div className="mt-8">
        <div className="max-w-5xl mx-auto mb-6">
          <CustomInput leftIcon={<MdSearch />} placeholder="Search..." />
        </div>
        <div>
          <InfiniteNFTFeed
            gqlQuery={GET_COLLECTION_NFTS}
            collection={collection}
          />
        </div>
      </div>
    </div>
  );
};

export default Collection;
