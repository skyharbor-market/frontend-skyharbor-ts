import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import WalletButton from "../WalletButton/WalletButton";

const navigation = [
  { name: "Marketplace", href: "/marketplace" },
  { name: "Collections", href: "/collections" },
  { name: "Activity", href: "/activity" },
  // { name: "Company", href: "#" },
];

interface NavProps {
  setTheme: any;
  theme: any;
}

export default function Navbar({ setTheme, theme }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="text-gray-900 dark:text-gray-200 backdrop-blur sticky top-0 bg-white/70 dark:bg-slate-800/70 z-20">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center gap-x-12">
          <Link href="/" className="-m-1.5 p-1.5">
            <div>
              <span className="sr-only">SkyHarbor</span>
              <div className="flex flex-row items-center">
                <img
                  className="h-8 mr-2 transition-all w-auto dark:invert"
                  src="assets/images/skyharborlogo.png"
                  alt=""
                />
                <p className="font-semibold">SkyHarbor</p>
              </div>
            </div>
          </Link>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-semibold leading-6 "
              >
                {item.name}
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
        <div className="hidden lg:flex">
          <div className="text-sm font-semibold leading-6 ">
            <WalletButton />
          </div>

          <button
            className="text-sm font-semibold leading-6 ml-2 w-8"
            onClick={() => {
              console.log("AAAASSS");
              setTheme(theme === "light" ? "dark" : "light");
            }}
          >
            {theme}
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
            <Link href="#" className="-m-1.5 p-1.5">
              <div>
                <span className="sr-only">SkyHarbor</span>
                {/* <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
              /> */}
                <p className="">SkyHarbor</p>
              </div>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 "
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
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7  hover:bg-gray-50"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <WalletButton />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
