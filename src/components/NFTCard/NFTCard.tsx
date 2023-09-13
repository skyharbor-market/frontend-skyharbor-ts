import { SupportedCurrenciesV2 } from "@/ergofunctions/consts";
import { longToCurrency } from "@/ergofunctions/serializer";
import { StarIcon } from "@heroicons/react/24/outline";
import React from "react";
import ArtworkMedia from "../artworkMedia";

type Props = {
  token: any;
};

const NFTCard = ({ token }: Props) => {
  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="relative transition-all group h-full overflow-hidden border dark:border-gray-600 rounded-lg shadow-lg dark:shadow-dark bg-white dark:bg-slate-800 scale-100 hover:scale-[1.05]">
      <div
        key={token.id}
        className="transition-all group relative h-full group-hover:-mt-6"
      >
        <div className="aspect-square overflow-hidden bg-gray-200 group-hover:opacity-90 bg-white cursor-pointer">
          {/* <img
            src={token.ipfs_art_url}
            alt={token.nft_name}
            className="h-full w-full object-cover object-center"
          /> */}
          <ArtworkMedia box={token} />
        </div>
        <div className="pb-6 pt-4 text-left p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200  line-clamp-1 h-6">
            {/* <span aria-hidden="true" className="absolute inset-0" /> */}
            {token.nft_name}
          </h3>
          <div className="mt-2 flex flex-col">
            <p className="sr-only">{token.rating} out of 5 stars</p>
            {/* <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <StarIcon
                  key={rating}
                  className={classNames(
                    token.rating > rating
                      ? "text-yellow-400"
                      : "text-gray-200",
                    "h-5 w-5 flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
              ))}
            </div> */}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 line-clamp-1">
              {longToCurrency(token.nerg_sale_value, undefined, token.currency)}{" "}
              {SupportedCurrenciesV2[token.currency].displayName}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute transition-all bottom-0 left-0 bg-blue-500 w-full opacity-0 group-hover:opacity-100 cursor-pointer">
        <button className="p-2 text-center w-full text-white text-white text-sm">
          Buy
        </button>
      </div>
    </div>
  );
};

export default NFTCard;
