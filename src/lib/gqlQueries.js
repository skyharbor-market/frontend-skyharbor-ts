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
  query GetNFTs($limit: Int, $offset: Int) {
    nfts(limit: $limit, offset: $offset, order_by: { created_at: desc }) {
      id
      title
      image_url
      // Add any other fields you need
    }
  }
`;
