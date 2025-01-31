/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
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
import { withApollo } from "../lib/withApollo";
import { useQuery, gql } from "@apollo/client";
import Fade from "@/components/Fade/Fade";
import { addNumberCommas } from "@/ergofunctions/helpers";
import { longToCurrency } from "@/ergofunctions/serializer";
import { supportedCurrencies } from "@/ergofunctions/consts";
import Link from "next/link";
import { maxDP } from "@/ergofunctions/frontend_helpers";
import TopCollections from "@/components/LandingPage/TopCollections";
import { BsBarChart } from "react-icons/bs";
import TopSales from "@/components/LandingPage/TopSales";
import LatestSales from "@/components/LandingPage/LatestSales";
import SEO from '@/components/SEO/SEO';
import { useThemeDetector } from "@/hooks/useThemeDetector";
import AnimatedBackground from '@/components/AnimatedBackground/AnimatedBackground';

const GET_WEEKLY_VOLUME = gql`
  query getWeeklyHourVolume {
    weekly_volume {
      sum
    }
  }
`;

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const Home = () => {
  const currentTheme = useThemeDetector();
  let mounted = true;
  const { loading, error, data } = useQuery(GET_WEEKLY_VOLUME);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const imgAnimation = useAnimation();

  const handleMouseMove = throttle((e: any) => {
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
        // ease: "linear",
        // duration: 0.15,
      },
    });
  }, 50); // Adjust the second parameter to control the throttling rate

  // Clean up animation on component unmount
  useEffect(() => {
    return () => {
      imgAnimation.stop();
      mounted = false
    };
  }, [imgAnimation]);

  return (
    <>
      <SEO 
        title="SkyHarbor | Ergo NFT Marketplace"
        url="https://skyharbor.io"
      />
      {/* Hero section - outside of layout padding */}
      <div 
        className="relative isolate h-[60vh] w-screen flex items-center overflow-hidden -mt-8" 
        id="home-hero-section"
        style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}
      >
        {/* Replace the static background div with the animated component */}
        <AnimatedBackground currentTheme={currentTheme} />

        {/* Grid pattern overlay */}
        <svg
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-100 dark:fill-gray-100/10">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
          />
        </svg>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:flex lg:items-center  lg:px-8 -mt-24">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <h1 className="max-w-lg text-4xl font-bold text-center tracking-tight mb-3 text-gray-900 dark:text-gray-100 sm:text-8xl">
              SkyHarbor
            </h1>
            <p className="mt-3 max-w-lg text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
              Buy and sell NFTs.
            </p>
            <div className="mt-2">
              <Fade fadeKey={"volume"}>
                <div className="flex justify-center">
                  <div className="inline-flex mt-3 items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    <BsBarChart className="mr-2"/>
                    <span>
                    {data?.weekly_volume[0].sum
                      ? addNumberCommas(
                          maxDP(
                            longToCurrency(
                              data.weekly_volume[0].sum,
                              supportedCurrencies[0].decimal
                            ),
                            0
                          )
                        )
                      : 0}{" "}
                    ERG weekly volume
                    </span>
                  </div>
                </div>
              </Fade>
            </div>
            {/* <div className="mt-10 flex items-center gap-x-6">
              <Link href="/marketplace">
                <div className="rounded-md cursor-pointer bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  View Marketplace
                </div>
              </Link>
            </div> */}
          </div>
          
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <motion.div
              animate={imgAnimation}
              onMouseMove={(e) => handleMouseMove(e)}
              onMouseOut={(e) => {
                if(mounted) {
                  imgAnimation.start({
                    x: 0,
                    y: 0,
                  });
                }
              }}
            >
              {/* Remove the Image component since we're using background image now */}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Regular content - uses layout padding */}
      <div>
        {/* TOP SALES */}
        <div className="mb-24 -mt-32 z-10 relative">
          <TopSales />
        </div>

        {/* TOP COLLECTIONS */}
        <div>
          <TopCollections />
        </div>
        
        {/* LATEST SALES */}
        <div>
          <LatestSales />
        </div>
      </div>
    </>
  );
};

export default Home;
