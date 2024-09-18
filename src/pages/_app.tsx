import "../styles/globals.css";
import { configureStore } from "@reduxjs/toolkit";
import type { AppProps } from "next/app";
import walletReducer from "../redux/reducers/walletSlice";
import marketReducer, { setErgPrice } from "../redux/reducers/marketSlice";
import { Provider, useDispatch } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import { createWrapper } from "next-redux-wrapper";
import { Analytics } from "@vercel/analytics/react";
import Layout from "@/components/layout";
import { ApolloProvider } from "@apollo/client";
import createApolloClient from "@/lib/apolloClient";
import { resolveValue, Toaster, ToastIcon } from "react-hot-toast";
import { Transition } from "@headlessui/react";

const client = createApolloClient();

// Store must be made here for next.js or else it wont work
export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    market: marketReducer,
  },
});

const TailwindToaster = () => {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        success: {},
        error: {},
      }}
    >
      {(t) => (
        <Transition
          appear
          show={t.visible}
          className={`transform p-4 flex rounded shadow-lg ${
            t.type === "error" ? "bg-red-400 text-white" : ""
          } ${t.type === "success" ? "bg-white" : ""}`}
          enter="transition-all duration-150"
          enterFrom="opacity-0 scale-50"
          enterTo="opacity-100 scale-100"
          leave="transition-all duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-75"
        >
          <ToastIcon toast={t} />
          {/* @ts-ignore */}
          <p className={`px-2 mb-0`}>{resolveValue(t.message)}</p>
        </Transition>
      )}
    </Toaster>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  const dispatch = useDispatch();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'light';
    }
    return 'light';
  });

  // Get ERG price
  async function getErgPrice() {
    const p = await axios(
      "https://api.coingecko.com/api/v3/simple/price?ids=ergo&vs_currencies=usd"
    ).catch((err) => {
      console.log("Error getting ERG price: ", err);
      return;
    });

    // @ts-ignore
    dispatch(setErgPrice(p?.data?.ergo?.usd));
  }

  // Light/dark mode
  useEffect(() => {
    getErgPrice();
  }, []);

  useEffect(() => {
    console.log("THEME", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <Layout setTheme={setTheme} theme={theme}>
          {/* <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            Toggle Theme
          </button> */}
          <Component {...pageProps} />
          {/* <Analytics /> */}
          <TailwindToaster />
        </Layout>
      </ApolloProvider>
    </Provider>
  );
}

// export default withRedux(makeStore)(MyApp)

const makeStore = () => store;
const wrapper = createWrapper(makeStore);

export default wrapper.withRedux(MyApp);
