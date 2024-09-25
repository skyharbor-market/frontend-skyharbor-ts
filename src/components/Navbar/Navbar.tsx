import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import WalletButton from "../WalletButton/WalletButton";

const navigation = [
  { name: "Marketplace", href: "/marketplace" },
  { name: "Collections", href: "/collections" },
  { name: "Activity", href: "/activity" },
];

interface NavProps {
  setTheme: any;
  theme: any;
}

export default function Navbar({ setTheme, theme }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  console.log("router.pathname", router.pathname);

  return (
    <header className="text-gray-900 dark:text-gray-200 backdrop-blur sticky top-0 bg-white/70 dark:bg-slate-800/70 z-20">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center gap-x-12">
          <Link href="/" className={`-m-1.5 p-1.5 ${router.pathname === '/' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md' : ''}`}>
            <div className={`${router.pathname === '/' ? '' : ''}`}>
              <span className="sr-only">SkyHarbor</span>
              <div className={`flex flex-row items-center cursor-pointer transition-all ${router.pathname === '/' ? 'hover:opacity-90' : 'hover:opacity-70'}`}>
                <img
                  className={`h-8 w-8 mr-2 transition-all bg-white rounded-full ${router.pathname === '/' ? 'filter brightness-100' : ''}`}
                  src="/assets/images/skyharborlogo.png"
                  alt=""
                />
                <p className={`font-semibold ${router.pathname === '/' ? 'text-black dark:text-white' : ''}`}>SkyHarbor</p>
              </div>
            </div>
          </Link>
          <div className="hidden lg:flex lg:gap-x-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <div
                  className={`text-sm cursor-pointer font-semibold leading-6 px-4 py-2 rounded-lg transition-all duration-300 ${
                    router.pathname === item.href
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200"
                  }`}
                >
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex items-center">
          <div className="text-sm font-semibold leading-6 ">
            <WalletButton theme={theme} />
          </div>

          <button
            className="text-sm font-semibold leading-6 ml-2 w-10 h-[38px] flex items-center  hover:text-white dark:hover:text-black justify-center border dark:border-gray-600 rounded-lg hover:bg-black dark:hover:bg-white transition-colors"
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
            }}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white dark:bg-slate-800 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <div>
                <span className="sr-only">SkyHarbor</span>
                <p className="font-semibold">SkyHarbor</p>
              </div>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-all duration-300 ${
                      router.pathname === item.href
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <WalletButton theme={theme} />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
