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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  return (
    <header className="text-gray-900 dark:text-gray-200 backdrop-blur sticky top-0 bg-white/70 dark:bg-slate-800/70 z-20">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center gap-x-4 lg:gap-x-12">
          <Link href="/" className={`p-1.5 ${router.pathname === '/' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md' : ''}`}>
            <div>
              <span className="sr-only">SkyHarbor</span>
              <div className={`flex flex-row items-center cursor-pointer transition-all ${router.pathname === '/' ? 'hover:opacity-90' : 'hover:opacity-70'}`}>
                <img
                  className={`h-7 w-7 md:h-8 md:w-8 mr-2 transition-all bg-white rounded-full ${router.pathname === '/' ? 'filter brightness-100' : ''}`}
                  src="/assets/images/skyharborlogo.png"
                  alt=""
                />
                <p className={`text-sm md:text-base font-semibold ${router.pathname === '/' ? 'text-black dark:text-white' : ''}`}>SkyHarbor</p>
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
        <div className="flex items-center gap-x-2">
          <div className="hidden lg:block">
            <WalletButton theme={theme} />
          </div>

          <button
            className="hidden lg:flex text-sm font-semibold leading-6 w-10 h-[38px] items-center hover:text-white dark:hover:text-black justify-center border dark:border-gray-600 rounded-lg hover:bg-black dark:hover:bg-white transition-colors"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-slate-800 px-4 py-4 sm:max-w-sm sm:px-6 sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex items-center space-x-2">
            <img
                  className={`h-7 w-7 md:h-8 md:w-8 mr-2 transition-all bg-white rounded-full ${router.pathname === '/' ? 'filter brightness-100' : ''}`}
                  src="/assets/images/skyharborlogo.png"
                  alt=""
                />
              <p className="font-semibold text-black dark:text-white">SkyHarbor</p>
            </div>
            </Link>
            <button
              type="button"
              className="rounded-lg p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="space-y-6">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={`block rounded-lg px-4 py-3 text-base font-semibold transition-all duration-300 ${
                      router.pathname === item.href
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200"
                    }`}>
                      {item.name}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <WalletButton theme={theme} />
                <button
                  className="mt-4 w-full rounded-lg border text-black dark:text-white dark:border-gray-600 py-2.5 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    setTheme(theme === "light" ? "dark" : "light");
                    setMobileMenuOpen(false);
                  }}
                >
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                  {theme === "light" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
