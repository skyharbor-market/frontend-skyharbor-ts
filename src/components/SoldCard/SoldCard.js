import React, { Fragment } from "react";
import Link from "next/link";
import { longToCurrency } from "../../ergofunctions/serializer";
import ArtworkMedia from "../artworkMedia";
import { addNumberCommas, friendlyAddress } from "../../ergofunctions/helpers";
import { supportedCurrencies } from "@/ergofunctions/consts";
// import NFTInfo from "./NFTInfo";

export default function SoldCard({
  item,
  noImage = false,
  noCollection = false,
  noTokenName = false,
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const date1 = new Date(item.completion_time);
  const diffTime = new Date() - date1;

  // Copy text
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() =>
      toast({
        title: "Copied",
        // description: "We've created your account for you.",
        position: "top-right",
        status: "info",
        duration: 2000,
        isClosable: true,
      })
    );
  };

  const gotoAddressExplorer = (address) => {
    window.open(
      `https://explorer.ergoplatform.com/en/addresses/${address}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  };
  const gotoTransaction = (txId) => {
    window.open(
      `https://explorer.ergoplatform.com/en/transactions/${txId}`,
      "_blank" // <- This is what makes it open in a new window.
    );
  };

  // Get currency information
  let currencyObject = supportedCurrencies.find(
    (l) => l.contractAddress === item.sales_address
  );
  if (!currencyObject) {
    currencyObject = supportedCurrencies[0]; // Automatically set to ERG if there is none
  }

  return (
    <Fragment>
      <tr className="text-md">
        {!noTokenName && (
          <td>
            <div className="flex items-center space-x-2">
              {!noImage && (
                <div className="p-2">
                  <div
                    className="relative w-16 h-16 bg-white rounded overflow-hidden cursor-pointer"
                    onClick={() => setIsOpen(true)}
                  >
                    <ArtworkMedia key={item.ipfs_art_url} box={item} small />
                  </div>
                </div>
              )}
              <div>
                <p
                  className="truncate w-60 mb-1 font-semibold cursor-pointer"
                  onClick={() => setIsOpen(true)}
                >
                  {item.nft_name}
                </p>

                {!noCollection && (
                  <Link href={`/collection/${item.collection_sys_name}`}>
                    {item.collection_name}
                  </Link>
                )}
              </div>
            </div>
          </td>
        )}
        <td>
          <p className="font-semibold">
            {addNumberCommas(
              Math.round(
                longToCurrency(
                  parseInt(item.nerg_sale_value),
                  currencyObject.decimal
                ) * 1000
              ) / 1000
            )}{" "}
            {currencyObject.displayName}
          </p>
        </td>
        <td>
          <p
            className="font-semibold text-blue-400 cursor-pointer"
            onClick={() => gotoAddressExplorer(item.seller_address)}
          >
            {friendlyAddress(item.seller_address, 4)}
          </p>
        </td>
        <td>
          <p
            className="font-semibold text-blue-400 cursor-pointer"
            onClick={() => gotoAddressExplorer(item.buyer_address)}
          >
            {friendlyAddress(item.buyer_address, 4)}
          </p>
        </td>
        <td className="font-semibold">
          <div className="flex justify-between">
            <p>{msToTime(diffTime)} ago</p>
            {/* <svg
              className="h-6 w-6 text-blue-400 cursor-pointer"
              onClick={() => gotoTransaction(item.spent_tx)}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.606 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg> */}
          </div>

          {/* You might need a Tailwind modal library or create your own modal with Tailwind styles */}
          {/* {isOpen && (
            <div>
              <NFTInfo noBuy={true} box={item} />
              <button onClick={() => setIsOpen(false)}>Close</button>
            </div>
          )} */}
        </td>
      </tr>
    </Fragment>
  );
}

function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(0);
  let minutes = (ms / (1000 * 60)).toFixed(0);
  let hours = (ms / (1000 * 60 * 60)).toFixed(0);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);
  if (seconds < 60) return seconds + " sec";
  else if (minutes < 60) return minutes + " min";
  else if (hours < 24) return hours + " hrs";
  else return days + " days";
}
