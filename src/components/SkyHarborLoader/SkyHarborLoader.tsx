import React from 'react';
import { CloudIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const SkyHarborLoader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        {/* Main pulsing cloud */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <CloudIcon className="w-24 h-24 text-blue-500 dark:text-blue-400" />
        </motion.div>
        
        {/* Small drifting clouds */}
        <motion.div
          className="absolute top-1/2 left-0"
          animate={{ 
            x: [0, 80],
            opacity: [0, 1, 0],
            scale: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "linear",
            delay: 0.5
          }}
        >
           <CloudIcon className="w-8 h-8 text-blue-300 dark:text-blue-600 opacity-50" />
        </motion.div>

         <motion.div
          className="absolute bottom-0 right-0"
          animate={{ 
            x: [0, -60],
            opacity: [0, 1, 0],
            scale: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "linear",
            delay: 1
          }}
        >
           <CloudIcon className="w-6 h-6 text-blue-300 dark:text-blue-600 opacity-50" />
        </motion.div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {text}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          We're fetching your assets from the SkyHarbor marketplace contract. This process can take a while.
        </p>
      </div>
    </div>
  );
};

export default SkyHarborLoader;
