import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ShutdownNotice: React.FC = () => {
  const router = useRouter();

  const handleGoToWallet = () => {
    router.push('/wallet');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
           <div className="relative w-24 h-24 mb-6">
            <img
              src="/assets/images/skyharborlogo.png"
              alt="SkyHarbor Logo"
              // fill
              style={{ objectFit: 'contain' }}
              className="mx-auto"
              // priority
            />
          </div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            SkyHarbor is Shutting Down
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Thank you for being a part of our journey.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
          <div className="space-y-6">
            <div>
               <p className="text-base text-gray-700 dark:text-gray-300 text-center">
                We appreciate every user who has supported our platform. As we wind down operations, please ensure you retrieve your assets.
              </p>
            </div>

            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Action Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Please visit your wallet page to delist any NFTs you currently have listed on the marketplace before the platform goes offline.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={handleGoToWallet}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
              >
                Go to Wallet to Delist NFTs
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-500 dark:text-gray-500">
          &copy; {new Date().getFullYear()} SkyHarbor. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ShutdownNotice;