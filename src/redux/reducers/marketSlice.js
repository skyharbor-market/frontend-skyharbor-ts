import {
    createSlice,
    PayloadAction,
  } from '@reduxjs/toolkit';
  
  
  const initialState = {
      // Collections on homepage
    ergPrice: null,
    collections: [],

    // "collectionTokens" will be an array of objects. the object will hold the collection name 
    // - and an array of all of their sale nft's
    collectionTokens: [],

    // marketplaceTokens will be every NFT for sale on the marketplace
    marketplaceTokens: [],
    marketplaceOrder: null,

    cartItems: []
  };
  
  export const marketSlice = createSlice({
    name: 'market',
    initialState,
    reducers: {
      // Set all collections
      setCollections: (state, action) => {
        state.collections = action.payload
      },
      setMarketplaceTokens: (state, action) => {
        state.marketplaceTokens = action.payload
      },
      setErgPrice: (state, action) => {
        state.ergPrice = action.payload
      },
      setMarketplaceOrder: (state, action) => {
        state.marketplaceOrder = action.payload
      },

      setCartItems: (state, action) => {
        state.cartItems = action.payload
      }
    },
  });
  export const {
    setCollections,
    setMarketplaceTokens,
    setErgPrice,
    setMarketplaceOrder,
    setCartItems
  } = marketSlice.actions;
  
//   export const selectionCollections = (state) => state.collections;
//   export const selectCollectionTokens = (state) => state.collectionTokens;
  
  // exporting the reducer here, as we need to add this to the store
  export default marketSlice.reducer;
  