import { useQuery } from "@apollo/client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GET_TOP_MONTHLY_COLLECTIONS } from "@/lib/gqlQueries";
import { formatValueWithDP } from "@/ergofunctions/frontend_helpers";
import { longToCurrency } from "@/ergofunctions/serializer";
import { supportedCurrencies } from "@/ergofunctions/consts";
import Button from "../Button/Button";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";

type Props = {};

type CollectionItemProps = {
  collection: any;
  index: number;
  startIndex: number;
  isHighlighted: boolean;
};

const CollectionItem: React.FC<CollectionItemProps> = ({ collection, index, startIndex, isHighlighted }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    // <Link href={`/collection/${collection.sys_name}`}>
      <motion.a
        key={collection.id}
        className={`relative flex cursor-pointer items-center justify-between px-4 py-2 bg-white rounded-lg backdrop-blur-md transition-all duration-300 hover:bg-opacity-30 overflow-hidden ${
          isHighlighted ? 'ring-2 ring-purple-300 shadow-lg bg-opacity-10' : 'bg-opacity-20'
        }`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="flex items-center z-10">
          <img
            src={collection.card_image}
            alt={collection.name}
            className="w-12 h-12 object-cover rounded-full mr-4 border-2 border-white"
          />
          <span className="font-semibold text-white">
            {startIndex + index + 1}. {collection.name}
          </span>
        </div>
        {/* <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: isHovered ? "0%" : "100%", opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute inset-y-0 right-0 w-1/3 flex items-center justify-center bg-purple-600 bg-opacity-80 z-20  px-2 text-center whitespace-nowrap"
        >
          <span className="text-white font-bold text-xs md:text-xs transform flex flex-row items-center">View Collection <ArrowRightCircleIcon className="h-4 w-4 md:w-5 md:h-5 ml-1" /></span>
        </motion.div> */}
        <span className="text-white font-medium z-10">
          {formatValueWithDP(
            longToCurrency(
              collection.sum,
              supportedCurrencies[0].decimal
            ),
            0
          )}{" "}
          ERG
        </span>
      </motion.a>
    // </Link>
  );
};

const LoadingState = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-300 rounded-xl mb-4"></div>
    <div className="space-y-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="h-16 bg-gray-300 rounded-lg"></div>
      ))}
    </div>
  </div>
);

const TopCollections = (props: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    loading: loadingTopCollections,
    error: errorTopCollections,
    data: dataTopCollections,
  } = useQuery(GET_TOP_MONTHLY_COLLECTIONS);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (dataTopCollections?.monthly_top_collection_volumes) {
        setCurrentIndex(
          (prevIndex) =>
            (prevIndex + 1) %
            dataTopCollections.monthly_top_collection_volumes.length
        );
      }
    }, 5000);
  }, [dataTopCollections]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  if (loadingTopCollections) return <LoadingState />;
  if (errorTopCollections) return <div>Error loading top collections</div>;

  const collections = dataTopCollections?.monthly_top_collection_volumes || [];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    startTimer();
  };

  // Calculate the middle index to split the collections evenly
  const middleIndex = Math.ceil(collections.length / 2);

  return (
    <div>
      <div className="mx-auto mt-8 max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 z-[2] px-6 py-12 rounded-xl sm:rounded-3xl sm:px-16 sm:py-20 lg:py-20 xl:px-24">
          <AnimatePresence mode="wait" initial={false}>
            {collections.map(
              (collection: any, index: number) =>
                index === currentIndex && (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="mx-auto flex flex-col md:flex-row justify-between max-w-2xl gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none">
                      <div className="lg:max-w-lg">
                        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                          #{index + 1} {collection.name}
                        </h2>
                        <p className="mt-6 leading-7 text-gray-300 h-32 overflow-hidden">
                          <span className="line-clamp-4 sm:line-clamp-4 md:line-clamp-4">
                            {collection.description}
                          </span>
                        </p>

                        <div className="mt-3 lg:mt-3">
                          <div className="inline-flex items-baseline px-4 pb-2 pt-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                            <span className="text-2xl font-bold text-white">
                              {formatValueWithDP(
                                longToCurrency(
                                  collection.sum,
                                  supportedCurrencies[0].decimal
                                ),
                                0
                              )}
                              <span className="ml-1 text-lg font-semibold">
                                ERG
                              </span>
                              <span className="text-xs font-semibold text-white ml-1">
                                Monthly Volume
                              </span>
                            </span>
                          </div>
                        </div>
                        <Link href={`/collection/${collection.sys_name}`}>
                        <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-3 py-2 rounded-lg text-sm mt-3">
                          View Collection
                        </button>
                        </Link>
                      </div>
                      <div className="w-full md:w-1/3">
                        <div
                          className="relative -z-20 min-w-full max-w-xl rounded-xl shadow-xl ring-1 ring-white/10 lg:row-span-4"
                          style={{
                            backgroundImage: `url(${collection.card_image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            height: "250px",
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {collections.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
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
        <div className="-mt-14 relative overflow-hidden rounded-b-xl z-[1]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-700 opacity-75 blur-xl"></div>
          <div className="relative pt-20 pb-4 px-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-4">
                {collections.slice(0, middleIndex).map((collection: any, index: number) => (
                  <div onClick={()=>goToSlide(index)}>

                  <CollectionItem 
                    key={collection.id} 
                    collection={collection} 
                    index={index} 
                    startIndex={0} 
                    isHighlighted={index === currentIndex}
                  />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {collections.slice(middleIndex).map((collection: any, index: number) => (
                  <div onClick={()=>goToSlide(index + middleIndex)}>

                  <CollectionItem 
                    key={collection.id} 
                    collection={collection} 
                    index={index} 
                    startIndex={middleIndex} 
                    isHighlighted={index + middleIndex === currentIndex}
                  />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopCollections;
