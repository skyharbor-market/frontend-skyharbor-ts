import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { throttle } from "lodash";

import {
  ArrowPathIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from "@heroicons/react/20/solid";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { useQuery, gql } from "@apollo/client";
import Fade from "@/components/Fade/Fade";
import { addNumberCommas } from "@/ergofunctions/helpers";
import { longToCurrency } from "@/ergofunctions/serializer";
import { supportedCurrencies } from "@/ergofunctions/consts";
import Link from "next/link";
import { maxDP } from "@/ergofunctions/frontend_helpers";

const GET_WEEKLY_VOLUME = gql`
  query getWeeklyHourVolume {
    weekly_volume {
      sum
    }
  }
`;

const GET_LATEST_SALES = gql`
  query getLatestSales($limit: Int) {
    sales(
      where: {
        _and: {
          status: { _eq: "complete" }
          token: { token_collection: { verified: { _eq: true } } }
        }
      }
      order_by: { completion_time: desc }
      limit: $limit
    ) {
      token_id
      box_id
      completion_time
      sales_address {
        address
      }
      nerg_sale_value
      seller_address
      buyer_address
      spent_tx
      currency
      list_time
      token {
        nft_name
        nft_desc
        royalty_int
        royalty_address
        ipfs_art_hash
        ipfs_art_url
        nft_type
        token_collection {
          name
          sys_name
          verified
        }
      }
    }
  }
`;

const GET_LARGEST_SALES_LAST_MONTH = gql`
  query getLargestSalesLastMonth($oneMonthAgo: timestamptz!, $limit: Int) {
    sales(
      where: {
        _and: [
          { status: { _eq: "complete" } }
          { currency: { _eq: "erg" } }
          { completion_time: { _gte: $oneMonthAgo } }
          { token: { token_collection: { verified: { _eq: true } } } }
        ]
      }
      order_by: { nerg_sale_value: desc }
      limit: $limit
    ) {
      token_id
      box_id
      completion_time
      sales_address {
        address
      }
      nerg_sale_value
      seller_address
      buyer_address
      spent_tx
      currency
      list_time
      token {
        nft_name
        nft_desc
        royalty_int
        royalty_address
        ipfs_art_hash
        ipfs_art_url
        nft_type
        token_collection {
          name
          sys_name
          verified
        }
      }
    }
  }
`;

const GET_TOP_COLLECTIONS = gql`
  query getTopCollections($limit: Int) {
    collections(
      where: { verified: { _eq: true } }
      order_by: { sales_aggregate: { sum: { nerg_sale_value: desc } } }
      limit: $limit
    ) {
      id
      name
      sys_name
      card_image
      sales_aggregate {
        aggregate {
          sum {
            nerg_sale_value
          }
        }
      }
    }
  }
`;

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Landing() {
  let mounted = true;
  const { loading, error, data } = useQuery(GET_WEEKLY_VOLUME);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const imgAnimation = useAnimation();

  const handleMouseMove = throttle((e) => {
    const { clientX, clientY } = e;
    const moveX = clientX - window.innerWidth / 2;
    const moveY = clientY - window.innerHeight / 2;
    const offsetFactor = 20;
    imgAnimation.start({
      x: -moveX / offsetFactor,
      y: -moveY / offsetFactor,

      transition: {
        type: "spring",
        damping: 8,
        stiffness: 120,
      },
    });
  }, 50);

  useEffect(() => {
    return () => {
      imgAnimation.stop();
      mounted = false;
    };
  }, [imgAnimation]);

  const {
    loading: loadingLatestSales,
    error: errorLatestSales,
    data: dataLatestSales,
  } = useQuery(GET_LATEST_SALES, {
    variables: { limit: 10 },
  });

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoISO = oneMonthAgo.toISOString();

  const {
    loading: loadingLargestSales,
    error: errorLargestSales,
    data: dataLargestSales,
  } = useQuery(GET_LARGEST_SALES_LAST_MONTH, {
    variables: { oneMonthAgo: oneMonthAgoISO, limit: 10 },
  });

  const {
    loading: loadingTopCollections,
    error: errorTopCollections,
    data: dataTopCollections,
  } = useQuery(GET_TOP_COLLECTIONS, {
    variables: { limit: 10 },
  });

  return (
    <div className="">
      {/* Header */}

      <main>
        {/* Latest 10 sales */}
        <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Latest 10 Sales
          </h2>
          {loadingLatestSales ? (
            <p>Loading...</p>
          ) : errorLatestSales ? (
            <p>Error loading latest sales.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {dataLatestSales.sales.map((sale) => (
                <li key={sale.box_id} className="flex items-center space-x-4">
                  <img
                    src={sale.token.ipfs_art_url}
                    alt={sale.token.nft_name}
                    className="w-16 h-16 rounded"
                  />
                  <div>
                    <p className="text-lg font-semibold">
                      {sale.token.nft_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {sale.token.token_collection.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Sold for{" "}
                      {addNumberCommas(
                        maxDP(
                          longToCurrency(
                            sale.nerg_sale_value,
                            supportedCurrencies[0].decimal
                          ),
                          2
                        )
                      )}{" "}
                      {sale.currency.toUpperCase()} at{" "}
                      {new Date(sale.completion_time).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Largest sales in the last month where currency = "erg" */}
        <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Largest Sales in the Last Month (ERG)
          </h2>
          {loadingLargestSales ? (
            <p>Loading...</p>
          ) : errorLargestSales ? (
            <p>Error loading largest sales.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {dataLargestSales.sales.map((sale) => (
                <li key={sale.box_id} className="flex items-center space-x-4">
                  <img
                    src={sale.token.ipfs_art_url}
                    alt={sale.token.nft_name}
                    className="w-16 h-16 rounded"
                  />
                  <div>
                    <p className="text-lg font-semibold">
                      {sale.token.nft_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {sale.token.token_collection.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Sold for{" "}
                      {addNumberCommas(
                        maxDP(
                          longToCurrency(
                            sale.nerg_sale_value,
                            supportedCurrencies[0].decimal
                          ),
                          2
                        )
                      )}{" "}
                      {sale.currency.toUpperCase()} at{" "}
                      {new Date(sale.completion_time).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top 10 collections based on volume */}
        <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Top 10 Collections by Volume
          </h2>
          {loadingTopCollections ? (
            <p>Loading...</p>
          ) : errorTopCollections ? (
            <p>Error loading top collections.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataTopCollections.collections.map((collection) => (
                <div
                  key={collection.id}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <img
                    src={collection.card_image}
                    alt={collection.name}
                    className="w-full h-40 object-cover rounded"
                  />
                  <h3 className="mt-4 text-lg font-semibold">
                    {collection.name}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Total Volume:{" "}
                    {addNumberCommas(
                      maxDP(
                        longToCurrency(
                          collection.sales_aggregate.aggregate.sum
                            .nerg_sale_value,
                          supportedCurrencies[0].decimal
                        ),
                        2
                      )
                    )}{" "}
                    ERG
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// export default withApollo()(Landing);
