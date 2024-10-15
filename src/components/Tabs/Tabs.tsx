import { ComponentType } from "react";

interface TabProps {
  name: string;
  value: string;
  icon: ComponentType;
}

interface TabsProps {
  tabs: TabProps[];
  setTab: (params: string) => void;
  currentTab: string;
}

export default function Tabs({ tabs, setTab, currentTab }: TabsProps) {
  return (
    <div className="w-full">
      <div className="sm:hidden">
        <select
          className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={currentTab}
          onChange={(e) => setTab(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.value}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="flex space-x-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
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
                <Icon className="mr-2 h-5 w-5" aria-hidden="true" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
