import { gql } from "@apollo/client";

export const GET_ALL_MINT_ADDRESSES = gql`
  query GET_ALL_MINT_ADDRESSES {
    mint_addresses(where: { address_collection: { verified: { _eq: true } } }) {
      id
      address
      address_collection {
        id
        name
        sys_name
        verified
      }
    }
  }
`;

export const CHECK_MINT_ADDRESS = gql`
  query verifiedMintAddresses($mintaddress: String!) {
    collections(where: { mint_addresses: { address: { _eq: $mintaddress } } }) {
      name
      sys_name
      verified
      mint_addresses {
        address
      }
    }
  }
`;

export const GET_NFTS = gql`
  query getMarketplaceNFTs($limit: Int, $offset: Int) {
    sales(
      where: {
        _and: {
          status: { _eq: "active" }
          token: { token_collection: { verified: { _eq: true } } }
        }
      }
      limit: $limit
      offset: $offset
      order_by: { list_time: desc }
    ) {
      token_id
      box_id
      box_json
      completion_time
      sales_address {
        address
      }
      nerg_sale_value
      seller_address
      buyer_address
      spent_tx
      currency
      list_time
      token {
        nft_name
        nft_desc
        royalty_int
        royalty_address
        ipfs_art_hash
        ipfs_art_url
        nft_type
        token_collection {
          name
          sys_name
          verified
        }
      }
    }
  }
`;

export const GET_ACTIVITY = gql`
  query getMarketplaceNFTs($limit: Int, $offset: Int) {
    sales(
      where: {
        _and: {
          status: { _eq: "complete" }
          token: { token_collection: { verified: { _eq: true } } }
        }
      }
      limit: $limit
      offset: $offset
      order_by: { completion_time: desc }
    ) {
      token_id
      box_id
      box_json
      completion_time
      sales_address {
        address
      }
      nerg_sale_value
      seller_address
      buyer_address
      spent_tx
      currency
      list_time
      token {
        nft_name
        nft_desc
        royalty_int
        royalty_address
        ipfs_art_hash
        ipfs_art_url
        nft_type
        token_collection {
          name
          sys_name
          verified
        }
      }
    }
  }
`;

export const GET_TOP_SALES = gql`
  query getMarketplaceNFTs {
    sales(
      where: {
        _and: {
          status: { _eq: "complete" }
          token: { token_collection: { verified: { _eq: true } } }
        }
      }
      limit: 20
      offset: 0
      order_by: { nerg_sale_value: desc }
    ) {
      token_id
      box_id
      completion_time
      sales_address {
        address
      }
      nerg_sale_value
      seller_address
      buyer_address
      spent_tx
      currency
      list_time
      token {
        nft_name
        nft_desc
        royalty_int
        royalty_address
        ipfs_art_hash
        ipfs_art_url
        nft_type
        token_collection {
          name
          sys_name
          verified
        }
      }
    }
  }
`;

export const GET_COLLECTIONS = gql`
  query getCollections($limit: Int, $offset: Int) {
    collections(
      limit: $limit
      offset: $offset
      order_by: { addition_time: desc }
      where: { verified: { _eq: true } }
    ) {
      id
      card_image
      description
      name
      sys_name
    }
  }
`;

export const GET_COLLECTION_INFO = gql`
  query getCollections($collection: String) {
    collections(limit: 1, where: { sys_name: { _eq: $collection } }) {
      id
      card_image
      description
      mint_addresses {
        address
        id
      }
      name
      verified
      discord_link
      website_link
      twitter_link
    }
  }
`;

export const GET_COLLECTION_NFTS = gql`
  query getMarketplaceNFTs($limit: Int, $offset: Int, $collection: String) {
    sales(
      where: {
        _and: {
          status: { _eq: "active" }
          token: { token_collection: { sys_name: { _eq: $collection } } }
        }
      }
      limit: $limit
      offset: $offset
      order_by: { list_time: desc }
    ) {
      token_id
      box_id
      box_json
      completion_time
      sales_address {
        address
      }
      nerg_sale_value
      seller_address
      buyer_address
      spent_tx
      currency
      list_time
      token {
        nft_name
        nft_desc
        royalty_int
        royalty_address
        ipfs_art_hash
        ipfs_art_url
        nft_type
        token_collection {
          name
          sys_name
          verified
        }
      }
    }
  }
`;
