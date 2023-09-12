import { ReactNode, SetStateAction } from "react";
import { FaShoppingCart, FaCartPlus } from "react-icons/fa";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import { Dispatch } from "react";

interface LayoutProps {
  children: ReactNode;
  setTheme: Dispatch<SetStateAction<string>>;
  theme: any;
}

export default function Layout({ children, setTheme, theme }: LayoutProps) {
  return (
    <div className="bg-white dark:bg-slate-800 dark:text-white">
      <Navbar setTheme={setTheme} theme={theme} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
