import { unspentBoxesForV1, boxById } from "./explorer";
import { v1ErgAddress, v1SigUsdAddress } from "./consts";
import { decodeString, decodeNum } from "./serializer";
import axios from "axios";

let ergolib = import("ergo-lib-wasm-browser");

// Convert ergo tree to address
async function ergoTreeToAddress(ergoTree) {
  try {
    const wasm = await ergolib;
    const address = wasm.Address.from_ergo_tree(ergoTree);
    return address.to_base58();
  } catch (error) {
    console.error("Error converting ergo tree to address:", error);
    return null;
  }
}

// Get NFT metadata from token ID
async function getNFTMetadata(tokenId) {
  try {
    // Get the issuing box for the NFT to extract metadata
    const issuingBox = await boxById(tokenId);
    
    if (!issuingBox) return null;
    
    const metadata = {
      tokenId: tokenId,
      nft_name: "",
      nft_desc: "",
      ipfs_art_hash: "",
      ipfs_art_url: "",
      nft_type: "",
      royalty_int: 0,
      royalty_address: null
    };
    
    // Decode NFT metadata from registers
    if (issuingBox.additionalRegisters) {
      if (issuingBox.additionalRegisters.R4) {
        metadata.nft_name = await decodeString(issuingBox.additionalRegisters.R4);
      }
      if (issuingBox.additionalRegisters.R5) {
        metadata.nft_desc = await decodeString(issuingBox.additionalRegisters.R5);
      }
      if (issuingBox.additionalRegisters.R7) {
        // NFT type/category
        const typeCode = issuingBox.additionalRegisters.R7;
        if (typeCode === "0e020101") metadata.nft_type = "image";
        else if (typeCode === "0e020102") metadata.nft_type = "audio";
        else if (typeCode === "0e020103") metadata.nft_type = "video";
      }
      if (issuingBox.additionalRegisters.R8) {
        metadata.ipfs_art_hash = await decodeString(issuingBox.additionalRegisters.R8);
      }
      if (issuingBox.additionalRegisters.R9) {
        metadata.ipfs_art_url = await decodeString(issuingBox.additionalRegisters.R9);
      }
    }
    
    return metadata;
  } catch (error) {
    console.error("Error getting NFT metadata:", error);
    return null;
  }
}

// Main function to get user's listed NFTs from blockchain
export async function getUserListedNFTsFromChain(userAddresses) {
  try {
    console.log("Fetching listed NFTs for addresses:", userAddresses);
    
    // Contract addresses to query (SkyHarbor marketplace contracts)
    const contractAddresses = [v1ErgAddress, v1SigUsdAddress];
    const allListedNFTs = [];
    
    // Query each contract address
    for (const contractAddr of contractAddresses) {
      console.log(`Querying contract: ${contractAddr}`);
      
      try {
        // Get all unspent boxes from this contract
        const boxes = await unspentBoxesForV1(contractAddr);
        console.log(`Found ${boxes.length} boxes in contract`);
        
        // Filter for user's listings
        for (const box of boxes) {
          // Check if box has an NFT
          if (!box.assets || box.assets.length === 0) continue;
          
          // Check if R5 (seller address) matches any user address
          if (box.additionalRegisters && box.additionalRegisters.R5) {
            try {
              // R5 contains the seller's ergo tree - handle both formats
              const ergoTree = box.additionalRegisters.R5.serializedValue || box.additionalRegisters.R5;
              const sellerAddress = await ergoTreeToAddress(ergoTree);
              
              if (sellerAddress && userAddresses.includes(sellerAddress)) {
                console.log(`Found user's listed NFT in box: ${box.boxId}`);
                
                // Get sale price from R4
                let salePrice = 0;
                if (box.additionalRegisters.R4) {
                  // R4 contains the sale price in nanoERGs
                  if (box.additionalRegisters.R4.renderedValue) {
                    salePrice = parseInt(box.additionalRegisters.R4.renderedValue);
                  } else {
                    salePrice = await decodeNum(box.additionalRegisters.R4, false);
                  }
                }
                
                // Get NFT metadata
                const nftMetadata = await getNFTMetadata(box.assets[0].tokenId);
                
                // Determine currency based on contract
                const currency = contractAddr === v1SigUsdAddress ? "sigusd" : "erg";
                
                // Format the listing data to match the expected structure
                const listing = {
                  box_id: box.boxId,
                  box_json: box,
                  seller_address: sellerAddress,
                  seller_ergotree: ergoTree,
                  token_id: box.assets[0].tokenId,
                  token_amount: box.assets[0].amount,
                  nerg_sale_value: salePrice,
                  currency: currency,
                  creation_height: box.creationHeight,
                  list_time: new Date().toISOString(), // Approximate from block height
                  status: "active",
                  sales_address: {
                    address: contractAddr
                  },
                  token: {
                    nft_name: nftMetadata?.nft_name || "Unknown NFT",
                    nft_desc: nftMetadata?.nft_desc || "",
                    ipfs_art_hash: nftMetadata?.ipfs_art_hash || "",
                    ipfs_art_url: nftMetadata?.ipfs_art_url || "",
                    nft_type: nftMetadata?.nft_type || "image",
                    royalty_int: nftMetadata?.royalty_int || 0,
                    royalty_address: nftMetadata?.royalty_address || null,
                    token_collection: {
                      name: "Unknown Collection",
                      sys_name: "unknown",
                      verified: false
                    }
                  }
                };
                
                allListedNFTs.push(listing);
              }
            } catch (error) {
              console.error(`Error processing box ${box.boxId}:`, error);
              continue;
            }
          }
        }
      } catch (error) {
        console.error(`Error querying contract ${contractAddr}:`, error);
        continue;
      }
    }
    
    console.log(`Found ${allListedNFTs.length} total listed NFTs for user`);
    return allListedNFTs;
    
  } catch (error) {
    console.error("Error fetching user's listed NFTs from chain:", error);
    throw error;
  }
}

// Helper function to check if a box is a valid SkyHarbor listing
export function isValidSkyHarborListing(box) {
  // Check if box has required registers for a listing
  return box.additionalRegisters && 
         box.additionalRegisters.R4 && // Price
         box.additionalRegisters.R5 && // Seller address
         box.assets && 
         box.assets.length > 0; // Has NFT
}