import { ReactNode, SetStateAction } from "react";
import { FaShoppingCart, FaCartPlus } from "react-icons/fa";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import { Dispatch } from "react";
import { Anek_Latin, Open_Sans } from "next/font/google";

const robotoslab = Open_Sans({ subsets: ["latin"] });

interface LayoutProps {
  children: ReactNode;
  setTheme: Dispatch<SetStateAction<string>>;
  theme: any;
}

export default function Layout({ children, setTheme, theme }: LayoutProps) {
  return (
    <div
      className={`bg-white dark:bg-black dark:text-white ${robotoslab.className}`}
    >
      <Navbar setTheme={setTheme} theme={theme} />
      <main className="min-h-screen max-w-screen-xl px-2 sm:px-6 lg:px-8 mx-auto mt-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
