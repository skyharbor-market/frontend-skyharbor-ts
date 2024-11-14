import { ComponentType, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

interface TabProps {
  name: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}

interface TabsProps {
  tabs: TabProps[];
  setTab: (params: string) => void;
  currentTab: string;
}

export default function Tabs({ tabs, setTab, currentTab }: TabsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTabData = tabs.find(tab => tab.value === currentTab);
  const Icon = currentTabData?.icon;

  return (
    <div className="w-full">
      <div className="sm:hidden">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
          >
            <div className="flex items-center">
              {Icon && <Icon className="h-5 w-5 mr-2" />}
              <span className="text-gray-900 dark:text-gray-100">
                {currentTabData?.name}
              </span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown className="h-4 w-4 text-gray-500" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg"
              >
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.name}
                      onClick={() => {
                        setTab(tab.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm ${
                        tab.value === currentTab
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <TabIcon className="h-5 w-5 mr-2" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="hidden sm:block">
        <nav className="flex space-x-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md" aria-label="Tabs">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setTab(tab.value)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                  tab.value === currentTab
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <TabIcon className="mr-2 h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
