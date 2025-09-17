import React, { useEffect, useState } from "react";
import { getUserListedNFTsFromChain } from "../../ergofunctions/getUserListedNFTsFromChain";
import NFTCard from "../NFTCard/NFTCard";
import LoadingCard from "../NFTCard/LoadingCard";

// GraphQL query removed - now using direct blockchain query

function UserListedTokens({ addresses }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ sales: [] });
  let mounted = true;

  useEffect(() => {
    mounted = true;
    
    // Fetch listed NFTs from blockchain
    const fetchListedNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const listedNFTs = await getUserListedNFTsFromChain(addresses);
        
        if (mounted) {
          setData({ sales: listedNFTs });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching listed NFTs:", err);
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };
    
    if (addresses && addresses.length > 0) {
      fetchListedNFTs();
    } else {
      setLoading(false);
      setData({ sales: [] });
    }

    return () => {
      mounted = false;
    };
  }, [addresses]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => {
          return <LoadingCard key={item} />;
        })}
      </div>
    );
  } else if (error) {
    return (
      <div className="text-center">
        <p className="font-semibold text-center">
          An error occurred retrieving your listed NFTs. Please refresh, If
          problem persists, notify us on{" "}
          <span
            onClick={() =>
              window.open("https://discord.com/invite/JyxsBvjqWs", "_blank")
            }
            className="purple-400 cursor-pointer"
          >
            Discord
          </span>
          .
        </p>
      </div>
    );
  } else if (data.sales.length === 0) {
    return (
      <div>
        <strong
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          You have no listed NFTs.
        </strong>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {data.sales.map((item, index) => {
          const cardItem = {
            token_id: item.token_id,
            box_id: item.box_id,
            box_json: item.box_json,
            completion_time: item.completion_time,
            sales_address: item.sales_address.address,
            nerg_sale_value: item.nerg_sale_value,
            seller_address: item.seller_address,
            buyer_address: item.buyer_address,
            spent_tx: item.spent_tx,
            currency: item.currency,
            list_time: item.list_time,

            nft_name: item.token.nft_name,
            nft_desc: item.token.nft_desc,
            royalty_int: item.token.royalty_int,
            royalty_address: item.token.royalty_address,

            ipfs_art_hash: item.token.ipfs_art_hash,
            ipfs_art_url: item.token.ipfs_art_url,
            nft_type: item.token.nft_type,

            collection_name: item.token.token_collection.name,
            collection_sys_name: item.token.token_collection.sys_name,
            verified_collection: item.token.token_collection.verified,
          };
          console.log("cardItem ", cardItem);

          return (
            <NFTCard
              key={index}
              token={cardItem}
              isOwner={true}
              userAddresses={addresses}
              showCollection
            />
          );
        })}
      </div>
    </div>
  );
}

export default UserListedTokens;
