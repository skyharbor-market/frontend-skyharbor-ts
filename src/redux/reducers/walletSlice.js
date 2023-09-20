import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface WalletInterface {
//   walletSelectOpen: boolean;
//   walletState: "Configure" | "nautilus" | "safew" | "ergopay";

//   defaultAddress: string;
//   userAddressList: string[];

//   addresses: string[];
//   tokens: any[];
// }

const initialState = {
  walletSelectOpen: false,
  walletState: "Configure",

  defaultAddress: "",
  userAddressList: [],

  addresses: [],
  tokens: [],
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    // Set our current wallet address
    setWallet: (state, action) => {
      state.addresses = action.payload;
    },
    // Store wallet owner's NFTs
    setTokens: (state, action) => {
      state.tokens = action.payload;
    },

    // Wallet
    setWalletSelectOpen: (state, action) => {
      state.walletSelectOpen = action.payload;
    },
    setWalletState: (state, action) => {
      state.walletState = action.payload;
    },
    setDefaultAddress: (state, action) => {
      state.defaultAddress = action.payload;
    },
    setUserAddressList: (state, action) => {
      state.userAddressList = action.payload;
    },
  },
});
// Here we are just exporting the actions from this slice, so that we can call them anywhere in our app.
export const {
  setWallet,
  setDefaultAddress,
  setTokens,
  setWalletSelectOpen,
  setWalletState,
  setUserAddressList,
} = walletSlice.actions;

// calling the above actions would be useless if we could not access the data in the state. So, we use something called a selector which allows us to select a value from the state.
export const selectTokens = (state) => state.tokens;
export const selectAddresses = (state) => state.addresses;
export const selectDefaultAddress = (state) => state.defaultAddress;

// exporting the reducer here, as we need to add this to the store
export default walletSlice.reducer;
