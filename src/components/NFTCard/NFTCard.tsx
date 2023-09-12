import { StarIcon } from "@heroicons/react/24/outline";
import React from "react";
import ArtworkMedia from "../artworkMedia";

type Props = {
  product: any;
};

const NFTCard = ({ product }: Props) => {
  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="relative group h-full overflow-hidden border rounded">
      <div
        key={product.id}
        className="group relative p-4 sm:p-6 cursor-pointer  h-full "
      >
        <div className="transition-all aspect-square overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75">
          {/* <img
            src={product.ipfs_art_url}
            alt={product.nft_name}
            className="h-full w-full object-cover object-center"
          /> */}
          <ArtworkMedia box={product} />
        </div>
        <div className="pb-4 pt-10 text-center">
          <h3 className="text-sm font-medium text-gray-900  line-clamp-2">
            <a href={product.href}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.nft_name}
            </a>
          </h3>
          <div className="mt-3 flex flex-col items-center">
            <p className="sr-only">{product.rating} out of 5 stars</p>
            {/* <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <StarIcon
                  key={rating}
                  className={classNames(
                    product.rating > rating
                      ? "text-yellow-400"
                      : "text-gray-200",
                    "h-5 w-5 flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
              ))}
            </div> */}
            <p className="mt-1 text-sm text-gray-500">
              {product.nerg_sale_value} {product.currency}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute transition-all bottom-0 left-0 bg-blue-400 w-full opacity-0 group-hover:opacity-100">
        <button className="p-3 text-center w-full text-white text-white">
          Buy
        </button>
      </div>
    </div>
  );
};

export default NFTCard;
