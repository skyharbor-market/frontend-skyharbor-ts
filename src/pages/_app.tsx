import "@/styles/globals.css";
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

const client = createApolloClient();

// Store must be made here for next.js or else it wont work
export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    market: marketReducer,
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const dispatch = useDispatch();

  const [theme, setTheme] = useState("light");

  // Get ERG price
  async function getErgPrice() {
    const p = await axios(
      "https://api.coingecko.com/api/v3/simple/price?ids=ergo&vs_currencies=usd"
    ).catch((err) => {
      console.log("Error getting ERG price: ", err);
      return;
    });

    dispatch(setErgPrice(p.data.ergo.usd));
  }

  // Light/dark mode
  useEffect(() => {
    getErgPrice();
  }, []);

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    console.log("THEME111", currentTheme);

    if (currentTheme) {
      setTheme(currentTheme);
    }
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
        </Layout>
      </ApolloProvider>
    </Provider>
  );
}

// export default withRedux(makeStore)(MyApp)

const makeStore = () => store;
const wrapper = createWrapper(makeStore);

export default wrapper.withRedux(MyApp);
