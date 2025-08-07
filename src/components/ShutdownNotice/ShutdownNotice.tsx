import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ShutdownNotice: React.FC = () => {
  const router = useRouter();

  const handleGoToWallet = () => {
    router.push('/wallet');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-8 md:p-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Important Notice
            </h1>
            
            <div className="space-y-4 mb-8">
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300">
                SkyHarbor is shutting down
              </p>
              
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Thank you for being part of our journey. We appreciate every user who has supported and used our platform.
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
                <p className="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Action Required
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please visit your wallet to delist any NFTs you currently have listed on the marketplace.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoToWallet}
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Go to Wallet to Delist NFTs
              </button>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                If you have any questions, please contact support.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Thank you for using SkyHarbor
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShutdownNotice;