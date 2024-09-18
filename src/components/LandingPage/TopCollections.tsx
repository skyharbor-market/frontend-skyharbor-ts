import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { GET_TOP_MONTHLY_COLLECTIONS } from "@/lib/gqlQueries";
import { formatValueWithDP } from "@/ergofunctions/frontend_helpers";
import { longToCurrency } from "@/ergofunctions/serializer";
import { supportedCurrencies } from "@/ergofunctions/consts";

type Props = {};

const TopCollections = (props: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    loading: loadingTopCollections,
    error: errorTopCollections,
    data: dataTopCollections,
  } = useQuery(GET_TOP_MONTHLY_COLLECTIONS);

  if (loadingTopCollections) return <div>Loading...</div>;
  if (errorTopCollections) return <div>Error loading top collections</div>;

  const collections = dataTopCollections?.monthly_top_collection_volumes || [];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % collections.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + collections.length) % collections.length
    );
  };

  return (
    <div>
      <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-12 rounded-xl sm:rounded-3xl sm:px-16 sm:py-24 lg:py-24 xl:px-24">
          {collections.map((collection: any, index: number) => (
            <div
              key={collection.id}
              className={`mx-auto flex flex-col md:flex-row max-w-2xl gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none ${
                index === currentIndex ? "block" : "hidden"
              }`}
            >
              <div className="lg:max-w-md">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {collection.name}
                </h2>
                <p className="mt-6 leading-7 text-gray-300 line-clamp-5">
                  {collection.description}
                </p>

                <div className="max-w-xl lg:row-start-3 mt-4 lg:mt-10 lg:max-w-md lg:border-t lg:border-white/10 lg:pt-10">
                  <dl className="max-w-xl space-y-8 text-base leading-7 text-gray-300 lg:max-w-none">
                    <div className="relative">
                      <dt className="inline-block font-semibold text-white">
                        Volume
                      </dt>{" "}
                      <dd className="inline">
                        {formatValueWithDP(
                          longToCurrency(
                            collection.sum,
                            supportedCurrencies[0].decimal
                          ),
                          0
                        )}{" "}
                        ERG
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div
                  className="relative -z-20 min-w-full max-w-xl rounded-xl shadow-xl ring-1 ring-white/10 lg:row-span-4 "
                  style={{
                    backgroundImage: `url(${collection.card_image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    //   filter: 'blur(8px)',
                    height: "400px",
                  }}
                />
              </div>
            </div>
          ))}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 rounded-full p-2"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 rounded-full p-2"
          >
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </button>
          <div
            className="pointer-events-none absolute left-12 top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-3xl lg:bottom-[-12rem] lg:top-auto lg:translate-y-0 lg:transform-gpu"
            aria-hidden="true"
          >
            <div
              className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-25"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopCollections;
