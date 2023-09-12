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
