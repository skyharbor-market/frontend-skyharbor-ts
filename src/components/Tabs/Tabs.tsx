import {
  BuildingOfficeIcon,
  CreditCardIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { ComponentType, ReactNode } from "react";
import { JsxElement } from "typescript";

const tabs = [
  { name: "My Account", href: "#", icon: UserIcon, current: false },
  { name: "Company", href: "#", icon: BuildingOfficeIcon, current: false },
  { name: "Team Members", href: "#", icon: UsersIcon, current: true },
  { name: "Billing", href: "#", icon: CreditCardIcon, current: false },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

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
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={tabs.find((tab) => tab.value === currentTab)?.value}
          onChange={(e) => setTab(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              // const curTab = tabs.find((tab) => tab.value === currentTab)
              return (
                <div
                  key={tab.name}
                  className={classNames(
                    tab.value == currentTab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium"
                  )}
                  onChange={() => setTab(tab.value)}
                  aria-current={tab.current ? "page" : undefined}
                >
                  <tab.icon
                    className={classNames(
                      tab.value == currentTab
                        ? "text-indigo-500"
                        : "text-gray-400 group-hover:text-gray-500",
                      "-ml-0.5 mr-2 h-5 w-5"
                    )}
                    aria-hidden="true"
                  />
                  <span>{tab.name}</span>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
