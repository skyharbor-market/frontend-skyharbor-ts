import { useQuery } from "@apollo/client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GET_TOP_SALES_MONTH } from "@/lib/gqlQueries";
import { formatValueWithDP } from "@/ergofunctions/frontend_helpers";
import { longToCurrency } from "@/ergofunctions/serializer";
import { supportedCurrencies } from "@/ergofunctions/consts";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import ArtworkMedia from "../artworkMedia";

type Props = {};

const LoadingState = () => (
  <div className="animate-pulse flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="h-16 w-full md:w-1/5 bg-gray-300 rounded-lg"></div>
    ))}
  </div>
);

const TopSales = (props: Props) => {
  const getThirty = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo.toISOString();
  }, []);

  const { loading, error, data } = useQuery(GET_TOP_SALES_MONTH, {
    variables: { limit: 5, offset: 0, thirtyDaysAgo: getThirty },
  });

  if (loading) return <LoadingState />;
  if (error) return <div>Error loading top sales</div>;

  const sales = data?.sales || [];

  return (
    <div className="">
      <h2 className="text-2xl md:text-3xl font-bold  mb-4 md:mb-2 flex items-center justify-center">
        <ArrowTrendingUpIcon className="w-6 h-6 md:w-8 md:h-8 mr-2" />
        Top Monthly Sales
      </h2>
      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
        {sales.map((sale: any, index: number) => {
          const soldItem = {
            token_id: sale.token_id,
            completion_time: sale.completion_time,
            sales_address: sale.sales_address.address,
            nft_name: sale.token.nft_name,
            nerg_sale_value: sale.nerg_sale_value,
            seller_address: sale.seller_address,
            buyer_address: sale.buyer_address,
            spent_tx: sale.spent_tx,

            ipfs_art_hash: sale.token.ipfs_art_hash,
            ipfs_art_url: sale.token.ipfs_art_url,
            nft_type: sale.token.nft_type,
          };
          return (
          <motion.div
            key={`${sale.token_id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-slate-900 w-full rounded-xl p-3 md:p-4 flex flex-col items-center justify-between
              ${index === 0 ? "md:w-1/4 " : "md:w-1/5 "}
              ${index === 0 ? "border border-yellow-400 shadow-lg" : " border-gray-300 dark:border-gray-600 shadow-md border"}`}
          >
            <div className="flex items-center mb-2">
              {/* <div className={`text-lg md:text-2xl font-bold mr-2 ${index === 0 ? "text-yellow-600 dark:text-yellow-400" : ""}`}>
                #{index + 1}
              </div> */}
              <div
                className=" overflow-hidden aspect-square w-full"
                >
                
              <ArtworkMedia
                // @ts-ignore
                box={soldItem}
              />
              </div>

            </div>
            <div className="text-center">
              <Link href={`/token/${sale.token_id}`}>
                <h3 className="text-sm md:text-base font-semibold truncate text-ellipsis md:max-w-[120px] max-w-[1800px] cursor-pointer hover:underline">
                  {sale.token.nft_name}
                </h3>
              </Link>
              <Link href={`/collection/${sale.token.token_collection.sys_name}`}>
                <p className="text-xs dark:text-gray-300 text-gray-500 truncate md:max-w-[120px] cursor-pointer hover:underline">
                  {sale.token.token_collection.name}
                </p>
              </Link>
            </div>
            <div className="text-center mt-2">
              <p className={`text-sm md:text-lg font-bold ${index === 0 ? "text-yellow-600 dark:text-yellow-400" : ""}`}>
                {formatValueWithDP(
                  longToCurrency(
                    sale.nerg_sale_value,
                    supportedCurrencies[0].decimal
                  ),
                  2
                )}{" "}
                ERG
              </p>
              <p className="text-xs dark:text-gray-300 text-gray-500">
                {new Date(sale.completion_time).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  );
};

export default TopSales;
